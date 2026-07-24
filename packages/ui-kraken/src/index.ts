/**
 * ui-kraken — highly customizable React Native / Expo component library.
 *
 * Public API. Every export is explicit — no `export *` — so consumers get a
 * precise surface and dead exports stay detectable. See docs/PLAN.md for
 * roadmap and AGENTS.md for the convention set every export follows.
 */

// Provider
export { KrakenProvider, useKraken } from "./provider";
export type {
  KrakenProviderProps,
  KrakenContextValue,
  KrakenThemeMode,
  KrakenTokensInput,
  KrakenButtonColorsInput,
} from "./provider";

// Tokens
export {
  DEFAULT_KRAKEN_TOKENS,
  DEFAULT_DARK_KRAKEN_TOKENS,
  DEFAULT_LIGHT_BUTTON_COLORS,
  DEFAULT_DARK_BUTTON_COLORS,
  buildKrakenConfig,
  coarseToFineTokens,
  mergeButtonColors,
  mergeButtonVariantColors,
  tint,
} from "./tokens";
export type {
  KrakenTokens,
  KrakenButtonColors,
  KrakenButtonVariantColors,
  ResolvedKrakenTokens,
  KrakenConfig,
} from "./tokens";

// Components
export { Button } from "./components";
export type {
  ButtonProps,
  ButtonColorsInput,
  ButtonTone,
  ButtonSize,
  ButtonRadius,
  ButtonElevation,
} from "./components";
