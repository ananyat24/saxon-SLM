// Maps saxon_machine_health_api's real response shapes onto this app's UI
// contract (src/types/contract.ts). All values here originate from the
// live backend call — nothing in this file invents classifier numbers.
import type {
  ClassifierOutput,
  ConfidenceBand,
  FailureCode,
  MachineSummary,
  RiskBand,
  ThresholdCrossing,
} from "../../types/contract";
import type { AssessmentResponse, MachineReading } from "./backendTypes";
import type { RosterEntry } from "./machineRoster";

const FAILURE_CODES: FailureCode[] = ["hdf", "pwf", "osf", "twf"];

function riskBandFromBackend(band: string): RiskBand {
  const upper = band.toUpperCase();
  if (upper === "UNKNOWN") return "UNCERTAIN";
  if (upper === "CRITICAL" || upper === "HIGH" || upper === "ELEVATED" || upper === "NORMAL" || upper === "UNCERTAIN") {
    return upper;
  }
  return "UNCERTAIN";
}

function confidenceBandFromString(band: string): ConfidenceBand {
  switch (band) {
    case "very_high":
    case "high":
      return "HIGH";
    case "moderate":
    case "rule_based":
      return "MEDIUM";
    case "low":
      return "LOW";
    default:
      return "UNCERTAIN";
  }
}

function deriveConfidence(a: AssessmentResponse): { confidence: number; confidence_band: ConfidenceBand } {
  const statusCode = a.input_validation.status_code;
  if (!a.input_validation.valid || statusCode === "OUT_OF_DISTRIBUTION") {
    // Not a real "we're 0% sure" number — reflects that this reading falls
    // outside what the model was validated on, so its confidence band is
    // downgraded regardless of the raw probability magnitude.
    const fallback = a.overall_failure_probability ?? 0.5;
    return { confidence: fallback, confidence_band: "UNCERTAIN" };
  }

  const detected = a.all_detected_conditions.filter((c) => c.probability !== null);
  if (detected.length > 0) {
    const top = detected.reduce((best, c) => ((c.probability ?? 0) > (best.probability ?? 0) ? c : best));
    return { confidence: top.probability ?? 0, confidence_band: confidenceBandFromString(top.confidence_band) };
  }

  // No probability-based condition detected (clean reading, or only the
  // rule-based ELEVATED_TOOL_WEAR flag) — use confidence that the machine
  // is healthy, i.e. the inverse of the overall failure probability.
  const healthyConfidence = 1 - (a.overall_failure_probability ?? 0);
  const band: ConfidenceBand = healthyConfidence >= 0.9 ? "HIGH" : healthyConfidence >= 0.7 ? "MEDIUM" : "LOW";
  return { confidence: healthyConfidence, confidence_band: band };
}

function flagsFromAssessment(a: AssessmentResponse): Record<FailureCode, boolean> {
  const detectedTypes = new Set(a.all_detected_conditions.map((c) => c.failure_type));
  const flags = {} as Record<FailureCode, boolean>;
  for (const code of FAILURE_CODES) {
    flags[code] = detectedTypes.has(code.toUpperCase());
  }
  return flags;
}

function thresholdsCrossedFromAssessment(a: AssessmentResponse, reading: MachineReading): ThresholdCrossing[] {
  const crossings: ThresholdCrossing[] = [];

  // Real out-of-training-distribution flags from the backend's own validation.
  for (const f of a.input_validation.out_of_range_fields) {
    if (f.value > f.training_high) {
      crossings.push({ field: f.field, value: f.value, threshold: f.training_high, direction: "above" });
    } else if (f.value < f.training_low) {
      crossings.push({ field: f.field, value: f.value, threshold: f.training_low, direction: "below" });
    }
  }

  // Real per-condition probability vs. the model's own decision threshold.
  for (const c of a.all_detected_conditions) {
    if (c.failure_type === "ELEVATED_TOOL_WEAR") {
      crossings.push({
        field: "tool_wear_min",
        value: reading.tool_wear_min,
        threshold: c.decision_threshold,
        direction: "above",
      });
      continue;
    }
    if (c.probability !== null) {
      crossings.push({
        field: `${c.failure_type.toLowerCase()}_probability`,
        value: c.probability,
        threshold: c.decision_threshold,
        direction: "above",
      });
    }
  }

  return crossings;
}

export function conditionsFromAssessment(a: AssessmentResponse): string[] {
  const statusCode = a.input_validation.status_code;
  if (statusCode === "SENSOR_FAULT") return ["Sensor Fault"];
  if (statusCode === "INSUFFICIENT_INFORMATION") return ["Insufficient Info"];

  const labels = a.all_detected_conditions.map((c) =>
    c.failure_type === "ELEVATED_TOOL_WEAR" ? "Elevated Tool Wear" : c.failure_type,
  );
  return labels.length ? labels : ["Insufficient Info"];
}

export function recommendedActionFromAssessment(a: AssessmentResponse): MachineSummary["recommended_action"] {
  const code = a.recommended_action_code;
  if (code.startsWith("STOP_AND_INSPECT")) return { label: "Stop and inspect", urgency: "stop" };
  if (code === "INSPECT_OR_REPLACE_TOOL" || code === "PLAN_TOOL_INSPECTION" || code === "REVIEW_MACHINE_CONDITION" || code === "CHECK_INPUT_DATA") {
    return { label: "Inspect", urgency: "inspect" };
  }
  return { label: "Monitor", urgency: "monitor" };
}

export function assessmentToClassifierOutput(reading: MachineReading, a: AssessmentResponse): ClassifierOutput {
  const { confidence, confidence_band } = deriveConfidence(a);
  return {
    machine_id: a.machine_id ?? reading.machine_id ?? "UNKNOWN",
    timestamp: new Date().toISOString(),
    flags: flagsFromAssessment(a),
    risk_band: riskBandFromBackend(a.overall_risk_band),
    confidence,
    confidence_band,
    sensor_snapshot: {
      air_temperature_k: reading.air_temperature_k,
      process_temperature_k: reading.process_temperature_k,
      rotational_speed_rpm: reading.rotational_speed_rpm,
      torque_nm: reading.torque_nm,
      tool_wear_min: reading.tool_wear_min,
    },
    thresholds_crossed: thresholdsCrossedFromAssessment(a, reading),
    classifier_version: a.model_version,
  };
}

export function assessmentToMachineSummary(entry: RosterEntry, a: AssessmentResponse): MachineSummary {
  return {
    machine_id: entry.machine_id,
    line: entry.line,
    cell: entry.cell,
    classifier_output: assessmentToClassifierOutput(entry.reading, a),
    recommended_action: recommendedActionFromAssessment(a),
    conditions: conditionsFromAssessment(a),
  };
}
