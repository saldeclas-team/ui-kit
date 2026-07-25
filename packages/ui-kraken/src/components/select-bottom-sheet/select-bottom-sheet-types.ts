import type { GetProps } from "tamagui";

import type { SelectBottomSheetColors } from "../../tokens/tokens-types";
import type { RadiusValue } from "../../utils/radius";
import type { StyledSelectBottomSheet } from "./select-bottom-sheet.styled";

/**
 * One selectable option in the bottom-sheet picker list.
 *
 * `Value` defaults to `string` and stays generic across the
 * component so consumers keep type-safety on `value`, `onChange`,
 * and each `option.value`. Same shape as `SelectOption` /
 * `MultiSelectOption` / `RadioOption`.
 */
export interface SelectBottomSheetOption<Value extends string = string> {
  value: Value;
  label: string;
}

/**
 * Trigger border-radius selector. Alias for the shared
 * `RadiusValue` union.
 */
export type SelectBottomSheetRadius = RadiusValue;

/**
 * Per-instance override input for `<SelectBottomSheet>`. Partial
 * of the full `SelectBottomSheetColors` palette; missing slots
 * fall through to the provider-resolved defaults.
 */
export type SelectBottomSheetColorsInput = Partial<SelectBottomSheetColors>;

/**
 * Sheet snap-point selector. Numbers are treated as pixel heights;
 * strings are treated as percentages ("50%", "85%") — matches the
 * `@gorhom/bottom-sheet` convention.
 */
export type SelectBottomSheetSnapPoint = string | number;

/**
 * `SelectBottomSheetProps` re-declares only the props we own.
 * Every Tamagui style prop that `StyledSelectBottomSheet` (the
 * outer YStack) accepts flows through the `...rest` spread with
 * types inferred from `GetProps<typeof StyledSelectBottomSheet>`.
 */
export interface SelectBottomSheetProps<Value extends string = string> extends Omit<
  GetProps<typeof StyledSelectBottomSheet>,
  "children" | "onChange"
> {
  /** Options rendered inside the sheet list, in array order. */
  options: SelectBottomSheetOption<Value>[];
  /**
   * Current value, or `null` when no option is selected.
   * Controlled — consumer holds state and updates via `onChange`.
   */
  value: Value | null;
  /** Fires with the picked value when a sheet row is tapped. */
  onChange: (value: Value) => void;
  /** Optional bold heading above the trigger. */
  label?: string;
  /** Muted helper copy below the trigger. Overridden by `errorText`. */
  helperText?: string;
  /** Error copy below the trigger. Overrides `helperText`. */
  errorText?: string;
  /**
   * Placeholder text inside the trigger when `value` is `null`
   * (or doesn't match any option). Default: `"Select…"`.
   */
  placeholder?: string;
  /**
   * Optional bold title at the top of the sheet, above the option
   * list. When omitted the list is flush with the drag handle.
   */
  sheetTitle?: string;
  /**
   * Disable the trigger — the sheet will not open on press.
   */
  disabled?: boolean;
  /**
   * Disable a subset of options by value inside the sheet.
   */
  disabledOptions?: Value[];
  /**
   * Snap points for the sheet. Passed straight through to
   * `@gorhom/bottom-sheet` — see [[SelectBottomSheetSnapPoint]].
   * Defaults to `["50%"]` — one snap point at half the screen,
   * enough for ~6-8 options without scroll.
   */
  snapPoints?: SelectBottomSheetSnapPoint[];
  /** Trigger border radius. Defaults to `"md"`. */
  radius?: SelectBottomSheetRadius;
  /**
   * Per-instance color override. Missing slots fall through to
   * the provider-resolved palette.
   */
  selectBottomSheetColors?: SelectBottomSheetColorsInput;
  /**
   * Root testID. Sub-elements derive:
   * `{root}-label`, `{root}-trigger`, `{root}-trigger-text`,
   * `{root}-helper-text`, `{root}-error-text`,
   * `{root}-sheet`, `{root}-sheet-title`, `{root}-sheet-list`,
   * `{root}-option-{value}`, `{root}-option-{value}-label`,
   * `{root}-missing-peer`.
   */
  testID?: string;
}
