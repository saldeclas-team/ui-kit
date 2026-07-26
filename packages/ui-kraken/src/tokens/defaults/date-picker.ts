import type { DatePickerColors } from "../tokens-types";

/**
 * Default light-mode DatePicker palette. Trigger chrome mirrors
 * `DEFAULT_LIGHT_INPUT_COLORS` so a DatePicker sitting next to an
 * Input in the same form reads as native. Accent uses iOS system
 * blue (`#007AFF`) so the highlighted date in the native picker
 * feels platform-consistent by default.
 */
export const DEFAULT_LIGHT_DATE_PICKER_COLORS: DatePickerColors = {
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
};

/**
 * Default dark-mode DatePicker palette. Trigger inverts to
 * gray-800; accent uses Apple's dark-mode system blue variant.
 */
export const DEFAULT_DARK_DATE_PICKER_COLORS: DatePickerColors = {
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
};

/**
 * Merge partial DatePicker-color overrides on top of a base
 * palette. Missing slots fall through.
 */
export function mergeDatePickerColors(
  base: DatePickerColors,
  override?: Partial<DatePickerColors>
): DatePickerColors {
  if (override == null) return base;
  return { ...base, ...override };
}
