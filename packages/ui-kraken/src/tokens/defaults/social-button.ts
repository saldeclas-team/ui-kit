import type { SocialButtonColors, SocialButtonProviderColors } from "../tokens-types";

/**
 * Default light-mode SocialButton palette. Per-brand values follow
 * each provider's official button guidelines:
 *
 * - Google: Material light card — white bg, near-black label,
 *   `#DADCE0` divider-gray border.
 * - Apple: Human Interface Guidelines "Sign in with Apple" black
 *   button — black bg, white label, black border.
 * - Facebook: brand blue `#1877F2` bg, white label, same border.
 * - GitHub: near-black `#24292F` bg, white label, same border.
 * - Microsoft: Fluent light card — white bg, gray-700 label,
 *   `#8C8C8C` medium-gray border.
 * - Generic: neutral gray-100 card for brand-agnostic providers
 *   (custom SSO, LinkedIn, X, Discord, etc.).
 */
export const DEFAULT_LIGHT_SOCIAL_BUTTON_COLORS: SocialButtonColors = {
  google: { background: "#FFFFFF", label: "#1F1F1F", border: "#DADCE0" },
  apple: { background: "#000000", label: "#FFFFFF", border: "#000000" },
  facebook: { background: "#1877F2", label: "#FFFFFF", border: "#1877F2" },
  github: { background: "#24292F", label: "#FFFFFF", border: "#24292F" },
  microsoft: { background: "#FFFFFF", label: "#5E5E5E", border: "#8C8C8C" },
  generic: { background: "#F3F4F6", label: "#111827", border: "#D1D5DB" },
};

/**
 * Default dark-mode SocialButton palette.
 *
 * - Google + Microsoft: swap to a dark card (Material Dark
 *   guidance) — `#1F1F1F` bg, near-white label, `#3C4043` border.
 * - Apple: flips to white card + black label (Apple's approved
 *   inverse for dark surfaces).
 * - Facebook: keeps brand blue — Facebook's brand does not have a
 *   dark-mode variant, the blue reads well on either background.
 * - GitHub: brand goes lighter on dark — white bg + near-black
 *   label so the button pops against `Surface.base`.
 * - Generic: gray-800 card for brand-agnostic providers on dark.
 */
export const DEFAULT_DARK_SOCIAL_BUTTON_COLORS: SocialButtonColors = {
  google: { background: "#1F1F1F", label: "#F5F5F7", border: "#3C4043" },
  apple: { background: "#FFFFFF", label: "#000000", border: "#FFFFFF" },
  facebook: { background: "#1877F2", label: "#FFFFFF", border: "#1877F2" },
  github: { background: "#F5F5F7", label: "#0B0B0F", border: "#F5F5F7" },
  microsoft: { background: "#1F1F1F", label: "#F5F5F7", border: "#3C4043" },
  generic: { background: "#1F2937", label: "#F5F5F7", border: "#374151" },
};

/**
 * Merge a partial per-provider override on top of a base provider
 * palette. Missing fields fall through — a consumer who only wants
 * to change `google.background` should not have to re-declare
 * `google.label` / `google.border`.
 */
export function mergeSocialButtonProviderColors(
  base: SocialButtonProviderColors,
  override?: Partial<SocialButtonProviderColors>
): SocialButtonProviderColors {
  if (override == null) return base;
  return { ...base, ...override };
}

/**
 * Merge partial SocialButton-color overrides across every provider.
 * Same shape as `mergeAlertColors` — provider-level nested-partial.
 */
export function mergeSocialButtonColors(
  base: SocialButtonColors,
  override?: Partial<Record<keyof SocialButtonColors, Partial<SocialButtonProviderColors>>>
): SocialButtonColors {
  if (override == null) return base;
  return {
    google: mergeSocialButtonProviderColors(base.google, override.google),
    apple: mergeSocialButtonProviderColors(base.apple, override.apple),
    facebook: mergeSocialButtonProviderColors(base.facebook, override.facebook),
    github: mergeSocialButtonProviderColors(base.github, override.github),
    microsoft: mergeSocialButtonProviderColors(base.microsoft, override.microsoft),
    generic: mergeSocialButtonProviderColors(base.generic, override.generic),
  };
}
