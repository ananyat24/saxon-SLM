import type {
  Alert,
  CopilotRequest,
  CopilotResponse,
  CreateWorkOrderInput,
  MachineDetail,
  MachineSummary,
  ModelConfidenceTrendPoint,
  OverviewSummary,
  Report,
  SystemStatus,
  WhatIfRequest,
  WhatIfResult,
  WorkOrder,
} from "../types/contract";

export interface ApiClient {
  getOverviewSummary(): Promise<OverviewSummary>;
  getMachineQueue(): Promise<MachineSummary[]>;
  getMachineDetail(machineId: string): Promise<MachineDetail>;
  postCopilotMessage(req: CopilotRequest): Promise<CopilotResponse>;
  getSystemStatus(): Promise<SystemStatus>;
  runWhatIf(req: WhatIfRequest): Promise<WhatIfResult>;
  getAlerts(): Promise<Alert[]>;
  acknowledgeAlert(id: string): Promise<void>;
  getModelConfidenceTrend(): Promise<ModelConfidenceTrendPoint[]>;
  getReports(): Promise<Report[]>;
  getWorkOrders(): Promise<WorkOrder[]>;
  createWorkOrder(input: CreateWorkOrderInput): Promise<WorkOrder>;
}
