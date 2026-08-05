import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api";
import { Card } from "../components/common/Card";
import { DataSourceTag } from "../components/common/DataSourceTag";
import { useHasPermission } from "../hooks/useHasPermission";
import type { CreateWorkOrderInput, WorkOrder, WorkOrderPriority, WorkOrderStatus } from "../types/contract";

const PRIORITY_META: Record<WorkOrderPriority, { label: string; colorVar: string }> = {
  high: { label: "High", colorVar: "--status-critical" },
  medium: { label: "Medium", colorVar: "--status-elevated" },
  low: { label: "Low", colorVar: "--status-normal" },
};

const STATUS_LABEL: Record<WorkOrderStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_FILTERS: ("all" | WorkOrderStatus)[] = ["all", "open", "in_progress", "completed", "cancelled"];

function PriorityBadge({ priority }: { priority: WorkOrderPriority }) {
  const meta = PRIORITY_META[priority];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
      style={{
        color: `var(${meta.colorVar})`,
        background: `color-mix(in srgb, var(${meta.colorVar}) 14%, transparent)`,
      }}
    >
      {meta.label}
    </span>
  );
}

function CreateWorkOrderForm({
  machineIds,
  onCreate,
  isPending,
}: {
  machineIds: string[];
  onCreate: (input: CreateWorkOrderInput) => void;
  isPending: boolean;
}) {
  const [machineId, setMachineId] = useState(machineIds[0] ?? "");
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<WorkOrderPriority>("medium");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!machineId || !title.trim()) return;
    onCreate({ machine_id: machineId, title: title.trim(), priority, status: "open", assigned_to: "Unassigned" });
    setTitle("");
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1">Machine</label>
        <select
          value={machineId}
          onChange={(e) => setMachineId(e.target.value)}
          className="bg-surface border border-border-subtle rounded-md px-2.5 py-2 text-sm text-text-primary"
        >
          {machineIds.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-medium text-text-secondary mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Inspect tool head"
          className="w-full bg-surface border border-border-subtle rounded-md px-2.5 py-2 text-sm text-text-primary"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1">Priority</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as WorkOrderPriority)}
          className="bg-surface border border-border-subtle rounded-md px-2.5 py-2 text-sm text-text-primary"
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={isPending || !title.trim()}
        className="text-sm font-medium rounded-md px-4 py-2 bg-accent hover:bg-accent-strong text-white disabled:opacity-50 transition-colors"
      >
        {isPending ? "Creating…" : "Create Work Order"}
      </button>
    </form>
  );
}

export function WorkOrdersPage() {
  const canAct = useHasPermission("act:work-orders");
  const [statusFilter, setStatusFilter] = useState<"all" | WorkOrderStatus>("all");
  const queryClient = useQueryClient();

  const workOrdersQuery = useQuery({ queryKey: ["work-orders"], queryFn: apiClient.getWorkOrders });
  const queueQuery = useQuery({ queryKey: ["machine-queue"], queryFn: apiClient.getMachineQueue });

  const createMutation = useMutation({
    mutationFn: (input: CreateWorkOrderInput) => apiClient.createWorkOrder(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["work-orders"] }),
  });

  const workOrders: WorkOrder[] = (workOrdersQuery.data ?? []).filter(
    (w) => statusFilter === "all" || w.status === statusFilter,
  );

  return (
    <div className="space-y-5 max-w-[1400px]">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Work Orders</h1>
          <DataSourceTag variant="coming-soon" />
        </div>
        <p className="text-sm text-text-muted">Maintenance actions linked to classifier output, by machine.</p>
      </div>

      {canAct && (
        <Card title="Create Work Order">
          <CreateWorkOrderForm
            machineIds={(queueQuery.data ?? []).map((m) => m.machine_id)}
            onCreate={(input) => createMutation.mutate(input)}
            isPending={createMutation.isPending}
          />
        </Card>
      )}

      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setStatusFilter(f)}
            className={`text-xs font-medium rounded-md px-3 py-1.5 border transition-colors ${
              statusFilter === f
                ? "bg-accent border-accent text-white"
                : "bg-surface border-border-subtle text-text-secondary hover:text-accent"
            }`}
          >
            {f === "all" ? "All" : STATUS_LABEL[f]}
          </button>
        ))}
      </div>

      <Card>
        {workOrdersQuery.isLoading && <p className="text-sm text-text-muted">Loading work orders…</p>}
        {workOrdersQuery.isError && <p className="text-sm text-status-critical">Failed to load work orders.</p>}
        {workOrdersQuery.data && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-text-muted border-b border-border-subtle">
                  <th className="py-2 pr-4 font-medium">ID</th>
                  <th className="py-2 pr-4 font-medium">Machine</th>
                  <th className="py-2 pr-4 font-medium">Title</th>
                  <th className="py-2 pr-4 font-medium">Priority</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium">Assigned To</th>
                  <th className="py-2 pr-2 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {workOrders.map((w) => (
                  <tr key={w.id} className="border-b border-border-subtle last:border-0">
                    <td className="py-2.5 pr-4 text-text-muted font-mono-tabular">{w.id}</td>
                    <td className="py-2.5 pr-4 font-medium text-text-primary">{w.machine_id}</td>
                    <td className="py-2.5 pr-4 text-text-secondary">{w.title}</td>
                    <td className="py-2.5 pr-4">
                      <PriorityBadge priority={w.priority} />
                    </td>
                    <td className="py-2.5 pr-4 text-text-secondary">{STATUS_LABEL[w.status]}</td>
                    <td className="py-2.5 pr-4 text-text-secondary">{w.assigned_to}</td>
                    <td className="py-2.5 pr-2 text-text-muted whitespace-nowrap">
                      {new Date(w.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {workOrders.length === 0 && <p className="text-sm text-text-muted py-4">No work orders match this filter.</p>}
          </div>
        )}
      </Card>
    </div>
  );
}
