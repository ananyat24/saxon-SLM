import { useAuthStore, ROLE_PERMISSIONS } from "../store/authStore";

export function useHasPermission(permission: string): boolean {
  const user = useAuthStore((s) => s.user);
  if (!user) return false;
  return ROLE_PERMISSIONS[user.role].includes(permission);
}
