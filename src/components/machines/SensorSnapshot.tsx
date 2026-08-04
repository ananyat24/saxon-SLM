import type { ClassifierOutput } from "../../types/contract";
import { sensorFieldMeta } from "../../config/taxonomy.config";

export function SensorSnapshot({ output }: { output: ClassifierOutput }) {
  const crossedFields = new Set(output.thresholds_crossed.map((t) => t.field));
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {Object.entries(output.sensor_snapshot).map(([field, value]) => {
        const meta = sensorFieldMeta[field] ?? { label: field, unit: "" };
        const crossed = crossedFields.has(field);
        return (
          <div
            key={field}
            className={`rounded-md border px-3 py-2 ${
              crossed ? "border-status-critical/40 bg-status-critical/10" : "border-border-subtle bg-surface-sunken"
            }`}
          >
            <p className="text-[11px] text-text-muted">{meta.label}</p>
            <p className="text-sm font-medium text-text-primary font-mono-tabular">
              {value}
              {meta.unit}
            </p>
          </div>
        );
      })}
    </div>
  );
}
