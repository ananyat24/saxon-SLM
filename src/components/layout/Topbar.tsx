import { useUiStore } from "../../store/uiStore";
import { useAuthStore, ROLE_LABELS } from "../../store/authStore";

export function Topbar() {
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <header className="h-14 shrink-0 border-b border-border-subtle bg-surface flex items-center justify-end gap-4 px-6">
      <button
        type="button"
        onClick={toggleTheme}
        className="text-xs text-text-secondary hover:text-text-primary border border-border-subtle rounded-md px-2.5 py-1.5 transition-colors"
        aria-label="Toggle dark mode"
      >
        {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
      </button>
      {user && (
        <div className="flex items-center gap-2">
          <div className="text-right leading-tight">
            <p className="text-xs font-medium text-text-primary">{user.name}</p>
            <p className="text-[11px] text-text-muted">{ROLE_LABELS[user.role]}</p>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="text-xs text-text-muted hover:text-text-primary"
          >
            Sign out
          </button>
        </div>
      )}
    </header>
  );
}
