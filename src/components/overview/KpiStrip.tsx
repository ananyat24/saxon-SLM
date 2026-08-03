import type { OverviewSummary } from "../../types/contract";

const TILES: {
  key: keyof OverviewSummary["kpis"];
  label: string;
  sub: string;
  colorVar: string;
  icon: string;
}[] = [
  { key: "monitored", label: "Machines Monitored", sub: "Total fleet", colorVar: "--accent", icon: "🏭" },
  { key: "critical", label: "Critical", sub: "Stop and inspect", colorVar: "--status-critical", icon: "🛑" },
  { key: "high", label: "High Risk", sub: "Inspect soon", colorVar: "--status-high", icon: "⚠️" },
  { key: "elevated", label: "Elevated", sub: "Watch closely", colorVar: "--status-elevated", icon: "🔶" },
  { key: "normal", label: "Normal", sub: "Operating fine", colorVar: "--status-normal", icon: "✅" },
  { key: "uncertain", label: "Uncertain / OOD", sub: "Needs review", colorVar: "--status-uncertain", icon: "❔" },
];

export function KpiStrip({ kpis }: { kpis: OverviewSummary["kpis"] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {TILES.map((tile, i) => (
        <div
          key={tile.key}
          className="rise-in bg-surface border border-border-subtle rounded-xl shadow-sm p-4"
          style={{ animationDelay: `${i * 60}ms`, borderTop: `2px solid var(${tile.colorVar})` }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg" aria-hidden>
              {tile.icon}
            </span>
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: `var(${tile.colorVar})` }}
              aria-hidden
            />
          </div>
          <p className="text-2xl font-semibold text-text-primary font-mono-tabular">{kpis[tile.key]}</p>
          <p className="text-xs font-medium text-text-secondary">{tile.label}</p>
          <p className="text-[11px] text-text-muted">{tile.sub}</p>
        </div>
      ))}
    </div>
  );
}
