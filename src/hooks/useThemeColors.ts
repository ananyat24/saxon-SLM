import { useUiStore } from "../store/uiStore";
import { cssVar } from "../lib/colors";

// Resolves CSS custom properties to concrete color strings for chart libraries
// (Recharts fill/stroke props don't reliably re-resolve var() on theme swap).
// Depending on `theme` forces recompute when the user toggles dark mode.
export function useThemeColors() {
  const theme = useUiStore((s) => s.theme);
  return {
    theme,
    critical: cssVar("--status-critical"),
    high: cssVar("--status-high"),
    elevated: cssVar("--status-elevated"),
    normal: cssVar("--status-normal"),
    uncertain: cssVar("--status-uncertain"),
    accent: cssVar("--accent"),
    textMuted: cssVar("--text-muted"),
    textSecondary: cssVar("--text-secondary"),
    borderSubtle: cssVar("--border-subtle"),
    surface: cssVar("--surface"),
  };
}
