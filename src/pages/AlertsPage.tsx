import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api";
import { Card } from "../components/common/Card";
import { RiskBadge } from "../components/common/StatusBadge";
import { DataSourceTag } from "../components/common/DataSourceTag";
import { LoadingState } from "../components/common/LoadingState";
import type { Alert } from "../types/contract";

const SEVERITY_META: Record<Alert["severity"], { label: string; colorVar: string }> = {
  critical: { label: "Critical", colorVar: "--status-critical" },
  warning: { label: "Warning", colorVar: "--status-elevated" },
  info: { label: "Info", colorVar: "--status-uncertain" },
};

const FILTERS: ("all" | Alert["severity"])[] = ["all", "critical", "warning", "info"];

export function AlertsPage() {
  const [filter, setFilter] = useState<"all" | Alert["severity"]>("all");
  const queryClient = useQueryClient();

  const alertsQuery = useQuery({ queryKey: ["alerts"], queryFn: apiClient.getAlerts });

  const ackMutation = useMutation({
    mutationFn: (id: string) => apiClient.acknowledgeAlert(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alerts"] }),
  });

  const alerts = (alertsQuery.data ?? []).filter((a) => filter === "all" || a.severity === filter);

  return (
    <div className="space-y-5 max-w-[1200px]">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Alerts</h1>
          <DataSourceTag variant="capable" />
        </div>
        <p className="text-sm text-text-muted">Classifier-driven alerts across the monitored fleet.</p>
      </div>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`text-xs font-medium rounded-md px-3 py-1.5 border transition-colors ${
              filter === f
                ? "bg-accent border-accent text-white"
                : "bg-surface border-border-subtle text-text-secondary hover:text-accent"
            }`}
          >
            {f === "all" ? "All" : SEVERITY_META[f].label}
          </button>
        ))}
      </div>

      <Card>
        {alertsQuery.isLoading && <LoadingState compact label="Fetching current alerts…" />}
        {alertsQuery.isError && <p className="text-sm text-status-critical">Failed to load alerts.</p>}
        {alertsQuery.data && alerts.length === 0 && (
          <p className="text-sm text-text-muted">No alerts match this filter.</p>
        )}
        <ul className="divide-y divide-border-subtle">
          {alerts.map((a) => {
            const meta = SEVERITY_META[a.severity];
            return (
              <li
                key={a.id}
                className="py-3 flex items-start gap-3 pl-3 border-l-2"
                style={{
                  borderColor: a.acknowledged ? "transparent" : `var(${meta.colorVar})`,
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded"
                      style={{
                        color: `var(${meta.colorVar})`,
                        background: `color-mix(in srgb, var(${meta.colorVar}) 14%, transparent)`,
                      }}
                    >
                      {meta.label}
                    </span>
                    <RiskBadge band={a.risk_band} />
                    <span className="text-xs text-text-muted">{a.machine_id}</span>
                    <span className="text-xs text-text-muted ml-auto">
                      {new Date(a.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-text-primary">{a.message}</p>
                </div>
                <div className="shrink-0">
                  {a.acknowledged ? (
                    <span className="text-xs text-text-muted">Acknowledged</span>
                  ) : (
                    <button
                      type="button"
                      disabled={ackMutation.isPending}
                      onClick={() => ackMutation.mutate(a.id)}
                      className="text-xs font-medium rounded-md px-3 py-1.5 bg-accent hover:bg-accent-strong text-white disabled:opacity-50 transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
