import type { ApiClient } from "../client";
import type {
  Alert,
  ClassifierOutput,
  CopilotRequest,
  CopilotResponse,
  CreateWorkOrderInput,
  ModelConfidenceTrendPoint,
  Report,
  WhatIfRequest,
  WhatIfResult,
  WorkOrder,
} from "../../types/contract";
import {
  buildOverviewSummary,
  getMachineDetailFixture,
  machineSummaries,
  sortedQueue,
  systemStatusFixture,
} from "./fixtures";
import {
  alertsFixture,
  modelConfidenceTrendFixture,
  reportsFixture,
  workOrdersFixture,
} from "./fixtures.extra";
import { sensorFieldMeta, failureTaxonomy } from "../../config/taxonomy.config";

// Mutable in-memory copies so acknowledge/create mutations persist for the session
// (mirrors how a real backend would hold state; resets on page reload).
const alertsState: Alert[] = alertsFixture.map((a) => ({ ...a }));
const workOrdersState: WorkOrder[] = workOrdersFixture.map((w) => ({ ...w }));

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function explainClassifierOutput(output: ClassifierOutput): string {
  if (output.thresholds_crossed.length === 0) {
    return `${output.machine_id} is currently in the **${output.risk_band}** band with ${(output.confidence * 100).toFixed(0)}% confidence. No sensor thresholds have been crossed.`;
  }
  const bullets = output.thresholds_crossed
    .map((t) => {
      const meta = sensorFieldMeta[t.field] ?? { label: t.field, unit: "" };
      return `- ${meta.label} is ${t.value}${meta.unit} (${t.direction} threshold of ${t.threshold}${meta.unit})`;
    })
    .join("\n");
  const flagLabels = (Object.entries(output.flags) as [keyof typeof output.flags, boolean][])
    .filter(([, v]) => v)
    .map(([k]) => failureTaxonomy[k].label);

  return [
    `**${output.machine_id}** was flagged **${output.risk_band}** (${(output.confidence * 100).toFixed(0)}% confidence, ${output.confidence_band}).`,
    flagLabels.length ? `Failure modes: ${flagLabels.join(", ")}.` : "",
    bullets,
    "",
    output.risk_band === "CRITICAL" || output.risk_band === "HIGH"
      ? "Recommendation: schedule an inspection before the next production run."
      : "Recommendation: continue monitoring at the current interval.",
  ]
    .filter(Boolean)
    .join("\n");
}

function suggestedQuestionsFor(machineId: string): string[] {
  return [
    "Explain the numbers",
    "Can I continue operating?",
    "What should I inspect?",
    "What happens if I reduce torque by 15%?",
  ].map((q) => (machineId ? q : q));
}

export const mockApiClient: ApiClient = {
  async getOverviewSummary() {
    return delay(buildOverviewSummary());
  },

  async getMachineQueue() {
    return delay(sortedQueue ?? machineSummaries);
  },

  async getMachineDetail(machineId: string) {
    const detail = getMachineDetailFixture(machineId);
    if (!detail) throw new Error(`Unknown machine: ${machineId}`);
    return delay(detail);
  },

  async postCopilotMessage(req: CopilotRequest): Promise<CopilotResponse> {
    const detail = getMachineDetailFixture(req.machine_id);
    if (!detail) {
      return delay({
        message: {
          role: "assistant",
          content: `I don't have classifier output for ${req.machine_id}, so I can't answer that reliably.`,
          machine_id: req.machine_id,
          timestamp: new Date().toISOString(),
        },
        suggested_questions: [],
      });
    }
    const output = detail.classifier_output;
    let content: string;
    const q = req.question.toLowerCase();
    if (q.includes("explain") || q.includes("why")) {
      content = explainClassifierOutput(output);
    } else if (q.includes("continue operating") || q.includes("can i continue")) {
      content =
        output.risk_band === "CRITICAL"
          ? "No — the classifier has this machine at CRITICAL risk. Recommend stopping and inspecting before continuing operation."
          : output.risk_band === "HIGH"
            ? "Operating is possible short-term, but the classifier flags HIGH risk — schedule an inspection soon."
            : "Yes, current classifier output shows no urgent risk. Continue monitoring as usual.";
    } else if (q.includes("inspect")) {
      const flagged = (Object.entries(output.flags) as [keyof typeof output.flags, boolean][]).filter(([, v]) => v);
      content = flagged.length
        ? `Based on the classifier flags, inspect: ${flagged.map(([k]) => failureTaxonomy[k].label).join(", ")}.`
        : "No specific failure mode is flagged. A general visual and vibration check is sufficient.";
    } else if (q.includes("torque") || q.includes("what if") || q.includes("reduce")) {
      content =
        "I can run that as a formal what-if scenario in the What-If Simulator, where the classifier re-scores the adjusted sensor inputs. I won't estimate that shift without calling the classifier.";
    } else {
      content = explainClassifierOutput(output);
    }

    return delay({
      message: {
        role: "assistant",
        content,
        machine_id: req.machine_id,
        classifier_output_ref: `${output.machine_id}@${output.timestamp}`,
        timestamp: new Date().toISOString(),
      },
      suggested_questions: suggestedQuestionsFor(req.machine_id),
    });
  },

  async getSystemStatus() {
    return delay(systemStatusFixture);
  },

  async runWhatIf(req: WhatIfRequest): Promise<WhatIfResult> {
    const detail = getMachineDetailFixture(req.machine_id);
    if (!detail) throw new Error(`Unknown machine: ${req.machine_id}`);
    const baseline = detail.classifier_output;
    const simulated: ClassifierOutput = {
      ...baseline,
      timestamp: new Date().toISOString(),
      sensor_snapshot: { ...baseline.sensor_snapshot, ...req.sensor_overrides },
    };
    return delay({
      baseline,
      simulated,
      delta_summary: "Simulated locally against the last known classifier output; connect the live API for a real re-score.",
    });
  },

  async getAlerts() {
    return delay(alertsState.slice());
  },

  async acknowledgeAlert(id: string) {
    const alert = alertsState.find((a) => a.id === id);
    if (alert) alert.acknowledged = true;
    return delay(undefined);
  },

  async getModelConfidenceTrend(): Promise<ModelConfidenceTrendPoint[]> {
    return delay(modelConfidenceTrendFixture);
  },

  async getReports(): Promise<Report[]> {
    return delay(reportsFixture);
  },

  async getWorkOrders() {
    return delay(workOrdersState.slice());
  },

  async createWorkOrder(input: CreateWorkOrderInput): Promise<WorkOrder> {
    const workOrder: WorkOrder = {
      id: `WO-${String(workOrdersState.length + 1).padStart(4, "0")}`,
      created_at: new Date().toISOString(),
      ...input,
    };
    workOrdersState.unshift(workOrder);
    return delay(workOrder);
  },
};
