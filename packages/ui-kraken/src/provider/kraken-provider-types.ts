import type { ReactNode } from "react";

import type { KrakenConfig } from "../tokens/kraken-tokens";
import type {
  KrakenButtonColors,
  KrakenButtonVariantColors,
  KrakenTextColors,
  ResolvedKrakenTokens,
} from "../tokens/kraken-tokens-types";

export type KrakenThemeMode = "light" | "dark" | "system";

/**
 * A partial-of-partials for `buttonColors`: consumers can override just one
 * variant, or just one slot within a variant, and the rest fills in from the
 * shipped defaults.
 */
export type KrakenButtonColorsInput = Partial<
  Record<keyof KrakenButtonColors, Partial<KrakenButtonVariantColors>>
>;

/**
 * Partial override for `textColors` — consumers only declare the slots they
 * want to change; the rest fills in from the shipped defaults.
 */
export type KrakenTextColorsInput = Partial<KrakenTextColors>;

/**
 * The input shape accepted by `<KrakenProvider tokens={...}>` — every field
 * is optional so consumers only specify what they want to override.
 */
export interface KrakenTokensInput {
  buttonColors?: KrakenButtonColorsInput;
  textColors?: KrakenTextColorsInput;
  radius?: number;
  spacing?: number;
}

export interface KrakenProviderProps {
  children: ReactNode;
  /** Partial light-mode token overrides. Missing fields fall back to `DEFAULT_KRAKEN_TOKENS`. */
  tokens?: KrakenTokensInput;
  /** Partial dark-mode token overrides. Missing fields fall back to `DEFAULT_DARK_KRAKEN_TOKENS`. */
  dark?: KrakenTokensInput;
  /**
   * Which theme to render.
   *
   * - `"light"` (default) — always light.
   * - `"dark"` — always dark.
   * - `"system"` — follow the device's color scheme via React Native's
   *   `useColorScheme()`. Falls back to `"light"` when the platform has no
   *   preference.
   */
  defaultTheme?: KrakenThemeMode;
}

export interface KrakenContextValue {
  /** Resolved light-mode tokens (defaults + light overrides). */
  lightTokens: ResolvedKrakenTokens;
  /** Resolved dark-mode tokens (defaults + dark overrides). */
  darkTokens: ResolvedKrakenTokens;
  /** The theme currently rendered — resolved from `defaultTheme` (with `"system"` collapsed). */
  activeTheme: "light" | "dark";
  /**
   * Tokens for the currently active theme — the shortcut most consumers use.
   * Equivalent to `activeTheme === "dark" ? darkTokens : lightTokens`.
   */
  tokens: ResolvedKrakenTokens;
  /** Raw Tamagui config — escape hatch for consumers who need to drop down to Tamagui APIs directly. */
  tamaguiConfig: KrakenConfig;
}
