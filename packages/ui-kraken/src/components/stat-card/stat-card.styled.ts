import { Text as TamaguiText, View as TamaguiView, XStack, YStack, styled } from "tamagui";

/**
 * Root card surface — vertical stack. Padding + gap come from `$ui*`
 * tokens; color-related props (backgroundColor, borderRadius) are
 * driven at runtime from `stat-card.tsx` because they depend on the
 * resolved palette + `radius` prop.
 */
export const StyledStatCard = styled(YStack, {
  name: "UIKitStatCard",
  padding: "$uiSpacingMd",
  gap: "$uiSpacingSm",
});

/**
 * Top row — title on the left (flex 1), optional icon on the right
 * (fixed slot). Keeps the title truncating cleanly instead of pushing
 * the icon out of the card when the title is long.
 */
export const StyledStatCardHeader = styled(XStack, {
  name: "UIKitStatCardHeader",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "$uiSpacingSm",
});

/**
 * Small caption above the value. Colored from `stat-card.tsx` at
 * runtime. Font size matches `Text.caption` so titles read as
 * secondary copy across the kit.
 */
export const StyledStatCardTitle = styled(TamaguiText, {
  name: "UIKitStatCardTitle",
  fontSize: 12,
  lineHeight: 16,
  fontWeight: "500",
  flexShrink: 1,
});

/**
 * Fixed-size wrapper for the top-right icon slot. Same dimensions as
 * Alert's icon wrapper so consumers can reuse the same icon
 * components across primitives.
 */
export const StyledStatCardIconWrapper = styled(TamaguiView, {
  name: "UIKitStatCardIconWrapper",
  width: 24,
  height: 24,
  justifyContent: "center",
  alignItems: "center",
});

/**
 * The metric itself. Colored from `stat-card.tsx` at runtime. Large,
 * bold, tight line-height so it reads as the dominant element of the
 * card.
 */
export const StyledStatCardValue = styled(TamaguiText, {
  name: "UIKitStatCardValue",
  fontSize: 28,
  lineHeight: 32,
  fontWeight: "700",
});

/**
 * Bottom row — trend arrow + delta text on the left, description on
 * the right. Both slots optional.
 */
export const StyledStatCardFooter = styled(XStack, {
  name: "UIKitStatCardFooter",
  alignItems: "center",
  gap: "$uiSpacingSm",
});

/**
 * Trend group — the arrow + delta text render as an inline pair.
 * Colored from `stat-card.tsx` at runtime (trend-driven).
 */
export const StyledStatCardTrend = styled(XStack, {
  name: "UIKitStatCardTrend",
  alignItems: "center",
  gap: 4,
});

/**
 * The trend arrow glyph wrapper. Colored via the shared trend color
 * (`trendUp` / `trendDown` / `trendNeutral`).
 */
export const StyledStatCardTrendIcon = styled(TamaguiText, {
  name: "UIKitStatCardTrendIcon",
  fontSize: 12,
  lineHeight: 16,
  fontWeight: "700",
});

/**
 * Delta text next to the arrow. Same color as the arrow.
 */
export const StyledStatCardDelta = styled(TamaguiText, {
  name: "UIKitStatCardDelta",
  fontSize: 12,
  lineHeight: 16,
  fontWeight: "600",
});

/**
 * Optional description caption on the footer row. Colored from
 * `stat-card.tsx` at runtime.
 */
export const StyledStatCardDescription = styled(TamaguiText, {
  name: "UIKitStatCardDescription",
  fontSize: 12,
  lineHeight: 16,
  fontWeight: "400",
  flexShrink: 1,
});
