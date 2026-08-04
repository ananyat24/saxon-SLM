import { useState } from "react";
import { useAuthStore, ROLE_LABELS, type Role } from "../../store/authStore";
import { clientConfig } from "../../config/client.config";

export function SignInGate({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const signIn = useAuthStore((s) => s.signIn);
  const [name, setName] = useState("Ananya T.");
  const [role, setRole] = useState<Role>("maintenance_engineer");

  if (user) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-alt px-4">
      <div className="w-full max-w-sm bg-surface border border-border-subtle rounded-lg p-8">
        <div className="flex items-center gap-2.5 mb-6">
          <img src="/saxon-logo.webp" alt={clientConfig.companyName} className="h-7 w-auto" />
          <div className="border-l border-border-subtle pl-2.5">
            <p className="text-xs text-text-muted leading-tight">{clientConfig.productName}</p>
          </div>
        </div>

        <h1 className="text-lg font-semibold text-text-primary mb-1">Sign in</h1>
        <p className="text-sm text-text-secondary mb-6">Mock SSO for pilot demo purposes.</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            signIn({ name, email: "operator@plant.local", role });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-accent hover:bg-accent-strong text-white text-sm font-medium py-2 transition-colors"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
