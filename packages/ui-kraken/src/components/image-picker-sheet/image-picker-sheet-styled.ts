import { Text as TamaguiText, XStack, YStack, styled } from "tamagui";

/**
 * Bold title above the action rows. Rendered when `sheetTitle`
 * is passed (or the default "Choose photo").
 */
export const StyledImagePickerSheetTitle = styled(TamaguiText, {
  name: "UIKitImagePickerSheetTitle",
  fontSize: 15,
  lineHeight: 20,
  fontWeight: "600",
  paddingHorizontal: 20,
  paddingVertical: 12,
  textAlign: "center",
});

/**
 * Container that stacks all three action rows vertically with
 * dividers between them.
 */
export const StyledImagePickerSheetActionList = styled(YStack, {
  name: "UIKitImagePickerSheetActionList",
});

/**
 * Single action row — pressable, full-width, with left-aligned
 * icon slot + label. Colors injected inline from the shell.
 */
export const StyledImagePickerSheetAction = styled(XStack, {
  name: "UIKitImagePickerSheetAction",
  alignItems: "center",
  paddingHorizontal: 20,
  paddingVertical: 16,
  gap: 12,
  minHeight: 56,
});

/**
 * Label text inside an action row.
 */
export const StyledImagePickerSheetActionLabel = styled(TamaguiText, {
  name: "UIKitImagePickerSheetActionLabel",
  fontSize: 16,
  lineHeight: 22,
  fontWeight: "500",
  flex: 1,
});

/**
 * Icon container inside an action row. Fixed width so labels
 * align across rows even when some have icons and some don't.
 */
export const StyledImagePickerSheetActionIcon = styled(YStack, {
  name: "UIKitImagePickerSheetActionIcon",
  width: 24,
  alignItems: "center",
  justifyContent: "center",
});

/**
 * Thin divider between action rows.
 */
export const StyledImagePickerSheetDivider = styled(YStack, {
  name: "UIKitImagePickerSheetDivider",
  height: 1,
});

/**
 * Fallback text rendered when `expo-image-picker` isn't
 * installed. Wrapping trigger is the consumer's Button that
 * called `ref.current?.present()` — we render this INSIDE the
 * BottomSheet body when the sheet opens.
 */
export const StyledImagePickerSheetMissingPeer = styled(TamaguiText, {
  name: "UIKitImagePickerSheetMissingPeer",
  fontSize: 13,
  lineHeight: 18,
  fontWeight: "500",
  paddingHorizontal: 20,
  paddingVertical: 24,
  textAlign: "center",
});
