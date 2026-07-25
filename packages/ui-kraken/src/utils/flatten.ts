/**
 * Flatten per-component color blocks into the flat `$ui*` token map that
 * Tamagui's `createTokens` + theme system expects. One function per
 * component palette; each is called inside `buildConfig()` in
 * `tokens/tokens.ts` for both light + dark modes.
 *
 * Adding a new component's palette to the Tamagui pipeline:
 *   1. Write the interface + defaults + merge in `tokens/defaults/<x>.ts`.
 *   2. Add a `flatten<X>Colors` here that returns `{ ui<X><Variant><Slot>: hex }`.
 *   3. Import + spread it inside `buildConfig()` in `tokens/tokens.ts`
 *      (both `tokens.color` and `themes.{light,dark}`).
 */

import type {
  AlertColors,
  ButtonColors,
  CurrencyInputColors,
  InputColors,
  RadioGroupColors,
  SurfaceColors,
  TextColors,
} from "../tokens/tokens-types";

/**
 * Flatten the nested `buttonColors` shape into a flat `$ui*` token map:
 *
 * ```
 * { primary: { background: "#2563EB", label: "#FFFFFF" } }
 * ```
 *
 * becomes
 *
 * ```
 * { uiButtonPrimaryBackground: "#2563EB", uiButtonPrimaryLabel: "#FFFFFF" }
 * ```
 */
export function flattenButtonColors(colors: ButtonColors): Record<string, string> {
  const out: Record<string, string> = {};
  for (const variant of Object.keys(colors) as Array<keyof ButtonColors>) {
    const slots = colors[variant];
    const capitalized = variant.charAt(0).toUpperCase() + variant.slice(1);
    if (slots.background != null) out[`uiButton${capitalized}Background`] = slots.background;
    if (slots.border != null) out[`uiButton${capitalized}Border`] = slots.border;
    out[`uiButton${capitalized}Label`] = slots.label;
  }
  return out;
}

/**
 * Flatten the `textColors` map into `$uiText{PascalCase}` Tamagui tokens.
 */
export function flattenTextColors(colors: TextColors): Record<string, string> {
  const out: Record<string, string> = {};
  for (const slot of Object.keys(colors) as Array<keyof TextColors>) {
    const capitalized = slot.charAt(0).toUpperCase() + slot.slice(1);
    out[`uiText${capitalized}`] = colors[slot];
  }
  return out;
}

/**
 * Flatten the nested `alertColors` shape into a flat `$ui*` token map:
 *
 * ```
 * { info: { background: "#EFF6FF", text: "#0284C7", icon: "#0284C7" } }
 * ```
 *
 * becomes
 *
 * ```
 * {
 *   uiAlertInfoBackground: "#EFF6FF",
 *   uiAlertInfoText: "#0284C7",
 *   uiAlertInfoIcon: "#0284C7",
 * }
 * ```
 *
 * `border` is only emitted when the variant explicitly sets it.
 */
export function flattenAlertColors(colors: AlertColors): Record<string, string> {
  const out: Record<string, string> = {};
  for (const variant of Object.keys(colors) as Array<keyof AlertColors>) {
    const slots = colors[variant];
    const capitalized = variant.charAt(0).toUpperCase() + variant.slice(1);
    out[`uiAlert${capitalized}Background`] = slots.background;
    out[`uiAlert${capitalized}Text`] = slots.text;
    out[`uiAlert${capitalized}Icon`] = slots.icon;
    if (slots.border != null) out[`uiAlert${capitalized}Border`] = slots.border;
  }
  return out;
}

/**
 * Flatten the `radioGroupColors` slot map into `$uiRadioGroup{PascalCase}`
 * Tamagui tokens. `selectedBackground` and `unselectedBackground` are
 * optional at the schema level — undefined slots are omitted so Tamagui
 * does not receive a `string | undefined` value.
 */
export function flattenRadioGroupColors(colors: RadioGroupColors): Record<string, string> {
  const out: Record<string, string> = {};
  for (const slot of Object.keys(colors) as Array<keyof RadioGroupColors>) {
    const value = colors[slot];
    if (value == null) continue;
    const capitalized = slot.charAt(0).toUpperCase() + slot.slice(1);
    out[`uiRadioGroup${capitalized}`] = value;
  }
  return out;
}

/**
 * Flatten the `inputColors` slot map into `$uiInput{PascalCase}` Tamagui
 * tokens. Every slot is required at the schema level so no optional
 * omission is needed.
 */
export function flattenInputColors(colors: InputColors): Record<string, string> {
  const out: Record<string, string> = {};
  for (const slot of Object.keys(colors) as Array<keyof InputColors>) {
    const capitalized = slot.charAt(0).toUpperCase() + slot.slice(1);
    out[`uiInput${capitalized}`] = colors[slot];
  }
  return out;
}

/**
 * Flatten the `currencyInputColors` slot map into
 * `$uiCurrencyInput{PascalCase}` Tamagui tokens.
 */
export function flattenCurrencyInputColors(colors: CurrencyInputColors): Record<string, string> {
  const out: Record<string, string> = {};
  for (const slot of Object.keys(colors) as Array<keyof CurrencyInputColors>) {
    const capitalized = slot.charAt(0).toUpperCase() + slot.slice(1);
    out[`uiCurrencyInput${capitalized}`] = colors[slot];
  }
  return out;
}

/**
 * Flatten the `surfaceColors` slot map into `$uiSurface{PascalCase}`
 * Tamagui tokens (`$uiSurfaceBase`, `$uiSurfaceRaised`, `$uiSurfaceOverlay`,
 * `$uiSurfaceSunken`).
 */
export function flattenSurfaceColors(colors: SurfaceColors): Record<string, string> {
  const out: Record<string, string> = {};
  for (const slot of Object.keys(colors) as Array<keyof SurfaceColors>) {
    const capitalized = slot.charAt(0).toUpperCase() + slot.slice(1);
    out[`uiSurface${capitalized}`] = colors[slot];
  }
  return out;
}
