import type { RiskBand, ConfidenceBand } from "../../types/contract";
import { riskBandMeta, confidenceBandMeta } from "../../config/taxonomy.config";

function Dot({ colorVar }: { colorVar: string }) {
  return <span className="inline-block w-2 h-2 rounded-full" style={{ background: `var(${colorVar})` }} />;
}

export function RiskBadge({ band }: { band: RiskBand }) {
  const meta = riskBandMeta[band];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{
        color: `var(${meta.colorVar})`,
        background: `color-mix(in srgb, var(${meta.colorVar}) 14%, transparent)`,
      }}
    >
      <Dot colorVar={meta.colorVar} />
      {meta.label}
    </span>
  );
}

export function ConfidenceIndicator({ band, value }: { band: ConfidenceBand; value: number }) {
  const meta = confidenceBandMeta[band];
  const strength = band === "HIGH" ? 3 : band === "MEDIUM" ? 2 : band === "LOW" ? 1 : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-3.5 rounded-sm"
            style={{
              background: i < strength ? `var(${meta.colorVar})` : "var(--border-subtle)",
            }}
          />
        ))}
      </div>
      <span className="text-xs text-text-secondary">
        {meta.label.split(" ")[0]} · {(value * 100).toFixed(0)}%
      </span>
    </div>
  );
}

export function ConditionBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-surface-sunken border border-border-subtle px-2 py-0.5 text-xs text-text-secondary">
      {label}
    </span>
  );
}

export function ActionButton({
  label,
  urgency,
  onClick,
}: {
  label: string;
  urgency: "stop" | "inspect" | "monitor";
  onClick?: () => void;
}) {
  const styles: Record<typeof urgency, string> = {
    stop: "bg-status-critical hover:opacity-90 text-white",
    inspect: "bg-status-elevated hover:opacity-90 text-white",
    monitor: "bg-accent hover:bg-accent-strong text-white",
  } as const;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs font-medium rounded-md px-3 py-1.5 whitespace-nowrap transition-colors ${styles[urgency]}`}
    >
      {label}
    </button>
  );
}
