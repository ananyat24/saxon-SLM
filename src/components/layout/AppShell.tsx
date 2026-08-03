import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { CopilotPanel } from "../copilot/CopilotPanel";
import { useUiStore } from "../../store/uiStore";

export function AppShell() {
  const copilotCollapsed = useUiStore((s) => s.copilotCollapsed);
  const setCopilotCollapsed = useUiStore((s) => s.setCopilotCollapsed);

  return (
    <div className="flex h-screen bg-surface-alt">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <div className="flex-1 flex min-h-0">
          <main className="flex-1 overflow-y-auto scrollbar-thin p-6">
            <Outlet />
          </main>
          <div
            className={`relative shrink-0 transition-all duration-200 ${copilotCollapsed ? "w-0" : "w-80"}`}
          >
            {!copilotCollapsed && (
              <div className="w-80 h-full">
                <CopilotPanel />
              </div>
            )}
            <button
              type="button"
              onClick={() => setCopilotCollapsed(!copilotCollapsed)}
              className="absolute top-3 -left-3 w-6 h-6 rounded-full bg-surface border border-border-subtle flex items-center justify-center text-xs text-text-secondary hover:text-accent"
              aria-label={copilotCollapsed ? "Expand copilot" : "Collapse copilot"}
            >
              {copilotCollapsed ? "‹" : "›"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
