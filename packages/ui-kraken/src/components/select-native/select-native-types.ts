import type { GetProps } from "tamagui";

import type { SelectNativeColors } from "../../tokens/tokens-types";
import type { RadiusValue } from "../../utils/radius";
import type { StyledSelectNative } from "./select-native.styled";

/**
 * Value type accepted by `<SelectNative>` options. `@expo/ui`'s
 * underlying `Picker` accepts either `string` or `number` so both
 * flow through unchanged.
 */
export type SelectNativeValue = string | number;

/**
 * One selectable option in the native picker menu.
 *
 * `Value` defaults to `string` and stays generic across the
 * component so consumers keep type-safety on `value`, `onChange`,
 * and each `option.value`. Numeric values are accepted too for
 * consumers coming from `SelectValue = string | number` APIs in
 * upstream codebases.
 */
export interface SelectNativeOption<Value extends SelectNativeValue = string> {
  value: Value;
  label: string;
}

/**
 * Frame border-radius selector. Alias for the shared `RadiusValue`
 * union.
 */
export type SelectNativeRadius = RadiusValue;

/**
 * Per-instance override input for `<SelectNative>`. Partial of the
 * full `SelectNativeColors` palette; missing slots fall through to
 * the provider-resolved defaults.
 */
export type SelectNativeColorsInput = Partial<SelectNativeColors>;

/**
 * `SelectNativeProps` re-declares only the props we own. Every
 * Tamagui style prop that `StyledSelectNative` (the outer YStack)
 * accepts flows through the `...rest` spread with types inferred
 * from `GetProps<typeof StyledSelectNative>` — padding, margin,
 * width, etc.
 */
export interface SelectNativeProps<Value extends SelectNativeValue = string> extends Omit<
  GetProps<typeof StyledSelectNative>,
  "children" | "onChange"
> {
  /** Options rendered inside the native picker menu, in array order. */
  options: SelectNativeOption<Value>[];
  /**
   * Current value, or `null` when no option is selected. Controlled —
   * consumer holds state and updates via `onChange`.
   */
  value: Value | null;
  /** Fires with the picked value when the user picks a menu option. */
  onChange: (value: Value) => void;
  /** Optional bold heading rendered above the trigger frame. */
  label?: string;
  /**
   * Muted helper copy below the frame. Overridden by `errorText`.
   */
  helperText?: string;
  /** Error copy below the frame. Overrides `helperText`. */
  errorText?: string;
  /**
   * Label of the invisible placeholder item that gets injected
   * when `value` doesn't match any option (typically when it's
   * `null` and we synthesize an empty-string value on the fly).
   * Required for the Android `Picker` to open reliably — without
   * a `Picker.Item` whose value matches `selectedValue`, the
   * Compose implementation silently no-ops on tap.
   *
   * Defaults to `"Select…"`.
   */
  placeholderLabel?: string;
  /** Disable the trigger — native menu will not open. */
  disabled?: boolean;
  /** Frame border radius. Defaults to `"md"`. */
  radius?: SelectNativeRadius;
  /**
   * Per-instance color override. Missing slots fall through to the
   * provider-resolved palette.
   */
  selectNativeColors?: SelectNativeColorsInput;
  /**
   * Root testID. Sub-elements derive:
   * `{root}-label`, `{root}-frame`, `{root}-picker`,
   * `{root}-helper-text`, `{root}-error-text`, `{root}-missing-peer`.
   */
  testID?: string;
}
