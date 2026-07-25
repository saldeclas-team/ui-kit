import type { GetProps } from "tamagui";

import type { MultiSelectColors } from "../../tokens/tokens-types";
import type { StyledMultiSelect } from "./multi-select.styled";

/**
 * One selectable chip.
 *
 * `Value` defaults to `string` and stays generic across the component
 * so consumers keep type-safety on `value`, `onChange`, and each
 * `option.value`. Same generic slot as `RadioOption` for API
 * symmetry — swapping RadioGroup ↔ MultiSelect only requires
 * changing `value: Value` to `value: Value[]` and `onChange`
 * accordingly.
 */
export interface MultiSelectOption<Value extends string = string> {
  value: Value;
  label: string;
}

/**
 * Chip border-radius selector. Same shape as `RadioRadius` /
 * `AlertRadius` for consistency across the kit: preset names resolve
 * to the theme scale, `"pill"` is fully rounded, a raw number passes
 * through as pixels.
 */
export type MultiSelectRadius = number | "none" | "sm" | "md" | "lg" | "pill";

/**
 * Per-instance override input for `<MultiSelect>`. Partial of the
 * full `MultiSelectColors` palette; missing slots fall through to the
 * provider-resolved defaults.
 */
export type MultiSelectColorsInput = Partial<MultiSelectColors>;

/**
 * `MultiSelectProps` re-declares only the props we own. Every Tamagui
 * style prop that `StyledMultiSelect` (the outer YStack) accepts flows
 * through the `...rest` spread with types inferred from
 * `GetProps<typeof StyledMultiSelect>` — padding, margin, width,
 * pressStyle, shorthand aliases, etc.
 */
export interface MultiSelectProps<Value extends string = string> extends Omit<
  GetProps<typeof StyledMultiSelect>,
  "children" | "onChange"
> {
  /** Options rendered as chips (in array order). */
  options: MultiSelectOption<Value>[];
  /** Currently-selected values. Passed back mutated in `onChange`. */
  value: Value[];
  /** Fires on toggle with the next selection array (add or remove). */
  onChange: (value: Value[]) => void;
  /** Optional bold heading rendered above the chip row. */
  label?: string;
  /**
   * Muted helper copy below the chip row. Overridden by `errorText`
   * when set.
   */
  helperText?: string;
  /** Error copy below the chip row. Overrides `helperText`. */
  errorText?: string;
  /** Disable every chip. */
  disabled?: boolean;
  /**
   * Disable a subset of chips by value. Overrides individual chip
   * presses. Combined with `disabled` (either being true disables
   * the chip).
   */
  disabledOptions?: Value[];
  /**
   * Chip border radius. Defaults to `"pill"` — chips are the whole
   * point.
   */
  radius?: MultiSelectRadius;
  /**
   * Per-instance color override. Missing slots fall through to the
   * provider-resolved palette.
   */
  multiSelectColors?: MultiSelectColorsInput;
  /**
   * Root testID. Sub-elements derive:
   * `{root}-label`, `{root}-chips`,
   * `{root}-chip-{value}`, `{root}-chip-{value}-label`,
   * `{root}-helper-text`, `{root}-error-text`.
   */
  testID?: string;
}
