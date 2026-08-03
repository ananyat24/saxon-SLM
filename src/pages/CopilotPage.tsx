import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api";
import { useUiStore } from "../store/uiStore";
import { CopilotPanel } from "../components/copilot/CopilotPanel";

export function CopilotPage() {
  const selectedMachineId = useUiStore((s) => s.selectedMachineId);
  const setSelectedMachineId = useUiStore((s) => s.setSelectedMachineId);
  const queueQuery = useQuery({ queryKey: ["machine-queue"], queryFn: apiClient.getMachineQueue });

  return (
    <div className="flex h-[calc(100vh-6.5rem)] gap-5 -m-6">
      <div className="w-64 shrink-0 border-r border-border-subtle bg-surface p-4 overflow-y-auto scrollbar-thin">
        <h2 className="text-sm font-semibold text-text-primary mb-3">Select machine</h2>
        <div className="space-y-1">
          {queueQuery.data?.map((m) => (
            <button
              key={m.machine_id}
              onClick={() => setSelectedMachineId(m.machine_id)}
              className={`w-full text-left rounded-md px-2.5 py-2 text-xs transition-colors ${
                selectedMachineId === m.machine_id
                  ? "bg-accent text-white"
                  : "text-text-secondary hover:bg-surface-sunken"
              }`}
            >
              <p className="font-medium">{m.machine_id}</p>
              <p className={selectedMachineId === m.machine_id ? "text-white/70" : "text-text-muted"}>
                {m.classifier_output.risk_band}
              </p>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <CopilotPanel fullPage />
      </div>
    </div>
  );
}
