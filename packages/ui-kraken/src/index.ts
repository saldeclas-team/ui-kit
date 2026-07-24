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
  KrakenTextColorsInput,
} from "./provider";

// Tokens
export {
  DEFAULT_KRAKEN_TOKENS,
  DEFAULT_DARK_KRAKEN_TOKENS,
  DEFAULT_LIGHT_BUTTON_COLORS,
  DEFAULT_DARK_BUTTON_COLORS,
  DEFAULT_LIGHT_TEXT_COLORS,
  DEFAULT_DARK_TEXT_COLORS,
  buildKrakenConfig,
  coarseToFineTokens,
  mergeButtonColors,
  mergeButtonVariantColors,
  mergeTextColors,
  tint,
} from "./tokens";
export type {
  KrakenTokens,
  KrakenButtonColors,
  KrakenButtonVariantColors,
  KrakenTextColors,
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

export { Text } from "./components";
export type { TextProps, TextVariant, TextColor, TextIntensity } from "./components";
