// Builds UI-contract-shaped aggregates (OverviewSummary, Alert[], SystemStatus)
// directly from real MachineSummary[] returned by the live backend — every
// number here is computed from an actual /assess call, not fixture data.
//
// One structural limit: the backend has no persisted history, so anything
// requiring multiple points in time (the 7-day Risk Trend line chart, the
// 18-day Model Confidence Trend chart) genuinely cannot be derived live —
// those specific charts stay on mock and are tagged accordingly in the UI
// rather than faking a trend from a single snapshot.
import type { Alert, ClassifierOutput, MachineSummary, OverviewSummary, RiskBand, SystemStatus } from "../../types/contract";

const LINES = ["Line A", "Line B", "Line C"];

function countBy<T>(items: T[], key: (t: T) => string): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => {
    const k = key(item);
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
}

export function buildLiveOverviewSummary(summaries: MachineSummary[], mockRiskTrend: OverviewSummary["risk_trend"]): OverviewSummary {
  const riskCounts = countBy(summaries, (m) => m.classifier_output.risk_band);
  const confCounts = countBy(summaries, (m) => m.classifier_output.confidence_band);

  const conditionCounts: Record<string, number> = {};
  for (const m of summaries) {
    for (const c of m.conditions) {
      conditionCounts[c] = (conditionCounts[c] ?? 0) + 1;
    }
  }

  const risk_by_line = LINES.map((line) => {
    const lineMachines = summaries.filter((m) => m.line === line);
    const c = countBy(lineMachines, (m) => m.classifier_output.risk_band);
    return {
      line,
      critical: c.CRITICAL ?? 0,
      high: c.HIGH ?? 0,
      elevated: c.ELEVATED ?? 0,
      normal: c.NORMAL ?? 0,
      uncertain: c.UNCERTAIN ?? 0,
    };
  });

  return {
    kpis: {
      monitored: summaries.length,
      critical: riskCounts.CRITICAL ?? 0,
      high: riskCounts.HIGH ?? 0,
      elevated: riskCounts.ELEVATED ?? 0,
      normal: riskCounts.NORMAL ?? 0,
      uncertain: riskCounts.UNCERTAIN ?? 0,
    },
    risk_distribution: (["CRITICAL", "HIGH", "ELEVATED", "NORMAL", "UNCERTAIN"] as RiskBand[]).map((band) => ({
      band,
      count: riskCounts[band] ?? 0,
    })),
    top_failure_conditions: Object.entries(conditionCounts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count),
    // Not derivable live — no stored history of past assessments to plot.
    risk_trend: mockRiskTrend,
    risk_by_line,
    model_confidence: (["HIGH", "MEDIUM", "LOW", "UNCERTAIN"] as const).map((band) => ({
      band,
      count: confCounts[band] ?? 0,
    })),
  };
}

const ALERT_MESSAGE: Record<RiskBand, (m: MachineSummary) => string> = {
  CRITICAL: (m) => `${m.machine_id} crossed a CRITICAL threshold — ${m.conditions.join(", ")}. Immediate inspection recommended.`,
  HIGH: (m) => `${m.machine_id} flagged HIGH risk — ${m.conditions.join(", ")}. Schedule an inspection soon.`,
  ELEVATED: (m) => `${m.machine_id} trending toward elevated risk — ${m.conditions.join(", ")}.`,
  UNCERTAIN: (m) => `${m.machine_id} classifier output is low-confidence / out-of-distribution. Review sensor feed for faults.`,
  NORMAL: (m) => `${m.machine_id} operating within normal parameters.`,
};

const ALERT_SEVERITY: Record<RiskBand, Alert["severity"]> = {
  CRITICAL: "critical",
  HIGH: "warning",
  ELEVATED: "warning",
  UNCERTAIN: "info",
  NORMAL: "info",
};

/** Alerts derived from current real risk state — one per non-normal machine. */
export function buildLiveAlerts(summaries: MachineSummary[]): Alert[] {
  return summaries
    .filter((m) => m.classifier_output.risk_band !== "NORMAL")
    .map((m) => ({
      id: `LIVE-${m.machine_id}`,
      machine_id: m.machine_id,
      risk_band: m.classifier_output.risk_band,
      message: ALERT_MESSAGE[m.classifier_output.risk_band](m),
      created_at: m.classifier_output.timestamp,
      acknowledged: false,
      severity: ALERT_SEVERITY[m.classifier_output.risk_band],
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

function statusCodeOf(output: ClassifierOutput, summaries: MachineSummary[]): string | undefined {
  // status_code isn't part of the UI contract's ClassifierOutput — infer
  // OOD/sensor-fault counts from the conditions labels we already mapped
  // (mapAssessment.ts sets these exact strings for those states).
  const summary = summaries.find((m) => m.classifier_output === output);
  if (summary?.conditions.includes("Sensor Fault")) return "SENSOR_FAULT";
  if (output.confidence_band === "UNCERTAIN") return "OUT_OF_DISTRIBUTION";
  return undefined;
}

/** bundle_trained_at from the real deployed model file, when available. */
export function buildLiveSystemStatus(
  summaries: MachineSummary[],
  classifierVersion: string,
  slmVersion: string,
  bundleTrainedAt: string | null | undefined,
): SystemStatus {
  const oodCount = summaries.filter((m) => statusCodeOf(m.classifier_output, summaries) === "OUT_OF_DISTRIBUTION").length;
  const sensorFaultCount = summaries.filter((m) => statusCodeOf(m.classifier_output, summaries) === "SENSOR_FAULT").length;
  return {
    data_quality: sensorFaultCount > 0 ? "DEGRADED" : "GOOD",
    out_of_distribution_count: oodCount,
    sensor_fault_count: sensorFaultCount,
    last_model_update: bundleTrainedAt ?? new Date().toISOString(),
    classifier_version: classifierVersion,
    slm_version: slmVersion,
  };
}
