/**
 * ui-kraken — highly customizable React Native / Expo component library.
 *
 * Public API. Every export is explicit — no `export *` — so consumers get a
 * precise surface and dead exports stay detectable. See docs/PLAN.md for
 * roadmap and AGENTS.md for the convention set every export follows.
 */

// Provider
export { UIKitProvider, useUIKit } from "./provider";
export type {
  ProviderProps,
  ContextValue,
  ThemeMode,
  TokensInput,
  ButtonColorsInput,
  TextColorsInput,
  AlertColorsInput,
  RadioGroupColorsInput,
  InputColorsInput,
  CurrencyInputColorsInput,
  SurfaceColorsInput,
  RefreshControlColorsInput,
  SkeletonColorsInput,
  HintColorsInput,
  StatCardColorsInput,
  MultiSelectColorsInput,
} from "./provider";

// Tokens
export {
  DEFAULT_TOKENS,
  DEFAULT_DARK_TOKENS,
  DEFAULT_LIGHT_BUTTON_COLORS,
  DEFAULT_DARK_BUTTON_COLORS,
  DEFAULT_LIGHT_TEXT_COLORS,
  DEFAULT_DARK_TEXT_COLORS,
  DEFAULT_LIGHT_ALERT_COLORS,
  DEFAULT_DARK_ALERT_COLORS,
  DEFAULT_LIGHT_RADIO_GROUP_COLORS,
  DEFAULT_DARK_RADIO_GROUP_COLORS,
  DEFAULT_LIGHT_INPUT_COLORS,
  DEFAULT_DARK_INPUT_COLORS,
  DEFAULT_LIGHT_CURRENCY_INPUT_COLORS,
  DEFAULT_DARK_CURRENCY_INPUT_COLORS,
  DEFAULT_LIGHT_SURFACE_COLORS,
  DEFAULT_DARK_SURFACE_COLORS,
  DEFAULT_LIGHT_REFRESH_CONTROL_COLORS,
  DEFAULT_DARK_REFRESH_CONTROL_COLORS,
  DEFAULT_LIGHT_SKELETON_COLORS,
  DEFAULT_DARK_SKELETON_COLORS,
  DEFAULT_LIGHT_HINT_COLORS,
  DEFAULT_DARK_HINT_COLORS,
  DEFAULT_LIGHT_STAT_CARD_COLORS,
  DEFAULT_DARK_STAT_CARD_COLORS,
  DEFAULT_LIGHT_MULTI_SELECT_COLORS,
  DEFAULT_DARK_MULTI_SELECT_COLORS,
  buildConfig,
  coarseToFineTokens,
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
  tint,
} from "./tokens";
export type {
  Tokens,
  ButtonColors,
  ButtonVariantColors,
  TextColors,
  AlertColors,
  AlertVariantColors,
  RadioGroupColors,
  InputColors,
  CurrencyInputColors,
  SurfaceColors,
  RefreshControlColors,
  SkeletonColors,
  HintColors,
  HintToneColors,
  StatCardColors,
  MultiSelectColors,
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

export { Alert } from "./components";
export type { AlertProps, AlertVariant, AlertRadius, AlertVariantColorsInput } from "./components";

export { RadioGroup } from "./components";
export type { RadioGroupProps, RadioOption, RadioOrientation, RadioRadius } from "./components";

export { Input } from "./components";
export type { InputProps, InputRadius } from "./components";

export { CurrencyInput } from "./components";
export type { CurrencyInputProps, CurrencyInputRadius } from "./components";

export { Surface } from "./components";
export type { SurfaceProps, SurfaceLevel } from "./components";

export { RefreshControl } from "./components";
export type { RefreshControlProps } from "./components";

export { Skeleton } from "./components";
export type { SkeletonProps, SkeletonRadius, SkeletonVariant } from "./components";

export { Hint } from "./components";
export type { HintProps, HintTone, HintEmphasis } from "./components";

export { StatCard } from "./components";
export type { StatCardProps, StatCardTrend, StatCardRadius } from "./components";

export { MultiSelect } from "./components";
export type { MultiSelectProps, MultiSelectOption, MultiSelectRadius } from "./components";
