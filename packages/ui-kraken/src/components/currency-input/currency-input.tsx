import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import type { ComponentRef } from "react";
import { TextInput } from "react-native";
import type { TextInputProps } from "react-native";

import { useUIKit } from "../../provider/use-ui-kit";
import type { CurrencyInputColors } from "../../tokens/tokens-types";
import {
  StyledCurrencyInputContainer,
  StyledCurrencyInputError,
  StyledCurrencyInputHelper,
  StyledCurrencyInputIconSlot,
  StyledCurrencyInputLabel,
  StyledCurrencyInputPrefix,
  StyledCurrencyInputWrapper,
} from "./currency-input.styled";
import type {
  CurrencyInputColorsInput,
  CurrencyInputProps,
  CurrencyInputRadius,
} from "./currency-input-types";
import { formatCurrency } from "./format-currency";
import { parseCurrency } from "./parse-currency";

type CurrencyInputRef = ComponentRef<typeof TextInput>;
type FocusHandlerArg = Parameters<NonNullable<TextInputProps["onFocus"]>>[0];

/**
 * Numeric input formatted as currency. Consumer stores a `number` in
 * their form state; the component owns all formatting and parsing.
 * Locale-aware separators (via `Intl.NumberFormat`), configurable
 * `decimals`, configurable `prefix` symbol.
 *
 * Palette derived from `tokens.currencyInputColors` on the provider,
 * overridable per-instance via the `currencyInputColors?` prop.
 */
export const CurrencyInput = forwardRef<CurrencyInputRef, CurrencyInputProps>(
  function CurrencyInput(
    {
      value,
      onChangeValue,
      label,
      helperText,
      error,
      prefix = "$",
      decimals = 0,
      locale = "en-US",
      leftIcon,
      rightIcon,
      disabled = false,
      radius = "md",
      InputComponent = TextInput,
      currencyInputColors,
      testID,
      onFocus,
      onBlur,
      ...rest
    },
    ref
  ) {
    const { tokens } = useUIKit();
    const rootId = testID ?? "currency-input";
    const palette = resolvePalette(tokens.currencyInputColors, currencyInputColors);
    const resolvedBorderRadius = resolveRadius(radius);
    const [isFocused, setIsFocused] = useState(false);
    const [display, setDisplay] = useState(() => formatCurrency(value, { locale, decimals }));
    // Guard against re-formatting the display in response to our own
    // emits — only re-sync when `value` changed EXTERNALLY (form reset,
    // parent state update, etc.). Without this, every keystroke would
    // race against itself.
    const lastEmittedRef = useRef<number | null>(value);

    useEffect(() => {
      if (value !== lastEmittedRef.current) {
        setDisplay(formatCurrency(value, { locale, decimals }));
        lastEmittedRef.current = value;
      }
    }, [value, locale, decimals]);

    const hasError = typeof error === "string" && error.length > 0;
    const borderColor = hasError
      ? palette.borderError
      : isFocused
        ? palette.borderFocused
        : palette.border;
    const backgroundColor = disabled ? palette.backgroundDisabled : palette.background;
    const textColor = disabled ? palette.textDisabled : palette.text;
    const keyboardType: TextInputProps["keyboardType"] =
      decimals === 0 ? "number-pad" : "decimal-pad";
    const hasPrefix = prefix.length > 0;

    const handleChangeText = useCallback(
      (text: string) => {
        const parsed = parseCurrency(text, { locale, decimals });
        setDisplay(formatCurrency(parsed, { locale, decimals }));
        lastEmittedRef.current = parsed;
        onChangeValue(parsed);
      },
      [onChangeValue, locale, decimals]
    );

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
      <StyledCurrencyInputContainer testID={rootId}>
        {label != null && label.length > 0 && (
          <StyledCurrencyInputLabel testID={`${rootId}-label`} color={palette.label}>
            {label}
          </StyledCurrencyInputLabel>
        )}
        <StyledCurrencyInputWrapper
          testID={`${rootId}-wrapper`}
          disabled={disabled}
          backgroundColor={backgroundColor}
          borderColor={borderColor}
          borderRadius={resolvedBorderRadius}
          accessibilityLabel={label}
          accessibilityState={{ disabled }}
        >
          {leftIcon != null && (
            <StyledCurrencyInputIconSlot testID={`${rootId}-left-icon`}>
              {leftIcon}
            </StyledCurrencyInputIconSlot>
          )}
          {hasPrefix && (
            <StyledCurrencyInputPrefix testID={`${rootId}-prefix`} color={palette.prefix}>
              {prefix}
            </StyledCurrencyInputPrefix>
          )}
          <InputComponent
            ref={ref}
            testID={`${rootId}-input`}
            value={display}
            onChangeText={handleChangeText}
            editable={!disabled}
            keyboardType={keyboardType}
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
            accessibilityValue={{ text: display }}
            {...rest}
          />
          {rightIcon != null && (
            <StyledCurrencyInputIconSlot testID={`${rootId}-right-icon`}>
              {rightIcon}
            </StyledCurrencyInputIconSlot>
          )}
        </StyledCurrencyInputWrapper>
        {hasError ? (
          <StyledCurrencyInputError testID={`${rootId}-error`} color={palette.errorText}>
            {error}
          </StyledCurrencyInputError>
        ) : helperText != null && helperText.length > 0 ? (
          <StyledCurrencyInputHelper testID={`${rootId}-helper`} color={palette.helperText}>
            {helperText}
          </StyledCurrencyInputHelper>
        ) : null}
      </StyledCurrencyInputContainer>
    );
  }
);

/**
 * Merge the per-instance `currencyInputColors?` override on top of the
 * provider-resolved palette. Missing slots fall through.
 */
function resolvePalette(
  base: CurrencyInputColors,
  override: CurrencyInputColorsInput | undefined
): CurrencyInputColors {
  if (override == null) return base;
  return { ...base, ...override };
}

function resolveRadius(radius: CurrencyInputRadius): number | string | undefined {
  if (radius === "none") return 0;
  if (radius === "pill") return 9999;
  if (typeof radius === "number") return radius;
  const map: Record<Exclude<CurrencyInputRadius, "none" | "pill" | number>, string> = {
    sm: "$uiRadiusSm",
    md: "$uiRadiusMd",
    lg: "$uiRadiusLg",
  };
  return map[radius];
}

export type {
  CurrencyInputColorsInput,
  CurrencyInputProps,
  CurrencyInputRadius,
} from "./currency-input-types";
