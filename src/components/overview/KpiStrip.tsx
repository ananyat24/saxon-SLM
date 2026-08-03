import type { OverviewSummary } from "../../types/contract";

const TILES: {
  key: keyof OverviewSummary["kpis"];
  label: string;
  sub: string;
  colorVar: string;
}[] = [
  { key: "monitored", label: "Machines Monitored", sub: "Total fleet", colorVar: "--accent" },
  { key: "critical", label: "Critical", sub: "Stop and inspect", colorVar: "--status-critical" },
  { key: "high", label: "High Risk", sub: "Inspect soon", colorVar: "--status-high" },
  { key: "elevated", label: "Elevated", sub: "Watch closely", colorVar: "--status-elevated" },
  { key: "normal", label: "Normal", sub: "Operating fine", colorVar: "--status-normal" },
  { key: "uncertain", label: "Uncertain / OOD", sub: "Needs review", colorVar: "--status-uncertain" },
];

export function KpiStrip({ kpis }: { kpis: OverviewSummary["kpis"] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {TILES.map((tile) => (
        <div key={tile.key} className="bg-surface border border-border-subtle rounded-lg p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: `var(${tile.colorVar})` }}
              aria-hidden
            />
            <p className="text-xs font-medium text-text-secondary">{tile.label}</p>
          </div>
          <p className="text-2xl font-semibold text-text-primary font-mono-tabular">{kpis[tile.key]}</p>
          <p className="text-[11px] text-text-muted">{tile.sub}</p>
        </div>
      ))}
    </div>
  );
}
