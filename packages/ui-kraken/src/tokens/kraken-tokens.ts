import { createTamagui, createTokens } from "tamagui";
import { defaultConfig } from "@tamagui/config/v4";

import { DEFAULT_KRAKEN_TOKENS, coarseToFineTokens } from "./kraken-tokens-derive";
import type { KrakenTokens } from "./kraken-tokens-types";

/**
 * Build a Tamagui config that carries ui-kraken's tokens under a `kraken*`
 * prefix so we never clobber the defaults from `@tamagui/config/v4` that we
 * spread underneath. Styled files reference these as `$krakenPrimary9`, etc.
 */
export function buildKrakenConfig(tokens: KrakenTokens = DEFAULT_KRAKEN_TOKENS) {
  const resolved = coarseToFineTokens(tokens);
  const base = defaultConfig.tokens;

  // @tamagui/config/v4 keeps colors under `themes`, not `tokens.color`.
  // We only need to add the kraken-prefixed tokens Button and future
  // components read via `$kraken*`.
  const krakenTokens = createTokens({
    ...base,
    color: {
      krakenPrimary3: resolved.color.primary3,
      krakenPrimary9: resolved.color.primary9,
      krakenPrimary10: resolved.color.primary10,
      krakenPrimary11: resolved.color.primary11,
      krakenSecondary3: resolved.color.secondary3,
      krakenSecondary9: resolved.color.secondary9,
      krakenSecondary10: resolved.color.secondary10,
      krakenSecondary11: resolved.color.secondary11,
      krakenDanger9: resolved.color.danger9,
      krakenDanger10: resolved.color.danger10,
      krakenTextPrimary: resolved.color.textPrimary,
      krakenTextSecondary: resolved.color.textSecondary,
      krakenTextOnPrimary: resolved.color.textOnPrimary,
      krakenTextOnSecondary: resolved.color.textOnSecondary,
      krakenTextOnDanger: resolved.color.textOnDanger,
    },
    radius: {
      ...base.radius,
      krakenRadiusSm: resolved.radius.sm,
      krakenRadiusMd: resolved.radius.md,
      krakenRadiusLg: resolved.radius.lg,
      krakenRadiusPill: resolved.radius.pill,
    },
    space: {
      ...base.space,
      krakenSpacingXs: resolved.space.xs,
      krakenSpacingSm: resolved.space.sm,
      krakenSpacingMd: resolved.space.md,
      krakenSpacingLg: resolved.space.lg,
      krakenSpacingXl: resolved.space.xl,
    },
    size: {
      ...base.size,
      krakenSizeXs: resolved.space.xs,
      krakenSizeSm: resolved.space.sm,
      krakenSizeMd: resolved.space.md,
      krakenSizeLg: resolved.space.lg,
      krakenSizeXl: resolved.space.xl,
    },
  });

  return createTamagui({
    ...defaultConfig,
    tokens: krakenTokens,
  });
}

export type KrakenConfig = ReturnType<typeof buildKrakenConfig>;

// Re-export the pure derive helpers so consumers get a single entry point.
export { DEFAULT_KRAKEN_TOKENS, coarseToFineTokens, tint } from "./kraken-tokens-derive";
