import { create } from "zustand";

export type Theme = "light" | "dark";

interface UiState {
  theme: Theme;
  toggleTheme: () => void;
  selectedMachineId: string | null;
  setSelectedMachineId: (id: string | null) => void;
  copilotCollapsed: boolean;
  setCopilotCollapsed: (collapsed: boolean) => void;
}

function applyThemeToDocument(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

const initialTheme: Theme =
  (typeof window !== "undefined" && (localStorage.getItem("theme") as Theme)) ||
  (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

if (typeof window !== "undefined") applyThemeToDocument(initialTheme);

export const useUiStore = create<UiState>((set, get) => ({
  theme: initialTheme,
  toggleTheme: () => {
    const next: Theme = get().theme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", next);
    applyThemeToDocument(next);
    set({ theme: next });
  },
  selectedMachineId: null,
  setSelectedMachineId: (id) => set({ selectedMachineId: id }),
  copilotCollapsed: false,
  setCopilotCollapsed: (collapsed) => set({ copilotCollapsed: collapsed }),
}));
