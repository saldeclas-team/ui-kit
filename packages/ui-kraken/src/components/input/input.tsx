import { forwardRef, useCallback, useState } from "react";
import type { ComponentRef } from "react";
import { TextInput } from "react-native";
import type { TextInputProps } from "react-native";

type FocusHandlerArg = Parameters<NonNullable<TextInputProps["onFocus"]>>[0];

import { useUIKit } from "../../provider/use-ui-kit";
import type { InputColors } from "../../tokens/tokens-types";
import {
  StyledInputContainer,
  StyledInputError,
  StyledInputHelper,
  StyledInputIconSlot,
  StyledInputLabel,
  StyledInputWrapper,
} from "./input.styled";
import type { InputColorsInput, InputProps, InputRadius } from "./input-types";

type InputRef = ComponentRef<typeof TextInput>;

/**
 * Single-line text input. Wraps RN `TextInput`; every `TextInputProps`
 * (except `style`) flows through — placeholder, keyboardType,
 * secureTextEntry, autoCapitalize, maxLength, onSubmitEditing, etc.
 *
 * Palette derived from `tokens.inputColors` on the provider,
 * overridable per-instance via the `inputColors?` prop.
 *
 * `InputComponent` defaults to RN `TextInput`. Consumers pass an
 * alternate implementation (e.g. `BottomSheetTextInput` from
 * `@gorhom/bottom-sheet`) when the input renders inside a bottom
 * sheet.
 */
export const Input = forwardRef<InputRef, InputProps>(function Input(
  {
    value,
    onChangeText,
    label,
    helperText,
    error,
    leftIcon,
    rightIcon,
    disabled = false,
    radius = "md",
    InputComponent = TextInput,
    inputColors,
    testID,
    onFocus,
    onBlur,
    ...rest
  },
  ref
) {
  const { tokens } = useUIKit();
  const rootId = testID ?? "input";
  const palette = resolvePalette(tokens.inputColors, inputColors);
  const resolvedBorderRadius = resolveRadius(radius);
  const [isFocused, setIsFocused] = useState(false);

  const hasError = typeof error === "string" && error.length > 0;
  const borderColor = hasError
    ? palette.borderError
    : isFocused
      ? palette.borderFocused
      : palette.border;
  const backgroundColor = disabled ? palette.backgroundDisabled : palette.background;
  const textColor = disabled ? palette.textDisabled : palette.text;

  const handleFocus = useCallback(
    (event: FocusHandlerArg) => {
      setIsFocused(true);
      onFocus?.(event);
    },
    [onFocus]
  );

  const handleBlur = useCallback(
    (event: FocusHandlerArg) => {
      setIsFocused(false);
      onBlur?.(event);
    },
    [onBlur]
  );

  return (
    <StyledInputContainer testID={rootId}>
      {label != null && label.length > 0 && (
        <StyledInputLabel testID={`${rootId}-label`} color={palette.label}>
          {label}
        </StyledInputLabel>
      )}
      <StyledInputWrapper
        testID={`${rootId}-wrapper`}
        disabled={disabled}
        backgroundColor={backgroundColor}
        borderColor={borderColor}
        borderRadius={resolvedBorderRadius}
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
      >
        {leftIcon != null && (
          <StyledInputIconSlot testID={`${rootId}-left-icon`}>{leftIcon}</StyledInputIconSlot>
        )}
        <InputComponent
          ref={ref}
          testID={`${rootId}-input`}
          value={value}
          onChangeText={onChangeText}
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={palette.placeholder}
          style={{
            flex: 1,
            fontSize: 16,
            padding: 0,
            margin: 0,
            color: textColor,
          }}
          {...rest}
        />
        {rightIcon != null && (
          <StyledInputIconSlot testID={`${rootId}-right-icon`}>{rightIcon}</StyledInputIconSlot>
        )}
      </StyledInputWrapper>
      {hasError ? (
        <StyledInputError testID={`${rootId}-error`} color={palette.errorText}>
          {error}
        </StyledInputError>
      ) : helperText != null && helperText.length > 0 ? (
        <StyledInputHelper testID={`${rootId}-helper`} color={palette.helperText}>
          {helperText}
        </StyledInputHelper>
      ) : null}
    </StyledInputContainer>
  );
});

/**
 * Merge the per-instance `inputColors?` override on top of the
 * provider-resolved palette. Missing slots fall through.
 */
function resolvePalette(base: InputColors, override: InputColorsInput | undefined): InputColors {
  if (override == null) return base;
  return { ...base, ...override };
}

function resolveRadius(radius: InputRadius): number | string | undefined {
  if (radius === "none") return 0;
  if (radius === "pill") return 9999;
  if (typeof radius === "number") return radius;
  const map: Record<Exclude<InputRadius, "none" | "pill" | number>, string> = {
    sm: "$uiRadiusSm",
    md: "$uiRadiusMd",
    lg: "$uiRadiusLg",
  };
  return map[radius];
}

export type { InputColorsInput, InputProps, InputRadius } from "./input-types";
