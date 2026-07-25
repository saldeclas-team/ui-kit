import type { GetProps } from "tamagui";

import type { SegmentedControlColors } from "../../tokens/tokens-types";
import type { RadiusValue } from "../../utils/radius";
import type { StyledSegmentedControl } from "./segmented-control.styled";

/**
 * One segment in the control.
 *
 * `Value` defaults to `string` and stays generic across the
 * component so consumers keep type-safety on `value`, `onChange`,
 * and each `option.value`. Same generic slot as `SelectOption` /
 * `RadioOption` / `MultiSelectOption` for API symmetry.
 */
export interface SegmentedControlOption<Value extends string = string> {
  value: Value;
  label: string;
}

/**
 * Container border-radius selector. Alias for the shared
 * `RadiusValue` union. Applied to the outer pill on Android;
 * IGNORED on iOS (SwiftUI `UISegmentedControl` owns its own
 * rounded pill shape and doesn't expose a radius prop).
 */
export type SegmentedControlRadius = RadiusValue;

/**
 * Per-instance color-override input. Partial of the full
 * `SegmentedControlColors` palette (9 slots — 3 shared + 6
 * Android-only chrome). Missing slots fall through to the
 * provider-resolved defaults.
 */
export type SegmentedControlColorsInput = Partial<SegmentedControlColors>;

/**
 * `SegmentedControlProps` re-declares only the props we own.
 * Every Tamagui `YStackProps` flows through the `...rest` spread
 * with types inferred from `GetProps<typeof StyledSegmentedControl>`.
 */
export interface SegmentedControlProps<Value extends string = string> extends Omit<
  GetProps<typeof StyledSegmentedControl>,
  "children" | "onChange"
> {
  /** Segments rendered in the native control, in array order. */
  options: SegmentedControlOption<Value>[];
  /**
   * Currently-selected value. Always one segment is selected —
   * segmented controls have no "unselected" state. Consumers pick
   * a sensible default on mount (typically the first option).
   */
  value: Value;
  /** Fires with the picked value when the user taps a segment. */
  onChange: (value: Value) => void;
  /** Optional bold heading rendered above the control. */
  label?: string;
  /**
   * Muted helper copy below the control. Overridden by `errorText`
   * when set.
   */
  helperText?: string;
  /** Error copy below the control. Overrides `helperText`. */
  errorText?: string;
  /** Disable the whole control — taps are swallowed at the native level. */
  disabled?: boolean;
  /**
   * **[Android only]** Container border radius. Applied by the
   * pure-JS Material 3 Android body to its outer pill; IGNORED
   * on iOS (native `UISegmentedControl` owns its own shape and
   * doesn't expose a radius prop). Prefixed `android` to signal
   * the platform scope at the API level.
   *
   * Defaults to `"pill"` to match M3 out of the box; pass
   * `"none"` for a square variant, `"sm"` / `"md"` / `"lg"` for
   * softened corners, or a raw number for a specific pixel value.
   */
  androidRadius?: SegmentedControlRadius;
  /**
   * Per-instance color override. Missing slots fall through to
   * the provider-resolved palette.
   */
  segmentedControlColors?: SegmentedControlColorsInput;
  /**
   * Root testID. Sub-elements derive:
   * `{root}-label`, `{root}-control`, `{root}-helper-text`,
   * `{root}-error-text`, `{root}-missing-peer`.
   */
  testID?: string;
}
