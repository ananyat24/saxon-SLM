import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { OverviewSummary } from "../../types/contract";
import { useThemeColors } from "../../hooks/useThemeColors";

export function RiskTrendChart({ data }: { data: OverviewSummary["risk_trend"] }) {
  const c = useThemeColors();
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: -20, right: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={c.borderSubtle} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(d: string) => d.slice(5)}
            tick={{ fontSize: 11, fill: c.textMuted }}
            axisLine={{ stroke: c.borderSubtle }}
            tickLine={false}
          />
          <YAxis tick={{ fontSize: 11, fill: c.textMuted }} axisLine={false} tickLine={false} width={28} />
          <Tooltip contentStyle={{ background: c.surface, border: `1px solid ${c.borderSubtle}`, fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="critical" name="Critical" stroke={c.critical} strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="high" name="High" stroke={c.high} strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="elevated" name="Elevated" stroke={c.elevated} strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="normal" name="Normal" stroke={c.normal} strokeWidth={2} dot={false} />
          <Line
            type="monotone"
            dataKey="uncertain"
            name="Uncertain"
            stroke={c.uncertain}
            strokeWidth={2}
            dot={false}
            strokeDasharray="4 3"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
