// Single source of truth for client-facing branding & copy.
// Swap this file (or load it from a remote config service) per deployment —
// no component code should need to change for a new client/plant rollout.

export interface ClientConfig {
  companyName: string;
  productName: string;
  plantName: string;
  logoInitials: string;
  supportEmail: string;
  footerBranding: string;
  copilotDisclaimer: string;
}

export const clientConfig: ClientConfig = {
  companyName: "Saxon.AI",
  productName: "Machine Health Copilot",
  plantName: "Plant 4 – Precision Machining",
  logoInitials: "SX",
  supportEmail: "support@saxon.ai",
  footerBranding: "Saxon.AI Machine Health Copilot · Pilot Build",
  copilotDisclaimer:
    "Copilot responses are based on classifier output. Not a substitute for engineering judgment.",
};
