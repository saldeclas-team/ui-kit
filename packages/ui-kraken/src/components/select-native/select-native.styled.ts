import { Text as TamaguiText, View, YStack, styled } from "tamagui";

/**
 * Root container for the field. Column layout stacks label above
 * the trigger frame above the helper / error text.
 */
export const StyledSelectNative = styled(YStack, {
  name: "UIKitSelectNative",
  gap: "$uiSpacingSm",
});

/**
 * Bold label text (rendered when the `label` prop is passed).
 * Colored from `select-native.tsx` at runtime.
 */
export const StyledSelectNativeLabel = styled(TamaguiText, {
  name: "UIKitSelectNativeLabel",
  fontSize: 14,
  lineHeight: 20,
  fontWeight: "600",
  marginBottom: "$uiSpacingXs",
});

/**
 * Wrapper frame around the native picker. Matches the 48 px min
 * height convention shared by `Input` / `CurrencyInput` so a
 * SelectNative in the same form column reads as aligned.
 *
 * The `@expo/ui` `<Host matchContents>` inside collapses to its
 * natural size — without this frame, native pickers sit flush
 * against neighboring fields and look cramped.
 */
export const StyledSelectNativeFrame = styled(View, {
  name: "UIKitSelectNativeFrame",
  minHeight: 48,
  paddingHorizontal: "$uiSpacingMd",
  paddingVertical: "$uiSpacingSm",
  borderWidth: 1,
  justifyContent: "center",

  variants: {
    disabled: {
      true: { opacity: 0.6 },
    },
  } as const,
});

/**
 * Muted helper text row below the frame.
 */
export const StyledSelectNativeHelperText = styled(TamaguiText, {
  name: "UIKitSelectNativeHelperText",
  fontSize: 12,
  lineHeight: 16,
  fontWeight: "400",
  marginTop: "$uiSpacingXs",
});

/**
 * Error text row below the frame. Same size as helper text;
 * color and semantics differ.
 */
export const StyledSelectNativeErrorText = styled(TamaguiText, {
  name: "UIKitSelectNativeErrorText",
  fontSize: 12,
  lineHeight: 16,
  fontWeight: "500",
  marginTop: "$uiSpacingXs",
});

/**
 * Fallback text rendered inside the frame when the `@expo/ui`
 * peer dep isn't installed. Communicates the missing dep and how
 * to install it, but doesn't crash the app.
 */
export const StyledSelectNativeMissingPeer = styled(TamaguiText, {
  name: "UIKitSelectNativeMissingPeer",
  fontSize: 13,
  lineHeight: 18,
  fontWeight: "500",
  textAlign: "center",
});
