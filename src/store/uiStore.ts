import { create } from "zustand";
import { clientConfig } from "../config/client.config";

export type Theme = "light" | "dark";

export const PLANT_OPTIONS = [
  "Plant 4 – Precision Machining",
  "Plant 2 – Sheet Metal",
  "Plant 7 – Assembly",
];

interface UiState {
  theme: Theme;
  toggleTheme: () => void;
  selectedMachineId: string | null;
  setSelectedMachineId: (id: string | null) => void;
  copilotCollapsed: boolean;
  setCopilotCollapsed: (collapsed: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  selectedPlant: string;
  setSelectedPlant: (plant: string) => void;
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
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  selectedPlant: clientConfig.plantName,
  setSelectedPlant: (plant) => set({ selectedPlant: plant }),
}));
