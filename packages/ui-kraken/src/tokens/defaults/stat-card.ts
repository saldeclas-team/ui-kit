import type { StatCardColors } from "../tokens-types";

/**
 * Default light-mode StatCard palette.
 *
 * - `background` — gray-50 so the card reads as a raised surface
 *   against a white app background.
 * - `title` / `description` / `icon` — muted gray-500 for secondary
 *   copy.
 * - `value` — near-black for maximum affordance on the metric.
 * - `trendUp` — green-600, `trendDown` — red-600, `trendNeutral` —
 *   gray-500 (matches the industry convention across every dashboard
 *   library).
 */
export const DEFAULT_LIGHT_STAT_CARD_COLORS: StatCardColors = {
  background: "#F9FAFB",
  title: "#6B7280",
  value: "#0B0B0F",
  description: "#6B7280",
  icon: "#6B7280",
  trendUp: "#059669",
  trendDown: "#DC2626",
  trendNeutral: "#6B7280",
};

/**
 * Default dark-mode StatCard palette.
 *
 * - `background` — gray-900 (one step lighter than `Surface.base`
 *   near-black) so cards read as elevated.
 * - `title` / `description` / `icon` — gray-400 for secondary copy.
 * - `value` — near-white for maximum contrast.
 * - Trend hues shift to lighter shades (green-400 / red-400 /
 *   gray-400) that pop on dark.
 */
export const DEFAULT_DARK_STAT_CARD_COLORS: StatCardColors = {
  background: "#111827",
  title: "#9CA3AF",
  value: "#F5F5F7",
  description: "#9CA3AF",
  icon: "#9CA3AF",
  trendUp: "#34D399",
  trendDown: "#F87171",
  trendNeutral: "#9CA3AF",
};

/**
 * Merge partial StatCard-color overrides on top of a base palette.
 * Missing slots fall through. Slot-based, same shape as
 * `mergeSurfaceColors` / `mergeSkeletonColors`.
 */
export function mergeStatCardColors(
  base: StatCardColors,
  override?: Partial<StatCardColors>
): StatCardColors {
  if (override == null) return base;
  return { ...base, ...override };
}
