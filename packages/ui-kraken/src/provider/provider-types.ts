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
  CollapsibleColors,
  ExternalLinkColors,
  SelectColors,
  SelectNativeColors,
  SelectBottomSheetColors,
  SegmentedControlColors,
  BottomSheetColors,
  DatePickerColors,
  DateRangePickerColors,
  HintColors,
  ImagePickerSheetColors,
  HintToneColors,
  MultiSelectColors,
  RefreshControlColors,
  SkeletonColors,
  SocialButtonColors,
  SocialButtonProviderColors,
  StatCardColors,
  SurfaceColors,
  DividerColors,
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
 * Partial override for `dividerColors` — consumers only declare the
 * `line` slot they want to change; missing slots fall through to
 * the shipped defaults. Single slot.
 */
export type DividerColorsInput = Partial<DividerColors>;

/**
 * Partial override for `refreshControlColors` — consumers only
 * declare the slots they want to change; the rest fills in from the
 * shipped defaults. Slot-based, 3 slots.
 */
export type RefreshControlColorsInput = Partial<RefreshControlColors>;

/**
 * Partial override for `skeletonColors` — consumers only declare the
 * slots they want to change; the rest fills in from the shipped
 * defaults. Slot-based, 2 slots (`base` + `highlight`).
 */
export type SkeletonColorsInput = Partial<SkeletonColors>;

/**
 * A partial-of-partials for `hintColors`: consumers can override just
 * one tone (e.g. `danger`), or just one slot within a tone (e.g.
 * `danger.background`), and the rest fills in from the shipped
 * defaults. Same shape as `AlertColorsInput`.
 */
export type HintColorsInput = Partial<Record<keyof HintColors, Partial<HintToneColors>>>;

/**
 * Partial override for `statCardColors` — consumers only declare the
 * slots they want to change; the rest fills in from the shipped
 * defaults. Slot-based, 8 slots (background / title / value /
 * description / icon / trendUp / trendDown / trendNeutral).
 */
export type StatCardColorsInput = Partial<StatCardColors>;

/**
 * Partial override for `multiSelectColors` — consumers only declare
 * the slots they want to change; the rest fills in from the shipped
 * defaults. Slot-based, 9 slots (3 selected + 3 unselected chip
 * states, plus groupLabel / helperText / errorText).
 */
export type MultiSelectColorsInput = Partial<MultiSelectColors>;

/**
 * A partial-of-partials for `socialButtonColors`: consumers can
 * override just one provider (e.g. `google`), or just one slot
 * within a provider (e.g. `google.background`), and the rest fills
 * in from the shipped defaults. Same shape as `ButtonColorsInput`.
 */
export type SocialButtonColorsInput = Partial<
  Record<keyof SocialButtonColors, Partial<SocialButtonProviderColors>>
>;

/**
 * Partial override for `collapsibleColors` — consumers only declare
 * the slots they want to change; the rest fills in from the shipped
 * defaults. Slot-based, 6 slots (4 header chrome + body background +
 * outer border).
 */
export type CollapsibleColorsInput = Partial<CollapsibleColors>;

/**
 * Partial override for `externalLinkColors` — consumers only
 * declare the slots they want to change; the rest fills in from the
 * shipped defaults. Slot-based, 2 slots (`label` + `icon`).
 */
export type ExternalLinkColorsInput = Partial<ExternalLinkColors>;

/**
 * Partial override for `selectColors` — consumers only declare the
 * slots they want to change; the rest fills in from the shipped
 * defaults. Slot-based, 16 slots (trigger chrome + label / helper /
 * error text + modal chrome + option-selected background).
 */
export type SelectColorsInput = Partial<SelectColors>;

/**
 * Partial override for `selectNativeColors` — consumers only
 * declare the slots they want to change; the rest fills in from
 * the shipped defaults. Slot-based, 7 slots (label + frame
 * background/backgroundDisabled/border/borderError + helperText
 * + errorText). Smaller than `SelectColorsInput` because the
 * native `@expo/ui` `Picker` owns most of its own chrome.
 */
export type SelectNativeColorsInput = Partial<SelectNativeColors>;

/**
 * Partial override for `selectBottomSheetColors` — consumers only
 * declare the slots they want to change; the rest fills in from
 * the shipped defaults. Slot-based, 15 slots (trigger chrome +
 * label / helper / error text + sheet chrome + option-selected
 * background).
 */
export type SelectBottomSheetColorsInput = Partial<SelectBottomSheetColors>;

/**
 * Partial override for `segmentedControlColors` — 3 slots.
 * Consumers only declare what they want to change; the rest
 * fills in from the shipped defaults.
 */
export type SegmentedControlColorsInput = Partial<SegmentedControlColors>;

/**
 * Partial override for `datePickerColors` — 13 slots. Consumers
 * only declare what they want to change; the rest fills in from
 * the shipped defaults.
 */
export type DatePickerColorsInput = Partial<DatePickerColors>;

/**
 * Partial override for `dateRangePickerColors` — 14 slots.
 * Consumers only declare what they want to change; the rest
 * fills in from the shipped defaults.
 */
export type DateRangePickerColorsInput = Partial<DateRangePickerColors>;

/**
 * Partial override for `bottomSheetColors` — 5 slots. Consumers
 * only declare what they want to change; the rest fills in from
 * the shipped defaults.
 */
export type BottomSheetColorsInput = Partial<BottomSheetColors>;

/**
 * Partial override for `imagePickerSheetColors` — 8 slots.
 * Consumers only declare what they want to change; the rest
 * fills in from the shipped defaults.
 */
export type ImagePickerSheetColorsInput = Partial<ImagePickerSheetColors>;

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
  dividerColors?: DividerColorsInput;
  refreshControlColors?: RefreshControlColorsInput;
  skeletonColors?: SkeletonColorsInput;
  hintColors?: HintColorsInput;
  statCardColors?: StatCardColorsInput;
  multiSelectColors?: MultiSelectColorsInput;
  socialButtonColors?: SocialButtonColorsInput;
  collapsibleColors?: CollapsibleColorsInput;
  externalLinkColors?: ExternalLinkColorsInput;
  selectColors?: SelectColorsInput;
  selectNativeColors?: SelectNativeColorsInput;
  selectBottomSheetColors?: SelectBottomSheetColorsInput;
  segmentedControlColors?: SegmentedControlColorsInput;
  datePickerColors?: DatePickerColorsInput;
  dateRangePickerColors?: DateRangePickerColorsInput;
  bottomSheetColors?: BottomSheetColorsInput;
  imagePickerSheetColors?: ImagePickerSheetColorsInput;
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
