import { Text as TamaguiText, XStack, YStack, styled } from "tamagui";

/**
 * Root container for the field. Column layout stacks label above
 * the two triggers above the helper / error text. Same shape as
 * DatePicker / Input / Select so a DateRangePicker in the same
 * form column reads flush.
 */
export const StyledDateRangePicker = styled(YStack, {
  name: "UIKitDateRangePicker",
  gap: "$uiSpacingSm",
});

/**
 * Bold label rendered when the `label` prop is passed. Colored
 * from `date-range-picker.tsx` at runtime.
 */
export const StyledDateRangePickerLabel = styled(TamaguiText, {
  name: "UIKitDateRangePickerLabel",
  fontSize: 14,
  lineHeight: 20,
  fontWeight: "600",
  marginBottom: "$uiSpacingXs",
});

/**
 * Horizontal-layout row for the two triggers. Each child
 * DatePicker gets `flex: 1` so they split the row equally.
 */
export const StyledDateRangePickerHorizontalRow = styled(XStack, {
  name: "UIKitDateRangePickerHorizontalRow",
  alignItems: "flex-end",
  gap: "$uiSpacingSm",
});

/**
 * Vertical-layout stack for the two triggers.
 */
export const StyledDateRangePickerVerticalStack = styled(YStack, {
  name: "UIKitDateRangePickerVerticalStack",
  gap: "$uiSpacingSm",
});

/**
 * Separator glyph rendered between the two triggers in the
 * horizontal layout only. Uses `→` for date-range legibility
 * (matches how designers typically annotate ranges).
 */
export const StyledDateRangePickerSeparator = styled(TamaguiText, {
  name: "UIKitDateRangePickerSeparator",
  fontSize: 20,
  lineHeight: 24,
  fontWeight: "400",
  paddingBottom: 10,
});

/**
 * Muted helper text row below the range.
 */
export const StyledDateRangePickerHelperText = styled(TamaguiText, {
  name: "UIKitDateRangePickerHelperText",
  fontSize: 12,
  lineHeight: 16,
  fontWeight: "400",
  marginTop: "$uiSpacingXs",
});

/**
 * Error text row below the range.
 */
export const StyledDateRangePickerErrorText = styled(TamaguiText, {
  name: "UIKitDateRangePickerErrorText",
  fontSize: 12,
  lineHeight: 16,
  fontWeight: "500",
  marginTop: "$uiSpacingXs",
});
