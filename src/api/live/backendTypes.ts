// Types mirroring saxon_machine_health_api's Pydantic schemas exactly
// (app/schemas/requests.py, app/schemas/responses.py). Kept separate from
// src/types/contract.ts because these are the REAL backend's wire format,
// not the frontend's UI-facing contract — mapBackendToContract.ts converts
// between the two.

export interface MachineReading {
  machine_id?: string | null;
  product_type: "L" | "M" | "H";
  air_temperature_k: number;
  process_temperature_k: number;
  rotational_speed_rpm: number;
  torque_nm: number;
  tool_wear_min: number;
}

export interface InputValidation {
  valid: boolean;
  status_code: string;
  missing_fields: string[];
  invalid_fields: string[];
  out_of_range_fields: { field: string; value: number; training_low: number; training_high: number }[];
}

export interface DetectedCondition {
  failure_type: string;
  severity: string;
  probability: number | null;
  confidence_band: string;
  decision_threshold: number;
}

export interface Answerability {
  can_estimate_current_condition: boolean;
  can_predict_exact_failure_time: boolean;
  can_estimate_remaining_useful_life: boolean;
  can_identify_exact_component_root_cause: boolean;
  prediction_requires_caution?: boolean | null;
}

export interface AssessmentResponse {
  assessment_id: string;
  machine_id?: string | null;
  input_validation: InputValidation;
  derived_values: Record<string, number>;
  machine_failure: boolean | null;
  overall_failure_probability?: number | null;
  overall_failure_threshold?: number | null;
  overall_risk_band: string;
  primary_failure: string;
  secondary_conditions: string[];
  all_detected_conditions: DetectedCondition[];
  failure_probabilities: Record<string, number>;
  recommended_action_code: string;
  answerability: Answerability;
  model_version: string;
  schema_version: string;
}

export interface ExplainResponse {
  assessment_id: string;
  status_code: string;
  summary: string;
  primary_condition?: string | null;
  all_detected_conditions: string[];
  explanation: string;
  recommended_action_code: string;
  recommended_action: string;
  limitations: Record<string, boolean>;
  classifier_version: string;
  slm_version: string;
  schema_version: string;
}

export interface WhatIfBackendResponse {
  assessment_id: string;
  intervention: string;
  current_assessment: AssessmentResponse;
  proposed_assessment: AssessmentResponse;
  conditions_removed: string[];
  conditions_added: string[];
  risk_changed: boolean;
  explanation: string;
  slm_version: string;
  schema_version: string;
}

export interface HealthResponse {
  status: "healthy" | "degraded";
  classifier_loaded: boolean;
  classifier_mock_mode: boolean;
  slm_mode: string;
  classifier_version: string;
  slm_version: string;
  api_version: string;
}
