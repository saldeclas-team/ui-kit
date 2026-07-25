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
