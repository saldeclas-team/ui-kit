import { Text as TamaguiText, XStack, YStack, styled } from "tamagui";

/**
 * Root container for the field. Column layout stacks label above
 * the trigger above the helper / error text. Same shape as Input
 * / Select / SegmentedControl so a DatePicker sitting next to
 * them in the same form column reads as visually aligned.
 */
export const StyledDatePicker = styled(YStack, {
  name: "UIKitDatePicker",
  gap: "$uiSpacingSm",
});

/**
 * Bold label rendered when the `label` prop is passed. Colored
 * from `date-picker.tsx` at runtime.
 */
export const StyledDatePickerLabel = styled(TamaguiText, {
  name: "UIKitDatePickerLabel",
  fontSize: 14,
  lineHeight: 20,
  fontWeight: "600",
  marginBottom: "$uiSpacingXs",
});

/**
 * Tappable trigger frame. Matches the visual weight of `<Input>`
 * (Input is 48px tall via minHeight; the DatePicker trigger
 * uses the same padding + a chevron on the right). Radius / colors
 * are injected inline from `date-picker.tsx` because they resolve
 * per-instance from the palette + `radius` prop.
 */
export const StyledDatePickerTrigger = styled(XStack, {
  name: "UIKitDatePickerTrigger",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 48,
  paddingHorizontal: 12,
  paddingVertical: 10,
  borderWidth: 1,
  gap: 8,
});

/**
 * The label / placeholder text inside the trigger. Font size /
 * weight match `<Input>`'s content so a DatePicker sitting next
 * to inputs in the same form reads flush.
 */
export const StyledDatePickerTriggerText = styled(TamaguiText, {
  name: "UIKitDatePickerTriggerText",
  fontSize: 16,
  lineHeight: 22,
  fontWeight: "400",
  flexShrink: 1,
});

/**
 * Chevron glyph rendered on the trailing edge of the trigger.
 * Uses a Unicode down-arrow so we don't pull in an icon lib for
 * one character; component consumers who want a custom glyph can
 * wrap `<DatePicker>` in their own layout — this component's
 * scope is date/time picking, not icon slotting.
 */
export const StyledDatePickerChevron = styled(TamaguiText, {
  name: "UIKitDatePickerChevron",
  fontSize: 12,
  lineHeight: 16,
  fontWeight: "600",
});

/**
 * Muted helper text row below the trigger.
 */
export const StyledDatePickerHelperText = styled(TamaguiText, {
  name: "UIKitDatePickerHelperText",
  fontSize: 12,
  lineHeight: 16,
  fontWeight: "400",
  marginTop: "$uiSpacingXs",
});

/**
 * Error text row below the trigger.
 */
export const StyledDatePickerErrorText = styled(TamaguiText, {
  name: "UIKitDatePickerErrorText",
  fontSize: 12,
  lineHeight: 16,
  fontWeight: "500",
  marginTop: "$uiSpacingXs",
});

/**
 * Fallback text rendered when the peer dep isn't installed.
 * Communicates the missing package + how to install without
 * crashing the app.
 */
export const StyledDatePickerMissingPeer = styled(TamaguiText, {
  name: "UIKitDatePickerMissingPeer",
  fontSize: 13,
  lineHeight: 18,
  fontWeight: "500",
});
