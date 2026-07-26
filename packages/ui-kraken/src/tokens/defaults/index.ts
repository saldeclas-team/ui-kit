/**
 * Per-component color defaults + merge helpers. Each file in this folder
 * owns the defaults for one component. Adding a new component to the token
 * schema takes 3 edits:
 *
 *   1. Create `defaults/<component>.ts` with `DEFAULT_LIGHT_<X>_COLORS`,
 *      `DEFAULT_DARK_<X>_COLORS`, and the `merge<X>Colors` helper.
 *   2. Add the `<component>Colors` field to `Tokens` in `tokens-types.ts`.
 *   3. Add one line to `DEFAULT_TOKENS` + `DEFAULT_DARK_TOKENS` below,
 *      and re-export the new symbols at the bottom of this file.
 *
 * This file stays short because it only aggregates. The color hex data +
 * merge logic live in the per-component files.
 */

import type { Tokens } from "../tokens-types";
import { DEFAULT_LIGHT_BUTTON_COLORS, DEFAULT_DARK_BUTTON_COLORS } from "./button";
import { DEFAULT_LIGHT_TEXT_COLORS, DEFAULT_DARK_TEXT_COLORS } from "./text";
import { DEFAULT_LIGHT_ALERT_COLORS, DEFAULT_DARK_ALERT_COLORS } from "./alert";
import { DEFAULT_LIGHT_RADIO_GROUP_COLORS, DEFAULT_DARK_RADIO_GROUP_COLORS } from "./radio-group";
import { DEFAULT_LIGHT_INPUT_COLORS, DEFAULT_DARK_INPUT_COLORS } from "./input";
import {
  DEFAULT_LIGHT_CURRENCY_INPUT_COLORS,
  DEFAULT_DARK_CURRENCY_INPUT_COLORS,
} from "./currency-input";
import { DEFAULT_LIGHT_SURFACE_COLORS, DEFAULT_DARK_SURFACE_COLORS } from "./surface";
import {
  DEFAULT_LIGHT_REFRESH_CONTROL_COLORS,
  DEFAULT_DARK_REFRESH_CONTROL_COLORS,
} from "./refresh-control";
import { DEFAULT_LIGHT_SKELETON_COLORS, DEFAULT_DARK_SKELETON_COLORS } from "./skeleton";
import { DEFAULT_LIGHT_HINT_COLORS, DEFAULT_DARK_HINT_COLORS } from "./hint";
import { DEFAULT_LIGHT_STAT_CARD_COLORS, DEFAULT_DARK_STAT_CARD_COLORS } from "./stat-card";
import {
  DEFAULT_LIGHT_MULTI_SELECT_COLORS,
  DEFAULT_DARK_MULTI_SELECT_COLORS,
} from "./multi-select";
import {
  DEFAULT_LIGHT_SOCIAL_BUTTON_COLORS,
  DEFAULT_DARK_SOCIAL_BUTTON_COLORS,
} from "./social-button";
import { DEFAULT_LIGHT_COLLAPSIBLE_COLORS, DEFAULT_DARK_COLLAPSIBLE_COLORS } from "./collapsible";
import {
  DEFAULT_LIGHT_EXTERNAL_LINK_COLORS,
  DEFAULT_DARK_EXTERNAL_LINK_COLORS,
} from "./external-link";
import { DEFAULT_LIGHT_SELECT_COLORS, DEFAULT_DARK_SELECT_COLORS } from "./select";
import {
  DEFAULT_LIGHT_SELECT_NATIVE_COLORS,
  DEFAULT_DARK_SELECT_NATIVE_COLORS,
} from "./select-native";
import {
  DEFAULT_LIGHT_SELECT_BOTTOM_SHEET_COLORS,
  DEFAULT_DARK_SELECT_BOTTOM_SHEET_COLORS,
} from "./select-bottom-sheet";
import {
  DEFAULT_LIGHT_SEGMENTED_CONTROL_COLORS,
  DEFAULT_DARK_SEGMENTED_CONTROL_COLORS,
} from "./segmented-control";
import { DEFAULT_LIGHT_DATE_PICKER_COLORS, DEFAULT_DARK_DATE_PICKER_COLORS } from "./date-picker";

/**
 * Fallback tokens when a consumer mounts `<UIKitProvider>` without any
 * overrides. Uses the light-mode palette by default.
 */
export const DEFAULT_TOKENS: Tokens = {
  buttonColors: DEFAULT_LIGHT_BUTTON_COLORS,
  textColors: DEFAULT_LIGHT_TEXT_COLORS,
  alertColors: DEFAULT_LIGHT_ALERT_COLORS,
  radioGroupColors: DEFAULT_LIGHT_RADIO_GROUP_COLORS,
  inputColors: DEFAULT_LIGHT_INPUT_COLORS,
  currencyInputColors: DEFAULT_LIGHT_CURRENCY_INPUT_COLORS,
  surfaceColors: DEFAULT_LIGHT_SURFACE_COLORS,
  refreshControlColors: DEFAULT_LIGHT_REFRESH_CONTROL_COLORS,
  skeletonColors: DEFAULT_LIGHT_SKELETON_COLORS,
  hintColors: DEFAULT_LIGHT_HINT_COLORS,
  statCardColors: DEFAULT_LIGHT_STAT_CARD_COLORS,
  multiSelectColors: DEFAULT_LIGHT_MULTI_SELECT_COLORS,
  socialButtonColors: DEFAULT_LIGHT_SOCIAL_BUTTON_COLORS,
  collapsibleColors: DEFAULT_LIGHT_COLLAPSIBLE_COLORS,
  externalLinkColors: DEFAULT_LIGHT_EXTERNAL_LINK_COLORS,
  selectColors: DEFAULT_LIGHT_SELECT_COLORS,
  selectNativeColors: DEFAULT_LIGHT_SELECT_NATIVE_COLORS,
  selectBottomSheetColors: DEFAULT_LIGHT_SELECT_BOTTOM_SHEET_COLORS,
  segmentedControlColors: DEFAULT_LIGHT_SEGMENTED_CONTROL_COLORS,
  datePickerColors: DEFAULT_LIGHT_DATE_PICKER_COLORS,
  radius: 12,
  spacing: 8,
};

/**
 * Fallback dark tokens when a consumer opts into dark mode without passing
 * their own `dark` prop.
 */
export const DEFAULT_DARK_TOKENS: Tokens = {
  buttonColors: DEFAULT_DARK_BUTTON_COLORS,
  textColors: DEFAULT_DARK_TEXT_COLORS,
  alertColors: DEFAULT_DARK_ALERT_COLORS,
  radioGroupColors: DEFAULT_DARK_RADIO_GROUP_COLORS,
  inputColors: DEFAULT_DARK_INPUT_COLORS,
  currencyInputColors: DEFAULT_DARK_CURRENCY_INPUT_COLORS,
  surfaceColors: DEFAULT_DARK_SURFACE_COLORS,
  refreshControlColors: DEFAULT_DARK_REFRESH_CONTROL_COLORS,
  skeletonColors: DEFAULT_DARK_SKELETON_COLORS,
  hintColors: DEFAULT_DARK_HINT_COLORS,
  statCardColors: DEFAULT_DARK_STAT_CARD_COLORS,
  multiSelectColors: DEFAULT_DARK_MULTI_SELECT_COLORS,
  socialButtonColors: DEFAULT_DARK_SOCIAL_BUTTON_COLORS,
  collapsibleColors: DEFAULT_DARK_COLLAPSIBLE_COLORS,
  externalLinkColors: DEFAULT_DARK_EXTERNAL_LINK_COLORS,
  selectColors: DEFAULT_DARK_SELECT_COLORS,
  selectNativeColors: DEFAULT_DARK_SELECT_NATIVE_COLORS,
  selectBottomSheetColors: DEFAULT_DARK_SELECT_BOTTOM_SHEET_COLORS,
  segmentedControlColors: DEFAULT_DARK_SEGMENTED_CONTROL_COLORS,
  datePickerColors: DEFAULT_DARK_DATE_PICKER_COLORS,
  radius: 12,
  spacing: 8,
};

// Re-export the per-component defaults + merge helpers so consumers can
// import everything from `../tokens` without knowing about this folder.
export {
  DEFAULT_LIGHT_BUTTON_COLORS,
  DEFAULT_DARK_BUTTON_COLORS,
  mergeButtonColors,
  mergeButtonVariantColors,
} from "./button";
export { DEFAULT_LIGHT_TEXT_COLORS, DEFAULT_DARK_TEXT_COLORS, mergeTextColors } from "./text";
export {
  DEFAULT_LIGHT_ALERT_COLORS,
  DEFAULT_DARK_ALERT_COLORS,
  mergeAlertColors,
  mergeAlertVariantColors,
} from "./alert";
export {
  DEFAULT_LIGHT_RADIO_GROUP_COLORS,
  DEFAULT_DARK_RADIO_GROUP_COLORS,
  mergeRadioGroupColors,
} from "./radio-group";
export { DEFAULT_LIGHT_INPUT_COLORS, DEFAULT_DARK_INPUT_COLORS, mergeInputColors } from "./input";
export {
  DEFAULT_LIGHT_CURRENCY_INPUT_COLORS,
  DEFAULT_DARK_CURRENCY_INPUT_COLORS,
  mergeCurrencyInputColors,
} from "./currency-input";
export {
  DEFAULT_LIGHT_SURFACE_COLORS,
  DEFAULT_DARK_SURFACE_COLORS,
  mergeSurfaceColors,
} from "./surface";
export {
  DEFAULT_LIGHT_REFRESH_CONTROL_COLORS,
  DEFAULT_DARK_REFRESH_CONTROL_COLORS,
  mergeRefreshControlColors,
} from "./refresh-control";
export {
  DEFAULT_LIGHT_SKELETON_COLORS,
  DEFAULT_DARK_SKELETON_COLORS,
  mergeSkeletonColors,
} from "./skeleton";
export {
  DEFAULT_LIGHT_HINT_COLORS,
  DEFAULT_DARK_HINT_COLORS,
  mergeHintColors,
  mergeHintToneColors,
} from "./hint";
export {
  DEFAULT_LIGHT_STAT_CARD_COLORS,
  DEFAULT_DARK_STAT_CARD_COLORS,
  mergeStatCardColors,
} from "./stat-card";
export {
  DEFAULT_LIGHT_MULTI_SELECT_COLORS,
  DEFAULT_DARK_MULTI_SELECT_COLORS,
  mergeMultiSelectColors,
} from "./multi-select";
export {
  DEFAULT_LIGHT_SOCIAL_BUTTON_COLORS,
  DEFAULT_DARK_SOCIAL_BUTTON_COLORS,
  mergeSocialButtonColors,
  mergeSocialButtonProviderColors,
} from "./social-button";
export {
  DEFAULT_LIGHT_COLLAPSIBLE_COLORS,
  DEFAULT_DARK_COLLAPSIBLE_COLORS,
  mergeCollapsibleColors,
} from "./collapsible";
export {
  DEFAULT_LIGHT_EXTERNAL_LINK_COLORS,
  DEFAULT_DARK_EXTERNAL_LINK_COLORS,
  mergeExternalLinkColors,
} from "./external-link";
export {
  DEFAULT_LIGHT_SELECT_COLORS,
  DEFAULT_DARK_SELECT_COLORS,
  mergeSelectColors,
} from "./select";
export {
  DEFAULT_LIGHT_SELECT_NATIVE_COLORS,
  DEFAULT_DARK_SELECT_NATIVE_COLORS,
  mergeSelectNativeColors,
} from "./select-native";
export {
  DEFAULT_LIGHT_SELECT_BOTTOM_SHEET_COLORS,
  DEFAULT_DARK_SELECT_BOTTOM_SHEET_COLORS,
  mergeSelectBottomSheetColors,
} from "./select-bottom-sheet";
export {
  DEFAULT_LIGHT_SEGMENTED_CONTROL_COLORS,
  DEFAULT_DARK_SEGMENTED_CONTROL_COLORS,
  mergeSegmentedControlColors,
} from "./segmented-control";
export {
  DEFAULT_LIGHT_DATE_PICKER_COLORS,
  DEFAULT_DARK_DATE_PICKER_COLORS,
  mergeDatePickerColors,
} from "./date-picker";
