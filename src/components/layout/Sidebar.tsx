import { useState } from "react";
import { NavLink } from "react-router-dom";
import { clientConfig } from "../../config/client.config";
import { useUiStore, PLANT_OPTIONS } from "../../store/uiStore";

const NAV_ITEMS = [
  { to: "/overview", label: "Overview" },
  { to: "/machines", label: "Machines" },
  { to: "/what-if", label: "What-If" },
  { to: "/alerts", label: "Alerts" },
  { to: "/model-confidence", label: "Model Confidence" },
  { to: "/reports", label: "Reports" },
  { to: "/work-orders", label: "Work Orders" },
  { to: "/administration", label: "Administration" },
];

export function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const setCollapsed = useUiStore((s) => s.setSidebarCollapsed);
  const selectedPlant = useUiStore((s) => s.selectedPlant);
  const setSelectedPlant = useUiStore((s) => s.setSelectedPlant);
  const [plantMenuOpen, setPlantMenuOpen] = useState(false);

  return (
    <aside
      className={`shrink-0 bg-sidebar text-sidebar-text flex flex-col h-screen sticky top-0 transition-all duration-200 ${
        collapsed ? "w-14" : "w-56"
      }`}
    >
      <div className={`flex items-center gap-2.5 px-5 py-5 ${collapsed ? "px-0 justify-center" : ""}`}>
        <div className={`bg-white rounded-md shrink-0 flex items-center justify-center ${collapsed ? "p-1.5" : "px-2 py-1.5"}`}>
          <img
            src="/saxon-logo.webp"
            alt="Saxon AI"
            className={collapsed ? "h-4 w-auto" : "h-5 w-auto"}
          />
        </div>
        {!collapsed && (
          <p className="text-[11px] text-sidebar-text-muted leading-tight">{clientConfig.productName}</p>
        )}
      </div>

      {!collapsed && (
        <div className="px-3 pb-2 relative">
          <button
            type="button"
            onClick={() => setPlantMenuOpen((v) => !v)}
            className="w-full flex items-center justify-between gap-2 rounded-md border border-white/10 bg-sidebar-hover px-3 py-2 text-left text-[11px] text-sidebar-text-muted hover:text-white transition-colors"
          >
            <span className="truncate">{selectedPlant}</span>
            <span aria-hidden className="shrink-0">{plantMenuOpen ? "▴" : "▾"}</span>
          </button>
          {plantMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setPlantMenuOpen(false)} />
              <div className="absolute left-3 right-3 top-full mt-1 z-20 rounded-md border border-white/10 bg-sidebar-hover overflow-hidden">
                {PLANT_OPTIONS.map((plant) => (
                  <button
                    key={plant}
                    type="button"
                    onClick={() => {
                      setSelectedPlant(plant);
                      setPlantMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-[11px] transition-colors ${
                      plant === selectedPlant
                        ? "bg-sidebar-active text-white"
                        : "text-sidebar-text-muted hover:bg-sidebar-active hover:text-white"
                    }`}
                  >
                    {plant}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                collapsed ? "justify-center px-0" : ""
              } ${
                isActive
                  ? "bg-sidebar-active text-white"
                  : "text-sidebar-text-muted hover:bg-sidebar-hover hover:text-white"
              }`
            }
          >
            {collapsed ? (
              <span aria-hidden className="text-xs font-mono-tabular">
                {item.label.charAt(0)}
              </span>
            ) : (
              item.label
            )}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="mx-3 mb-2 flex items-center justify-center rounded-md px-3 py-2 text-xs text-sidebar-text-muted hover:bg-sidebar-hover hover:text-white transition-colors"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? "»" : "« Collapse"}
      </button>
    </aside>
  );
}
