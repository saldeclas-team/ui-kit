import type { GetProps } from "tamagui";

import type { SelectColors } from "../../tokens/tokens-types";
import type { RadiusValue } from "../../utils/radius";
import type { StyledSelect } from "./select.styled";

/**
 * One selectable option in the picker.
 *
 * `Value` defaults to `string` and stays generic across the component
 * so consumers keep type-safety on `value`, `onChange`, and each
 * `option.value`. Same shape as `MultiSelectOption` / `RadioOption`
 * so consumers can trivially move a controlled form between the
 * single-choice, multi-choice, and picker variants.
 */
export interface SelectOption<Value extends string = string> {
  value: Value;
  label: string;
}

/**
 * Trigger border-radius selector. Alias for the shared `RadiusValue`
 * union — every component-with-radius primitive in ui-kraken shares
 * the same shape and the `resolveRadius` helper from `utils/radius`.
 */
export type SelectRadius = RadiusValue;

/**
 * Per-instance override input for `<Select>`. Partial of the full
 * `SelectColors` palette; missing slots fall through to the
 * provider-resolved defaults.
 */
export type SelectColorsInput = Partial<SelectColors>;

/**
 * `SelectProps` re-declares only the props we own. Every Tamagui
 * style prop that `StyledSelect` (the outer YStack) accepts flows
 * through the `...rest` spread with types inferred from
 * `GetProps<typeof StyledSelect>` — padding, margin, width, etc.
 */
export interface SelectProps<Value extends string = string> extends Omit<
  GetProps<typeof StyledSelect>,
  "children" | "onChange"
> {
  /** Options rendered inside the modal list (in array order). */
  options: SelectOption<Value>[];
  /**
   * Current value, or `null` when no option is selected. Controlled —
   * consumer holds state and updates via `onChange`.
   */
  value: Value | null;
  /** Fires with the picked value when a modal row is tapped. */
  onChange: (value: Value) => void;
  /** Optional bold heading rendered above the trigger. */
  label?: string;
  /**
   * Muted helper copy below the trigger. Overridden by `errorText`
   * when set.
   */
  helperText?: string;
  /** Error copy below the trigger. Overrides `helperText`. */
  errorText?: string;
  /**
   * Placeholder text rendered inside the trigger when `value` is
   * `null`. Defaults to `"Select…"`.
   */
  placeholder?: string;
  /**
   * Optional title rendered at the top of the modal card. When
   * omitted the title row is skipped entirely (the option list is
   * flush with the top of the card).
   */
  modalTitle?: string;
  /**
   * Disable the trigger — modal will not open on press.
   */
  disabled?: boolean;
  /**
   * Disable a subset of options by value inside the modal list.
   * Disabled options render greyed out and swallow their own press.
   */
  disabledOptions?: Value[];
  /** Trigger border radius. Defaults to `"md"`. */
  radius?: SelectRadius;
  /**
   * Per-instance color override. Missing slots fall through to the
   * provider-resolved palette.
   */
  selectColors?: SelectColorsInput;
  /**
   * Root testID. Sub-elements derive:
   * `{root}-label`, `{root}-trigger`, `{root}-trigger-text`,
   * `{root}-helper-text`, `{root}-error-text`,
   * `{root}-modal`, `{root}-modal-overlay`, `{root}-modal-title`,
   * `{root}-option-{value}`, `{root}-option-{value}-label`.
   */
  testID?: string;
}
