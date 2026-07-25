import type { SkeletonColors } from "../tokens-types";

/**
 * Default light-mode Skeleton palette.
 *
 * - `base` — gray-200 fill; reads as "not real content" against a white
 *   Surface without being invisible.
 * - `highlight` — gray-100, slightly lighter for the pulse peak.
 */
export const DEFAULT_LIGHT_SKELETON_COLORS: SkeletonColors = {
  base: "#E5E7EB",
  highlight: "#F3F4F6",
};

/**
 * Default dark-mode Skeleton palette.
 *
 * - `base` — gray-800 fill; visible against `Surface.base` (near-black).
 * - `highlight` — gray-700 for the pulse peak.
 */
export const DEFAULT_DARK_SKELETON_COLORS: SkeletonColors = {
  base: "#1F2937",
  highlight: "#374151",
};

/**
 * Merge partial Skeleton-color overrides on top of a base palette.
 * Missing slots fall through. Slot-based, same shape as
 * `mergeSurfaceColors` / `mergeRefreshControlColors`.
 */
export function mergeSkeletonColors(
  base: SkeletonColors,
  override?: Partial<SkeletonColors>
): SkeletonColors {
  if (override == null) return base;
  return { ...base, ...override };
}
