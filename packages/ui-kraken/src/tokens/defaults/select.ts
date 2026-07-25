import type { SelectColors } from "../tokens-types";

/**
 * Default light-mode Select palette. Trigger chrome mirrors
 * `DEFAULT_LIGHT_INPUT_COLORS` so a Select sitting next to an Input
 * in the same form reads as native. Modal chrome mirrors
 * `DEFAULT_LIGHT_MULTI_SELECT_COLORS` so the sheet-vs-modal picker
 * pair share the same overlay tone.
 */
export const DEFAULT_LIGHT_SELECT_COLORS: SelectColors = {
  background: "#FFFFFF",
  backgroundDisabled: "#F3F4F6",
  border: "#D1D5DB",
  borderFocused: "#2563EB",
  borderError: "#DC2626",
  text: "#111827",
  textDisabled: "#9CA3AF",
  placeholder: "#9CA3AF",
  chevron: "#6B7280",
  label: "#111827",
  helperText: "#6B7280",
  errorText: "#DC2626",
  overlayBackground: "rgba(17, 24, 39, 0.55)",
  menuBackground: "#FFFFFF",
  menuTitle: "#111827",
  optionSelectedBackground: "#EEF2FF",
};

/**
 * Default dark-mode Select palette. Trigger + modal chrome tuned for
 * dark surfaces — border/placeholder lifted for contrast, selected-row
 * highlight uses a translucent blue instead of the light `#EEF2FF`.
 */
export const DEFAULT_DARK_SELECT_COLORS: SelectColors = {
  background: "#111827",
  backgroundDisabled: "#1F2937",
  border: "#374151",
  borderFocused: "#60A5FA",
  borderError: "#F87171",
  text: "#F9FAFB",
  textDisabled: "#6B7280",
  placeholder: "#6B7280",
  chevron: "#9CA3AF",
  label: "#F9FAFB",
  helperText: "#9CA3AF",
  errorText: "#F87171",
  overlayBackground: "rgba(0, 0, 0, 0.65)",
  menuBackground: "#111827",
  menuTitle: "#F9FAFB",
  optionSelectedBackground: "rgba(96, 165, 250, 0.16)",
};

/**
 * Merge partial Select-color overrides on top of a base palette.
 * Missing slots fall through. Slot-based, same shape as
 * `mergeMultiSelectColors` / `mergeInputColors`.
 */
export function mergeSelectColors(
  base: SelectColors,
  override?: Partial<SelectColors>
): SelectColors {
  if (override == null) return base;
  return { ...base, ...override };
}
