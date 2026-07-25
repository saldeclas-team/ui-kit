import type { TextColors } from "../tokens-types";

/**
 * Default light-mode Text palette. Tuned for WCAG AA contrast on white
 * surfaces. Semantic colors mirror the brand primary (Blue-600) and the
 * standard Tailwind/Material palette for success / warning / danger / info.
 */
export const DEFAULT_LIGHT_TEXT_COLORS: TextColors = {
  primary: "#0B0B0F",
  secondary: "#5B6472",
  tertiary: "#9CA3AF",
  disabled: "#D1D5DB",
  inverse: "#FFFFFF",
  interactive: "#2563EB",
  success: "#059669",
  warning: "#D97706",
  danger: "#DC2626",
  info: "#0284C7",
  onPrimary: "#FFFFFF",
  onSecondary: "#FFFFFF",
  onSuccess: "#FFFFFF",
  onDanger: "#FFFFFF",
};

/**
 * Default dark-mode Text palette. Lighter brand hues, near-white foreground
 * text, gray-scale hierarchy adjusted for readability against dark surfaces.
 * `onSecondary` and `onSuccess` flip to near-black because the corresponding
 * dark-mode Button `background` for those variants is a light color.
 */
export const DEFAULT_DARK_TEXT_COLORS: TextColors = {
  primary: "#F5F5F7",
  secondary: "#9CA3AF",
  tertiary: "#6B7280",
  disabled: "#4B5563",
  inverse: "#0B0B0F",
  interactive: "#60A5FA",
  success: "#34D399",
  warning: "#FBBF24",
  danger: "#F87171",
  info: "#38BDF8",
  onPrimary: "#FFFFFF",
  onSecondary: "#0B0B0F",
  onSuccess: "#0B0B0F",
  onDanger: "#FFFFFF",
};

/**
 * Merge partial text-color overrides on top of a base palette. Missing slots
 * fall through — consumers only declare the slots they want to change.
 */
export function mergeTextColors(base: TextColors, override?: Partial<TextColors>): TextColors {
  if (override == null) return base;
  return { ...base, ...override };
}
