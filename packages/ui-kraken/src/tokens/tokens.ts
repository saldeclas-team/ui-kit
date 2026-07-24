import { createTamagui, createTokens } from "tamagui";
import { defaultConfig } from "@tamagui/config/v4";

import { DEFAULT_DARK_TOKENS, DEFAULT_TOKENS, coarseToFineTokens } from "./tokens-derive";
import type { ButtonColors, TextColors, Tokens, ResolvedTokens } from "./tokens-types";

/**
 * Build a Tamagui config that carries the ui-kraken tokens under a `ui*`
 * prefix (so we never clobber the defaults from `@tamagui/config/v4`) AND
 * wires the same token names into both the `light` and `dark` themes so
 * `<Theme name="dark">` (or a KrakenProvider mounted in dark mode) flips
 * every `$uiButtonPrimaryBackground` / `$uiTextPrimary` etc.
 * reference automatically.
 *
 * Both `light` and `dark` are optional. When omitted, the shipped defaults
 * (`DEFAULT_TOKENS` / `DEFAULT_DARK_TOKENS`) are used.
 */
export function buildConfig(light: Tokens = DEFAULT_TOKENS, dark: Tokens = DEFAULT_DARK_TOKENS) {
  const lightResolved = coarseToFineTokens(light);
  const darkResolved = coarseToFineTokens(dark);

  const baseTokens = defaultConfig.tokens;
  const baseThemes = defaultConfig.themes;

  const tokens = createTokens({
    ...baseTokens,
    color: {
      ...(baseTokens as { color?: Record<string, string> }).color,
      ...flattenButtonColors(lightResolved.buttonColors),
      ...flattenTextColors(lightResolved.textColors),
    },
    radius: {
      ...baseTokens.radius,
      uiRadiusSm: lightResolved.radius.sm,
      uiRadiusMd: lightResolved.radius.md,
      uiRadiusLg: lightResolved.radius.lg,
      uiRadiusPill: lightResolved.radius.pill,
    },
    space: {
      ...baseTokens.space,
      uiSpacingXs: lightResolved.space.xs,
      uiSpacingSm: lightResolved.space.sm,
      uiSpacingMd: lightResolved.space.md,
      uiSpacingLg: lightResolved.space.lg,
      uiSpacingXl: lightResolved.space.xl,
    },
    size: {
      ...baseTokens.size,
      uiSizeXs: lightResolved.space.xs,
      uiSizeSm: lightResolved.space.sm,
      uiSizeMd: lightResolved.space.md,
      uiSizeLg: lightResolved.space.lg,
      uiSizeXl: lightResolved.space.xl,
    },
  });

  return createTamagui({
    ...defaultConfig,
    tokens,
    themes: {
      ...baseThemes,
      light: {
        ...(baseThemes.light ?? {}),
        ...flattenButtonColors(lightResolved.buttonColors),
        ...flattenTextColors(lightResolved.textColors),
      },
      dark: {
        ...(baseThemes.dark ?? {}),
        ...flattenButtonColors(darkResolved.buttonColors),
        ...flattenTextColors(darkResolved.textColors),
      },
    },
  });
}

/**
 * Flatten the nested `buttonColors` shape into a flat `$ui*` token map:
 *
 * ```
 * { primary: { background: "#2563EB", label: "#FFFFFF" } }
 * ```
 *
 * becomes
 *
 * ```
 * { uiButtonPrimaryBackground: "#2563EB", uiButtonPrimaryLabel: "#FFFFFF" }
 * ```
 */
function flattenButtonColors(colors: ButtonColors): Record<string, string> {
  const out: Record<string, string> = {};
  for (const variant of Object.keys(colors) as Array<keyof ButtonColors>) {
    const slots = colors[variant];
    const capitalized = variant.charAt(0).toUpperCase() + variant.slice(1);
    if (slots.background != null) out[`uiButton${capitalized}Background`] = slots.background;
    if (slots.border != null) out[`uiButton${capitalized}Border`] = slots.border;
    out[`uiButton${capitalized}Label`] = slots.label;
  }
  return out;
}

/**
 * Flatten the `textColors` map into `$uiText{PascalCase}` Tamagui tokens.
 */
function flattenTextColors(colors: TextColors): Record<string, string> {
  const out: Record<string, string> = {};
  for (const slot of Object.keys(colors) as Array<keyof TextColors>) {
    const capitalized = slot.charAt(0).toUpperCase() + slot.slice(1);
    out[`uiText${capitalized}`] = colors[slot];
  }
  return out;
}

export type Config = ReturnType<typeof buildConfig>;

// Re-export the pure derive helpers so consumers get a single entry point.
export {
  DEFAULT_DARK_TOKENS,
  DEFAULT_TOKENS,
  DEFAULT_DARK_BUTTON_COLORS,
  DEFAULT_LIGHT_BUTTON_COLORS,
  DEFAULT_DARK_TEXT_COLORS,
  DEFAULT_LIGHT_TEXT_COLORS,
  coarseToFineTokens,
  mergeButtonColors,
  mergeButtonVariantColors,
  mergeTextColors,
  tint,
} from "./tokens-derive";
export type { ResolvedTokens };
