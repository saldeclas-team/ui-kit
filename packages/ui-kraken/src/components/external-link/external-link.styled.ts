import { Text as TamaguiText, View as TamaguiView, XStack, styled } from "tamagui";

/**
 * Root row — horizontal, icon on the left (optional), label in the
 * middle, trailing arrow on the right (optional). Colors are driven
 * at runtime from `external-link.tsx` because they depend on the
 * resolved palette.
 */
export const StyledExternalLink = styled(XStack, {
  name: "UIKitExternalLink",
  alignItems: "center",
  gap: 4,
  pressStyle: { opacity: 0.7 },

  variants: {
    disabled: {
      true: { opacity: 0.5, pointerEvents: "none" },
    },
  } as const,
});

/**
 * Fixed-size wrapper for the leading icon slot.
 */
export const StyledExternalLinkIconWrapper = styled(TamaguiView, {
  name: "UIKitExternalLinkIconWrapper",
  width: 16,
  height: 16,
  justifyContent: "center",
  alignItems: "center",
});

/**
 * Fixed-size wrapper for the trailing icon slot (auto glyph or
 * consumer override).
 */
export const StyledExternalLinkTrailingIconWrapper = styled(TamaguiView, {
  name: "UIKitExternalLinkTrailingIconWrapper",
  width: 14,
  height: 14,
  justifyContent: "center",
  alignItems: "center",
});

/**
 * Label text. Colored from `external-link.tsx` at runtime. Underlined
 * via `textDecorationLine` — the underline color is derived from the
 * label color (via `textDecorationColor` on the runtime style).
 */
export const StyledExternalLinkLabel = styled(TamaguiText, {
  name: "UIKitExternalLinkLabel",
  fontSize: 14,
  lineHeight: 20,
  fontWeight: "500",
  textDecorationLine: "underline",
});
