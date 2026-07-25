import { Text as TamaguiText, View as TamaguiView, XStack, YStack, styled } from "tamagui";

/**
 * Root container — column stack holding the label, the visual wrapper,
 * and the helper / error text row. Mirrors `StyledInputContainer`.
 */
export const StyledCurrencyInputContainer = styled(YStack, {
  name: "UIKitCurrencyInputContainer",
  gap: "$uiSpacingXs",
});

/**
 * Bold label above the input. Coloured from `currency-input.tsx` at
 * runtime so per-instance `currencyInputColors.label` overrides land
 * here.
 */
export const StyledCurrencyInputLabel = styled(TamaguiText, {
  name: "UIKitCurrencyInputLabel",
  fontSize: 14,
  lineHeight: 20,
  fontWeight: "600",
});

/**
 * Visual wrapper around the prefix + input + icon row. Border +
 * background come from `currency-input.tsx` at runtime (state-driven).
 * Meets the 48 × 48 px minimum touch target.
 */
export const StyledCurrencyInputWrapper = styled(XStack, {
  name: "UIKitCurrencyInputWrapper",
  alignItems: "center",
  gap: "$uiSpacingSm",
  minHeight: 48,
  paddingHorizontal: "$uiSpacingMd",
  paddingVertical: "$uiSpacingSm",
  borderWidth: 1,

  variants: {
    disabled: {
      true: { opacity: 0.6 },
    },
  } as const,
});

/**
 * Currency prefix text (`"$"` / `"€"` / etc.). Coloured at runtime.
 * `fontWeight: 600` so the symbol reads as a distinct token next to
 * the numeric value.
 */
export const StyledCurrencyInputPrefix = styled(TamaguiText, {
  name: "UIKitCurrencyInputPrefix",
  fontSize: 16,
  lineHeight: 24,
  fontWeight: "600",
});

/**
 * Fixed-size wrapper for the left / right icon slots (matches
 * `StyledInputIconSlot`).
 */
export const StyledCurrencyInputIconSlot = styled(TamaguiView, {
  name: "UIKitCurrencyInputIconSlot",
  width: 20,
  height: 20,
  justifyContent: "center",
  alignItems: "center",
});

/**
 * Muted helper text below the input (rendered when `helperText` is
 * set and no error is active).
 */
export const StyledCurrencyInputHelper = styled(TamaguiText, {
  name: "UIKitCurrencyInputHelper",
  fontSize: 12,
  lineHeight: 16,
  fontWeight: "400",
});

/**
 * Error message below the input (rendered when `error` is a non-empty
 * string; replaces `StyledCurrencyInputHelper` in that row).
 */
export const StyledCurrencyInputError = styled(TamaguiText, {
  name: "UIKitCurrencyInputError",
  fontSize: 12,
  lineHeight: 16,
  fontWeight: "500",
});
