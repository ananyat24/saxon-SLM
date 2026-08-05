import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api";
import { Card } from "../components/common/Card";
import { DataSourceTag } from "../components/common/DataSourceTag";
import { useHasPermission } from "../hooks/useHasPermission";

export function ReportsPage() {
  const canView = useHasPermission("view:reports");
  const reportsQuery = useQuery({
    queryKey: ["reports"],
    queryFn: apiClient.getReports,
    enabled: canView,
  });

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center max-w-md mx-auto">
        <h1 className="text-lg font-semibold text-text-primary mb-1">Reports</h1>
        <p className="text-sm text-text-muted">You don't have access to this section.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-[1200px]">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Reports</h1>
          <DataSourceTag variant="coming-soon" />
        </div>
        <p className="text-sm text-text-muted">Generated fleet health and classifier performance reports.</p>
      </div>

      {reportsQuery.isLoading && <p className="text-sm text-text-muted">Loading reports…</p>}
      {reportsQuery.isError && <p className="text-sm text-status-critical">Failed to load reports.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(reportsQuery.data ?? []).map((r) => (
          <Card key={r.id}>
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-text-primary">{r.title}</h3>
                <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-text-muted border border-border-subtle rounded px-1.5 py-0.5">
                  {r.format}
                </span>
              </div>
              <p className="text-xs text-text-muted">
                {r.period_start} → {r.period_end} · generated {new Date(r.generated_at).toLocaleDateString()}
              </p>
              <p className="text-sm text-text-secondary">{r.summary}</p>
              <button
                type="button"
                disabled
                title="Download is not wired up in this pilot build"
                className="text-xs font-medium rounded-md px-3 py-1.5 border border-border-subtle text-text-muted cursor-not-allowed"
              >
                Download (disabled in pilot)
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
