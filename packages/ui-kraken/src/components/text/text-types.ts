import type { ReactNode } from "react";
import type { GetProps } from "tamagui";

import type { KrakenTextColors } from "../../tokens/kraken-tokens-types";
import type { StyledText } from "./text.styled";

/**
 * Type-scale variants. Naming follows the HTML/MUI convention so devs coming
 * from web templates land in familiar territory. See README for the full
 * fontSize / lineHeight / fontWeight table.
 */
export type TextVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "subtitle1"
  | "subtitle2"
  | "body1"
  | "body2"
  | "caption"
  | "overline"
  | "label";

/**
 * Semantic color slot from `KrakenTextColors`. The `color` prop on `<Text>`
 * accepts either one of these slot names (resolves to the theme token) OR an
 * arbitrary color string (hex / rgb / rgba) that ui-kraken passes through
 * to the underlying RN Text as-is.
 */
export type TextColor = keyof KrakenTextColors;

/**
 * Intensity modulator applied on top of the resolved color.
 *
 * - `subtle` — resolved color rendered at `opacity: 0.65`.
 * - `normal` — default; no modulation.
 * - `strong` — `opacity: 1` and `fontWeight` bumped one step (400 → 600,
 *   500 → 700). If the variant's base weight is already 700+, weight is
 *   left unchanged.
 */
export type TextIntensity = "subtle" | "normal" | "strong";

/**
 * `TextProps` re-declares ONLY props that are ours (`variant`, `intensity`)
 * or that we override (`color` union of slot + arbitrary string). Every RN
 * Text prop (`onPress`, `selectable`, `numberOfLines`, `ellipsizeMode`,
 * `textAlign`, `adjustsFontSizeToFit`, `allowFontScaling`, `accessibilityLabel`,
 * `dataDetectorType`, `style`, `ref`, `testID`, etc.) plus every Tamagui
 * style prop (`padding`, `margin`, `backgroundColor`, `pressStyle`,
 * `hoverStyle`, shorthand aliases) flows through via `...rest` — those props
 * arrive typed from `GetProps<typeof StyledText>` inference.
 */
export interface TextProps extends Omit<GetProps<typeof StyledText>, "children" | "color"> {
  children?: ReactNode;
  /** HTML-familiar type-scale variant. Defaults to `"body2"`. */
  variant?: TextVariant;
  /**
   * Text color. Either a slot name from `KrakenTextColors` (resolves to a
   * theme token via `useKraken()`) OR a raw color string (`#RRGGBB`, `rgb(...)`)
   * applied as-is. Defaults to `"primary"`.
   */
  color?: TextColor | (string & {});
  /** Modulator on top of the resolved color. Defaults to `"normal"`. */
  intensity?: TextIntensity;
}
