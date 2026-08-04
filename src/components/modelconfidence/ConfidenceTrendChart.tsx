import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ModelConfidenceTrendPoint } from "../../types/contract";
import { useThemeColors } from "../../hooks/useThemeColors";

export function ConfidenceTrendChart({ data }: { data: ModelConfidenceTrendPoint[] }) {
  const c = useThemeColors();
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: -20, right: 10 }}>
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
          <Area type="monotone" dataKey="high" name="High" stackId="conf" stroke={c.normal} fill={c.normal} fillOpacity={0.35} />
          <Area type="monotone" dataKey="medium" name="Medium" stackId="conf" stroke={c.elevated} fill={c.elevated} fillOpacity={0.35} />
          <Area type="monotone" dataKey="low" name="Low" stackId="conf" stroke={c.high} fill={c.high} fillOpacity={0.35} />
          <Area
            type="monotone"
            dataKey="uncertain"
            name="Uncertain"
            stackId="conf"
            stroke={c.uncertain}
            fill={c.uncertain}
            fillOpacity={0.35}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
