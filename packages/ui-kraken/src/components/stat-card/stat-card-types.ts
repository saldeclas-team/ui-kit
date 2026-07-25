import type { ReactNode } from "react";
import type { GetProps } from "tamagui";

import type { StatCardColors } from "../../tokens/tokens-types";
import type { StyledStatCard } from "./stat-card.styled";

/**
 * Trend direction. Drives the delta color (via the corresponding
 * `trend*` slot on the palette) AND the auto arrow glyph
 * (`▲` / `▼` / `—`) rendered next to the delta text.
 */
export type StatCardTrend = "up" | "down" | "neutral";

/**
 * Border radius selector. Same shape as `ButtonRadius` / `AlertRadius`
 * for consistency across the kit: preset names resolve to the theme
 * scale, `"pill"` is fully rounded, a raw number is passed through as
 * pixels.
 */
export type StatCardRadius = number | "none" | "sm" | "md" | "lg" | "pill";

/**
 * Per-instance override input for `<StatCard>`. Partial of the full
 * `StatCardColors` palette; missing slots fall through to the
 * provider-resolved defaults.
 */
export type StatCardColorsInput = Partial<StatCardColors>;

/**
 * `StatCardProps` re-declares only the props we own. Every Tamagui
 * style prop that `StyledStatCard` accepts flows through the `...rest`
 * spread (padding, margin, width, borderColor, pressStyle, shorthand
 * aliases, etc.) with types inferred from
 * `GetProps<typeof StyledStatCard>`.
 */
export interface StatCardProps extends Omit<GetProps<typeof StyledStatCard>, "children" | "color"> {
  /** Small heading rendered above the value. Required. */
  title: string;
  /** Main metric. Numbers render via `String(value)`. Required. */
  value: string | number;
  /** Optional secondary caption below the delta row. */
  description?: string;
  /**
   * Optional icon in the top-right corner. Consumer brings any
   * ReactNode; tone-tinted via a color-inheriting wrapper.
   */
  icon?: ReactNode;
  /**
   * Trend direction. Drives the delta color AND the auto arrow glyph.
   * When omitted, no trend / delta row renders (even if `delta` is set).
   */
  trend?: StatCardTrend;
  /** Delta value rendered next to the trend arrow (e.g. `"+8.2%"`, `-3.5`). */
  delta?: string | number;
  /**
   * Override for the default arrow glyph (`▲` / `▼` / `—`). Consumer
   * brings any ReactNode when their design system ships specific
   * trend icons.
   */
  deltaIcon?: ReactNode;
  /** Border radius. Defaults to `"lg"` (cards need more radius than form fields). */
  radius?: StatCardRadius;
  /**
   * Per-instance color override. Missing slots fall through to the
   * provider-resolved palette.
   */
  statCardColors?: StatCardColorsInput;
  /**
   * Root testID. Sub-elements derive:
   * `{root}-title`, `{root}-value`, `{root}-icon`,
   * `{root}-description`, `{root}-delta`, `{root}-trend-icon`.
   */
  testID?: string;
}
