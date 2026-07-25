import type { SegmentedControlColors } from "../tokens-types";

/**
 * Default light-mode SegmentedControl palette. Surrounding label
 * + helper / error text only — the native SegmentedControl paints
 * its own container and per-segment chrome, and we deliberately
 * do NOT pass a `tintColor` (see plan doc for the rationale).
 */
export const DEFAULT_LIGHT_SEGMENTED_CONTROL_COLORS: SegmentedControlColors = {
  label: "#111827",
  helperText: "#6B7280",
  errorText: "#DC2626",
  // Material 3 role colors (light scheme). See
  // https://m3.material.io/styles/color/roles for the source of
  // truth. Consumers who want a design-system-primary tint
  // override `selectedBackground` + `selectedLabel` per-instance.
  containerBackground: "#FEF7FF",
  containerBorder: "#79747E",
  selectedBackground: "#E8DEF8",
  selectedLabel: "#1D192B",
  unselectedLabel: "#1C1B1F",
  ripple: "#D0BCFF33",
};

/**
 * Default dark-mode SegmentedControl palette.
 */
export const DEFAULT_DARK_SEGMENTED_CONTROL_COLORS: SegmentedControlColors = {
  label: "#F9FAFB",
  helperText: "#9CA3AF",
  errorText: "#F87171",
  // Material 3 role colors (dark scheme).
  containerBackground: "#1D1B20",
  containerBorder: "#938F99",
  selectedBackground: "#4A4458",
  selectedLabel: "#E8DEF8",
  unselectedLabel: "#E6E1E5",
  ripple: "#38313F",
};

/**
 * Merge partial SegmentedControl-color overrides on top of a
 * base palette. Missing slots fall through.
 */
export function mergeSegmentedControlColors(
  base: SegmentedControlColors,
  override?: Partial<SegmentedControlColors>
): SegmentedControlColors {
  if (override == null) return base;
  return { ...base, ...override };
}
