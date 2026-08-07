import type { OverviewSummary } from "../../types/contract";

export function TopFailureBars({ data }: { data: OverviewSummary["top_failure_conditions"] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <ul className="space-y-2.5">
      {data.map((d) => (
        <li key={d.label}>
          <div className="flex items-center justify-between gap-2 text-xs mb-1">
            <span className="text-text-secondary min-w-0 truncate" title={d.label}>{d.label}</span>
            <span className="tabular-nums font-medium text-text-primary shrink-0">{d.count}</span>
          </div>
          <div className="h-2 rounded-full bg-surface-sunken overflow-hidden">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${(d.count / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
