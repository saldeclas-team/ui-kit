import { Text as TamaguiText, View as TamaguiView, XStack, YStack, styled } from "tamagui";

/**
 * Root container — column stack holding the label, the visual wrapper,
 * and the helper / error text row.
 */
export const StyledInputContainer = styled(YStack, {
  name: "UIKitInputContainer",
  gap: "$uiSpacingXs",
});

/**
 * Bold label above the input. Coloured from `input.tsx` at runtime so
 * per-instance `inputColors.label` overrides land here.
 */
export const StyledInputLabel = styled(TamaguiText, {
  name: "UIKitInputLabel",
  fontSize: 14,
  lineHeight: 20,
  fontWeight: "600",
});

/**
 * The visual wrapper around the underlying `TextInput`. Border +
 * background come from `input.tsx` at runtime (state-driven). Meets
 * the 48 × 48 px minimum touch target so the input stays tap-friendly
 * even when the intrinsic text height would be smaller. `pressStyle`
 * intentionally NOT set — the wrapper is not itself pressable; the
 * inner `TextInput` handles focus on tap.
 */
export const StyledInputWrapper = styled(XStack, {
  name: "UIKitInputWrapper",
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
 * Fixed-size wrapper for the left / right icon slots. Keeps input
 * text alignment predictable regardless of the icon glyph's intrinsic
 * size (same pattern as `StyledAlertIconWrapper`).
 */
export const StyledInputIconSlot = styled(TamaguiView, {
  name: "UIKitInputIconSlot",
  width: 20,
  height: 20,
  justifyContent: "center",
  alignItems: "center",
});

/**
 * Muted helper text below the input (rendered when `helperText` is
 * set and no error is active).
 */
export const StyledInputHelper = styled(TamaguiText, {
  name: "UIKitInputHelper",
  fontSize: 12,
  lineHeight: 16,
  fontWeight: "400",
});

/**
 * Error message below the input (rendered when `error` is a non-empty
 * string; replaces `StyledInputHelper` in that row).
 */
export const StyledInputError = styled(TamaguiText, {
  name: "UIKitInputError",
  fontSize: 12,
  lineHeight: 16,
  fontWeight: "500",
});
