import type { ComponentType, ReactNode, Ref } from "react";
import type { TextInput, TextInputProps } from "react-native";

import type { InputColors } from "../../tokens/tokens-types";

/**
 * Border radius selector. Same shape as `ButtonRadius` / `AlertRadius` /
 * `RadioRadius` for consistency across the kit: preset names resolve to
 * the theme scale, `"pill"` is fully rounded, a raw number is passed
 * through as pixels. Applies to the input wrapper.
 */
export type InputRadius = number | "none" | "sm" | "md" | "lg" | "pill";

/**
 * Per-instance override input for `<Input>`. Partial of the full
 * `InputColors` palette — every slot optional; missing slots fall
 * through to the provider-resolved defaults.
 */
export type InputColorsInput = Partial<InputColors>;

/**
 * `InputProps` re-declares only the props we own or override. Every RN
 * `TextInputProps` (minus `style`) flows through the `...rest` spread —
 * `placeholder`, `keyboardType`, `secureTextEntry`, `autoCapitalize`,
 * `autoCorrect`, `autoFocus`, `maxLength`, `onSubmitEditing`,
 * `returnKeyType`, `accessibilityLabel`, etc. — with types inferred from
 * `Omit<TextInputProps, "style">`.
 */
export interface InputProps extends Omit<TextInputProps, "style"> {
  /** Controlled value. */
  value: string;
  /** Fires on every keystroke. */
  onChangeText: (value: string) => void;
  /**
   * Optional bold label rendered above the input. Also becomes the
   * `accessibilityLabel` on the wrapper when provided.
   */
  label?: string;
  /**
   * Optional muted helper text rendered below the input. Hidden when
   * `error` is set (error message takes precedence in that row).
   */
  helperText?: string;
  /**
   * Error message. When set (non-empty), activates the error border
   * style and replaces `helperText` in the row below the input.
   */
  error?: string;
  /** Optional leading icon slot. Consumer brings their own icon. */
  leftIcon?: ReactNode;
  /** Optional trailing icon slot. Consumer brings their own icon. */
  rightIcon?: ReactNode;
  /** Disables editing + focus and dims the surface. Sets `editable={false}`. */
  disabled?: boolean;
  /** Border radius on the input wrapper. Default: `"md"`. */
  radius?: InputRadius;
  /**
   * Alternate `TextInput` implementation. Defaults to RN `TextInput`.
   * Pass `BottomSheetTextInput` from `@gorhom/bottom-sheet` when the
   * input renders inside a bottom sheet so the keyboard-avoidance
   * behaviour attached to that sheet handles focus correctly. Type
   * widens `ComponentType<TextInputProps>` with a `ref?` slot so
   * consumers can pass either a plain functional component or a
   * `forwardRef`-based one.
   */
  InputComponent?: ComponentType<TextInputProps & { ref?: Ref<TextInput> }>;
  /**
   * Per-instance color override. Missing slots fall through to the
   * provider-resolved palette. Enables brand-color inputs without
   * touching the provider.
   */
  inputColors?: InputColorsInput;
  /**
   * Root testID. Sub-elements derive:
   * `{testID}-label`, `{testID}-wrapper`, `{testID}-input`,
   * `{testID}-left-icon`, `{testID}-right-icon`,
   * `{testID}-helper`, `{testID}-error`.
   */
  testID?: string;
}
