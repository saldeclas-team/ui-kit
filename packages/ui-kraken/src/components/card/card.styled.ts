import { XStack, YStack, styled } from "tamagui";

/**
 * Card root — a `YStack` with layout defaults (padding, radius,
 * gap). The internal `<Surface>` handles the background color;
 * this styled component only carries layout. Consumers override
 * defaults via Tamagui pass-through props on `<Card>`.
 */
export const StyledCard = styled(YStack, {
  name: "UIKitCard",
  padding: 16,
  borderRadius: 12,
  gap: 12,
});

/**
 * `Card.Header` styled root — horizontal row, title on the left,
 * trailing action on the right. `padding=0` because Card's own
 * padding covers the outer inset.
 */
export const StyledCardHeader = styled(XStack, {
  name: "UIKitCardHeader",
  justifyContent: "space-between",
  alignItems: "center",
});

/**
 * `Card.Body` styled root — vertical stack for stacked paragraphs
 * / rows. Small default gap between direct children.
 */
export const StyledCardBody = styled(YStack, {
  name: "UIKitCardBody",
  gap: 8,
});

/**
 * `Card.Footer` styled root — horizontal row of action buttons,
 * right-aligned per iOS + Material convention.
 */
export const StyledCardFooter = styled(XStack, {
  name: "UIKitCardFooter",
  justifyContent: "flex-end",
  gap: 8,
});
