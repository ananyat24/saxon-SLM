import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api";
import { Card } from "../components/common/Card";
import { ModelConfidenceDonut } from "../components/overview/ModelConfidenceDonut";
import { ConfidenceTrendChart } from "../components/modelconfidence/ConfidenceTrendChart";
import { StatusStrip } from "../components/overview/StatusStrip";
import { DataSourceTag } from "../components/common/DataSourceTag";

export function ModelConfidencePage() {
  const summaryQuery = useQuery({ queryKey: ["overview-summary"], queryFn: apiClient.getOverviewSummary });
  const trendQuery = useQuery({ queryKey: ["model-confidence-trend"], queryFn: apiClient.getModelConfidenceTrend });
  const statusQuery = useQuery({ queryKey: ["system-status"], queryFn: apiClient.getSystemStatus });

  const loading = summaryQuery.isLoading || trendQuery.isLoading || statusQuery.isLoading;
  const error = summaryQuery.isError || trendQuery.isError || statusQuery.isError;

  return (
    <div className="space-y-5 max-w-[1500px]">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Model Confidence</h1>
          <DataSourceTag variant="capable" />
        </div>
        <p className="text-sm text-text-muted">
          Is the classifier trustworthy right now? Current confidence mix, drift over time, and data-quality signals.
        </p>
      </div>

      {loading && <p className="text-sm text-text-muted">Loading model confidence data…</p>}
      {error && <p className="text-sm text-status-critical">Failed to load model confidence data.</p>}

      {summaryQuery.data && trendQuery.data && statusQuery.data && (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2">
              <Card title="Confidence Trend (18 Days)" action={<DataSourceTag variant="coming-soon" />}>
                <ConfidenceTrendChart data={trendQuery.data} />
              </Card>
            </div>
            <Card title="Current Confidence Mix">
              <ModelConfidenceDonut data={summaryQuery.data.model_confidence} />
            </Card>
          </div>

          <Card title="Model Trust Signals">
            <StatusStrip status={statusQuery.data} />
          </Card>
        </>
      )}
    </div>
  );
}
