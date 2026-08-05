// Demo machine roster used only when VITE_API_MODE=live.
//
// The real backend (saxon_machine_health_api) is a pure inference service —
// it has no concept of a "fleet" or persisted machines, it just scores
// whatever reading you send it. Since there's no live plant sensor feed for
// this pilot yet, we keep a small fixed roster of machine IDs/locations for
// demo continuity, but the sensor readings below are REAL rows sampled
// directly from the training/eval dataset
// (ai4i_augmented_classifier_dataset_v2.csv), not synthetic values — each
// one is labeled with the ground-truth primary_failure_class it was sampled
// under, for reference. The prediction shown in the UI is always a live
// call to the real trained model, never this label.
import type { MachineReading } from "./backendTypes";

export interface RosterEntry {
  machine_id: string;
  line: string;
  cell: string;
  reading: MachineReading;
  /** Ground-truth label from the source dataset row — reference only, not shown as the prediction. */
  datasetLabel: string;
}

export const machineRoster: RosterEntry[] = [
  {
    machine_id: "CNC-104",
    line: "Line A",
    cell: "Cell 3",
    datasetLabel: "MULTIPLE_FAILURES (HDF|OSF)",
    reading: {
      machine_id: "CNC-104",
      product_type: "L",
      air_temperature_k: 297.5521,
      process_temperature_k: 305.6509,
      rotational_speed_rpm: 1280.2097,
      torque_nm: 57.3154,
      tool_wear_min: 198.6023,
    },
  },
  {
    machine_id: "CNC-088",
    line: "Line A",
    cell: "Cell 1",
    datasetLabel: "HDF",
    reading: {
      machine_id: "CNC-088",
      product_type: "M",
      air_temperature_k: 300.8,
      process_temperature_k: 309.4,
      rotational_speed_rpm: 1342.0,
      torque_nm: 62.4,
      tool_wear_min: 113.0,
    },
  },
  {
    machine_id: "CNC-063",
    line: "Line C",
    cell: "Cell 3",
    datasetLabel: "PWF",
    reading: {
      machine_id: "CNC-063",
      product_type: "L",
      air_temperature_k: 298.9,
      process_temperature_k: 309.1,
      rotational_speed_rpm: 2861.0,
      torque_nm: 4.6,
      tool_wear_min: 143.0,
    },
  },
  {
    machine_id: "CNC-112",
    line: "Line B",
    cell: "Cell 2",
    datasetLabel: "TWF",
    reading: {
      machine_id: "CNC-112",
      product_type: "L",
      air_temperature_k: 298.8,
      process_temperature_k: 308.9,
      rotational_speed_rpm: 1455.0,
      torque_nm: 41.3,
      tool_wear_min: 208.0,
    },
  },
  {
    machine_id: "CNC-099",
    line: "Line B",
    cell: "Cell 1",
    datasetLabel: "OSF",
    reading: {
      machine_id: "CNC-099",
      product_type: "L",
      air_temperature_k: 298.4,
      process_temperature_k: 308.2,
      rotational_speed_rpm: 1282.0,
      torque_nm: 60.7,
      tool_wear_min: 216.0,
    },
  },
  {
    machine_id: "CNC-045",
    line: "Line B",
    cell: "Cell 4",
    datasetLabel: "NORMAL",
    reading: {
      machine_id: "CNC-045",
      product_type: "M",
      air_temperature_k: 298.1,
      process_temperature_k: 308.6,
      rotational_speed_rpm: 1551.0,
      torque_nm: 42.8,
      tool_wear_min: 0.0,
    },
  },
  {
    machine_id: "CNC-021",
    line: "Line A",
    cell: "Cell 5",
    datasetLabel: "NORMAL",
    reading: {
      machine_id: "CNC-021",
      product_type: "L",
      air_temperature_k: 298.2,
      process_temperature_k: 308.7,
      rotational_speed_rpm: 1408.0,
      torque_nm: 46.3,
      tool_wear_min: 3.0,
    },
  },
  {
    machine_id: "CNC-071",
    line: "Line C",
    cell: "Cell 1",
    datasetLabel: "NO_FAULT_FOUND",
    reading: {
      machine_id: "CNC-071",
      product_type: "M",
      air_temperature_k: 297.9292,
      process_temperature_k: 306.8462,
      rotational_speed_rpm: 1312.1289,
      torque_nm: 53.6638,
      tool_wear_min: 89.0182,
    },
  },
];

export function findRosterEntry(machineId: string): RosterEntry | undefined {
  return machineRoster.find((m) => m.machine_id === machineId);
}
