import type { ReactNode } from "react";
import type { GetProps } from "tamagui";

import type { AlertVariantColors } from "../../tokens/tokens-types";
import type { RadiusValue } from "../../utils/radius";
import type { StyledAlert } from "./alert.styled";

/**
 * Semantic variant. Drives the default color palette (background + text +
 * icon + optional border) and the a11y announcement priority: `danger`
 * uses `accessibilityLiveRegion="assertive"` (interrupts), everything
 * else uses `"polite"`.
 *
 * `"danger"` intentionally replaces the more common `"error"` name so
 * the vocabulary matches `TextColors.danger` across the kit —
 * one semantic slot, one name.
 */
export type AlertVariant = "info" | "success" | "warning" | "danger";

/**
 * Border radius selector. Same shape as `ButtonRadius` for consistency
 * across the kit: preset names resolve to the theme scale, `"pill"` is
 * fully rounded, a raw number is passed through as pixels.
 */
export type AlertRadius = RadiusValue;

/**
 * Per-instance override input for `<Alert>`. Partial of one variant's
 * slots — the variant is already picked (either via the `variant` prop
 * or the compound subcomponent like `Alert.Info`), so this only needs
 * the slots inside that variant, all optional. Missing slots fall
 * through to the provider-resolved variant palette.
 *
 * Provider-level input is `AlertColorsInput` (from the provider barrel),
 * which is a partial-of-partials over ALL variants.
 */
export type AlertVariantColorsInput = Partial<AlertVariantColors>;

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
   * Per-instance color override for THIS alert's resolved variant.
   * Missing slots fall through to the provider-resolved palette. Enables
   * brand-color alerts without extending the provider palette.
   */
  alertColors?: AlertVariantColorsInput;
  /**
   * Root testID. Sub-elements derive:
   * `{testID}-title`, `{testID}-body`, `{testID}-icon`.
   */
  testID?: string;
}
