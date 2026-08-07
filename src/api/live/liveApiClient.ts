// Hybrid live client: routes machine assessment, copilot Q&A, and what-if
// analysis to the real saxon_machine_health_api backend (a trained CatBoost
// classifier + templated/SLM explainer). Everything else in ApiClient has
// no real backend yet (no fleet aggregation, alert store, work-order store,
// or historical drift tracking exists server-side) and is delegated
// unchanged to mockApiClient rather than being faked as if it were live —
// see DataSourceTag in the UI for what's marked accordingly.
import type { ApiClient } from "../client";
import type { Alert, CopilotRequest, CopilotResponse, MachineDetail, MachineSummary, OverviewSummary, SystemStatus, WhatIfRequest, WhatIfResult } from "../../types/contract";
import { mockApiClient } from "../mock/mockApiClient";
import { buildOverviewSummary as buildMockOverviewSummary } from "../mock/fixtures";
import { backendClient } from "./backendClient";
import { assessmentToClassifierOutput, assessmentToMachineSummary } from "./mapAssessment";
import { buildLiveAlerts, buildLiveOverviewSummary, buildLiveSystemStatus } from "./liveDerived";
import { findRosterEntry, machineRoster } from "./machineRoster";
import type { DatasetInfoResponse, HealthResponse, MachineReading } from "./backendTypes";

function requireRosterEntry(machineId: string) {
  const entry = findRosterEntry(machineId);
  if (!entry) throw new Error(`Unknown machine for live backend: ${machineId}`);
  return entry;
}

async function fetchMachineSummary(machineId: string): Promise<MachineSummary> {
  const entry = requireRosterEntry(machineId);
  const assessment = await backendClient.assess(entry.reading);
  return assessmentToMachineSummary(entry, assessment);
}

const riskRank: Record<string, number> = { CRITICAL: 0, HIGH: 1, ELEVATED: 2, NORMAL: 3, UNCERTAIN: 4 };

// Short-lived cache so Overview/Alerts/System Status/Machine Queue — which
// all fire near-simultaneously on page load — share one round of real
// /assess calls instead of each independently re-scoring all 8 machines.
const CACHE_MS = 8000;
let summariesCache: { promise: Promise<MachineSummary[]>; ts: number } | null = null;

function getAllMachineSummaries(): Promise<MachineSummary[]> {
  const now = Date.now();
  if (!summariesCache || now - summariesCache.ts > CACHE_MS) {
    summariesCache = {
      promise: Promise.all(machineRoster.map((entry) => fetchMachineSummary(entry.machine_id))),
      ts: now,
    };
  }
  return summariesCache.promise;
}

let metaCache: { promise: Promise<[HealthResponse, DatasetInfoResponse]>; ts: number } | null = null;
function getBackendMeta(): Promise<[HealthResponse, DatasetInfoResponse]> {
  const now = Date.now();
  if (!metaCache || now - metaCache.ts > CACHE_MS) {
    metaCache = { promise: Promise.all([backendClient.health(), backendClient.datasetInfo()]), ts: now };
  }
  return metaCache.promise;
}

// Session-local acknowledge state — the real backend has no alert store, so
// "acknowledged" only persists for this browser session, not across reloads.
const acknowledgedLiveAlertIds = new Set<string>();

export const liveApiClient: ApiClient = {
  // --- Real backend calls ---
  async getMachineQueue() {
    const summaries = await getAllMachineSummaries();
    return [...summaries].sort((a, b) => riskRank[a.classifier_output.risk_band] - riskRank[b.classifier_output.risk_band]);
  },

  async getMachineDetail(machineId: string): Promise<MachineDetail> {
    const summary = await fetchMachineSummary(machineId);
    // The real backend has no history store — it only scores the reading
    // you send it. We show the single real assessment we have rather than
    // inventing past readings.
    return { ...summary, history: [summary.classifier_output] };
  },

  async postCopilotMessage(req: CopilotRequest): Promise<CopilotResponse> {
    const entry = requireRosterEntry(req.machine_id);
    const explanation = await backendClient.explain(req.question, entry.reading);
    const content = [
      explanation.summary,
      "",
      explanation.explanation,
      "",
      `Recommended action: ${explanation.recommended_action}`,
    ].join("\n");
    return {
      message: {
        role: "assistant",
        content,
        machine_id: req.machine_id,
        classifier_output_ref: explanation.assessment_id,
        timestamp: new Date().toISOString(),
        slm_verified: explanation.slm_verified ?? undefined,
      },
      // Static suggested-question chips — UI affordance, not model output.
      suggested_questions: [
        "Explain the numbers",
        "Can I continue operating?",
        "What should I inspect?",
        "What happens if I reduce torque by 15%?",
      ],
    };
  },

  async runWhatIf(req: WhatIfRequest): Promise<WhatIfResult> {
    const entry = requireRosterEntry(req.machine_id);
    const current = entry.reading;
    const proposed: MachineReading = { ...current, ...req.sensor_overrides };
    const changedFields = Object.keys(req.sensor_overrides).filter(
      (k) => (req.sensor_overrides as Record<string, number>)[k] !== (current as unknown as Record<string, number>)[k],
    );
    const intervention = changedFields.length ? `Adjusted ${changedFields.join(", ")}` : "No sensor change";

    const result = await backendClient.whatIf(intervention, current, proposed);
    return {
      baseline: assessmentToClassifierOutput(current, result.current_assessment),
      simulated: assessmentToClassifierOutput(proposed, result.proposed_assessment),
      delta_summary: result.explanation,
    };
  },

  // --- Derived live from real per-machine assessments (current-state only —
  // see liveDerived.ts for what genuinely can't be derived without history) ---
  async getOverviewSummary(): Promise<OverviewSummary> {
    const summaries = await getAllMachineSummaries();
    // Only risk_trend is pulled from here — it needs multi-day history we
    // don't have; everything else uses the real summaries above.
    const { risk_trend } = buildMockOverviewSummary();
    return buildLiveOverviewSummary(summaries, risk_trend);
  },

  async getSystemStatus(): Promise<SystemStatus> {
    const [summaries, [health, datasetInfo]] = await Promise.all([getAllMachineSummaries(), getBackendMeta()]);
    return buildLiveSystemStatus(summaries, health.classifier_version, health.slm_version, datasetInfo.bundle_trained_at);
  },

  async getAlerts(): Promise<Alert[]> {
    const summaries = await getAllMachineSummaries();
    return buildLiveAlerts(summaries).map((a) => ({ ...a, acknowledged: acknowledgedLiveAlertIds.has(a.id) }));
  },

  async acknowledgeAlert(id: string) {
    acknowledgedLiveAlertIds.add(id);
  },

  // --- No real backend support (no persisted history / report / work-order
  // store exists server-side) — unchanged mock, not faked as live ---
  getModelConfidenceTrend: mockApiClient.getModelConfidenceTrend,
  getReports: mockApiClient.getReports,
  getWorkOrders: mockApiClient.getWorkOrders,
  createWorkOrder: mockApiClient.createWorkOrder,
};
