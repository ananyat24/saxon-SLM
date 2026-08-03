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

export interface ApiClient {
  getOverviewSummary(): Promise<OverviewSummary>;
  getMachineQueue(): Promise<MachineSummary[]>;
  getMachineDetail(machineId: string): Promise<MachineDetail>;
  postCopilotMessage(req: CopilotRequest): Promise<CopilotResponse>;
  getSystemStatus(): Promise<SystemStatus>;
  runWhatIf(req: WhatIfRequest): Promise<WhatIfResult>;
}
