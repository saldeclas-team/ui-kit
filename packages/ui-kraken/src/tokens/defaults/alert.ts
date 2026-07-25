import type { AlertColors, AlertVariantColors } from "../tokens-types";

/**
 * Default light-mode Alert palette. Each variant is a full 4-slot palette
 * (`background` / `text` / `icon` / optional `border`). Backgrounds are
 * pre-tinted (~10-15% of the semantic hue at 50-level) so the row reads
 * as a soft callout against a white / near-white surface.
 */
export const DEFAULT_LIGHT_ALERT_COLORS: AlertColors = {
  info: { background: "#EFF6FF", text: "#0284C7", icon: "#0284C7" },
  success: { background: "#F0FDF4", text: "#059669", icon: "#059669" },
  warning: { background: "#FFFBEB", text: "#D97706", icon: "#D97706" },
  danger: { background: "#FEF2F2", text: "#DC2626", icon: "#DC2626" },
};

/**
 * Default dark-mode Alert palette. Text + icon shift to a lighter variant
 * hue so they pop on a dark surface; backgrounds land at ~20% alpha of the
 * variant color at the 900-level so they read as a subtle tint on
 * near-black without washing out.
 */
export const DEFAULT_DARK_ALERT_COLORS: AlertColors = {
  info: { background: "#0C4A6E33", text: "#38BDF8", icon: "#38BDF8" },
  success: { background: "#064E3B33", text: "#34D399", icon: "#34D399" },
  warning: { background: "#78350F33", text: "#FBBF24", icon: "#FBBF24" },
  danger: { background: "#7F1D1D33", text: "#F87171", icon: "#F87171" },
};

/**
 * Merge a partial per-variant override on top of a base variant palette.
 * Missing fields fall through — a consumer who only wants to change
 * `info.background` should not have to re-declare `info.text` / `info.icon`.
 */
export function mergeAlertVariantColors(
  base: AlertVariantColors,
  override?: Partial<AlertVariantColors>
): AlertVariantColors {
  if (override == null) return base;
  return { ...base, ...override };
}

/**
 * Merge partial alert-color overrides across every variant.
 */
export function mergeAlertColors(
  base: AlertColors,
  override?: Partial<Record<keyof AlertColors, Partial<AlertVariantColors>>>
): AlertColors {
  if (override == null) return base;
  return {
    info: mergeAlertVariantColors(base.info, override.info),
    success: mergeAlertVariantColors(base.success, override.success),
    warning: mergeAlertVariantColors(base.warning, override.warning),
    danger: mergeAlertVariantColors(base.danger, override.danger),
  };
}
