import type { RefreshControlColors } from "../tokens-types";

/**
 * Default light-mode RefreshControl palette.
 *
 * - `spinner` — brand blue-600 (matches `Input.borderFocused` /
 *   `RadioGroup.selectedBorder` / `Text.interactive`).
 * - `background` — gray-50 (matches `Surface.raised`) so the Android
 *   circle blends with a card-like surface.
 * - `title` — gray-500 (matches `Text.secondary`).
 */
export const DEFAULT_LIGHT_REFRESH_CONTROL_COLORS: RefreshControlColors = {
  spinner: "#2563EB",
  background: "#F9FAFB",
  title: "#5B6472",
};

/**
 * Default dark-mode RefreshControl palette.
 *
 * - `spinner` — lighter brand blue-400 so it pops on dark.
 * - `background` — gray-900 (matches `Surface.raised` in dark).
 * - `title` — gray-400 (matches `Text.secondary` in dark).
 */
export const DEFAULT_DARK_REFRESH_CONTROL_COLORS: RefreshControlColors = {
  spinner: "#60A5FA",
  background: "#111827",
  title: "#9CA3AF",
};

/**
 * Merge partial RefreshControl-color overrides on top of a base
 * palette. Missing slots fall through. Slot-based, same shape as
 * `mergeInputColors` / `mergeSurfaceColors`.
 */
export function mergeRefreshControlColors(
  base: RefreshControlColors,
  override?: Partial<RefreshControlColors>
): RefreshControlColors {
  if (override == null) return base;
  return { ...base, ...override };
}
