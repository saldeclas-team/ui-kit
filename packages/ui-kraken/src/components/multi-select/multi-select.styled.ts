import { Text as TamaguiText, XStack, YStack, styled } from "tamagui";

/**
 * Root container for the group. Column layout stacks label above
 * the chip row above the helper / error text.
 */
export const StyledMultiSelect = styled(YStack, {
  name: "UIKitMultiSelect",
  gap: "$uiSpacingSm",
});

/**
 * Bold group heading (rendered when the `label` prop is passed).
 * Colored from `multi-select.tsx` at runtime.
 */
export const StyledMultiSelectGroupLabel = styled(TamaguiText, {
  name: "UIKitMultiSelectGroupLabel",
  fontSize: 14,
  lineHeight: 20,
  fontWeight: "600",
  marginBottom: "$uiSpacingXs",
});

/**
 * Wrap-container for the chip row. `flex-wrap: wrap` so long chip
 * lists gracefully break to multiple rows; the parent controls the
 * vertical room.
 */
export const StyledMultiSelectChips = styled(XStack, {
  name: "UIKitMultiSelectChips",
  flexWrap: "wrap",
  gap: "$uiSpacingSm",
});

/**
 * A single chip. Meets the 32 px minimum touch target on both axes
 * (RN's accessibility guideline for compact controls). Border /
 * background / borderRadius come from `multi-select.tsx` at runtime.
 * `pressStyle` gives a subtle scale + fade on tap so the interaction
 * reads as responsive without needing a native ripple.
 */
export const StyledMultiSelectChip = styled(XStack, {
  name: "UIKitMultiSelectChip",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 32,
  paddingHorizontal: "$uiSpacingMd",
  paddingVertical: "$uiSpacingXs",
  borderWidth: 1,
  pressStyle: { scale: 0.97, opacity: 0.85 },

  variants: {
    disabled: {
      true: { opacity: 0.5, pointerEvents: "none" },
    },
  } as const,
});

/**
 * Chip label text. Colored from `multi-select.tsx` at runtime.
 */
export const StyledMultiSelectChipLabel = styled(TamaguiText, {
  name: "UIKitMultiSelectChipLabel",
  fontSize: 13,
  lineHeight: 16,
  fontWeight: "500",
});

/**
 * Muted helper text row below the chip container.
 */
export const StyledMultiSelectHelperText = styled(TamaguiText, {
  name: "UIKitMultiSelectHelperText",
  fontSize: 12,
  lineHeight: 16,
  fontWeight: "400",
  marginTop: "$uiSpacingXs",
});

/**
 * Error text row below the chip container. Same size as helper text;
 * color and semantics differ.
 */
export const StyledMultiSelectErrorText = styled(TamaguiText, {
  name: "UIKitMultiSelectErrorText",
  fontSize: 12,
  lineHeight: 16,
  fontWeight: "500",
  marginTop: "$uiSpacingXs",
});
