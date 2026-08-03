import type { SystemStatus } from "../../types/contract";

export function StatusStrip({ status }: { status: SystemStatus }) {
  const dataQualityColor =
    status.data_quality === "GOOD" ? "--status-normal" : status.data_quality === "DEGRADED" ? "--status-elevated" : "--status-critical";

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
      <div className="bg-surface border border-border-subtle rounded-lg px-3 py-2.5">
        <p className="text-text-muted mb-0.5">Data Quality</p>
        <p className="font-medium flex items-center gap-1.5" style={{ color: `var(${dataQualityColor})` }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: `var(${dataQualityColor})` }} />
          {status.data_quality}
        </p>
      </div>
      <div className="bg-surface border border-border-subtle rounded-lg px-3 py-2.5">
        <p className="text-text-muted mb-0.5">Out of Distribution</p>
        <p className="font-medium text-text-primary tabular-nums">{status.out_of_distribution_count} machines</p>
      </div>
      <div className="bg-surface border border-border-subtle rounded-lg px-3 py-2.5">
        <p className="text-text-muted mb-0.5">Sensor Faults</p>
        <p className="font-medium text-text-primary tabular-nums">{status.sensor_fault_count} machines</p>
      </div>
      <div className="bg-surface border border-border-subtle rounded-lg px-3 py-2.5">
        <p className="text-text-muted mb-0.5">Last Model Update</p>
        <p className="font-medium text-text-primary">
          {new Date(status.last_model_update).toLocaleDateString()} · {status.classifier_version}
        </p>
      </div>
      <div className="bg-surface border border-border-subtle rounded-lg px-3 py-2.5">
        <p className="text-text-muted mb-0.5">Explainer / SLM</p>
        <p className="font-medium text-text-primary">{status.slm_version}</p>
      </div>
    </div>
  );
}
