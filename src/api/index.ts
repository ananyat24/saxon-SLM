import type { ApiClient } from "./client";
import { mockApiClient } from "./mock/mockApiClient";
import { liveApiClient } from "./live/liveApiClient";

const mode = import.meta.env.VITE_API_MODE ?? "mock";

export const isLiveApiMode = mode === "live";

// "live" currently means: the real saxon_machine_health_api classifier/SLM
// backend for machine assessment, copilot Q&A, and what-if analysis, with
// everything else (fleet aggregation, alerts, work orders, reports,
// confidence drift) still served from mock fixtures — see liveApiClient.ts.
export const apiClient: ApiClient = isLiveApiMode ? liveApiClient : mockApiClient;

export type { ApiClient };
