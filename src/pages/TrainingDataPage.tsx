import { useQuery } from "@tanstack/react-query";
import { Card } from "../components/common/Card";
import { DataSourceTag } from "../components/common/DataSourceTag";
import { CountBarList } from "../components/trainingdata/CountBarList";
import { sensorFieldMeta } from "../config/taxonomy.config";
import { isLiveApiMode } from "../api";
import { backendClient } from "../api/live/backendClient";
import { trainingDatasetSnapshot } from "../api/live/trainingDatasetSnapshot";

function featureLabel(field: string): string {
  if (field === "product_type") return "Product Type";
  return sensorFieldMeta[field]?.label ?? field;
}

export function TrainingDataPage() {
  const datasetInfoQuery = useQuery({
    queryKey: ["dataset-info"],
    queryFn: backendClient.datasetInfo,
    enabled: isLiveApiMode,
  });

  return (
    <div className="space-y-5 max-w-[1500px]">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Training Data</h1>
          <DataSourceTag variant="capable" />
        </div>
        <p className="text-sm text-text-muted">What the deployed classifier was trained on and validated against.</p>
      </div>

      {!isLiveApiMode && (
        <Card>
          <p className="text-sm text-text-muted">
            Training data detail is read directly from the deployed model — switch to the live backend
            (<code className="text-xs bg-surface-sunken rounded px-1 py-0.5">VITE_API_MODE=live</code>) to see it.
          </p>
        </Card>
      )}

      {isLiveApiMode && datasetInfoQuery.isLoading && <p className="text-sm text-text-muted">Loading model metadata…</p>}
      {isLiveApiMode && datasetInfoQuery.isError && (
        <p className="text-sm text-status-critical">Failed to load dataset info from the backend.</p>
      )}

      {datasetInfoQuery.data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card title="Model">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-text-muted">Version</dt>
                  <dd className="text-text-primary font-medium font-mono-tabular">{datasetInfoQuery.data.model_version}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-muted">Trained</dt>
                  <dd className="text-text-primary font-medium">
                    {datasetInfoQuery.data.bundle_trained_at
                      ? new Date(datasetInfoQuery.data.bundle_trained_at).toLocaleString()
                      : "Unknown"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-muted">Failure targets</dt>
                  <dd className="text-text-primary font-medium">{datasetInfoQuery.data.failure_targets.join(", ")}</dd>
                </div>
              </dl>
            </Card>

            <Card title="Raw Input Features" className="md:col-span-1">
              <ul className="text-sm text-text-secondary space-y-1.5">
                {datasetInfoQuery.data.raw_input_features.map((f) => (
                  <li key={f} className="flex justify-between">
                    <span>{featureLabel(f)}</span>
                    <span className="text-text-muted font-mono-tabular text-xs">{f}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card title="Engineered Features">
              <ul className="text-sm text-text-secondary space-y-1.5">
                {datasetInfoQuery.data.model_features
                  .filter((f) => !datasetInfoQuery.data!.raw_input_features.includes(f))
                  .map((f) => (
                    <li key={f} className="font-mono-tabular text-xs text-text-muted">
                      {f}
                    </li>
                  ))}
              </ul>
            </Card>
          </div>

          <Card title="Per-Target Decision Thresholds">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-text-muted border-b border-border-subtle">
                    <th className="py-2 pr-4 font-medium">Target</th>
                    <th className="py-2 pr-4 font-medium text-right">Threshold</th>
                    <th className="py-2 pr-4 font-medium text-right">Precision</th>
                    <th className="py-2 pr-4 font-medium text-right">Recall</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(datasetInfoQuery.data.thresholds).map(([name, t]) => (
                    <tr key={name} className="border-b border-border-subtle last:border-0">
                      <td className="py-2 pr-4 font-medium text-text-primary">{name}</td>
                      <td className="py-2 pr-4 text-right font-mono-tabular text-text-secondary">{t.threshold.toFixed(4)}</td>
                      <td className="py-2 pr-4 text-right font-mono-tabular text-text-secondary">
                        {t.precision != null ? `${(t.precision * 100).toFixed(1)}%` : "—"}
                      </td>
                      <td className="py-2 pr-4 text-right font-mono-tabular text-text-secondary">
                        {t.recall != null ? `${(t.recall * 100).toFixed(1)}%` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card title="Training Distribution Ranges" action={<span className="text-[11px] text-text-muted">Used for out-of-distribution detection</span>}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-text-muted border-b border-border-subtle">
                      <th className="py-2 pr-4 font-medium">Field</th>
                      <th className="py-2 pr-4 font-medium text-right">Low</th>
                      <th className="py-2 pr-4 font-medium text-right">High</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(datasetInfoQuery.data.distribution_ranges).map(([field, r]) => (
                      <tr key={field} className="border-b border-border-subtle last:border-0">
                        <td className="py-2 pr-4 text-text-primary">{featureLabel(field)}</td>
                        <td className="py-2 pr-4 text-right font-mono-tabular text-text-secondary">
                          {r.low.toFixed(2)}
                          {sensorFieldMeta[field]?.unit}
                        </td>
                        <td className="py-2 pr-4 text-right font-mono-tabular text-text-secondary">
                          {r.high.toFixed(2)}
                          {sensorFieldMeta[field]?.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card title="Plausible Input Limits" action={<span className="text-[11px] text-text-muted">Used for input validation</span>}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-text-muted border-b border-border-subtle">
                      <th className="py-2 pr-4 font-medium">Field</th>
                      <th className="py-2 pr-4 font-medium text-right">Min</th>
                      <th className="py-2 pr-4 font-medium text-right">Max</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(datasetInfoQuery.data.plausible_limits).map(([field, [lo, hi]]) => (
                      <tr key={field} className="border-b border-border-subtle last:border-0">
                        <td className="py-2 pr-4 text-text-primary">{featureLabel(field)}</td>
                        <td className="py-2 pr-4 text-right font-mono-tabular text-text-secondary">{lo}</td>
                        <td className="py-2 pr-4 text-right font-mono-tabular text-text-secondary">{hi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </>
      )}

      <Card
        title="Training Dataset Snapshot"
        action={<DataSourceTag variant="coming-soon" />}
      >
        <p className="text-xs text-text-muted mb-4">
          Counted directly from <span className="font-mono-tabular">{trainingDatasetSnapshot.fileName}</span> (
          {trainingDatasetSnapshot.totalRows.toLocaleString()} rows) — a fixed reference snapshot, not a live query,
          since the dataset itself doesn't change between requests.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">By primary failure class</p>
            <CountBarList data={trainingDatasetSnapshot.byPrimaryClass} />
          </div>
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">By split</p>
              <CountBarList data={trainingDatasetSnapshot.bySplit} />
            </div>
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">By product type</p>
              <CountBarList data={trainingDatasetSnapshot.byProductType} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
