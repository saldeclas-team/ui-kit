import type { ReactNode } from "react";
import type { GetProps } from "tamagui";

import type { CollapsibleColors } from "../../tokens/tokens-types";
import type { StyledCollapsible } from "./collapsible.styled";

/**
 * Body animation mode.
 *
 * - `"height"` (default) — the body slides open / closed via an
 *   animated `height` interpolation on plain RN `Animated`.
 * - `"none"` — no animation; the body mounts/unmounts on state
 *   change. Use for reduced-motion or performance-sensitive
 *   contexts (long lists of Collapsibles).
 */
export type CollapsibleAnimation = "height" | "none";

/**
 * Border radius selector. Same shape as `AlertRadius` /
 * `ButtonRadius`: preset names resolve to the theme scale,
 * `"pill"` is fully rounded, a raw number is passed through as
 * pixels.
 */
export type CollapsibleRadius = number | "none" | "sm" | "md" | "lg" | "pill";

/**
 * Per-instance override input for `<Collapsible>`. Partial of the
 * full `CollapsibleColors` palette; missing slots fall through to
 * the provider-resolved defaults.
 */
export type CollapsibleColorsInput = Partial<CollapsibleColors>;

/**
 * `CollapsibleProps` re-declares only the props we own. Every
 * Tamagui style prop that `StyledCollapsible` (the outer YStack)
 * accepts flows through the `...rest` spread with types inferred
 * from `GetProps<typeof StyledCollapsible>`.
 */
export interface CollapsibleProps extends Omit<GetProps<typeof StyledCollapsible>, "children"> {
  /** Header text label. Required. */
  title: string;
  /** Whether the body is visible. Controlled by the consumer. */
  expanded: boolean;
  /** Fires when the user taps the header. */
  onExpandedChange: (expanded: boolean) => void;
  /** Body content — any ReactNode. */
  children?: ReactNode;
  /** Optional leading icon in the header. */
  icon?: ReactNode;
  /**
   * Override for the default trailing chevron glyph (`▸`).
   * Consumer brings any ReactNode. The rotation transform still
   * applies to the wrapper — the icon rotates 90° on expand.
   */
  chevron?: ReactNode;
  /** Disable the header press (renders at 50% opacity, ignores taps). */
  disabled?: boolean;
  /** Animation mode. Defaults to `"height"`. */
  animation?: CollapsibleAnimation;
  /**
   * Animation duration in milliseconds. Default `200`. Chevron
   * rotation uses `min(duration, 150)` so it always finishes
   * slightly before the height slide.
   */
  duration?: number;
  /** Border radius. Defaults to `"md"`. */
  radius?: CollapsibleRadius;
  /**
   * Per-instance color override. Missing slots fall through to the
   * provider-resolved palette.
   */
  collapsibleColors?: CollapsibleColorsInput;
  /**
   * Root testID. Sub-elements derive:
   * `{root}-header`, `{root}-icon`, `{root}-title`, `{root}-chevron`,
   * `{root}-body`, `{root}-body-content`.
   */
  testID?: string;
}
