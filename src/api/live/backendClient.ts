// Thin fetch wrapper around the real saxon_machine_health_api service.
// VITE_API_BASE_URL should point at the API's versioned root, e.g.
// http://localhost:8010/api/v1 for local dev, matching that service's
// api_prefix setting.
import type { AssessmentResponse, DatasetInfoResponse, ExplainResponse, HealthResponse, MachineReading, WhatIfBackendResponse } from "./backendTypes";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`Machine Health API request failed: ${res.status} ${res.statusText} — ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Machine Health API request failed: ${res.status} ${res.statusText} — ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

export const backendClient = {
  health: () => get<HealthResponse>("/health"),
  datasetInfo: () => get<DatasetInfoResponse>("/dataset-info"),
  assess: (reading: MachineReading) => post<AssessmentResponse>("/assess", reading),
  explain: (question: string, reading: MachineReading) => post<ExplainResponse>("/explain", { question, reading }),
  whatIf: (intervention: string, current: MachineReading, proposed: MachineReading) =>
    post<WhatIfBackendResponse>("/what-if", { intervention, current, proposed }),
};
