/**
 * ui-kraken — highly customizable React Native / Expo component library.
 *
 * Public API. Every export is explicit — no `export *` — so consumers get a
 * precise surface and dead exports stay detectable. See docs/PLAN.md for
 * roadmap and AGENTS.md for the convention set every export follows.
 */

// Provider
export { KrakenProvider, useUIKit } from "./provider";
export type {
  ProviderProps,
  ContextValue,
  ThemeMode,
  TokensInput,
  ButtonColorsInput,
  TextColorsInput,
} from "./provider";

// Tokens
export {
  DEFAULT_TOKENS,
  DEFAULT_DARK_TOKENS,
  DEFAULT_LIGHT_BUTTON_COLORS,
  DEFAULT_DARK_BUTTON_COLORS,
  DEFAULT_LIGHT_TEXT_COLORS,
  DEFAULT_DARK_TEXT_COLORS,
  buildConfig,
  coarseToFineTokens,
  mergeButtonColors,
  mergeButtonVariantColors,
  mergeTextColors,
  tint,
} from "./tokens";
export type {
  Tokens,
  ButtonColors,
  ButtonVariantColors,
  TextColors,
  ResolvedTokens,
  Config,
} from "./tokens";

// Components
export { Button } from "./components";
export type {
  ButtonProps,
  ButtonVariantColorsInput,
  ButtonTone,
  ButtonSize,
  ButtonRadius,
  ButtonElevation,
} from "./components";

export { Text } from "./components";
export type { TextProps, TextVariant, TextColor, TextIntensity } from "./components";
