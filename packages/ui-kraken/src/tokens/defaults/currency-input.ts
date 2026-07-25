import type { CurrencyInputColors } from "../tokens-types";

/**
 * Default light-mode CurrencyInput palette. Mirrors the `Input` defaults
 * (WCAG AA on white / near-white surfaces) plus a muted `prefix` slot
 * (gray-500) so the currency symbol reads as secondary against the
 * value the user types.
 */
export const DEFAULT_LIGHT_CURRENCY_INPUT_COLORS: CurrencyInputColors = {
  background: "#FFFFFF",
  backgroundDisabled: "#F3F4F6",
  border: "#D1D5DB",
  borderFocused: "#2563EB",
  borderError: "#DC2626",
  text: "#0B0B0F",
  textDisabled: "#9CA3AF",
  placeholder: "#9CA3AF",
  prefix: "#6B7280",
  label: "#0B0B0F",
  helperText: "#6B7280",
  errorText: "#DC2626",
};

/**
 * Default dark-mode CurrencyInput palette. Mirrors `Input` dark defaults
 * with a lighter muted `prefix` (gray-400) so the symbol stays legible
 * against gray-900 without over-shouting the value.
 */
export const DEFAULT_DARK_CURRENCY_INPUT_COLORS: CurrencyInputColors = {
  background: "#111827",
  backgroundDisabled: "#1F2937",
  border: "#374151",
  borderFocused: "#60A5FA",
  borderError: "#F87171",
  text: "#F5F5F7",
  textDisabled: "#6B7280",
  placeholder: "#6B7280",
  prefix: "#9CA3AF",
  label: "#F5F5F7",
  helperText: "#9CA3AF",
  errorText: "#F87171",
};

/**
 * Merge partial CurrencyInput-color overrides on top of a base palette.
 * Missing slots fall through. Same signature as `mergeInputColors`.
 */
export function mergeCurrencyInputColors(
  base: CurrencyInputColors,
  override?: Partial<CurrencyInputColors>
): CurrencyInputColors {
  if (override == null) return base;
  return { ...base, ...override };
}
