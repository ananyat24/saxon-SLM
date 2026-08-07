import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { OverviewSummary } from "../../types/contract";
import { riskBandMeta } from "../../config/taxonomy.config";
import { useThemeColors } from "../../hooks/useThemeColors";

export function RiskDonut({ data }: { data: OverviewSummary["risk_distribution"] }) {
  const c = useThemeColors();
  const colorFor = (band: string) =>
    ({ CRITICAL: c.critical, HIGH: c.high, ELEVATED: c.elevated, NORMAL: c.normal, UNCERTAIN: c.uncertain })[band] ??
    c.uncertain;
  const total = data.reduce((s, d) => s + d.count, 0) || 1;

  return (
    <div>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="band" innerRadius={55} outerRadius={80} paddingAngle={2}>
              {data.map((d) => (
                <Cell key={d.band} fill={colorFor(d.band)} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, _name, entry) => {
                const n = Number(value);
                return [
                  `${n} (${((n / total) * 100).toFixed(0)}%)`,
                  riskBandMeta[(entry.payload as { band: keyof typeof riskBandMeta }).band].label,
                ];
              }}
              contentStyle={{ background: c.surface, border: `1px solid ${c.borderSubtle}`, fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-1 mt-1">
        {data.map((d) => (
          <li key={d.band} className="flex items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-text-secondary min-w-0 truncate">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: colorFor(d.band) }} />
              {riskBandMeta[d.band].label}
            </span>
            <span className="tabular-nums text-text-primary font-medium shrink-0">
              {d.count} · {((d.count / total) * 100).toFixed(0)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
