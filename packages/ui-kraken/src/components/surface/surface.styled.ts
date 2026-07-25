import { YStack, styled } from "tamagui";

/**
 * Root styled component — a plain `YStack` with no default flex,
 * padding, or border radius. Everything visual is either resolved at
 * runtime in `surface.tsx` (backgroundColor from the level palette)
 * or flows through as a Tamagui pass-through prop.
 */
export const StyledSurface = styled(YStack, {
  name: "UIKitSurface",
});
