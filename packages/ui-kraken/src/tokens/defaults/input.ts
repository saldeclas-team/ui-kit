import type { InputColors } from "../tokens-types";

/**
 * Default light-mode Input palette. Tuned for WCAG AA contrast on
 * white / near-white surfaces. Focused border mirrors the brand blue
 * used by RadioGroup + Text `interactive`; error border mirrors Alert
 * `danger`.
 */
export const DEFAULT_LIGHT_INPUT_COLORS: InputColors = {
  background: "#FFFFFF",
  backgroundDisabled: "#F3F4F6",
  border: "#D1D5DB",
  borderFocused: "#2563EB",
  borderError: "#DC2626",
  text: "#0B0B0F",
  textDisabled: "#9CA3AF",
  placeholder: "#9CA3AF",
  label: "#0B0B0F",
  helperText: "#6B7280",
  errorText: "#DC2626",
};

/**
 * Default dark-mode Input palette. Backgrounds shift to gray-900 /
 * gray-800 so the input reads as a subtle depression against the near-
 * black app surface; focused / error borders use the lighter variant
 * shades so they pop on dark.
 */
export const DEFAULT_DARK_INPUT_COLORS: InputColors = {
  background: "#111827",
  backgroundDisabled: "#1F2937",
  border: "#374151",
  borderFocused: "#60A5FA",
  borderError: "#F87171",
  text: "#F5F5F7",
  textDisabled: "#6B7280",
  placeholder: "#6B7280",
  label: "#F5F5F7",
  helperText: "#9CA3AF",
  errorText: "#F87171",
};

/**
 * Merge partial Input-color overrides on top of a base palette.
 * Missing slots fall through — consumers only declare the slots they
 * want to change. Same signature as `mergeTextColors` (Input is
 * slot-based, not variant-based, so no nested merge is needed).
 */
export function mergeInputColors(base: InputColors, override?: Partial<InputColors>): InputColors {
  if (override == null) return base;
  return { ...base, ...override };
}
