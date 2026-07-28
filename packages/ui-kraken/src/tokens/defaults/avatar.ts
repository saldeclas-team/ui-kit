import type { AvatarColors } from "../tokens-types";

/**
 * Default light-mode Avatar palette. Neutral placeholder — gray-200
 * background + gray-700 initials text. Reads as a placeholder that
 * doesn't over-emphasize the "we don't have a photo" state.
 */
export const DEFAULT_LIGHT_AVATAR_COLORS: AvatarColors = {
  background: "#E5E7EB",
  text: "#374151",
};

/**
 * Default dark-mode Avatar palette. Inverted from light — gray-700
 * background + gray-50 initials text. Same neutral-placeholder role
 * on dark surfaces.
 */
export const DEFAULT_DARK_AVATAR_COLORS: AvatarColors = {
  background: "#374151",
  text: "#F9FAFB",
};

/**
 * Merge partial Avatar-color overrides on top of a base palette.
 * Missing slots fall through. Same shape as every other component
 * merge helper.
 */
export function mergeAvatarColors(
  base: AvatarColors,
  override?: Partial<AvatarColors>
): AvatarColors {
  if (override == null) return base;
  return { ...base, ...override };
}
