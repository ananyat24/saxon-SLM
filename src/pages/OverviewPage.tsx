import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api";
import { KpiStrip } from "../components/overview/KpiStrip";
import { AttentionQueue } from "../components/overview/AttentionQueue";
import { RiskDonut } from "../components/overview/RiskDonut";
import { TopFailureBars } from "../components/overview/TopFailureBars";
import { RiskTrendChart } from "../components/overview/RiskTrendChart";
import { RiskByLineChart } from "../components/overview/RiskByLineChart";
import { ModelConfidenceDonut } from "../components/overview/ModelConfidenceDonut";
import { StatusStrip } from "../components/overview/StatusStrip";
import { Card } from "../components/common/Card";
import { useUiStore } from "../store/uiStore";

export function OverviewPage() {
  const setSelectedMachineId = useUiStore((s) => s.setSelectedMachineId);
  const setCopilotCollapsed = useUiStore((s) => s.setCopilotCollapsed);

  const summaryQuery = useQuery({ queryKey: ["overview-summary"], queryFn: apiClient.getOverviewSummary });
  const queueQuery = useQuery({ queryKey: ["machine-queue"], queryFn: apiClient.getMachineQueue });
  const statusQuery = useQuery({ queryKey: ["system-status"], queryFn: apiClient.getSystemStatus });

  function handleSelect(machineId: string) {
    setSelectedMachineId(machineId);
    setCopilotCollapsed(false);
  }

  if (summaryQuery.isLoading || queueQuery.isLoading || statusQuery.isLoading) {
    return <div className="text-sm text-text-muted">Loading overview…</div>;
  }
  if (summaryQuery.isError || queueQuery.isError || statusQuery.isError || !summaryQuery.data || !queueQuery.data || !statusQuery.data) {
    return <div className="text-sm text-status-critical">Failed to load overview data.</div>;
  }

  const summary = summaryQuery.data;
  const queue = queueQuery.data;
  const status = statusQuery.data;

  return (
    <div className="space-y-5 max-w-[1500px]">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Fleet Overview</h1>
        <p className="text-sm text-text-muted">Real-time classifier output across all monitored machines.</p>
      </div>

      <KpiStrip kpis={summary.kpis} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-5">
          <Card title="Machine Attention Queue">
            <AttentionQueue queue={queue} onSelect={handleSelect} />
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card title="Risk Trend (7 Days)">
              <RiskTrendChart data={summary.risk_trend} />
            </Card>
            <Card title="Risk by Line">
              <RiskByLineChart data={summary.risk_by_line} />
            </Card>
          </div>
        </div>

        <div className="space-y-5">
          <Card title="Risk Distribution">
            <RiskDonut data={summary.risk_distribution} />
          </Card>
          <Card title="Top Failure Conditions">
            <TopFailureBars data={summary.top_failure_conditions} />
          </Card>
          <Card title="Model Confidence Overview">
            <ModelConfidenceDonut data={summary.model_confidence} />
          </Card>
        </div>
      </div>

      <StatusStrip status={status} />
    </div>
  );
}
