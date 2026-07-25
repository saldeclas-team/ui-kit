import type { ReactNode } from "react";
import type { GetProps } from "tamagui";

import type { StyledAlert } from "./alert.styled";

/**
 * Semantic variant. Drives the default color palette (icon + text +
 * background at low opacity), and the a11y announcement priority:
 * `danger` uses `accessibilityRole="alert"` (interrupts), everything
 * else uses `accessibilityRole="status"` (polite).
 *
 * `"danger"` intentionally replaces the more common `"error"` name so
 * the vocabulary matches `KrakenTextColors.danger` across the kit —
 * one semantic slot, one name.
 */
export type AlertVariant = "info" | "success" | "warning" | "danger";

/**
 * Border radius selector. Same shape as `ButtonRadius` for consistency
 * across the kit: preset names resolve to the theme scale, `"pill"` is
 * fully rounded, a raw number is passed through as pixels.
 */
export type AlertRadius = number | "none" | "sm" | "md" | "lg" | "pill";

/**
 * Slots that `alertColors` can override per-instance. Every slot
 * defaults to a value derived from the `variant` (which pulls from
 * `KrakenTextColors.<slot>` on the provider). Missing slots on the
 * input object fall through to the variant's defaults — you only
 * override what you want to change.
 */
export interface AlertColors {
  /** Fill color of the surface. Default: `textColors.<variant>` at ~10% opacity. */
  background: string;
  /** Border color. Default: unset (no border). */
  border?: string;
  /** Title + body text color. Default: `textColors.<variant>` at full opacity. */
  text: string;
  /** Icon glyph color. Default: `textColors.<variant>` at full opacity. */
  icon: string;
}

/** Per-instance override; every field optional. */
export type AlertColorsInput = Partial<AlertColors>;

/**
 * `AlertProps` re-declares only the props we own or override. Every
 * Tamagui style prop that `StyledAlert` accepts flows through the
 * `...rest` spread (padding, margin, pressStyle, shorthand aliases,
 * etc.) with types inferred from `GetProps<typeof StyledAlert>`.
 */
export interface AlertProps extends Omit<GetProps<typeof StyledAlert>, "children" | "color"> {
  /** Semantic variant. Defaults to `"info"`. */
  variant?: AlertVariant;
  /** Optional bold title rendered above the body. */
  title?: string;
  /** Body content. Plain string OR nested `<Text>` for rich content. */
  children?: ReactNode;
  /**
   * Optional leading icon. `Alert` does NOT depend on an icon library
   * — consumer brings their own (`<Alert icon={<CheckCircleIcon />}>`).
   */
  icon?: ReactNode;
  /** Border radius. Defaults to `"md"`. */
  radius?: AlertRadius;
  /**
   * Per-instance color override. Missing slots fall through to the
   * `variant` defaults. Enables brand-color alerts without extending
   * the provider palette.
   */
  alertColors?: AlertColorsInput;
  /**
   * Root testID. Sub-elements derive:
   * `{testID}-title`, `{testID}-body`, `{testID}-icon`.
   */
  testID?: string;
}
