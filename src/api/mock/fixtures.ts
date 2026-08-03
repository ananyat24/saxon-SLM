import type {
  ClassifierOutput,
  MachineDetail,
  MachineSummary,
  OverviewSummary,
  SystemStatus,
} from "../../types/contract";

const LINES = ["Line A", "Line B", "Line C"];

function makeSensorSnapshot(seed: number): Record<string, number> {
  return {
    air_temperature_k: 298 + (seed % 5),
    process_temperature_k: 308 + (seed % 6),
    rotational_speed_rpm: 1400 + (seed * 17) % 500,
    torque_nm: 35 + (seed * 3) % 40,
    tool_wear_min: (seed * 13) % 240,
  };
}

interface MachineSeed {
  id: string;
  line: string;
  cell: string;
  risk: ClassifierOutput["risk_band"];
  confidence: number;
  confidenceBand: ClassifierOutput["confidence_band"];
  flags: ClassifierOutput["flags"];
  conditions: string[];
  crossings: ClassifierOutput["thresholds_crossed"];
}

const seeds: MachineSeed[] = [
  {
    id: "CNC-104",
    line: "Line A",
    cell: "Cell 3",
    risk: "CRITICAL",
    confidence: 0.96,
    confidenceBand: "HIGH",
    flags: { hdf: false, pwf: false, osf: true, twf: true },
    conditions: ["OSF", "Elevated Tool Wear"],
    crossings: [
      { field: "tool_wear_min", value: 224, threshold: 200, direction: "above" },
      { field: "torque_nm", value: 68, threshold: 60, direction: "above" },
    ],
  },
  {
    id: "CNC-088",
    line: "Line A",
    cell: "Cell 1",
    risk: "HIGH",
    confidence: 0.88,
    confidenceBand: "MEDIUM",
    flags: { hdf: true, pwf: false, osf: false, twf: false },
    conditions: ["HDF"],
    crossings: [
      { field: "process_temperature_k", value: 309.1, threshold: 308.5, direction: "above" },
      { field: "rotational_speed_rpm", value: 1310, threshold: 1350, direction: "below" },
    ],
  },
  {
    id: "CNC-112",
    line: "Line B",
    cell: "Cell 2",
    risk: "ELEVATED",
    confidence: 0.81,
    confidenceBand: "MEDIUM",
    flags: { hdf: false, pwf: false, osf: false, twf: true },
    conditions: ["Elevated Tool Wear"],
    crossings: [{ field: "tool_wear_min", value: 178, threshold: 160, direction: "above" }],
  },
  {
    id: "CNC-045",
    line: "Line B",
    cell: "Cell 4",
    risk: "NORMAL",
    confidence: 0.97,
    confidenceBand: "HIGH",
    flags: { hdf: false, pwf: false, osf: false, twf: false },
    conditions: [],
    crossings: [],
  },
  {
    id: "CNC-071",
    line: "Line C",
    cell: "Cell 1",
    risk: "UNCERTAIN",
    confidence: 0.52,
    confidenceBand: "UNCERTAIN",
    flags: { hdf: false, pwf: false, osf: false, twf: false },
    conditions: ["Sensor Fault"],
    crossings: [],
  },
  {
    id: "CNC-063",
    line: "Line C",
    cell: "Cell 3",
    risk: "HIGH",
    confidence: 0.9,
    confidenceBand: "HIGH",
    flags: { hdf: false, pwf: true, osf: false, twf: false },
    conditions: ["PWF"],
    crossings: [{ field: "torque_nm", value: 12, threshold: 20, direction: "below" }],
  },
  {
    id: "CNC-021",
    line: "Line A",
    cell: "Cell 5",
    risk: "NORMAL",
    confidence: 0.94,
    confidenceBand: "HIGH",
    flags: { hdf: false, pwf: false, osf: false, twf: false },
    conditions: [],
    crossings: [],
  },
  {
    id: "CNC-099",
    line: "Line B",
    cell: "Cell 1",
    risk: "ELEVATED",
    confidence: 0.74,
    confidenceBand: "MEDIUM",
    flags: { hdf: false, pwf: false, osf: true, twf: false },
    conditions: ["OSF"],
    crossings: [{ field: "torque_nm", value: 58, threshold: 55, direction: "above" }],
  },
];

function classifierOutputFor(seed: MachineSeed, idx: number, offsetHours = 0): ClassifierOutput {
  const ts = new Date(Date.now() - offsetHours * 3600_000).toISOString();
  return {
    machine_id: seed.id,
    timestamp: ts,
    flags: seed.flags,
    risk_band: seed.risk,
    confidence: seed.confidence,
    confidence_band: seed.confidenceBand,
    sensor_snapshot: makeSensorSnapshot(idx + 1),
    thresholds_crossed: seed.crossings,
    classifier_version: "cnc-failure-clf-v2.3.1",
  };
}

function recommendedAction(risk: ClassifierOutput["risk_band"]): MachineSummary["recommended_action"] {
  switch (risk) {
    case "CRITICAL":
      return { label: "Stop and inspect", urgency: "stop" };
    case "HIGH":
      return { label: "Inspect", urgency: "inspect" };
    case "ELEVATED":
      return { label: "Inspect", urgency: "inspect" };
    default:
      return { label: "Monitor", urgency: "monitor" };
  }
}

export const machineSummaries: MachineSummary[] = seeds.map((seed, idx) => ({
  machine_id: seed.id,
  line: seed.line,
  cell: seed.cell,
  classifier_output: classifierOutputFor(seed, idx),
  recommended_action: recommendedAction(seed.risk),
  conditions: seed.conditions.length ? seed.conditions : ["Insufficient Info"],
}));

export function getMachineDetailFixture(machineId: string): MachineDetail | undefined {
  const idx = seeds.findIndex((s) => s.id === machineId);
  if (idx === -1) return undefined;
  const seed = seeds[idx];
  const summary = machineSummaries[idx];
  const history = Array.from({ length: 12 }, (_, i) => classifierOutputFor(seed, idx, i * 4));
  return { ...summary, history };
}

const riskRank: Record<ClassifierOutput["risk_band"], number> = {
  CRITICAL: 0,
  HIGH: 1,
  ELEVATED: 2,
  NORMAL: 3,
  UNCERTAIN: 4,
};

export const sortedQueue = [...machineSummaries].sort(
  (a, b) => riskRank[a.classifier_output.risk_band] - riskRank[b.classifier_output.risk_band],
);

function countBy<T>(items: T[], key: (t: T) => string): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => {
    const k = key(item);
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
}

export function buildOverviewSummary(): OverviewSummary {
  const riskCounts = countBy(machineSummaries, (m) => m.classifier_output.risk_band);
  const confCounts = countBy(machineSummaries, (m) => m.classifier_output.confidence_band);

  const conditionCounts: Record<string, number> = {};
  for (const m of machineSummaries) {
    for (const c of m.conditions) {
      conditionCounts[c] = (conditionCounts[c] ?? 0) + 1;
    }
  }

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const risk_trend = days.map((date, i) => ({
    date,
    critical: 1 + ((i * 7) % 3),
    high: 2 + ((i * 5) % 3),
    elevated: 2 + ((i * 3) % 4),
    normal: 3 + ((i * 11) % 4),
    uncertain: (i % 2),
  }));

  const risk_by_line = LINES.map((line) => {
    const lineMachines = machineSummaries.filter((m) => m.line === line);
    const c = countBy(lineMachines, (m) => m.classifier_output.risk_band);
    return {
      line,
      critical: c.CRITICAL ?? 0,
      high: c.HIGH ?? 0,
      elevated: c.ELEVATED ?? 0,
      normal: c.NORMAL ?? 0,
      uncertain: c.UNCERTAIN ?? 0,
    };
  });

  return {
    kpis: {
      monitored: machineSummaries.length,
      critical: riskCounts.CRITICAL ?? 0,
      high: riskCounts.HIGH ?? 0,
      elevated: riskCounts.ELEVATED ?? 0,
      normal: riskCounts.NORMAL ?? 0,
      uncertain: riskCounts.UNCERTAIN ?? 0,
    },
    risk_distribution: (["CRITICAL", "HIGH", "ELEVATED", "NORMAL", "UNCERTAIN"] as const).map((band) => ({
      band,
      count: riskCounts[band] ?? 0,
    })),
    top_failure_conditions: Object.entries(conditionCounts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count),
    risk_trend,
    risk_by_line,
    model_confidence: (["HIGH", "MEDIUM", "LOW", "UNCERTAIN"] as const).map((band) => ({
      band,
      count: confCounts[band] ?? 0,
    })),
  };
}

export const systemStatusFixture: SystemStatus = {
  data_quality: "GOOD",
  out_of_distribution_count: 1,
  sensor_fault_count: 1,
  last_model_update: new Date(Date.now() - 6 * 24 * 3600_000).toISOString(),
  classifier_version: "cnc-failure-clf-v2.3.1",
  slm_version: "qwen3-1.7b-unsloth-explainer-v0.9.2",
};
