// Additional fixtures for Alerts, Model Confidence Trend, Reports, and Work Orders.
// Kept separate from fixtures.ts to avoid that file growing unwieldy; derives from
// the same machine seed data so numbers stay consistent across pages.
import type {
  Alert,
  ModelConfidenceTrendPoint,
  Report,
  WorkOrder,
} from "../../types/contract";
import { machineSummaries } from "./fixtures";

function isoDaysAgo(days: number, hours = 0): string {
  return new Date(Date.now() - days * 24 * 3600_000 - hours * 3600_000).toISOString();
}

// --- Alerts -----------------------------------------------------------
// Derived from machine fixtures: CRITICAL/HIGH machines generate alert entries,
// plus a couple of informational/uncertain entries for variety.
const alertSeeds: Omit<Alert, "id">[] = machineSummaries
  .filter((m) => ["CRITICAL", "HIGH", "ELEVATED", "UNCERTAIN"].includes(m.classifier_output.risk_band))
  .map((m, idx) => {
    const band = m.classifier_output.risk_band;
    const severity: Alert["severity"] = band === "CRITICAL" ? "critical" : band === "HIGH" ? "warning" : band === "UNCERTAIN" ? "info" : "warning";
    const message =
      band === "CRITICAL"
        ? `${m.machine_id} crossed a CRITICAL threshold — ${m.conditions.join(", ")}. Immediate inspection recommended.`
        : band === "HIGH"
          ? `${m.machine_id} flagged HIGH risk — ${m.conditions.join(", ")}. Schedule an inspection soon.`
          : band === "UNCERTAIN"
            ? `${m.machine_id} classifier output is low-confidence / out-of-distribution. Review sensor feed for faults.`
            : `${m.machine_id} trending toward elevated risk — ${m.conditions.join(", ")}.`;
    return {
      machine_id: m.machine_id,
      risk_band: band,
      message,
      created_at: isoDaysAgo(0, idx * 3 + 1),
      acknowledged: idx % 3 === 0,
      severity,
    };
  });

// Pad with a couple of resolved/info alerts so the list feels like a real feed.
alertSeeds.push(
  {
    machine_id: "CNC-045",
    risk_band: "NORMAL",
    message: "CNC-045 completed scheduled maintenance; classifier output re-baselined.",
    created_at: isoDaysAgo(1, 4),
    acknowledged: true,
    severity: "info",
  },
  {
    machine_id: "CNC-021",
    risk_band: "NORMAL",
    message: "CNC-021 sensor calibration check passed.",
    created_at: isoDaysAgo(2, 2),
    acknowledged: true,
    severity: "info",
  },
);

export const alertsFixture: Alert[] = alertSeeds
  .map((a, idx) => ({ id: `ALT-${String(idx + 1).padStart(3, "0")}`, ...a }))
  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

// --- Model confidence trend --------------------------------------------
export const modelConfidenceTrendFixture: ModelConfidenceTrendPoint[] = Array.from({ length: 18 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (17 - i));
  const wobble = Math.sin(i / 3) * 1.5;
  return {
    date: d.toISOString().slice(0, 10),
    high: Math.max(0, Math.round(5 + wobble + (i % 4))),
    medium: Math.max(0, Math.round(2 + Math.cos(i / 2))),
    low: Math.max(0, Math.round(1 + (i % 3 === 0 ? 1 : 0))),
    uncertain: Math.max(0, i % 5 === 0 ? 1 : 0),
  };
});

// --- Reports -------------------------------------------------------------
export const reportsFixture: Report[] = [
  {
    id: "RPT-001",
    title: "Weekly Fleet Health Summary",
    period_start: isoDaysAgo(7).slice(0, 10),
    period_end: isoDaysAgo(0).slice(0, 10),
    generated_at: isoDaysAgo(0, 6),
    format: "pdf",
    summary: "Fleet-wide risk distribution, top failure conditions, and week-over-week trend across all 3 lines.",
  },
  {
    id: "RPT-002",
    title: "Line A Deep Dive — Tool Wear Trends",
    period_start: isoDaysAgo(14).slice(0, 10),
    period_end: isoDaysAgo(7).slice(0, 10),
    generated_at: isoDaysAgo(7, 3),
    format: "pdf",
    summary: "Tool wear progression on Line A machines with elevated OSF/TWF flags, including CNC-104.",
  },
  {
    id: "RPT-003",
    title: "Monthly Classifier Performance Report",
    period_start: isoDaysAgo(30).slice(0, 10),
    period_end: isoDaysAgo(0).slice(0, 10),
    generated_at: isoDaysAgo(0, 12),
    format: "csv",
    summary: "Confidence band distribution, out-of-distribution counts, and sensor fault rate for the trailing month.",
  },
  {
    id: "RPT-004",
    title: "Weekly Fleet Health Summary",
    period_start: isoDaysAgo(14).slice(0, 10),
    period_end: isoDaysAgo(7).slice(0, 10),
    generated_at: isoDaysAgo(7, 6),
    format: "pdf",
    summary: "Fleet-wide risk distribution, top failure conditions, and week-over-week trend across all 3 lines.",
  },
  {
    id: "RPT-005",
    title: "Work Order Closure Audit",
    period_start: isoDaysAgo(30).slice(0, 10),
    period_end: isoDaysAgo(0).slice(0, 10),
    generated_at: isoDaysAgo(1, 1),
    format: "csv",
    summary: "Time-to-close and outcome breakdown for work orders linked to critical/high classifier outputs.",
  },
  {
    id: "RPT-006",
    title: "Line B & C Sensor Fault Review",
    period_start: isoDaysAgo(21).slice(0, 10),
    period_end: isoDaysAgo(14).slice(0, 10),
    generated_at: isoDaysAgo(14, 8),
    format: "pdf",
    summary: "Sensor fault and out-of-distribution incidents on Line B and Line C, including CNC-071.",
  },
];

// --- Work orders -----------------------------------------------------
const workOrderSeeds: Omit<WorkOrder, "id" | "created_at">[] = [
  {
    machine_id: "CNC-104",
    title: "Inspect tool head — OSF + elevated tool wear",
    status: "in_progress",
    priority: "high",
    assigned_to: "R. Alvarez",
    linked_classifier_output_ref: "CNC-104",
  },
  {
    machine_id: "CNC-088",
    title: "Investigate heat dissipation failure flag",
    status: "open",
    priority: "high",
    assigned_to: "Unassigned",
    linked_classifier_output_ref: "CNC-088",
  },
  {
    machine_id: "CNC-063",
    title: "Check torque sensor calibration — PWF flag",
    status: "open",
    priority: "high",
    assigned_to: "J. Kim",
    linked_classifier_output_ref: "CNC-063",
  },
  {
    machine_id: "CNC-112",
    title: "Schedule tool change — elevated tool wear",
    status: "open",
    priority: "medium",
    assigned_to: "Unassigned",
    linked_classifier_output_ref: "CNC-112",
  },
  {
    machine_id: "CNC-099",
    title: "Review overstrain flag on next shift",
    status: "completed",
    priority: "medium",
    assigned_to: "R. Alvarez",
    linked_classifier_output_ref: "CNC-099",
  },
  {
    machine_id: "CNC-071",
    title: "Inspect sensor wiring — classifier output uncertain",
    status: "in_progress",
    priority: "medium",
    assigned_to: "J. Kim",
    linked_classifier_output_ref: "CNC-071",
  },
  {
    machine_id: "CNC-045",
    title: "Routine quarterly preventive maintenance",
    status: "completed",
    priority: "low",
    assigned_to: "M. Chen",
  },
  {
    machine_id: "CNC-021",
    title: "Verify calibration after firmware update",
    status: "cancelled",
    priority: "low",
    assigned_to: "M. Chen",
  },
];

export const workOrdersFixture: WorkOrder[] = workOrderSeeds.map((wo, idx) => ({
  id: `WO-${String(idx + 1).padStart(4, "0")}`,
  created_at: isoDaysAgo(idx % 6, idx),
  ...wo,
}));
