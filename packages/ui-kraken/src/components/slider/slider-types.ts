import type { YStackProps } from "tamagui";

import type { SliderColors } from "../../tokens/tokens-types";

/**
 * Size preset. Track height + thumb size scale together:
 * `"sm"` → track 4 + thumb 16, `"md"` → track 6 + thumb 20
 * (default), `"lg"` → track 8 + thumb 24.
 */
export type SliderSize = "sm" | "md" | "lg";

/**
 * Per-instance color override. Partial of the full `SliderColors`
 * palette — missing slots fall through to the provider palette.
 */
export type SliderColorsInput = Partial<SliderColors>;

/**
 * `SliderProps` re-declares only props that are OURS. Every
 * Tamagui `YStackProps` flows through the `...rest` spread —
 * `margin`, `padding`, etc. `backgroundColor` is intentionally
 * omitted; the track palette owns it.
 */
export interface SliderProps extends Omit<YStackProps, "backgroundColor"> {
  /**
   * Current value. Controlled by the consumer. Clamped to
   * `[min, max]` internally.
   */
  value: number;
  /**
   * Fires on every drag frame with the new (clamped + snapped)
   * value.
   */
  onValueChange: (value: number) => void;
  /**
   * Fires on release with the final (clamped + snapped) value.
   * Optional — consumers who only care about the final value use
   * this instead of `onValueChange`.
   */
  onSlidingComplete?: (value: number) => void;
  /** Range minimum. Default: `0`. */
  min?: number;
  /** Range maximum. Default: `100`. */
  max?: number;
  /**
   * Snap increment. Default: `1`. Pass `0` for continuous
   * (floating-point) values.
   */
  step?: number;
  /**
   * Size preset. Track + thumb scale together.
   */
  size?: SliderSize;
  /**
   * When true, the slider ignores drag gestures and dims the
   * thumb. Also sets `accessibilityState.disabled`.
   */
  disabled?: boolean;
  /** Per-instance color override. */
  sliderColors?: SliderColorsInput;
  /** Root testID. Default: `"slider"`. */
  testID?: string;
}
