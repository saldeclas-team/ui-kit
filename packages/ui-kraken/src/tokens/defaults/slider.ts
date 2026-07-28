import type { SliderColors } from "../tokens-types";

/**
 * Default light-mode Slider palette. Track + fill mirror
 * ProgressBar's light palette so a Slider and a ProgressBar at
 * the same value read as related. Thumb is white with implicit
 * definition from the surrounding surface color.
 */
export const DEFAULT_LIGHT_SLIDER_COLORS: SliderColors = {
  track: "#E5E7EB",
  fill: "#2563EB",
  thumb: "#FFFFFF",
};

/**
 * Default dark-mode Slider palette. Track + fill mirror
 * ProgressBar's dark palette; thumb uses gray-50 so it's visible
 * against dark surfaces.
 */
export const DEFAULT_DARK_SLIDER_COLORS: SliderColors = {
  track: "#374151",
  fill: "#60A5FA",
  thumb: "#F9FAFB",
};

/**
 * Merge partial Slider-color overrides on top of a base palette.
 * Missing slots fall through. Same shape as every other component
 * merge helper.
 */
export function mergeSliderColors(
  base: SliderColors,
  override?: Partial<SliderColors>
): SliderColors {
  if (override == null) return base;
  return { ...base, ...override };
}
