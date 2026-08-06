// Static snapshot computed directly from the real training dataset
// (ai4i_augmented_classifier_dataset_v2.csv, 14,949 rows) used to train the
// deployed classifier. This is inherently a point-in-time snapshot, not a
// live query — the dataset itself doesn't change at runtime — but every
// number below was counted from the actual file, not estimated.
export const trainingDatasetSnapshot = {
  fileName: "ai4i_augmented_classifier_dataset_v2.csv",
  totalRows: 14949,
  byPrimaryClass: [
    { label: "NORMAL", count: 9643 },
    { label: "MULTIPLE_FAILURES", count: 2136 },
    { label: "NO_FAULT_FOUND", count: 1298 },
    { label: "PWF", count: 1174 },
    { label: "HDF", count: 506 },
    { label: "OSF", count: 150 },
    { label: "TWF", count: 42 },
  ],
  bySplit: [
    { label: "train", count: 11418 },
    { label: "validation", count: 1774 },
    { label: "test", count: 1757 },
  ],
  byProductType: [
    { label: "L (Low)", count: 7909 },
    { label: "M (Medium)", count: 4633 },
    { label: "H (High)", count: 2407 },
  ],
  bySource: [
    { label: "original_ai4i", count: 9949 },
    { label: "rule_grounded_boundary", count: 3200 },
    { label: "rule_grounded_overlap", count: 1800 },
  ],
};
