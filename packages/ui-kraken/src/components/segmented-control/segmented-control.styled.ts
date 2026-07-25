import { Text as TamaguiText, YStack, styled } from "tamagui";

/**
 * Root container for the field. Column layout stacks label above
 * the native control above the helper / error text. Same shape
 * as Input / Select / MultiSelect so a SegmentedControl next to
 * them in the same form column reads as visually aligned.
 */
export const StyledSegmentedControl = styled(YStack, {
  name: "UIKitSegmentedControl",
  gap: "$uiSpacingSm",
});

/**
 * Bold label rendered when the `label` prop is passed. Colored
 * from `segmented-control.tsx` at runtime.
 */
export const StyledSegmentedControlLabel = styled(TamaguiText, {
  name: "UIKitSegmentedControlLabel",
  fontSize: 14,
  lineHeight: 20,
  fontWeight: "600",
  marginBottom: "$uiSpacingXs",
});

/**
 * Muted helper text row below the control.
 */
export const StyledSegmentedControlHelperText = styled(TamaguiText, {
  name: "UIKitSegmentedControlHelperText",
  fontSize: 12,
  lineHeight: 16,
  fontWeight: "400",
  marginTop: "$uiSpacingXs",
});

/**
 * Error text row below the control.
 */
export const StyledSegmentedControlErrorText = styled(TamaguiText, {
  name: "UIKitSegmentedControlErrorText",
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
export const StyledSegmentedControlMissingPeer = styled(TamaguiText, {
  name: "UIKitSegmentedControlMissingPeer",
  fontSize: 13,
  lineHeight: 18,
  fontWeight: "500",
});
