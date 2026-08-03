import type { ApiClient } from "./client";
import type {
  CopilotRequest,
  CopilotResponse,
  MachineDetail,
  MachineSummary,
  OverviewSummary,
  SystemStatus,
  WhatIfRequest,
  WhatIfResult,
} from "../types/contract";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`API request failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// Real implementation — calls a backend proxy. No secrets/keys live here;
// auth is handled by the proxy via cookies/session, not embedded tokens.
export const httpApiClient: ApiClient = {
  getOverviewSummary: () => request<OverviewSummary>("/overview/summary"),
  getMachineQueue: () => request<MachineSummary[]>("/machines/queue"),
  getMachineDetail: (machineId) => request<MachineDetail>(`/machines/${encodeURIComponent(machineId)}`),
  postCopilotMessage: (req: CopilotRequest) =>
    request<CopilotResponse>("/copilot/message", { method: "POST", body: JSON.stringify(req) }),
  getSystemStatus: () => request<SystemStatus>("/system/status"),
  runWhatIf: (req: WhatIfRequest) =>
    request<WhatIfResult>("/what-if", { method: "POST", body: JSON.stringify(req) }),
};
