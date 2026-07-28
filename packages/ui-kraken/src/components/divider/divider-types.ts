import type { YStackProps } from "tamagui";

import type { DividerColors } from "../../tokens/tokens-types";

/**
 * Line orientation. `"horizontal"` renders a full-width row with
 * `height=thickness`; `"vertical"` renders a full-height column
 * with `width=thickness`. Both use `alignSelf: "stretch"` so the
 * divider fills the parent's cross-axis without a manual size.
 */
export type DividerOrientation = "horizontal" | "vertical";

/**
 * Per-instance color override. Partial of the full `DividerColors`
 * palette — the only slot today is `line` so the type accepts
 * either `{}` or `{ line: string }`. Kept as a partial to match
 * the shape of every other component's per-instance override API.
 */
export type DividerColorsInput = Partial<DividerColors>;

/**
 * `DividerProps` re-declares only props that are OURS. Every
 * Tamagui `YStackProps` flows through the `...rest` spread —
 * `margin`, `flex`, `borderRadius`, `opacity`, etc.
 * `backgroundColor` is intentionally omitted because the
 * palette-resolved `line` slot controls it — override via
 * `dividerColors={{ line: "#..." }}` instead.
 */
export interface DividerProps extends Omit<YStackProps, "backgroundColor"> {
  /** Line orientation. Default: `"horizontal"`. */
  orientation?: DividerOrientation;
  /**
   * Line thickness in px. Applied as `height` (horizontal) or
   * `width` (vertical). Default: `1`.
   */
  thickness?: number;
  /**
   * Inset on both ends of the line. For horizontal dividers, this
   * is `marginHorizontal`; for vertical, `marginVertical`.
   * Default: `0` (line stretches edge-to-edge).
   */
  inset?: number;
  /**
   * Per-instance color override. Only the `line` slot is read but
   * the input shape accepts the full palette for consistency with
   * other components' override APIs.
   */
  dividerColors?: DividerColorsInput;
  /** Root testID. Default: `"divider"`. */
  testID?: string;
}
