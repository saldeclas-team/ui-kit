import type { SelectNativeColors } from "../tokens-types";

/**
 * Default light-mode SelectNative palette. Wrapper frame tuned to
 * match `DEFAULT_LIGHT_INPUT_COLORS` so a SelectNative sitting next
 * to an Input in the same form reads as native. Interior chrome
 * (the SwiftUI Menu / Compose Picker itself) is untouched here —
 * `@expo/ui` owns those colors and picks them from the platform's
 * default appearance so the picker feels genuinely native.
 */
export const DEFAULT_LIGHT_SELECT_NATIVE_COLORS: SelectNativeColors = {
  label: "#111827",
  background: "#FFFFFF",
  backgroundDisabled: "#F3F4F6",
  border: "#D1D5DB",
  borderError: "#DC2626",
  helperText: "#6B7280",
  errorText: "#DC2626",
};

/**
 * Default dark-mode SelectNative palette. Frame + text tuned for
 * dark surfaces; the native picker inside flips its own chrome
 * automatically when the underlying appearance is dark.
 */
export const DEFAULT_DARK_SELECT_NATIVE_COLORS: SelectNativeColors = {
  label: "#F9FAFB",
  background: "#111827",
  backgroundDisabled: "#1F2937",
  border: "#374151",
  borderError: "#F87171",
  helperText: "#9CA3AF",
  errorText: "#F87171",
};

/**
 * Merge partial SelectNative-color overrides on top of a base
 * palette. Missing slots fall through. Slot-based, same shape as
 * `mergeSelectColors` / `mergeInputColors`.
 */
export function mergeSelectNativeColors(
  base: SelectNativeColors,
  override?: Partial<SelectNativeColors>
): SelectNativeColors {
  if (override == null) return base;
  return { ...base, ...override };
}
