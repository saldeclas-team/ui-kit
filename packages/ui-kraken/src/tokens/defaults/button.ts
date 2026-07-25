import type { ButtonColors, ButtonVariantColors } from "../tokens-types";

/**
 * Default light-mode Button palette. Tuned to work on a white / near-white
 * surface with WCAG AA contrast for the label color.
 */
export const DEFAULT_LIGHT_BUTTON_COLORS: ButtonColors = {
  primary: { background: "#2563EB", label: "#FFFFFF" },
  secondary: { background: "#0EA5E9", label: "#FFFFFF" },
  outline: { border: "#2563EB", label: "#2563EB" },
  ghost: { label: "#2563EB" },
  destructive: { background: "#DC2626", label: "#FFFFFF" },
};

/**
 * Default dark-mode Button palette. Uses lighter brand shades so they pop on
 * a dark surface, and inverts the label colors where needed for contrast.
 */
export const DEFAULT_DARK_BUTTON_COLORS: ButtonColors = {
  primary: { background: "#3B82F6", label: "#FFFFFF" },
  secondary: { background: "#38BDF8", label: "#0B0B0F" },
  outline: { border: "#60A5FA", label: "#60A5FA" },
  ghost: { label: "#60A5FA" },
  destructive: { background: "#EF4444", label: "#FFFFFF" },
};

/**
 * Merge a partial per-variant override on top of a base variant palette.
 * Missing fields fall through — a consumer who only wants to change
 * `primary.background` should not have to re-declare `primary.label`.
 */
export function mergeButtonVariantColors(
  base: ButtonVariantColors,
  override?: Partial<ButtonVariantColors>
): ButtonVariantColors {
  if (override == null) return base;
  return { ...base, ...override };
}

/**
 * Merge partial button-color overrides across every variant.
 */
export function mergeButtonColors(
  base: ButtonColors,
  override?: Partial<Record<keyof ButtonColors, Partial<ButtonVariantColors>>>
): ButtonColors {
  if (override == null) return base;
  return {
    primary: mergeButtonVariantColors(base.primary, override.primary),
    secondary: mergeButtonVariantColors(base.secondary, override.secondary),
    outline: mergeButtonVariantColors(base.outline, override.outline),
    ghost: mergeButtonVariantColors(base.ghost, override.ghost),
    destructive: mergeButtonVariantColors(base.destructive, override.destructive),
  };
}
