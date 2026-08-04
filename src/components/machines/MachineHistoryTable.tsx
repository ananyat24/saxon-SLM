import type { ClassifierOutput } from "../../types/contract";
import { RiskBadge, ConfidenceIndicator } from "../common/StatusBadge";

export function MachineHistoryTable({ history }: { history: ClassifierOutput[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-text-muted border-b border-border-subtle">
            <th className="py-2 pr-4 font-medium">Timestamp</th>
            <th className="py-2 pr-4 font-medium">Risk</th>
            <th className="py-2 pr-4 font-medium">Confidence</th>
            <th className="py-2 pr-2 font-medium">Flags</th>
          </tr>
        </thead>
        <tbody>
          {history.map((h) => {
            const flagged = (Object.entries(h.flags) as [string, boolean][]).filter(([, v]) => v);
            return (
              <tr key={h.timestamp} className="border-b border-border-subtle last:border-0">
                <td className="py-2 pr-4 text-text-secondary whitespace-nowrap">
                  {new Date(h.timestamp).toLocaleString()}
                </td>
                <td className="py-2 pr-4">
                  <RiskBadge band={h.risk_band} />
                </td>
                <td className="py-2 pr-4">
                  <ConfidenceIndicator band={h.confidence_band} value={h.confidence} />
                </td>
                <td className="py-2 pr-2 text-text-muted">
                  {flagged.length ? flagged.map(([k]) => k.toUpperCase()).join(", ") : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
