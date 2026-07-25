import { Text as TamaguiText, View as TamaguiView, XStack, styled } from "tamagui";

/**
 * Root surface — horizontal row with the icon on the left and the
 * content stack on the right. Radius / padding / gap come from
 * `$ui*` tokens; color-related props (background, borderColor) are
 * driven at runtime from `alert.tsx` because they depend on the
 * resolved variant + optional per-instance override.
 */
export const StyledAlert = styled(XStack, {
  name: "UIKitAlert",
  paddingHorizontal: "$uiSpacingMd",
  paddingVertical: "$uiSpacingSm",
  gap: "$uiSpacingSm",
  alignItems: "flex-start",
});

/**
 * Fixed-size wrapper for the icon slot so title / body alignment
 * stays predictable regardless of the icon glyph's intrinsic size.
 */
export const StyledAlertIconWrapper = styled(TamaguiView, {
  name: "UIKitAlertIconWrapper",
  width: 24,
  height: 24,
  justifyContent: "center",
  alignItems: "center",
});

/**
 * Flex-1 column holding the title + body. `flexShrink: 1` lets long
 * body text wrap instead of overflowing the row when combined with
 * a narrow parent.
 */
export const StyledAlertContent = styled(TamaguiView, {
  name: "UIKitAlertContent",
  flex: 1,
  flexShrink: 1,
});

/**
 * Bold title. Colored from `alert.tsx` at runtime (variant-driven).
 * fontSize matches Text `subtitle2`; fontWeight bumps to 600 to make
 * the title read as heading-y without needing a full Text.H6.
 */
export const StyledAlertTitle = styled(TamaguiText, {
  name: "UIKitAlertTitle",
  fontSize: 14,
  lineHeight: 20,
  fontWeight: "600",
  marginBottom: 2,
});

/**
 * Body text. Colored from `alert.tsx` at runtime. Matches Text `body2`
 * defaults so the body reads the same as any other body copy.
 */
export const StyledAlertBody = styled(TamaguiText, {
  name: "UIKitAlertBody",
  fontSize: 14,
  lineHeight: 20,
  fontWeight: "400",
});
