import type { ConfidenceBand, FailureCode, RiskBand } from "../types/contract";

// Failure-code taxonomy is client-specific — different plants may map
// different codes/labels onto the same underlying classifier flags.
export interface FailureCodeMeta {
  label: string;
  shortLabel: string;
  description: string;
  colorVar: string;
}

export const failureTaxonomy: Record<FailureCode, FailureCodeMeta> = {
  hdf: {
    label: "Heat Dissipation Failure",
    shortLabel: "HDF",
    description: "Process/air temperature differential too low combined with low rotational speed.",
    colorVar: "--status-high",
  },
  pwf: {
    label: "Power Failure",
    shortLabel: "PWF",
    description: "Power (torque x rotational speed) outside the acceptable operating envelope.",
    colorVar: "--status-elevated",
  },
  osf: {
    label: "Overstrain Failure",
    shortLabel: "OSF",
    description: "Tool wear x torque product exceeds the strain limit for this product type.",
    colorVar: "--status-critical",
  },
  twf: {
    label: "Tool Wear Failure",
    shortLabel: "TWF",
    description: "Tool wear minutes exceed the expected failure window.",
    colorVar: "--status-uncertain",
  },
};

export const riskBandMeta: Record<RiskBand, { label: string; colorVar: string }> = {
  CRITICAL: { label: "Critical", colorVar: "--status-critical" },
  HIGH: { label: "High Risk", colorVar: "--status-high" },
  ELEVATED: { label: "Elevated", colorVar: "--status-elevated" },
  NORMAL: { label: "Normal", colorVar: "--status-normal" },
  UNCERTAIN: { label: "Uncertain / OOD", colorVar: "--status-uncertain" },
};

export const confidenceBandMeta: Record<ConfidenceBand, { label: string; colorVar: string }> = {
  HIGH: { label: "High (>=90%)", colorVar: "--status-normal" },
  MEDIUM: { label: "Medium (70-90%)", colorVar: "--status-elevated" },
  LOW: { label: "Low (<70%)", colorVar: "--status-high" },
  UNCERTAIN: { label: "Uncertain / OOD", colorVar: "--status-uncertain" },
};

// Thresholds used purely for display context in Copilot "why flagged" explanations.
// The real threshold-crossing values always come from ClassifierOutput.thresholds_crossed;
// this config only supplies human-readable field labels/units.
export const sensorFieldMeta: Record<string, { label: string; unit: string }> = {
  air_temperature_k: { label: "Air Temperature", unit: "K" },
  process_temperature_k: { label: "Process Temperature", unit: "K" },
  rotational_speed_rpm: { label: "Rotational Speed", unit: "rpm" },
  torque_nm: { label: "Torque", unit: "Nm" },
  tool_wear_min: { label: "Tool Wear", unit: "min" },
};
