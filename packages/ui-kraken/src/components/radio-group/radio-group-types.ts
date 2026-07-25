import type { GetProps } from "tamagui";

import type { RadioGroupColors } from "../../tokens/tokens-types";
import type { StyledRadioGroup } from "./radio-group.styled";

/**
 * One option in a `RadioGroup`. Generic in `T` so the consumer keeps
 * type-safety on the `value` identity across the group.
 */
export interface RadioOption<T extends string = string> {
  value: T;
  label: string;
}

/**
 * Layout direction for the option rows. `"vertical"` is the mobile
 * default (stacked cards); `"horizontal"` is for tight segmented pickers
 * like "S / M / L".
 */
export type RadioOrientation = "vertical" | "horizontal";

/**
 * Border radius selector. Same shape as `ButtonRadius` / `AlertRadius`
 * for consistency across the kit: preset names resolve to the theme
 * scale, `"pill"` is fully rounded, a raw number is passed through as
 * pixels. Applies to each option ROW, not to the ring around the dot
 * (that stays perfectly circular).
 */
export type RadioRadius = number | "none" | "sm" | "md" | "lg" | "pill";

/**
 * Per-instance override input for `<RadioGroup>`. Partial of the full
 * `RadioGroupColors` palette — every slot optional; missing slots fall
 * through to the provider-resolved defaults.
 */
export type RadioGroupColorsInput = Partial<RadioGroupColors>;

/**
 * `RadioGroupProps` re-declares only the props we own or override.
 * Every Tamagui style prop that `StyledRadioGroup` accepts flows
 * through the `...rest` spread with types inferred from
 * `GetProps<typeof StyledRadioGroup>`. `onChange` is omitted from the
 * spread base because Tamagui's Stack ships its own `onChange` typing
 * that would collide with ours.
 */
export interface RadioGroupProps<T extends string = string> extends Omit<
  GetProps<typeof StyledRadioGroup>,
  "children" | "onChange"
> {
  /** Controlled selection. `null` = nothing selected. */
  value: T | null;
  /** Fires on tap of an unselected option. Never fires for a tap on the already-selected option. */
  onChange: (value: T) => void;
  /** Enumerated choices. `label` is displayed; `value` is the identity. */
  options: ReadonlyArray<RadioOption<T>>;
  /** Optional bold heading rendered above the group. */
  label?: string;
  /** Disables every option at once. Per-option disabling is a Non-goal for v1. */
  disabled?: boolean;
  /** Layout direction. Default: `"vertical"`. */
  orientation?: RadioOrientation;
  /** Border radius on each option row. Default: `"md"`. */
  radius?: RadioRadius;
  /**
   * Per-instance color override. Missing slots fall through to the
   * provider-resolved palette. Enables brand-color radios without
   * touching the provider.
   */
  radioGroupColors?: RadioGroupColorsInput;
  /**
   * Root testID. Sub-elements derive:
   * `{testID}-label`, `{testID}-option-{value}`,
   * `{testID}-option-{value}-circle`, `{testID}-option-{value}-dot`,
   * `{testID}-option-{value}-label`.
   */
  testID?: string;
}
