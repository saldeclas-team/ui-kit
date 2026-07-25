import { Text as TamaguiText, View as TamaguiView, XStack, styled } from "tamagui";

/**
 * Root row — horizontal, icon on the left, content stack on the right.
 * Padding + gap come from `$ui*` tokens; color-related props
 * (background) are driven at runtime from `hint.tsx` because they
 * depend on the resolved tone + emphasis.
 *
 * Default spacing is compact (spacingSm vertical, spacingMd horizontal)
 * so a Hint below an Input reads as inline advisory rather than a
 * banner. The `dense` prop in `hint.tsx` swaps these for one step
 * tighter values.
 */
export const StyledHint = styled(XStack, {
  name: "UIKitHint",
  paddingHorizontal: "$uiSpacingMd",
  paddingVertical: "$uiSpacingSm",
  gap: "$uiSpacingSm",
  alignItems: "flex-start",
});

/**
 * Fixed-size wrapper for the icon slot so title / body alignment
 * stays predictable regardless of the icon glyph's intrinsic size.
 * Slightly smaller than Alert's 24×24 to fit Hint's tighter type
 * scale.
 */
export const StyledHintIconWrapper = styled(TamaguiView, {
  name: "UIKitHintIconWrapper",
  width: 20,
  height: 20,
  justifyContent: "center",
  alignItems: "center",
});

/**
 * Flex-1 column holding the title + body. `flexShrink: 1` lets long
 * body text wrap instead of overflowing the row when combined with
 * a narrow parent.
 */
export const StyledHintContent = styled(TamaguiView, {
  name: "UIKitHintContent",
  flex: 1,
  flexShrink: 1,
});

/**
 * Bold title. Colored from `hint.tsx` at runtime (tone-driven). Sits
 * one step below Alert's title size so Hint stays visually secondary.
 */
export const StyledHintTitle = styled(TamaguiText, {
  name: "UIKitHintTitle",
  fontSize: 13,
  lineHeight: 18,
  fontWeight: "600",
  marginBottom: 2,
});

/**
 * Body text. Colored from `hint.tsx` at runtime. Matches Text `caption`
 * defaults so a Hint next to a form field reads at the same weight as
 * the field's helper text.
 */
export const StyledHintBody = styled(TamaguiText, {
  name: "UIKitHintBody",
  fontSize: 12,
  lineHeight: 16,
  fontWeight: "400",
});
