import { Text as TamaguiText, View as TamaguiView, XStack, YStack, styled } from "tamagui";

/**
 * Root container. Vertical stack (header on top, body below).
 * `overflow: hidden` clips the body's animated height slide so
 * expanding content doesn't paint outside the border-radius.
 * `borderColor` / `borderRadius` come from `collapsible.tsx` at
 * runtime.
 */
export const StyledCollapsible = styled(YStack, {
  name: "UIKitCollapsible",
  borderWidth: 1,
  overflow: "hidden",
});

/**
 * Header row — icon on the left, title in the middle (flex 1),
 * chevron on the right. Background / borders come from
 * `collapsible.tsx` at runtime.
 */
export const StyledCollapsibleHeader = styled(XStack, {
  name: "UIKitCollapsibleHeader",
  alignItems: "center",
  gap: "$uiSpacingSm",
  paddingHorizontal: "$uiSpacingMd",
  paddingVertical: "$uiSpacingSm",
  minHeight: 48,
  pressStyle: { opacity: 0.85 },

  variants: {
    disabled: {
      true: { opacity: 0.5, pointerEvents: "none" },
    },
  } as const,
});

/**
 * Fixed-size wrapper for the leading icon slot.
 */
export const StyledCollapsibleIconWrapper = styled(TamaguiView, {
  name: "UIKitCollapsibleIconWrapper",
  width: 20,
  height: 20,
  justifyContent: "center",
  alignItems: "center",
});

/**
 * Header title text. `flex: 1` lets long titles wrap. Color comes
 * from `collapsible.tsx` at runtime.
 */
export const StyledCollapsibleTitle = styled(TamaguiText, {
  name: "UIKitCollapsibleTitle",
  fontSize: 15,
  lineHeight: 20,
  fontWeight: "600",
  flex: 1,
  flexShrink: 1,
});

/**
 * Trailing chevron wrapper. Fixed 20x20 so the header layout stays
 * predictable regardless of the chevron glyph's intrinsic size.
 */
export const StyledCollapsibleChevronWrapper = styled(TamaguiView, {
  name: "UIKitCollapsibleChevronWrapper",
  width: 20,
  height: 20,
  justifyContent: "center",
  alignItems: "center",
});

/**
 * Body region wrapper. Padding + background come from
 * `collapsible.tsx` at runtime.
 */
export const StyledCollapsibleBody = styled(TamaguiView, {
  name: "UIKitCollapsibleBody",
  paddingHorizontal: "$uiSpacingMd",
  paddingVertical: "$uiSpacingMd",
});
