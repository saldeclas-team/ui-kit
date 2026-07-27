import { Text as TamaguiText, XStack, YStack, styled } from "tamagui";

/**
 * Root container for the field. Column layout stacks label above
 * the trigger above the helper / error text — same shape as
 * `Select` / `MultiSelect`.
 */
export const StyledSelectBottomSheet = styled(YStack, {
  name: "UIKitSelectBottomSheet",
  gap: "$uiSpacingSm",
});

/**
 * Bold label text (rendered when the `label` prop is passed).
 */
export const StyledSelectBottomSheetLabel = styled(TamaguiText, {
  name: "UIKitSelectBottomSheetLabel",
  fontSize: 14,
  lineHeight: 20,
  fontWeight: "600",
  marginBottom: "$uiSpacingXs",
});

/**
 * The tappable trigger. Row layout with the selected-value text
 * on the left and a chevron on the right. 44 px min touch target.
 */
export const StyledSelectBottomSheetTrigger = styled(XStack, {
  name: "UIKitSelectBottomSheetTrigger",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  paddingHorizontal: "$uiSpacingMd",
  paddingVertical: "$uiSpacingSm",
  borderWidth: 1,
  pressStyle: { opacity: 0.85 },

  variants: {
    disabled: {
      true: { opacity: 0.6, pointerEvents: "none" },
    },
  } as const,
});

/**
 * Selected-value text — the label of the currently-picked option,
 * or the placeholder when no value is set.
 */
export const StyledSelectBottomSheetTriggerText = styled(TamaguiText, {
  name: "UIKitSelectBottomSheetTriggerText",
  fontSize: 15,
  lineHeight: 20,
  fontWeight: "500",
  flexShrink: 1,
});

/**
 * Trailing chevron indicator — text glyph so we avoid needing
 * an icon peer dep for something decorative.
 */
export const StyledSelectBottomSheetChevron = styled(TamaguiText, {
  name: "UIKitSelectBottomSheetChevron",
  fontSize: 12,
  lineHeight: 16,
  fontWeight: "700",
  marginLeft: "$uiSpacingSm",
});

/**
 * Muted helper text row below the trigger.
 */
export const StyledSelectBottomSheetHelperText = styled(TamaguiText, {
  name: "UIKitSelectBottomSheetHelperText",
  fontSize: 12,
  lineHeight: 16,
  fontWeight: "400",
  marginTop: "$uiSpacingXs",
});

/**
 * Error text row below the trigger.
 */
export const StyledSelectBottomSheetErrorText = styled(TamaguiText, {
  name: "UIKitSelectBottomSheetErrorText",
  fontSize: 12,
  lineHeight: 16,
  fontWeight: "500",
  marginTop: "$uiSpacingXs",
});

/**
 * Optional bold title rendered at the top of the sheet, above
 * the option list.
 */
export const StyledSelectBottomSheetTitle = styled(TamaguiText, {
  name: "UIKitSelectBottomSheetTitle",
  fontSize: 15,
  lineHeight: 20,
  fontWeight: "600",
  paddingHorizontal: "$uiSpacingMd",
  paddingTop: "$uiSpacingSm",
  paddingBottom: "$uiSpacingSm",
});

/**
 * A single option row inside the sheet's option list. Meets the
 * 44 px min touch target.
 */
export const StyledSelectBottomSheetOption = styled(XStack, {
  name: "UIKitSelectBottomSheetOption",
  alignItems: "center",
  minHeight: 44,
  paddingHorizontal: "$uiSpacingMd",
  paddingVertical: "$uiSpacingSm",
  pressStyle: { opacity: 0.85 },

  variants: {
    disabled: {
      true: { opacity: 0.5, pointerEvents: "none" },
    },
  } as const,
});

/**
 * Option row label.
 */
export const StyledSelectBottomSheetOptionLabel = styled(TamaguiText, {
  name: "UIKitSelectBottomSheetOptionLabel",
  fontSize: 15,
  lineHeight: 20,
  fontWeight: "500",
  flexShrink: 1,
});

/**
 * Fallback text rendered inside the trigger when the peer deps
 * aren't installed. Renders the exact package names that need to
 * be installed for the sheet to work.
 */
export const StyledSelectBottomSheetMissingPeer = styled(TamaguiText, {
  name: "UIKitSelectBottomSheetMissingPeer",
  fontSize: 13,
  lineHeight: 18,
  fontWeight: "500",
});
