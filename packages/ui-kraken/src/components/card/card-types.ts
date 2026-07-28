import type { XStackProps, YStackProps } from "tamagui";

import type { SurfaceColorsInput, SurfaceLevel } from "../surface";

/**
 * Semantic elevation level forwarded to the internal `<Surface>`.
 * Reuses `SurfaceLevel` verbatim — a Card IS a padded, rounded
 * Surface. Default: `"raised"` (the card-like affordance).
 */
export type CardLevel = SurfaceLevel;

/**
 * `CardProps` re-declares only props that are OURS. Every Tamagui
 * `YStackProps` flows through the `...rest` spread — `padding`,
 * `borderRadius`, `gap`, `margin`, `flex`, `pressStyle`, shorthand
 * aliases (`px`, `py`, `br`), etc. `backgroundColor` is omitted
 * from the spread because the internal `<Surface>` owns background
 * color resolution — override via `surfaceColors` (per-instance)
 * or the provider (globally).
 */
export interface CardProps extends Omit<YStackProps, "backgroundColor"> {
  /**
   * Semantic elevation level forwarded to the internal `<Surface>`.
   * Drives which slot on `surfaceColors` is used for the background.
   * Default: `"raised"`.
   */
  level?: CardLevel;
  /**
   * Per-instance color override forwarded to the internal
   * `<Surface>`. Missing slots fall through to the provider palette.
   */
  surfaceColors?: SurfaceColorsInput;
  /** Root testID. Default: `"card"`. */
  testID?: string;
}

/**
 * `Card.Header` — horizontal slot for a title (left) + optional
 * trailing action (right). Extends `XStackProps` so every Tamagui
 * layout prop flows through. Defaults picked to match the "title
 * + action" pattern; consumers override at the callsite.
 */
export interface CardHeaderProps extends XStackProps {
  /** Slot testID. Default: `"card-header"`. */
  testID?: string;
}

/**
 * `Card.Body` — vertical slot for main content. Extends
 * `YStackProps`. Default gap suits stacked paragraphs / rows;
 * consumers override for tighter or looser vertical rhythm.
 */
export interface CardBodyProps extends YStackProps {
  /** Slot testID. Default: `"card-body"`. */
  testID?: string;
}

/**
 * `Card.Footer` — horizontal slot for action buttons, right-
 * aligned by default. Extends `XStackProps`.
 */
export interface CardFooterProps extends XStackProps {
  /** Slot testID. Default: `"card-footer"`. */
  testID?: string;
}
