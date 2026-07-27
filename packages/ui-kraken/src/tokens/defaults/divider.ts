import type { DividerColors } from "../tokens-types";

/**
 * Default light-mode Divider palette. `line` uses gray-200 — same
 * tone as the default Input / Card border colors so a divider
 * between two inputs or two cards reads as native chrome instead
 * of competing.
 */
export const DEFAULT_LIGHT_DIVIDER_COLORS: DividerColors = {
  line: "#E5E7EB",
};

/**
 * Default dark-mode Divider palette. `line` uses gray-700 — visible
 * on dark backgrounds without competing with content text.
 */
export const DEFAULT_DARK_DIVIDER_COLORS: DividerColors = {
  line: "#374151",
};

/**
 * Merge partial Divider-color overrides on top of a base palette.
 * Missing slots fall through. Same shape as every other component
 * merge helper.
 */
export function mergeDividerColors(
  base: DividerColors,
  override?: Partial<DividerColors>
): DividerColors {
  if (override == null) return base;
  return { ...base, ...override };
}
