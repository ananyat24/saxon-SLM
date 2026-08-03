import { create } from "zustand";

export type Role = "maintenance_engineer" | "plant_manager" | "administrator";

export const ROLE_LABELS: Record<Role, string> = {
  maintenance_engineer: "Maintenance Engineer",
  plant_manager: "Plant Manager",
  administrator: "Administrator",
};

// Single-role today, but every permission check goes through useHasPermission
// so a real RBAC backend can slot in later without touching call sites.
export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  maintenance_engineer: ["view:overview", "view:copilot", "view:machines", "act:work-orders"],
  plant_manager: ["view:overview", "view:copilot", "view:machines", "view:reports", "act:work-orders"],
  administrator: [
    "view:overview",
    "view:copilot",
    "view:machines",
    "view:reports",
    "act:work-orders",
    "manage:administration",
  ],
};

interface AuthUser {
  name: string;
  email: string;
  role: Role;
}

interface AuthState {
  user: AuthUser | null;
  signIn: (user: AuthUser) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  signIn: (user) => set({ user }),
  signOut: () => set({ user: null }),
}));
