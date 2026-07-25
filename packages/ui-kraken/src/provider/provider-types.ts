import type { ReactNode } from "react";

import type { Config } from "../tokens/tokens";
import type {
  AlertColors,
  AlertVariantColors,
  ButtonColors,
  ButtonVariantColors,
  CurrencyInputColors,
  InputColors,
  RadioGroupColors,
  SurfaceColors,
  TextColors,
  ResolvedTokens,
} from "../tokens/tokens-types";

export type ThemeMode = "light" | "dark" | "system";

/**
 * A partial-of-partials for `buttonColors`: consumers can override just one
 * variant, or just one slot within a variant, and the rest fills in from the
 * shipped defaults.
 */
export type ButtonColorsInput = Partial<Record<keyof ButtonColors, Partial<ButtonVariantColors>>>;

/**
 * Partial override for `textColors` — consumers only declare the slots they
 * want to change; the rest fills in from the shipped defaults.
 */
export type TextColorsInput = Partial<TextColors>;

/**
 * A partial-of-partials for `alertColors`: same shape as `ButtonColorsInput`.
 * Consumers can override just one variant (e.g. `danger`), or just one slot
 * within a variant (e.g. `danger.background`), and the rest fills in from
 * the shipped defaults.
 */
export type AlertColorsInput = Partial<Record<keyof AlertColors, Partial<AlertVariantColors>>>;

/**
 * Partial override for `radioGroupColors` — consumers only declare the
 * slots they want to change; the rest fills in from the shipped defaults.
 * Slot-based (no variants), so the shape mirrors `TextColorsInput`.
 */
export type RadioGroupColorsInput = Partial<RadioGroupColors>;

/**
 * Partial override for `inputColors` — consumers only declare the slots
 * they want to change; the rest fills in from the shipped defaults.
 * Slot-based (no variants), so the shape mirrors `TextColorsInput`.
 */
export type InputColorsInput = Partial<InputColors>;

/**
 * Partial override for `currencyInputColors` — consumers only declare
 * the slots they want to change; the rest fills in from the shipped
 * defaults. Slot-based, same shape as `InputColorsInput` plus a
 * `prefix` slot for the currency-symbol text color.
 */
export type CurrencyInputColorsInput = Partial<CurrencyInputColors>;

/**
 * Partial override for `surfaceColors` — consumers only declare the
 * slots they want to change; the rest fills in from the shipped
 * defaults. Slot-based, mirrors `TextColorsInput`.
 */
export type SurfaceColorsInput = Partial<SurfaceColors>;

/**
 * The input shape accepted by `<UIKitProvider tokens={...}>` — every field
 * is optional so consumers only specify what they want to override.
 */
export interface TokensInput {
  buttonColors?: ButtonColorsInput;
  textColors?: TextColorsInput;
  alertColors?: AlertColorsInput;
  radioGroupColors?: RadioGroupColorsInput;
  inputColors?: InputColorsInput;
  currencyInputColors?: CurrencyInputColorsInput;
  surfaceColors?: SurfaceColorsInput;
  radius?: number;
  spacing?: number;
}

export interface ProviderProps {
  children: ReactNode;
  /** Partial light-mode token overrides. Missing fields fall back to `DEFAULT_TOKENS`. */
  tokens?: TokensInput;
  /** Partial dark-mode token overrides. Missing fields fall back to `DEFAULT_DARK_TOKENS`. */
  dark?: TokensInput;
  /**
   * Which theme to render.
   *
   * - `"light"` (default) — always light.
   * - `"dark"` — always dark.
   * - `"system"` — follow the device's color scheme via React Native's
   *   `useColorScheme()`. Falls back to `"light"` when the platform has no
   *   preference.
   */
  defaultTheme?: ThemeMode;
}

export interface ContextValue {
  /** Resolved light-mode tokens (defaults + light overrides). */
  lightTokens: ResolvedTokens;
  /** Resolved dark-mode tokens (defaults + dark overrides). */
  darkTokens: ResolvedTokens;
  /** The theme currently rendered — resolved from `defaultTheme` (with `"system"` collapsed). */
  activeTheme: "light" | "dark";
  /**
   * Tokens for the currently active theme — the shortcut most consumers use.
   * Equivalent to `activeTheme === "dark" ? darkTokens : lightTokens`.
   */
  tokens: ResolvedTokens;
  /** Raw Tamagui config — escape hatch for consumers who need to drop down to Tamagui APIs directly. */
  tamaguiConfig: Config;
}
