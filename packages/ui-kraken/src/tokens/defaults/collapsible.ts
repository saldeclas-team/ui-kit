import type { CollapsibleColors } from "../tokens-types";

/**
 * Default light-mode Collapsible palette.
 *
 * Header uses `Surface.raised` (gray-50) so it reads as a slightly
 * elevated card on a white app background. Body is pure white so
 * expanded content reads as sitting behind the header. Border draws
 * a subtle outline that separates stacked Collapsibles.
 */
export const DEFAULT_LIGHT_COLLAPSIBLE_COLORS: CollapsibleColors = {
  headerBackground: "#F9FAFB",
  title: "#0B0B0F",
  icon: "#6B7280",
  chevron: "#6B7280",
  bodyBackground: "#FFFFFF",
  border: "#E5E7EB",
};

/**
 * Default dark-mode Collapsible palette.
 *
 * Header uses `Surface.raised` (gray-900), body uses `Surface.base`
 * (near-black) — expanded content reads as sitting BEHIND the header
 * in dark mode (Material 3 dark-surface convention where higher
 * elevation is lighter).
 */
export const DEFAULT_DARK_COLLAPSIBLE_COLORS: CollapsibleColors = {
  headerBackground: "#111827",
  title: "#F5F5F7",
  icon: "#9CA3AF",
  chevron: "#9CA3AF",
  bodyBackground: "#0B0B0F",
  border: "#1F2937",
};

/**
 * Merge partial Collapsible-color overrides on top of a base
 * palette. Missing slots fall through. Slot-based, same shape as
 * `mergeSurfaceColors` / `mergeSkeletonColors`.
 */
export function mergeCollapsibleColors(
  base: CollapsibleColors,
  override?: Partial<CollapsibleColors>
): CollapsibleColors {
  if (override == null) return base;
  return { ...base, ...override };
}
