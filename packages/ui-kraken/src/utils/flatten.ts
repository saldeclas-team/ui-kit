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
  CollapsibleColors,
  CurrencyInputColors,
  ExternalLinkColors,
  HintColors,
  InputColors,
  MultiSelectColors,
  RadioGroupColors,
  RefreshControlColors,
  SkeletonColors,
  SocialButtonColors,
  StatCardColors,
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

/**
 * Flatten the `refreshControlColors` slot map into
 * `$uiRefreshControl{PascalCase}` Tamagui tokens
 * (`$uiRefreshControlSpinner`, `$uiRefreshControlBackground`,
 * `$uiRefreshControlTitle`).
 */
export function flattenRefreshControlColors(colors: RefreshControlColors): Record<string, string> {
  const out: Record<string, string> = {};
  for (const slot of Object.keys(colors) as Array<keyof RefreshControlColors>) {
    const capitalized = slot.charAt(0).toUpperCase() + slot.slice(1);
    out[`uiRefreshControl${capitalized}`] = colors[slot];
  }
  return out;
}

/**
 * Flatten the `skeletonColors` slot map into `$uiSkeleton{PascalCase}`
 * Tamagui tokens (`$uiSkeletonBase`, `$uiSkeletonHighlight`).
 */
export function flattenSkeletonColors(colors: SkeletonColors): Record<string, string> {
  const out: Record<string, string> = {};
  for (const slot of Object.keys(colors) as Array<keyof SkeletonColors>) {
    const capitalized = slot.charAt(0).toUpperCase() + slot.slice(1);
    out[`uiSkeleton${capitalized}`] = colors[slot];
  }
  return out;
}

/**
 * Flatten the nested `hintColors` shape into a flat `$ui*` token map:
 *
 * ```
 * { info: { text: "#1E40AF", icon: "#2563EB", background: "#EFF6FF" } }
 * ```
 *
 * becomes
 *
 * ```
 * {
 *   uiHintInfoText: "#1E40AF",
 *   uiHintInfoIcon: "#2563EB",
 *   uiHintInfoBackground: "#EFF6FF",
 * }
 * ```
 */
export function flattenHintColors(colors: HintColors): Record<string, string> {
  const out: Record<string, string> = {};
  for (const tone of Object.keys(colors) as Array<keyof HintColors>) {
    const slots = colors[tone];
    const capitalized = tone.charAt(0).toUpperCase() + tone.slice(1);
    out[`uiHint${capitalized}Text`] = slots.text;
    out[`uiHint${capitalized}Icon`] = slots.icon;
    out[`uiHint${capitalized}Background`] = slots.background;
  }
  return out;
}

/**
 * Flatten the `statCardColors` slot map into `$uiStatCard{PascalCase}`
 * Tamagui tokens (`$uiStatCardBackground`, `$uiStatCardTitle`,
 * `$uiStatCardValue`, ...).
 */
export function flattenStatCardColors(colors: StatCardColors): Record<string, string> {
  const out: Record<string, string> = {};
  for (const slot of Object.keys(colors) as Array<keyof StatCardColors>) {
    const capitalized = slot.charAt(0).toUpperCase() + slot.slice(1);
    out[`uiStatCard${capitalized}`] = colors[slot];
  }
  return out;
}

/**
 * Flatten the `multiSelectColors` slot map into
 * `$uiMultiSelect{PascalCase}` Tamagui tokens
 * (`$uiMultiSelectSelectedBackground`,
 * `$uiMultiSelectUnselectedLabel`, ...).
 */
export function flattenMultiSelectColors(colors: MultiSelectColors): Record<string, string> {
  const out: Record<string, string> = {};
  for (const slot of Object.keys(colors) as Array<keyof MultiSelectColors>) {
    const capitalized = slot.charAt(0).toUpperCase() + slot.slice(1);
    out[`uiMultiSelect${capitalized}`] = colors[slot];
  }
  return out;
}

/**
 * Flatten the nested `socialButtonColors` shape into a flat `$ui*`
 * token map:
 *
 * ```
 * { google: { background: "#FFFFFF", label: "#1F1F1F", border: "#DADCE0" } }
 * ```
 *
 * becomes
 *
 * ```
 * {
 *   uiSocialButtonGoogleBackground: "#FFFFFF",
 *   uiSocialButtonGoogleLabel: "#1F1F1F",
 *   uiSocialButtonGoogleBorder: "#DADCE0",
 * }
 * ```
 */
export function flattenSocialButtonColors(colors: SocialButtonColors): Record<string, string> {
  const out: Record<string, string> = {};
  for (const provider of Object.keys(colors) as Array<keyof SocialButtonColors>) {
    const slots = colors[provider];
    const capitalized = provider.charAt(0).toUpperCase() + provider.slice(1);
    out[`uiSocialButton${capitalized}Background`] = slots.background;
    out[`uiSocialButton${capitalized}Label`] = slots.label;
    out[`uiSocialButton${capitalized}Border`] = slots.border;
  }
  return out;
}

/**
 * Flatten the `collapsibleColors` slot map into
 * `$uiCollapsible{PascalCase}` Tamagui tokens
 * (`$uiCollapsibleHeaderBackground`, `$uiCollapsibleTitle`, ...).
 */
export function flattenCollapsibleColors(colors: CollapsibleColors): Record<string, string> {
  const out: Record<string, string> = {};
  for (const slot of Object.keys(colors) as Array<keyof CollapsibleColors>) {
    const capitalized = slot.charAt(0).toUpperCase() + slot.slice(1);
    out[`uiCollapsible${capitalized}`] = colors[slot];
  }
  return out;
}

/**
 * Flatten the `externalLinkColors` slot map into
 * `$uiExternalLink{PascalCase}` Tamagui tokens
 * (`$uiExternalLinkLabel`, `$uiExternalLinkIcon`).
 */
export function flattenExternalLinkColors(colors: ExternalLinkColors): Record<string, string> {
  const out: Record<string, string> = {};
  for (const slot of Object.keys(colors) as Array<keyof ExternalLinkColors>) {
    const capitalized = slot.charAt(0).toUpperCase() + slot.slice(1);
    out[`uiExternalLink${capitalized}`] = colors[slot];
  }
  return out;
}
