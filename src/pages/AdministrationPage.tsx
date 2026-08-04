import { Card } from "../components/common/Card";
import { useHasPermission } from "../hooks/useHasPermission";
import { clientConfig } from "../config/client.config";
import { failureTaxonomy } from "../config/taxonomy.config";
import { ROLE_PERMISSIONS, ROLE_LABELS, type Role } from "../store/authStore";
import type { FailureCode } from "../types/contract";

const ALL_PERMISSIONS = Array.from(new Set(Object.values(ROLE_PERMISSIONS).flat())).sort();
const ROLES = Object.keys(ROLE_LABELS) as Role[];
const FAILURE_CODES = Object.keys(failureTaxonomy) as FailureCode[];

const CLIENT_CONFIG_LABELS: Record<keyof typeof clientConfig, string> = {
  companyName: "Company Name",
  productName: "Product Name",
  plantName: "Plant Name",
  logoInitials: "Logo Initials",
  supportEmail: "Support Email",
  footerBranding: "Footer Branding",
  copilotDisclaimer: "Copilot Disclaimer",
};

export function AdministrationPage() {
  const canManage = useHasPermission("manage:administration");

  if (!canManage) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center max-w-md mx-auto">
        <h1 className="text-lg font-semibold text-text-primary mb-1">Administration</h1>
        <p className="text-sm text-text-muted">You don't have access to this section.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Administration</h1>
        <p className="text-sm text-text-muted">
          Client configuration, role permissions, and failure-code taxonomy — driven entirely by config, not code, for
          multi-client rollout.
        </p>
      </div>

      <Card title="Client Configuration">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(Object.keys(clientConfig) as (keyof typeof clientConfig)[]).map((key) => (
            <div key={key}>
              <dt className="text-[11px] text-text-muted">{CLIENT_CONFIG_LABELS[key]}</dt>
              <dd className="text-sm text-text-primary">{clientConfig[key]}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card title="Role Permissions Matrix">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-text-muted border-b border-border-subtle">
                <th className="py-2 pr-4 font-medium">Permission</th>
                {ROLES.map((role) => (
                  <th key={role} className="py-2 px-3 font-medium text-center">
                    {ROLE_LABELS[role]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_PERMISSIONS.map((perm) => (
                <tr key={perm} className="border-b border-border-subtle last:border-0">
                  <td className="py-2 pr-4 text-text-secondary font-mono-tabular">{perm}</td>
                  {ROLES.map((role) => (
                    <td key={role} className="py-2 px-3 text-center">
                      {ROLE_PERMISSIONS[role].includes(perm) ? (
                        <span className="text-status-normal font-semibold">✓</span>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Failure Code Taxonomy">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-text-muted border-b border-border-subtle">
                <th className="py-2 pr-4 font-medium">Code</th>
                <th className="py-2 pr-4 font-medium">Label</th>
                <th className="py-2 pr-4 font-medium">Description</th>
                <th className="py-2 pr-2 font-medium">Color</th>
              </tr>
            </thead>
            <tbody>
              {FAILURE_CODES.map((code) => {
                const meta = failureTaxonomy[code];
                return (
                  <tr key={code} className="border-b border-border-subtle last:border-0">
                    <td className="py-2 pr-4 font-mono-tabular text-text-primary font-medium">{meta.shortLabel}</td>
                    <td className="py-2 pr-4 text-text-secondary">{meta.label}</td>
                    <td className="py-2 pr-4 text-text-muted">{meta.description}</td>
                    <td className="py-2 pr-2">
                      <span
                        className="inline-block w-4 h-4 rounded-full border border-border-subtle align-middle"
                        style={{ background: `var(${meta.colorVar})` }}
                        title={meta.colorVar}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
