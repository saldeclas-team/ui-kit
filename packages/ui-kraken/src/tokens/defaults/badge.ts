import type { BadgeColors, BadgeToneColors } from "../tokens-types";

/**
 * Default light-mode Badge palette. Each tone is a full 2-slot palette
 * (`background` + `text`). Backgrounds are pale tints (~5-10% of the
 * semantic hue at 50-level) so the tone signal is readable without
 * competing with surrounding content.
 *
 * Same hue mapping as Hint's soft-emphasis palette — a Badge and a
 * Hint of the same tone read as the same visual signal at different
 * sizes.
 */
export const DEFAULT_LIGHT_BADGE_COLORS: BadgeColors = {
  neutral: { background: "#F3F4F6", text: "#374151" },
  primary: { background: "#DBEAFE", text: "#1E3A8A" },
  success: { background: "#DCFCE7", text: "#166534" },
  warning: { background: "#FEF3C7", text: "#92400E" },
  danger: { background: "#FEE2E2", text: "#991B1B" },
};

/**
 * Default dark-mode Badge palette. Each tone uses a deeper tinted
 * background + lighter tone-hue text to preserve contrast against
 * dark surfaces without washing out.
 */
export const DEFAULT_DARK_BADGE_COLORS: BadgeColors = {
  neutral: { background: "#1F2937", text: "#D1D5DB" },
  primary: { background: "#1E3A8A", text: "#93C5FD" },
  success: { background: "#064E3B", text: "#6EE7B7" },
  warning: { background: "#78350F", text: "#FCD34D" },
  danger: { background: "#7F1D1D", text: "#FCA5A5" },
};

/**
 * Merge a partial per-tone override on top of a base tone palette.
 * Missing fields fall through — a consumer who only wants to change
 * `danger.background` should not have to re-declare `danger.text`.
 */
export function mergeBadgeToneColors(
  base: BadgeToneColors,
  override?: Partial<BadgeToneColors>
): BadgeToneColors {
  if (override == null) return base;
  return { ...base, ...override };
}

/**
 * Merge partial badge-color overrides across every tone. Missing
 * tones fall through to the base palette.
 */
export function mergeBadgeColors(
  base: BadgeColors,
  override?: Partial<Record<keyof BadgeColors, Partial<BadgeToneColors>>>
): BadgeColors {
  if (override == null) return base;
  return {
    neutral: mergeBadgeToneColors(base.neutral, override.neutral),
    primary: mergeBadgeToneColors(base.primary, override.primary),
    success: mergeBadgeToneColors(base.success, override.success),
    warning: mergeBadgeToneColors(base.warning, override.warning),
    danger: mergeBadgeToneColors(base.danger, override.danger),
  };
}
