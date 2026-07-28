import type { YStackProps } from "tamagui";

import type { ProgressBarColors } from "../../tokens/tokens-types";

/**
 * Size preset for the track height. Maps to px at render time:
 * `"sm"` → 4, `"md"` → 8 (default), `"lg"` → 12. Consumers who
 * need pixel-perfect sizes pass a raw `number`.
 */
export type ProgressBarSize = "sm" | "md" | "lg";

/**
 * Corner-radius mode. `"full"` → track + fill are pilled
 * (`borderRadius = height / 2`); `"none"` → straight bar. No
 * arbitrary radius prop — consumers pass Tamagui `borderRadius={...}`
 * via the spread if they need a specific value.
 */
export type ProgressBarRadius = "full" | "none";

/**
 * Per-instance color override. Partial of the full `ProgressBarColors`
 * palette — missing slots fall through to the provider palette.
 */
export type ProgressBarColorsInput = Partial<ProgressBarColors>;

/**
 * `ProgressBarProps` re-declares only props that are OURS. Every
 * Tamagui `YStackProps` flows through the `...rest` spread —
 * `margin`, `padding`, `flex`, etc. `backgroundColor` is
 * intentionally omitted; the track palette owns it.
 */
export interface ProgressBarProps extends Omit<YStackProps, "backgroundColor"> {
  /** Current value. Clamped to `[min, max]`. Default: `0`. */
  value?: number;
  /** Range minimum. Default: `0`. */
  min?: number;
  /** Range maximum. Default: `100`. */
  max?: number;
  /**
   * Track height preset OR raw number.
   * `"sm"` → 4, `"md"` → 8 (default), `"lg"` → 12.
   */
  size?: ProgressBarSize | number;
  /** Corner radius mode. Default: `"full"` (pill). */
  radius?: ProgressBarRadius;
  /**
   * When true, renders `"{percent}%"` label above the bar. Ignored
   * if `label` is set (custom label wins). Default: `false`.
   */
  showValueLabel?: boolean;
  /**
   * Custom label text above the bar. Wins over `showValueLabel`.
   * When set, replaces the auto-generated percent label.
   */
  label?: string;
  /**
   * Per-instance color override. Missing slots fall through to the
   * provider palette.
   */
  progressBarColors?: ProgressBarColorsInput;
  /** Root testID. Default: `"progress-bar"`. */
  testID?: string;
}
