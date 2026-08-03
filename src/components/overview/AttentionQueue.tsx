import { useState } from "react";
import type { MachineSummary } from "../../types/contract";
import { RiskBadge, ConfidenceIndicator, ConditionBadge, ActionButton } from "../common/StatusBadge";

export function AttentionQueue({
  queue,
  onSelect,
}: {
  queue: MachineSummary[];
  onSelect: (machineId: string) => void;
}) {
  const [sortKey, setSortKey] = useState<"priority" | "machine">("priority");

  const sorted = [...queue];
  if (sortKey === "machine") sorted.sort((a, b) => a.machine_id.localeCompare(b.machine_id));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-text-muted border-b border-border-subtle sticky top-0 bg-surface">
            <th
              className="py-2 pr-2 font-medium cursor-pointer select-none"
              onClick={() => setSortKey("priority")}
            >
              #
            </th>
            <th className="py-2 pr-4 font-medium cursor-pointer select-none" onClick={() => setSortKey("machine")}>
              Machine
            </th>
            <th className="py-2 pr-4 font-medium">Condition</th>
            <th className="py-2 pr-4 font-medium">Risk</th>
            <th className="py-2 pr-4 font-medium">Confidence</th>
            <th className="py-2 pr-2 font-medium text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((m, idx) => (
            <tr
              key={m.machine_id}
              onClick={() => onSelect(m.machine_id)}
              className="border-b border-border-subtle last:border-0 hover:bg-surface-sunken cursor-pointer transition-colors"
            >
              <td className="py-2.5 pr-2 text-text-muted tabular-nums">{idx + 1}</td>
              <td className="py-2.5 pr-4">
                <p className="font-medium text-text-primary">{m.machine_id}</p>
                <p className="text-xs text-text-muted">
                  {m.line} · {m.cell}
                </p>
              </td>
              <td className="py-2.5 pr-4">
                <div className="flex flex-wrap gap-1 max-w-[220px]">
                  {m.conditions.map((c) => (
                    <ConditionBadge key={c} label={c} />
                  ))}
                </div>
              </td>
              <td className="py-2.5 pr-4">
                <RiskBadge band={m.classifier_output.risk_band} />
              </td>
              <td className="py-2.5 pr-4">
                <ConfidenceIndicator band={m.classifier_output.confidence_band} value={m.classifier_output.confidence} />
              </td>
              <td className="py-2.5 pr-2 text-right" onClick={(e) => e.stopPropagation()}>
                <ActionButton
                  label={m.recommended_action.label}
                  urgency={m.recommended_action.urgency}
                  onClick={() => onSelect(m.machine_id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
