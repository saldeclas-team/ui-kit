import type { HintColors, HintToneColors } from "../tokens-types";

/**
 * Default light-mode Hint palette. Each tone is a full 3-slot palette
 * (`text` / `icon` / `background`). Backgrounds are pale tints
 * (~5-10% of the semantic hue at 50-level) reserved for
 * `emphasis="soft"` — the default `ghost` emphasis paints only text +
 * icon on a transparent row.
 *
 * Text hues sit slightly darker than the matching Alert `text` slot so
 * Hint reads as "quieter and secondary" against a white surface.
 */
export const DEFAULT_LIGHT_HINT_COLORS: HintColors = {
  neutral: { text: "#4B5563", icon: "#6B7280", background: "#F3F4F6" },
  info: { text: "#1E40AF", icon: "#2563EB", background: "#EFF6FF" },
  success: { text: "#065F46", icon: "#059669", background: "#ECFDF5" },
  warning: { text: "#92400E", icon: "#D97706", background: "#FFFBEB" },
  danger: { text: "#991B1B", icon: "#DC2626", background: "#FEF2F2" },
};

/**
 * Default dark-mode Hint palette. Text uses the lighter tone hue so it
 * pops on dark; backgrounds land at deeper tinted grays so
 * `emphasis="soft"` reads as a subtle differentiation from
 * `Surface.base` (near-black) without washing out.
 */
export const DEFAULT_DARK_HINT_COLORS: HintColors = {
  neutral: { text: "#D1D5DB", icon: "#9CA3AF", background: "#1F2937" },
  info: { text: "#93C5FD", icon: "#60A5FA", background: "#1E3A8A" },
  success: { text: "#6EE7B7", icon: "#34D399", background: "#064E3B" },
  warning: { text: "#FCD34D", icon: "#FBBF24", background: "#78350F" },
  danger: { text: "#FCA5A5", icon: "#F87171", background: "#7F1D1D" },
};

/**
 * Merge a partial per-tone override on top of a base tone palette.
 * Missing fields fall through — a consumer who only wants to change
 * `danger.background` should not have to re-declare `danger.text` /
 * `danger.icon`.
 */
export function mergeHintToneColors(
  base: HintToneColors,
  override?: Partial<HintToneColors>
): HintToneColors {
  if (override == null) return base;
  return { ...base, ...override };
}

/**
 * Merge partial hint-color overrides across every tone.
 */
export function mergeHintColors(
  base: HintColors,
  override?: Partial<Record<keyof HintColors, Partial<HintToneColors>>>
): HintColors {
  if (override == null) return base;
  return {
    neutral: mergeHintToneColors(base.neutral, override.neutral),
    info: mergeHintToneColors(base.info, override.info),
    success: mergeHintToneColors(base.success, override.success),
    warning: mergeHintToneColors(base.warning, override.warning),
    danger: mergeHintToneColors(base.danger, override.danger),
  };
}
