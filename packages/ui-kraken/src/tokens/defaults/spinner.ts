import type { SpinnerColors } from "../tokens-types";

/**
 * Default light-mode Spinner palette. `color` uses gray-500 — same
 * muted secondary tone that reads as "in-progress" without
 * competing with actual content on a white / light surface.
 */
export const DEFAULT_LIGHT_SPINNER_COLORS: SpinnerColors = {
  color: "#6B7280",
};

/**
 * Default dark-mode Spinner palette. `color` uses gray-400 —
 * visible on dark surfaces without over-emphasizing the loading
 * state.
 */
export const DEFAULT_DARK_SPINNER_COLORS: SpinnerColors = {
  color: "#9CA3AF",
};

/**
 * Merge partial Spinner-color overrides on top of a base palette.
 * Missing slots fall through. Same shape as every other component
 * merge helper.
 */
export function mergeSpinnerColors(
  base: SpinnerColors,
  override?: Partial<SpinnerColors>
): SpinnerColors {
  if (override == null) return base;
  return { ...base, ...override };
}
