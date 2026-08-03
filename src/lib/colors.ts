export function cssVar(name: string): string {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export const RISK_COLOR_VARS: Record<string, string> = {
  CRITICAL: "--status-critical",
  HIGH: "--status-high",
  ELEVATED: "--status-elevated",
  NORMAL: "--status-normal",
  UNCERTAIN: "--status-uncertain",
};
