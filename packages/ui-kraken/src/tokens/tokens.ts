import { createTamagui, createTokens } from "tamagui";
import { defaultConfig } from "@tamagui/config/v4";

import {
  flattenAlertColors,
  flattenButtonColors,
  flattenCurrencyInputColors,
  flattenInputColors,
  flattenRadioGroupColors,
  flattenHintColors,
  flattenMultiSelectColors,
  flattenRefreshControlColors,
  flattenSkeletonColors,
  flattenSocialButtonColors,
  flattenStatCardColors,
  flattenSurfaceColors,
  flattenTextColors,
} from "../utils/flatten";
import { DEFAULT_DARK_TOKENS, DEFAULT_TOKENS } from "./defaults";
import { coarseToFineTokens } from "./tokens-derive";
import type { Tokens, ResolvedTokens } from "./tokens-types";

/**
 * Build a Tamagui config that carries the ui-kraken tokens under a `ui*`
 * prefix (so we never clobber the defaults from `@tamagui/config/v4`) AND
 * wires the same token names into both the `light` and `dark` themes so
 * `<Theme name="dark">` (or a UIKitProvider mounted in dark mode) flips
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
      ...flattenAlertColors(lightResolved.alertColors),
      ...flattenRadioGroupColors(lightResolved.radioGroupColors),
      ...flattenInputColors(lightResolved.inputColors),
      ...flattenCurrencyInputColors(lightResolved.currencyInputColors),
      ...flattenSurfaceColors(lightResolved.surfaceColors),
      ...flattenRefreshControlColors(lightResolved.refreshControlColors),
      ...flattenSkeletonColors(lightResolved.skeletonColors),
      ...flattenHintColors(lightResolved.hintColors),
      ...flattenStatCardColors(lightResolved.statCardColors),
      ...flattenMultiSelectColors(lightResolved.multiSelectColors),
      ...flattenSocialButtonColors(lightResolved.socialButtonColors),
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
        ...flattenAlertColors(lightResolved.alertColors),
        ...flattenRadioGroupColors(lightResolved.radioGroupColors),
        ...flattenInputColors(lightResolved.inputColors),
        ...flattenCurrencyInputColors(lightResolved.currencyInputColors),
        ...flattenSurfaceColors(lightResolved.surfaceColors),
        ...flattenRefreshControlColors(lightResolved.refreshControlColors),
        ...flattenSkeletonColors(lightResolved.skeletonColors),
        ...flattenHintColors(lightResolved.hintColors),
        ...flattenStatCardColors(lightResolved.statCardColors),
        ...flattenMultiSelectColors(lightResolved.multiSelectColors),
        ...flattenSocialButtonColors(lightResolved.socialButtonColors),
      },
      dark: {
        ...(baseThemes.dark ?? {}),
        ...flattenButtonColors(darkResolved.buttonColors),
        ...flattenTextColors(darkResolved.textColors),
        ...flattenAlertColors(darkResolved.alertColors),
        ...flattenRadioGroupColors(darkResolved.radioGroupColors),
        ...flattenInputColors(darkResolved.inputColors),
        ...flattenCurrencyInputColors(darkResolved.currencyInputColors),
        ...flattenSurfaceColors(darkResolved.surfaceColors),
        ...flattenRefreshControlColors(darkResolved.refreshControlColors),
        ...flattenSkeletonColors(darkResolved.skeletonColors),
        ...flattenHintColors(darkResolved.hintColors),
        ...flattenStatCardColors(darkResolved.statCardColors),
        ...flattenMultiSelectColors(darkResolved.multiSelectColors),
        ...flattenSocialButtonColors(darkResolved.socialButtonColors),
      },
    },
  });
}

export type Config = ReturnType<typeof buildConfig>;

// Re-export defaults + merge helpers (from `./defaults/`) alongside the
// pure derive helper (from `./tokens-derive`) and the color utilities
// (from `../utils/color`) so consumers get a single entry point.
export {
  DEFAULT_DARK_TOKENS,
  DEFAULT_TOKENS,
  DEFAULT_DARK_BUTTON_COLORS,
  DEFAULT_LIGHT_BUTTON_COLORS,
  DEFAULT_DARK_TEXT_COLORS,
  DEFAULT_LIGHT_TEXT_COLORS,
  DEFAULT_DARK_ALERT_COLORS,
  DEFAULT_LIGHT_ALERT_COLORS,
  DEFAULT_DARK_RADIO_GROUP_COLORS,
  DEFAULT_LIGHT_RADIO_GROUP_COLORS,
  DEFAULT_DARK_INPUT_COLORS,
  DEFAULT_LIGHT_INPUT_COLORS,
  DEFAULT_DARK_CURRENCY_INPUT_COLORS,
  DEFAULT_LIGHT_CURRENCY_INPUT_COLORS,
  DEFAULT_DARK_SURFACE_COLORS,
  DEFAULT_LIGHT_SURFACE_COLORS,
  DEFAULT_DARK_REFRESH_CONTROL_COLORS,
  DEFAULT_LIGHT_REFRESH_CONTROL_COLORS,
  DEFAULT_DARK_SKELETON_COLORS,
  DEFAULT_LIGHT_SKELETON_COLORS,
  DEFAULT_DARK_HINT_COLORS,
  DEFAULT_LIGHT_HINT_COLORS,
  DEFAULT_DARK_STAT_CARD_COLORS,
  DEFAULT_LIGHT_STAT_CARD_COLORS,
  DEFAULT_DARK_MULTI_SELECT_COLORS,
  DEFAULT_LIGHT_MULTI_SELECT_COLORS,
  DEFAULT_DARK_SOCIAL_BUTTON_COLORS,
  DEFAULT_LIGHT_SOCIAL_BUTTON_COLORS,
  mergeButtonColors,
  mergeButtonVariantColors,
  mergeTextColors,
  mergeAlertColors,
  mergeAlertVariantColors,
  mergeRadioGroupColors,
  mergeInputColors,
  mergeCurrencyInputColors,
  mergeSurfaceColors,
  mergeRefreshControlColors,
  mergeSkeletonColors,
  mergeHintColors,
  mergeHintToneColors,
  mergeStatCardColors,
  mergeMultiSelectColors,
  mergeSocialButtonColors,
  mergeSocialButtonProviderColors,
} from "./defaults";
export { coarseToFineTokens } from "./tokens-derive";
export { tint } from "../utils/color";
export type { ResolvedTokens };
