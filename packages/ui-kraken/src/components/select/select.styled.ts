import { Text as TamaguiText, XStack, YStack, styled } from "tamagui";

/**
 * Root container for the field. Column layout stacks label above
 * the trigger above the helper / error text — same shape as `Input`
 * and `MultiSelect` so a Select drops into an existing form layout
 * without any spacing tweaks.
 */
export const StyledSelect = styled(YStack, {
  name: "UIKitSelect",
  gap: "$uiSpacingSm",
});

/**
 * Bold label text (rendered when the `label` prop is passed).
 * Colored from `select.tsx` at runtime.
 */
export const StyledSelectLabel = styled(TamaguiText, {
  name: "UIKitSelectLabel",
  fontSize: 14,
  lineHeight: 20,
  fontWeight: "600",
  marginBottom: "$uiSpacingXs",
});

/**
 * The tappable trigger. Row layout with the selected-value text on
 * the left and a chevron on the right. Meets the 44 px minimum touch
 * target for iOS interactive controls. Background / border /
 * borderRadius come from `select.tsx` at runtime.
 */
export const StyledSelectTrigger = styled(XStack, {
  name: "UIKitSelectTrigger",
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
 * Selected-value text — the label of the currently-picked option, or
 * the placeholder copy when no value is set. Colored from
 * `select.tsx` at runtime.
 */
export const StyledSelectTriggerText = styled(TamaguiText, {
  name: "UIKitSelectTriggerText",
  fontSize: 15,
  lineHeight: 20,
  fontWeight: "500",
  flexShrink: 1,
});

/**
 * Trailing chevron. Rendered as text — the caret glyph avoids the
 * icon-peer-dep dance for a purely-decorative affordance.
 */
export const StyledSelectChevron = styled(TamaguiText, {
  name: "UIKitSelectChevron",
  fontSize: 12,
  lineHeight: 16,
  fontWeight: "700",
  marginLeft: "$uiSpacingSm",
});

/**
 * Muted helper text row below the trigger.
 */
export const StyledSelectHelperText = styled(TamaguiText, {
  name: "UIKitSelectHelperText",
  fontSize: 12,
  lineHeight: 16,
  fontWeight: "400",
  marginTop: "$uiSpacingXs",
});

/**
 * Error text row below the trigger. Same size as helper text;
 * color and semantics differ.
 */
export const StyledSelectErrorText = styled(TamaguiText, {
  name: "UIKitSelectErrorText",
  fontSize: 12,
  lineHeight: 16,
  fontWeight: "500",
  marginTop: "$uiSpacingXs",
});

/**
 * Full-screen backdrop behind the modal card. Centers the card and
 * absorbs taps to dismiss.
 */
export const StyledSelectOverlay = styled(XStack, {
  name: "UIKitSelectOverlay",
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: "$uiSpacingLg",
});

/**
 * Modal card panel. Rounded corners always, since the modal is
 * detached from its trigger and reads better with soft edges
 * regardless of the trigger `radius` setting.
 */
export const StyledSelectMenu = styled(YStack, {
  name: "UIKitSelectMenu",
  width: "100%",
  maxWidth: 420,
  maxHeight: "80%",
  borderRadius: "$uiRadiusLg",
  overflow: "hidden",
});

/**
 * Optional bold title rendered at the top of the modal card.
 */
export const StyledSelectMenuTitle = styled(TamaguiText, {
  name: "UIKitSelectMenuTitle",
  fontSize: 15,
  lineHeight: 20,
  fontWeight: "600",
  paddingHorizontal: "$uiSpacingMd",
  paddingTop: "$uiSpacingMd",
  paddingBottom: "$uiSpacingSm",
});

/**
 * A single option row inside the modal list. Meets the 44 px
 * minimum touch target. Background comes from `select.tsx` at
 * runtime (highlight for the currently-selected option).
 */
export const StyledSelectOption = styled(XStack, {
  name: "UIKitSelectOption",
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
 * Option row label. Colored from `select.tsx` at runtime.
 */
export const StyledSelectOptionLabel = styled(TamaguiText, {
  name: "UIKitSelectOptionLabel",
  fontSize: 15,
  lineHeight: 20,
  fontWeight: "500",
  flexShrink: 1,
});
