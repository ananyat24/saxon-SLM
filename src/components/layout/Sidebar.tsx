import { NavLink } from "react-router-dom";
import { clientConfig } from "../../config/client.config";

const NAV_ITEMS = [
  { to: "/overview", label: "Overview", icon: "📊" },
  { to: "/machines", label: "Machines", icon: "🛠️" },
  { to: "/live-assessment", label: "Live Assessment", icon: "📡" },
  { to: "/copilot", label: "Copilot", icon: "💬" },
  { to: "/what-if", label: "What-If", icon: "🧪" },
  { to: "/alerts", label: "Alerts", icon: "🔔" },
  { to: "/model-confidence", label: "Model Confidence", icon: "📈" },
  { to: "/reports", label: "Reports", icon: "📄" },
  { to: "/work-orders", label: "Work Orders", icon: "🧾" },
  { to: "/administration", label: "Administration", icon: "⚙️" },
];

export function Sidebar() {
  return (
    <aside className="w-60 shrink-0 bg-sidebar text-sidebar-text flex flex-col h-screen sticky top-0 relative overflow-hidden bp-grid">
      <div className="flex items-center gap-2 px-5 py-5 relative">
        <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center font-semibold text-xs font-mono-tabular">
          {clientConfig.logoInitials}
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-white">{clientConfig.companyName}</p>
          <p className="text-[11px] text-sidebar-text-muted">{clientConfig.productName}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 space-y-0.5 relative">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-sidebar-active text-white border-l-2 border-accent -ml-px pl-[11px]"
                  : "text-sidebar-text-muted hover:bg-sidebar-hover hover:text-white"
              }`
            }
          >
            <span aria-hidden>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 text-[11px] text-sidebar-text-muted border-t border-white/5 relative">
        {clientConfig.plantName}
      </div>
    </aside>
  );
}
