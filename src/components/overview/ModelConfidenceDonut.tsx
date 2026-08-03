import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { OverviewSummary } from "../../types/contract";
import { confidenceBandMeta } from "../../config/taxonomy.config";
import { useThemeColors } from "../../hooks/useThemeColors";

export function ModelConfidenceDonut({ data }: { data: OverviewSummary["model_confidence"] }) {
  const c = useThemeColors();
  const colorFor = (band: string) =>
    ({ HIGH: c.normal, MEDIUM: c.elevated, LOW: c.high, UNCERTAIN: c.uncertain })[band] ?? c.uncertain;
  const total = data.reduce((s, d) => s + d.count, 0) || 1;

  return (
    <div>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="band" innerRadius={42} outerRadius={65} paddingAngle={2}>
              {data.map((d) => (
                <Cell key={d.band} fill={colorFor(d.band)} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: c.surface, border: `1px solid ${c.borderSubtle}`, fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-1 mt-1">
        {data.map((d) => (
          <li key={d.band} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-text-secondary">
              <span className="w-2 h-2 rounded-full" style={{ background: colorFor(d.band) }} />
              {confidenceBandMeta[d.band].label}
            </span>
            <span className="tabular-nums text-text-primary font-medium">
              {d.count} · {((d.count / total) * 100).toFixed(0)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
