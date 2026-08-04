import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "../api";
import { Card } from "../components/common/Card";
import { RiskBadge, ConfidenceIndicator } from "../components/common/StatusBadge";
import { sensorFieldMeta } from "../config/taxonomy.config";
import type { ClassifierOutput } from "../types/contract";

function OutputPanel({ label, output }: { label: string; output: ClassifierOutput }) {
  const flagged = (Object.entries(output.flags) as [string, boolean][]).filter(([, v]) => v);
  return (
    <div className="rounded-md border border-border-subtle p-4 space-y-3">
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">{label}</p>
      <div className="flex flex-wrap items-center gap-2">
        <RiskBadge band={output.risk_band} />
        <ConfidenceIndicator band={output.confidence_band} value={output.confidence} />
      </div>
      <p className="text-xs text-text-muted">
        Flags: {flagged.length ? flagged.map(([k]) => k.toUpperCase()).join(", ") : "none"}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(output.sensor_snapshot).map(([field, value]) => {
          const meta = sensorFieldMeta[field] ?? { label: field, unit: "" };
          return (
            <div key={field} className="text-xs">
              <p className="text-text-muted">{meta.label}</p>
              <p className="text-text-primary font-medium font-mono-tabular">
                {value}
                {meta.unit}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function WhatIfPage() {
  const queueQuery = useQuery({ queryKey: ["machine-queue"], queryFn: apiClient.getMachineQueue });
  const [machineId, setMachineId] = useState<string>("");
  const [overrides, setOverrides] = useState<Record<string, number>>({});

  const detailQuery = useQuery({
    queryKey: ["machine-detail", machineId],
    queryFn: () => apiClient.getMachineDetail(machineId),
    enabled: !!machineId,
  });

  useEffect(() => {
    if (!machineId && queueQuery.data && queueQuery.data.length > 0) {
      setMachineId(queueQuery.data[0].machine_id);
    }
  }, [machineId, queueQuery.data]);

  useEffect(() => {
    if (detailQuery.data) {
      setOverrides({ ...detailQuery.data.classifier_output.sensor_snapshot });
    }
  }, [detailQuery.data]);

  const whatIfMutation = useMutation({
    mutationFn: () => apiClient.runWhatIf({ machine_id: machineId, sensor_overrides: overrides }),
  });

  const fields = Object.keys(sensorFieldMeta);

  return (
    <div className="space-y-5 max-w-[1500px]">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">What-If Simulator</h1>
        <p className="text-sm text-text-muted">
          Adjust sensor inputs for a machine and re-score against the classifier to see the projected impact.
        </p>
      </div>

      <Card title="Scenario Setup">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Machine</label>
            <select
              value={machineId}
              onChange={(e) => {
                setMachineId(e.target.value);
                whatIfMutation.reset();
              }}
              className="w-full max-w-xs bg-surface border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary"
            >
              {(queueQuery.data ?? []).map((m) => (
                <option key={m.machine_id} value={m.machine_id}>
                  {m.machine_id} — {m.line} / {m.cell}
                </option>
              ))}
            </select>
          </div>

          {detailQuery.data && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map((field) => {
                const meta = sensorFieldMeta[field];
                const baseline = detailQuery.data.classifier_output.sensor_snapshot[field] ?? 0;
                const value = overrides[field] ?? baseline;
                const min = Math.max(0, baseline * 0.5);
                const max = baseline * 1.5 || 100;
                return (
                  <div key={field}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-text-secondary">
                        {meta.label} ({meta.unit})
                      </span>
                      <span className="font-mono-tabular text-text-primary font-medium">{value}</span>
                    </div>
                    <input
                      type="range"
                      min={min}
                      max={max}
                      step={1}
                      value={value}
                      onChange={(e) => setOverrides((o) => ({ ...o, [field]: Number(e.target.value) }))}
                      className="w-full accent-accent"
                    />
                    <p className="text-[11px] text-text-muted mt-0.5">Baseline: {baseline}{meta.unit}</p>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={!machineId || whatIfMutation.isPending}
              onClick={() => whatIfMutation.mutate()}
              className="text-sm font-medium rounded-md px-4 py-2 bg-accent hover:bg-accent-strong text-white disabled:opacity-50 transition-colors"
            >
              {whatIfMutation.isPending ? "Running simulation…" : "Run What-If Simulation"}
            </button>
            {whatIfMutation.isError && (
              <span className="text-xs text-status-critical">Simulation failed. Try again.</span>
            )}
          </div>
        </div>
      </Card>

      {whatIfMutation.data && (
        <Card title="Result">
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">{whatIfMutation.data.delta_summary}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <OutputPanel label="Baseline" output={whatIfMutation.data.baseline} />
              <OutputPanel label="Simulated" output={whatIfMutation.data.simulated} />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
