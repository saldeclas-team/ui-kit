import type { ReactNode } from "react";
import type { YStackProps } from "tamagui";

import type { BadgeToneColors } from "../../tokens/tokens-types";

/**
 * Semantic tone. Drives which slot on `badgeColors` is used.
 * Same 5-tone set as `Hint` + `Alert` so the feedback primitives
 * share a coherent palette.
 */
export type BadgeTone = "neutral" | "primary" | "success" | "warning" | "danger";

/**
 * Size preset. Badges are small by nature — `sm` for compact
 * indicators (fontSize 10, minHeight 16), `md` (default) for the
 * standard notification / status pill (fontSize 12, minHeight 20).
 * No `lg` preset — consumers who need something bigger reach for
 * `Hint` or `Alert`.
 */
export type BadgeSize = "sm" | "md";

/**
 * Per-instance color override. Applies to the tone the consumer
 * picked — no cross-tone leakage. Same shape as `Hint`'s per-
 * instance override API.
 */
export type BadgeColorsInput = Partial<BadgeToneColors>;

/**
 * `BadgeProps` re-declares only props that are OURS. Every
 * Tamagui `YStackProps` flows through the `...rest` spread —
 * `margin`, `padding`, `borderWidth`, etc. `backgroundColor` is
 * intentionally omitted; the palette-resolved tone controls it.
 * `children` is also omitted from the spread because count / dot
 * modes need to override it programmatically.
 */
export interface BadgeProps extends Omit<YStackProps, "backgroundColor" | "children"> {
  /** Semantic tone. Default: `"neutral"`. */
  tone?: BadgeTone;
  /** Size preset. Default: `"md"`. */
  size?: BadgeSize;
  /**
   * Numeric count. When set, renders the formatted number
   * (clamped at `maxCount`) as the badge content — wins over
   * `children`.
   */
  count?: number;
  /**
   * Clamp threshold for the count display. When `count > maxCount`,
   * renders `"{maxCount}+"`. Default: `99`.
   */
  maxCount?: number;
  /**
   * Dot mode. When true, renders a small filled circle with no
   * text — wins over both `count` and `children`. Sizes: 8 px (sm)
   * / 10 px (md).
   */
  dot?: boolean;
  /** Text content. Ignored when `count` or `dot` is set. */
  children?: ReactNode;
  /**
   * Per-instance color override. Applies to the tone the consumer
   * picked — no cross-tone leakage.
   */
  badgeColors?: BadgeColorsInput;
  /** Root testID. Default: `"badge"`. */
  testID?: string;
}
