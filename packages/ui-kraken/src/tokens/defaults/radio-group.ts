import type { RadioGroupColors } from "../tokens-types";

/**
 * Default light-mode RadioGroup palette. Selected color mirrors the brand
 * blue used by Button + Text `interactive`; unselected border is a
 * neutral gray. Selected row gets a very subtle blue tint background.
 */
export const DEFAULT_LIGHT_RADIO_GROUP_COLORS: RadioGroupColors = {
  selectedBorder: "#2563EB",
  unselectedBorder: "#9CA3AF",
  dot: "#2563EB",
  label: "#0B0B0F",
  groupLabel: "#0B0B0F",
  selectedBackground: "#EFF6FF",
  unselectedBackground: undefined,
};

/**
 * Default dark-mode RadioGroup palette. Lighter brand blue so it pops on
 * a dark surface; higher-contrast neutral gray on unselected rings.
 * Selected row tint is a translucent blue that reads over near-black.
 */
export const DEFAULT_DARK_RADIO_GROUP_COLORS: RadioGroupColors = {
  selectedBorder: "#60A5FA",
  unselectedBorder: "#6B7280",
  dot: "#60A5FA",
  label: "#F5F5F7",
  groupLabel: "#F5F5F7",
  selectedBackground: "#1E3A8A33",
  unselectedBackground: undefined,
};

/**
 * Merge partial RadioGroup-color overrides on top of a base palette.
 * Missing slots fall through — consumers only declare the slots they
 * want to change. Same signature as `mergeTextColors` (RadioGroup is
 * slot-based, not variant-based, so no nested merge is needed).
 */
export function mergeRadioGroupColors(
  base: RadioGroupColors,
  override?: Partial<RadioGroupColors>
): RadioGroupColors {
  if (override == null) return base;
  return { ...base, ...override };
}
