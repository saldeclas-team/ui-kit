import type { SurfaceColors } from "../tokens-types";

/**
 * Default light-mode Surface palette. Tuned for a subtle vertical
 * rhythm on white / near-white surfaces:
 *
 * - `base`    — pure white
 * - `raised`  — a step darker (gray-50) so a card on the app bg reads
 *   as elevated without needing a shadow
 * - `overlay` — matches `base` (future shadow / border cues distinguish
 *   modals + sheets in v1)
 * - `sunken`  — a step below `raised` (gray-100), for inset regions
 */
export const DEFAULT_LIGHT_SURFACE_COLORS: SurfaceColors = {
  base: "#FFFFFF",
  raised: "#F9FAFB",
  overlay: "#FFFFFF",
  sunken: "#F3F4F6",
};

/**
 * Default dark-mode Surface palette. Follows the Material 3 dark-mode
 * convention where luminance INCREASES with elevation — a raised
 * surface on a near-black bg is slightly lighter so it reads as
 * "closer" to the viewer without needing a shadow.
 *
 * - `base`    — near-black app background
 * - `raised`  — gray-900, a step lighter than `base`
 * - `overlay` — gray-800, another step up
 * - `sunken`  — gray-950, a step below `base`
 */
export const DEFAULT_DARK_SURFACE_COLORS: SurfaceColors = {
  base: "#0B0B0F",
  raised: "#111827",
  overlay: "#1F2937",
  sunken: "#030712",
};

/**
 * Merge partial Surface-color overrides on top of a base palette.
 * Missing slots fall through. Slot-based, same shape as
 * `mergeInputColors` / `mergeTextColors`.
 */
export function mergeSurfaceColors(
  base: SurfaceColors,
  override?: Partial<SurfaceColors>
): SurfaceColors {
  if (override == null) return base;
  return { ...base, ...override };
}
