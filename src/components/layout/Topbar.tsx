import { useEffect, useRef, useState } from "react";
import { useUiStore } from "../../store/uiStore";
import { useAuthStore, ROLE_LABELS } from "../../store/authStore";

export function Topbar() {
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

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
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-surface-sunken transition-colors"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
              style={{ background: "var(--accent-soft)", color: "var(--accent-strong)" }}
            >
              {user.name
                .split(" ")
                .map((p) => p.charAt(0))
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="text-right leading-tight">
              <p className="text-xs font-medium text-text-primary">{user.name}</p>
              <p className="text-[11px] text-text-muted">{ROLE_LABELS[user.role]}</p>
            </div>
            <span aria-hidden className="text-[10px] text-text-muted">
              {menuOpen ? "▴" : "▾"}
            </span>
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-1 w-40 rounded-md border border-border-subtle bg-surface overflow-hidden z-30"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  signOut();
                }}
                className="w-full text-left px-3 py-2 text-xs text-text-secondary hover:bg-surface-sunken hover:text-text-primary transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
