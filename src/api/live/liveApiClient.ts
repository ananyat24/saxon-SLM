// Hybrid live client: routes machine assessment, copilot Q&A, and what-if
// analysis to the real saxon_machine_health_api backend (a trained CatBoost
// classifier + templated/SLM explainer). Everything else in ApiClient has
// no real backend yet (no fleet aggregation, alert store, work-order store,
// or historical drift tracking exists server-side) and is delegated
// unchanged to mockApiClient rather than being faked as if it were live —
// see DataSourceTag in the UI for what's marked accordingly.
import type { ApiClient } from "../client";
import type { CopilotRequest, CopilotResponse, MachineDetail, MachineSummary, WhatIfRequest, WhatIfResult } from "../../types/contract";
import { mockApiClient } from "../mock/mockApiClient";
import { backendClient } from "./backendClient";
import { assessmentToClassifierOutput, assessmentToMachineSummary } from "./mapAssessment";
import { findRosterEntry, machineRoster } from "./machineRoster";
import type { MachineReading } from "./backendTypes";

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

export const liveApiClient: ApiClient = {
  // --- Real backend calls ---
  async getMachineQueue() {
    const summaries = await Promise.all(machineRoster.map((entry) => fetchMachineSummary(entry.machine_id)));
    return summaries.sort((a, b) => riskRank[a.classifier_output.risk_band] - riskRank[b.classifier_output.risk_band]);
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

  // --- No real backend endpoint yet — unchanged mock, not faked as live ---
  getOverviewSummary: mockApiClient.getOverviewSummary,
  getSystemStatus: mockApiClient.getSystemStatus,
  getAlerts: mockApiClient.getAlerts,
  acknowledgeAlert: mockApiClient.acknowledgeAlert,
  getModelConfidenceTrend: mockApiClient.getModelConfidenceTrend,
  getReports: mockApiClient.getReports,
  getWorkOrders: mockApiClient.getWorkOrders,
  createWorkOrder: mockApiClient.createWorkOrder,
};
