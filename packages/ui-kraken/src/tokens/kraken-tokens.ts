import { createTamagui, createTokens } from "tamagui";
import { defaultConfig } from "@tamagui/config/v4";

import {
  DEFAULT_DARK_KRAKEN_TOKENS,
  DEFAULT_KRAKEN_TOKENS,
  coarseToFineTokens,
} from "./kraken-tokens-derive";
import type {
  KrakenButtonColors,
  KrakenTextColors,
  KrakenTokens,
  ResolvedKrakenTokens,
} from "./kraken-tokens-types";

/**
 * Build a Tamagui config that carries ui-kraken tokens under a `kraken*`
 * prefix (so we never clobber the defaults from `@tamagui/config/v4`) AND
 * wires the same token names into both the `light` and `dark` themes so
 * `<Theme name="dark">` (or a KrakenProvider mounted in dark mode) flips
 * every `$krakenButtonPrimaryBackground` / `$krakenTextPrimary` etc.
 * reference automatically.
 *
 * Both `light` and `dark` are optional. When omitted, the shipped defaults
 * (`DEFAULT_KRAKEN_TOKENS` / `DEFAULT_DARK_KRAKEN_TOKENS`) are used.
 */
export function buildKrakenConfig(
  light: KrakenTokens = DEFAULT_KRAKEN_TOKENS,
  dark: KrakenTokens = DEFAULT_DARK_KRAKEN_TOKENS
) {
  const lightResolved = coarseToFineTokens(light);
  const darkResolved = coarseToFineTokens(dark);

  const baseTokens = defaultConfig.tokens;
  const baseThemes = defaultConfig.themes;

  const krakenTokens = createTokens({
    ...baseTokens,
    color: {
      ...(baseTokens as { color?: Record<string, string> }).color,
      ...flattenButtonColors(lightResolved.buttonColors),
      ...flattenTextColors(lightResolved.textColors),
    },
    radius: {
      ...baseTokens.radius,
      krakenRadiusSm: lightResolved.radius.sm,
      krakenRadiusMd: lightResolved.radius.md,
      krakenRadiusLg: lightResolved.radius.lg,
      krakenRadiusPill: lightResolved.radius.pill,
    },
    space: {
      ...baseTokens.space,
      krakenSpacingXs: lightResolved.space.xs,
      krakenSpacingSm: lightResolved.space.sm,
      krakenSpacingMd: lightResolved.space.md,
      krakenSpacingLg: lightResolved.space.lg,
      krakenSpacingXl: lightResolved.space.xl,
    },
    size: {
      ...baseTokens.size,
      krakenSizeXs: lightResolved.space.xs,
      krakenSizeSm: lightResolved.space.sm,
      krakenSizeMd: lightResolved.space.md,
      krakenSizeLg: lightResolved.space.lg,
      krakenSizeXl: lightResolved.space.xl,
    },
  });

  return createTamagui({
    ...defaultConfig,
    tokens: krakenTokens,
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
 * Flatten the nested `buttonColors` shape into a flat `$kraken*` token map:
 *
 * ```
 * { primary: { background: "#2563EB", label: "#FFFFFF" } }
 * ```
 *
 * becomes
 *
 * ```
 * { krakenButtonPrimaryBackground: "#2563EB", krakenButtonPrimaryLabel: "#FFFFFF" }
 * ```
 */
function flattenButtonColors(colors: KrakenButtonColors): Record<string, string> {
  const out: Record<string, string> = {};
  for (const variant of Object.keys(colors) as Array<keyof KrakenButtonColors>) {
    const slots = colors[variant];
    const capitalized = variant.charAt(0).toUpperCase() + variant.slice(1);
    if (slots.background != null) out[`krakenButton${capitalized}Background`] = slots.background;
    if (slots.border != null) out[`krakenButton${capitalized}Border`] = slots.border;
    out[`krakenButton${capitalized}Label`] = slots.label;
  }
  return out;
}

/**
 * Flatten the `textColors` map into `$krakenText{PascalCase}` Tamagui tokens.
 */
function flattenTextColors(colors: KrakenTextColors): Record<string, string> {
  const out: Record<string, string> = {};
  for (const slot of Object.keys(colors) as Array<keyof KrakenTextColors>) {
    const capitalized = slot.charAt(0).toUpperCase() + slot.slice(1);
    out[`krakenText${capitalized}`] = colors[slot];
  }
  return out;
}

export type KrakenConfig = ReturnType<typeof buildKrakenConfig>;

// Re-export the pure derive helpers so consumers get a single entry point.
export {
  DEFAULT_DARK_KRAKEN_TOKENS,
  DEFAULT_KRAKEN_TOKENS,
  DEFAULT_DARK_BUTTON_COLORS,
  DEFAULT_LIGHT_BUTTON_COLORS,
  DEFAULT_DARK_TEXT_COLORS,
  DEFAULT_LIGHT_TEXT_COLORS,
  coarseToFineTokens,
  mergeButtonColors,
  mergeButtonVariantColors,
  mergeTextColors,
  tint,
} from "./kraken-tokens-derive";
export type { ResolvedKrakenTokens };
