import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { OverviewSummary } from "../../types/contract";
import { useThemeColors } from "../../hooks/useThemeColors";

export function RiskByLineChart({ data }: { data: OverviewSummary["risk_by_line"] }) {
  const c = useThemeColors();
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -20, right: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={c.borderSubtle} vertical={false} />
          <XAxis dataKey="line" tick={{ fontSize: 11, fill: c.textMuted }} axisLine={{ stroke: c.borderSubtle }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: c.textMuted }} axisLine={false} tickLine={false} width={28} />
          <Tooltip contentStyle={{ background: c.surface, border: `1px solid ${c.borderSubtle}`, fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="critical" name="Critical" stackId="risk" fill={c.critical} radius={[0, 0, 0, 0]} />
          <Bar dataKey="high" name="High" stackId="risk" fill={c.high} />
          <Bar dataKey="elevated" name="Elevated" stackId="risk" fill={c.elevated} />
          <Bar dataKey="normal" name="Normal" stackId="risk" fill={c.normal} />
          <Bar dataKey="uncertain" name="Uncertain" stackId="risk" fill={c.uncertain} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
