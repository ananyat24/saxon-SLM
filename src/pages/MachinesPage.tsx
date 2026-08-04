import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api";
import { AttentionQueue } from "../components/overview/AttentionQueue";
import { Card } from "../components/common/Card";
import { RiskBadge, ConfidenceIndicator, ConditionBadge, ActionButton } from "../components/common/StatusBadge";
import { SensorSnapshot } from "../components/machines/SensorSnapshot";
import { MachineHistoryTable } from "../components/machines/MachineHistoryTable";
import { useUiStore } from "../store/uiStore";

export function MachinesPage() {
  const selectedMachineId = useUiStore((s) => s.selectedMachineId);
  const setSelectedMachineId = useUiStore((s) => s.setSelectedMachineId);
  const setCopilotCollapsed = useUiStore((s) => s.setCopilotCollapsed);

  const queueQuery = useQuery({ queryKey: ["machine-queue"], queryFn: apiClient.getMachineQueue });
  const detailQuery = useQuery({
    queryKey: ["machine-detail", selectedMachineId],
    queryFn: () => apiClient.getMachineDetail(selectedMachineId as string),
    enabled: !!selectedMachineId,
  });

  function handleSelect(machineId: string) {
    setSelectedMachineId(machineId);
    setCopilotCollapsed(false);
  }

  return (
    <div className="space-y-5 max-w-[1500px]">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Machines</h1>
        <p className="text-sm text-text-muted">Full monitored fleet with classifier output, sensor detail, and history.</p>
      </div>

      <Card title="Fleet">
        {queueQuery.isLoading && <p className="text-sm text-text-muted">Loading machines…</p>}
        {queueQuery.isError && <p className="text-sm text-status-critical">Failed to load machine queue.</p>}
        {queueQuery.data && <AttentionQueue queue={queueQuery.data} onSelect={handleSelect} />}
      </Card>

      {selectedMachineId && (
        <Card
          title={`Machine Detail — ${selectedMachineId}`}
          action={
            <button
              type="button"
              onClick={() => setSelectedMachineId(null)}
              className="text-xs text-text-muted hover:text-accent"
            >
              Close
            </button>
          }
        >
          {detailQuery.isLoading && <p className="text-sm text-text-muted">Loading detail…</p>}
          {detailQuery.isError && <p className="text-sm text-status-critical">Failed to load machine detail.</p>}
          {detailQuery.data && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <RiskBadge band={detailQuery.data.classifier_output.risk_band} />
                <ConfidenceIndicator
                  band={detailQuery.data.classifier_output.confidence_band}
                  value={detailQuery.data.classifier_output.confidence}
                />
                <div className="flex flex-wrap gap-1">
                  {detailQuery.data.conditions.map((c) => (
                    <ConditionBadge key={c} label={c} />
                  ))}
                </div>
                <span className="ml-auto">
                  <ActionButton
                    label={detailQuery.data.recommended_action.label}
                    urgency={detailQuery.data.recommended_action.urgency}
                  />
                </span>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-text-secondary mb-2">Sensor Snapshot</h4>
                <SensorSnapshot output={detailQuery.data.classifier_output} />
              </div>

              {detailQuery.data.classifier_output.thresholds_crossed.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-text-secondary mb-2">Thresholds Crossed</h4>
                  <ul className="text-xs text-text-secondary space-y-1">
                    {detailQuery.data.classifier_output.thresholds_crossed.map((t) => (
                      <li key={t.field}>
                        {t.field}: {t.value} ({t.direction} threshold {t.threshold})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h4 className="text-xs font-semibold text-text-secondary mb-2">Classifier History</h4>
                <MachineHistoryTable history={detailQuery.data.history} />
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
