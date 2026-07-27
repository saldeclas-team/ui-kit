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
  DividerColorsInput,
  SpinnerColorsInput,
  AvatarColorsInput,
  BadgeColorsInput,
  RefreshControlColorsInput,
  SkeletonColorsInput,
  HintColorsInput,
  StatCardColorsInput,
  MultiSelectColorsInput,
  SocialButtonColorsInput,
  CollapsibleColorsInput,
  ExternalLinkColorsInput,
  SelectColorsInput,
  SelectNativeColorsInput,
  SelectBottomSheetColorsInput,
  SegmentedControlColorsInput,
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
  DEFAULT_LIGHT_DIVIDER_COLORS,
  DEFAULT_DARK_DIVIDER_COLORS,
  DEFAULT_LIGHT_SPINNER_COLORS,
  DEFAULT_DARK_SPINNER_COLORS,
  DEFAULT_LIGHT_AVATAR_COLORS,
  DEFAULT_DARK_AVATAR_COLORS,
  DEFAULT_LIGHT_BADGE_COLORS,
  DEFAULT_DARK_BADGE_COLORS,
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
  DEFAULT_LIGHT_SOCIAL_BUTTON_COLORS,
  DEFAULT_DARK_SOCIAL_BUTTON_COLORS,
  DEFAULT_LIGHT_COLLAPSIBLE_COLORS,
  DEFAULT_DARK_COLLAPSIBLE_COLORS,
  DEFAULT_LIGHT_EXTERNAL_LINK_COLORS,
  DEFAULT_DARK_EXTERNAL_LINK_COLORS,
  DEFAULT_LIGHT_SELECT_COLORS,
  DEFAULT_DARK_SELECT_COLORS,
  DEFAULT_LIGHT_SELECT_NATIVE_COLORS,
  DEFAULT_DARK_SELECT_NATIVE_COLORS,
  DEFAULT_LIGHT_SELECT_BOTTOM_SHEET_COLORS,
  DEFAULT_DARK_SELECT_BOTTOM_SHEET_COLORS,
  DEFAULT_LIGHT_SEGMENTED_CONTROL_COLORS,
  DEFAULT_DARK_SEGMENTED_CONTROL_COLORS,
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
  mergeDividerColors,
  mergeSpinnerColors,
  mergeAvatarColors,
  mergeBadgeColors,
  mergeBadgeToneColors,
  mergeRefreshControlColors,
  mergeSkeletonColors,
  mergeHintColors,
  mergeHintToneColors,
  mergeStatCardColors,
  mergeMultiSelectColors,
  mergeSocialButtonColors,
  mergeSocialButtonProviderColors,
  mergeCollapsibleColors,
  mergeExternalLinkColors,
  mergeSelectColors,
  mergeSelectNativeColors,
  mergeSelectBottomSheetColors,
  mergeSegmentedControlColors,
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
  DividerColors,
  SpinnerColors,
  AvatarColors,
  BadgeColors,
  BadgeToneColors,
  RefreshControlColors,
  SkeletonColors,
  HintColors,
  HintToneColors,
  StatCardColors,
  MultiSelectColors,
  SocialButtonColors,
  SocialButtonProviderColors,
  CollapsibleColors,
  ExternalLinkColors,
  SelectColors,
  SelectNativeColors,
  SelectBottomSheetColors,
  SegmentedControlColors,
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

export { Card } from "./components";
export type {
  CardBodyProps,
  CardFooterProps,
  CardHeaderProps,
  CardLevel,
  CardProps,
} from "./components";

export { Divider } from "./components";
export type { DividerOrientation, DividerProps } from "./components";

export { Spinner } from "./components";
export type { SpinnerProps, SpinnerSize } from "./components";

export { Avatar } from "./components";
export type { AvatarProps, AvatarShape, AvatarSize } from "./components";

export { Badge } from "./components";
export type { BadgeProps, BadgeSize, BadgeTone } from "./components";

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

export { SocialButton } from "./components";
export type {
  SocialButtonProps,
  SocialButtonProvider,
  SocialButtonRadius,
  SocialButtonSize,
} from "./components";

export { Collapsible } from "./components";
export type { CollapsibleProps, CollapsibleAnimation, CollapsibleRadius } from "./components";

export { ExternalLink } from "./components";
export type { ExternalLinkProps } from "./components";

export { Select } from "./components";
export type { SelectProps, SelectOption, SelectRadius } from "./components";

export { SelectNative } from "./components";
export type {
  SelectNativeProps,
  SelectNativeOption,
  SelectNativeRadius,
  SelectNativeValue,
} from "./components";

export { SelectBottomSheet } from "./components";
export type {
  SelectBottomSheetProps,
  SelectBottomSheetOption,
  SelectBottomSheetRadius,
  SelectBottomSheetSnapPoint,
} from "./components";

export { SegmentedControl } from "./components";
export type { SegmentedControlProps, SegmentedControlOption } from "./components";

export { DatePicker } from "./components";
export type {
  DatePickerProps,
  DatePickerMode,
  DatePickerRadius,
  DateTimeStyle,
} from "./components";

export { DateRangePicker } from "./components";
export type {
  DateRangePickerProps,
  DateRangePickerMode,
  DateRangePickerOrientation,
  DateRangePickerRadius,
} from "./components";

export { BottomSheet } from "./components";
export type {
  BottomSheetProps,
  BottomSheetRef,
  BottomSheetRadius,
  BottomSheetSnapPoint,
} from "./components";

export { ImagePickerSheet } from "./components";
export type {
  ImagePickerSheetProps,
  ImagePickerSheetRef,
  ImagePickerSheetRadius,
  PickedAsset,
} from "./components";
