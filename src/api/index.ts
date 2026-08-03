import type { ApiClient } from "./client";
import { mockApiClient } from "./mock/mockApiClient";
import { httpApiClient } from "./httpApiClient";

const mode = import.meta.env.VITE_API_MODE ?? "mock";

export const apiClient: ApiClient = mode === "live" ? httpApiClient : mockApiClient;

export type { ApiClient };
