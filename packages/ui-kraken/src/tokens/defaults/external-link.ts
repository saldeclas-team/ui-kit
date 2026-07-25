import type { ExternalLinkColors } from "../tokens-types";

/**
 * Default light-mode ExternalLink palette. Matches
 * `TextColors.interactive` — links in body copy look native
 * alongside other interactive text.
 */
export const DEFAULT_LIGHT_EXTERNAL_LINK_COLORS: ExternalLinkColors = {
  label: "#2563EB",
  icon: "#2563EB",
};

/**
 * Default dark-mode ExternalLink palette. Lighter blue for contrast
 * on dark surfaces.
 */
export const DEFAULT_DARK_EXTERNAL_LINK_COLORS: ExternalLinkColors = {
  label: "#60A5FA",
  icon: "#60A5FA",
};

/**
 * Merge partial ExternalLink-color overrides on top of a base
 * palette. Missing slots fall through. Slot-based, same shape as
 * `mergeSurfaceColors` / `mergeSkeletonColors`.
 */
export function mergeExternalLinkColors(
  base: ExternalLinkColors,
  override?: Partial<ExternalLinkColors>
): ExternalLinkColors {
  if (override == null) return base;
  return { ...base, ...override };
}
