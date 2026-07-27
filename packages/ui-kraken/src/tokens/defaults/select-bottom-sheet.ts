import type { SelectBottomSheetColors } from "../tokens-types";

/**
 * Default light-mode SelectBottomSheet palette. Trigger chrome
 * mirrors [[DEFAULT_LIGHT_SELECT_COLORS]] so a SelectBottomSheet
 * trigger sits next to a Select trigger without visual drift.
 * Sheet chrome uses a white panel with a light-grey handle bar
 * (matches the affordance most iOS/Android bottom sheets use).
 */
export const DEFAULT_LIGHT_SELECT_BOTTOM_SHEET_COLORS: SelectBottomSheetColors = {
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
  sheetBackground: "#FFFFFF",
  sheetHandle: "#D1D5DB",
  optionSelectedBackground: "#EEF2FF",
};

/**
 * Default dark-mode SelectBottomSheet palette.
 */
export const DEFAULT_DARK_SELECT_BOTTOM_SHEET_COLORS: SelectBottomSheetColors = {
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
  sheetBackground: "#111827",
  sheetHandle: "#374151",
  optionSelectedBackground: "rgba(96, 165, 250, 0.16)",
};

/**
 * Merge partial SelectBottomSheet-color overrides on top of a base
 * palette. Missing slots fall through. Slot-based, same shape as
 * `mergeSelectColors`.
 */
export function mergeSelectBottomSheetColors(
  base: SelectBottomSheetColors,
  override?: Partial<SelectBottomSheetColors>
): SelectBottomSheetColors {
  if (override == null) return base;
  return { ...base, ...override };
}
