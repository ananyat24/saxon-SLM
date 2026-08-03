// Core API contract shared by mock and live adapters.
// This mirrors the real classifier / SLM inference schema.

export type RiskBand = "CRITICAL" | "HIGH" | "ELEVATED" | "NORMAL" | "UNCERTAIN";
export type ConfidenceBand = "HIGH" | "MEDIUM" | "LOW" | "UNCERTAIN";
export type FailureCode = "hdf" | "pwf" | "osf" | "twf";

export interface ThresholdCrossing {
  field: string;
  value: number;
  threshold: number;
  direction: "above" | "below";
}

export interface ClassifierOutput {
  machine_id: string;
  timestamp: string; // ISO 8601
  flags: Record<FailureCode, boolean>;
  risk_band: RiskBand;
  confidence: number; // 0-1
  confidence_band: ConfidenceBand;
  sensor_snapshot: Record<string, number>;
  thresholds_crossed: ThresholdCrossing[];
  classifier_version: string;
}

export interface CopilotMessage {
  role: "user" | "assistant";
  content: string;
  machine_id?: string;
  classifier_output_ref?: string;
  timestamp: string;
}

export interface CopilotRequest {
  machine_id: string;
  question: string;
}

export interface CopilotResponse {
  message: CopilotMessage;
  suggested_questions: string[];
}

export interface MachineSummary {
  machine_id: string;
  line: string;
  cell: string;
  classifier_output: ClassifierOutput;
  recommended_action: {
    label: string;
    urgency: "stop" | "inspect" | "monitor";
  };
  conditions: string[]; // e.g. ["OSF", "Elevated Tool Wear"]
}

export interface OverviewSummary {
  kpis: {
    monitored: number;
    critical: number;
    high: number;
    elevated: number;
    normal: number;
    uncertain: number;
  };
  risk_distribution: { band: RiskBand; count: number }[];
  top_failure_conditions: { label: string; count: number }[];
  risk_trend: { date: string; critical: number; high: number; elevated: number; normal: number; uncertain: number }[];
  risk_by_line: { line: string; critical: number; high: number; elevated: number; normal: number; uncertain: number }[];
  model_confidence: { band: ConfidenceBand; count: number }[];
}

export interface SystemStatus {
  data_quality: "GOOD" | "DEGRADED" | "POOR";
  out_of_distribution_count: number;
  sensor_fault_count: number;
  last_model_update: string; // ISO date
  classifier_version: string;
  slm_version: string;
}

export interface WhatIfRequest {
  machine_id: string;
  sensor_overrides: Record<string, number>;
}

export interface WhatIfResult {
  baseline: ClassifierOutput;
  simulated: ClassifierOutput;
  delta_summary: string;
}

export interface MachineDetail extends MachineSummary {
  history: ClassifierOutput[];
}
