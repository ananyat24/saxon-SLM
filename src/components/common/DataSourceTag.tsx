import { isLiveApiMode } from "../../api";

// Small inline marker next to a page title so it's always visible which
// pages call the real classifier backend and which are still on mock data
// pending real integration — never silently blend the two.
//
// "capable" pages (Machines, What-If, Copilot) genuinely call the real
// backend, but only when VITE_API_MODE=live is actually set — otherwise
// they're on mock like everything else, so they must say so rather than
// claim to be live unconditionally. "coming-soon" pages have no backend
// support yet regardless of mode.
export function DataSourceTag({ variant }: { variant: "capable" | "coming-soon" }) {
  if (variant === "capable" && isLiveApiMode) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-status-normal/10 px-2.5 py-1 text-[11px] font-medium text-status-normal">
        <span className="w-1.5 h-1.5 rounded-full bg-status-normal" />
        Live model
      </span>
    );
  }
  if (variant === "capable") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-sunken border border-border-subtle px-2.5 py-1 text-[11px] font-medium text-text-muted">
        Demo data (mock)
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-sunken border border-border-subtle px-2.5 py-1 text-[11px] font-medium text-text-muted">
      Demo data — live integration coming soon
    </span>
  );
}
