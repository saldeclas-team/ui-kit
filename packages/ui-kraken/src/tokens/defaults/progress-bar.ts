import type { ProgressBarColors } from "../tokens-types";

/**
 * Default light-mode ProgressBar palette. Track uses gray-200 (same
 * as Input / Card borders), fill uses blue-600 (primary action
 * hue), label uses gray-900 for readable secondary text.
 */
export const DEFAULT_LIGHT_PROGRESS_BAR_COLORS: ProgressBarColors = {
  track: "#E5E7EB",
  fill: "#2563EB",
  label: "#111827",
};

/**
 * Default dark-mode ProgressBar palette. Each slot inverts to
 * preserve contrast on dark surfaces.
 */
export const DEFAULT_DARK_PROGRESS_BAR_COLORS: ProgressBarColors = {
  track: "#374151",
  fill: "#60A5FA",
  label: "#F9FAFB",
};

/**
 * Merge partial ProgressBar-color overrides on top of a base
 * palette. Missing slots fall through. Same shape as every other
 * component merge helper.
 */
export function mergeProgressBarColors(
  base: ProgressBarColors,
  override?: Partial<ProgressBarColors>
): ProgressBarColors {
  if (override == null) return base;
  return { ...base, ...override };
}
