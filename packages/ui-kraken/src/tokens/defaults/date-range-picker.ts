import type { DateRangePickerColors } from "../tokens-types";

/**
 * Default light-mode DateRangePicker palette. Trigger chrome
 * mirrors `DEFAULT_LIGHT_DATE_PICKER_COLORS` so a range picker
 * sitting next to a single-date picker in the same form reads
 * flush. Separator uses gray-400 — legible on light backgrounds
 * without competing with the trigger borders.
 */
export const DEFAULT_LIGHT_DATE_RANGE_PICKER_COLORS: DateRangePickerColors = {
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
  accent: "#007AFF",
  separator: "#9CA3AF",
};

/**
 * Default dark-mode DateRangePicker palette. Separator uses
 * gray-500 to stay visible against the gray-800 trigger backdrop
 * without over-highlighting.
 */
export const DEFAULT_DARK_DATE_RANGE_PICKER_COLORS: DateRangePickerColors = {
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
  accent: "#0A84FF",
  separator: "#6B7280",
};

/**
 * Merge partial DateRangePicker-color overrides on top of a base
 * palette. Missing slots fall through.
 */
export function mergeDateRangePickerColors(
  base: DateRangePickerColors,
  override?: Partial<DateRangePickerColors>
): DateRangePickerColors {
  if (override == null) return base;
  return { ...base, ...override };
}
