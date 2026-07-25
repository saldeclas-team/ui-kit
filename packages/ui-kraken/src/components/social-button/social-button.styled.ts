import { Text as TamaguiText, View as TamaguiView, XStack, styled } from "tamagui";

/**
 * Root row — horizontal with the icon on the left and label
 * centered. Padding + gap come from `$ui*` tokens; color-related
 * props (background, borderColor, borderRadius) are driven at
 * runtime from `social-button.tsx` because they depend on the
 * resolved provider palette + `radius` prop.
 *
 * `size` variant handles the height + horizontal padding + gap
 * scale (sm / md / lg → 40 / 48 / 56 px min-height).
 */
export const StyledSocialButton = styled(XStack, {
  name: "UIKitSocialButton",
  alignItems: "center",
  justifyContent: "center",
  gap: "$uiSpacingSm",
  minHeight: 48,
  paddingHorizontal: "$uiSpacingMd",
  borderWidth: 1,
  pressStyle: { scale: 0.98, opacity: 0.9 },

  variants: {
    size: {
      sm: {
        minHeight: 40,
        paddingHorizontal: "$uiSpacingSm",
        gap: "$uiSpacingXs",
      },
      md: {
        minHeight: 48,
        paddingHorizontal: "$uiSpacingMd",
        gap: "$uiSpacingSm",
      },
      lg: {
        minHeight: 56,
        paddingHorizontal: "$uiSpacingLg",
        gap: "$uiSpacingSm",
      },
    },
    disabled: {
      true: {
        opacity: 0.45,
        pointerEvents: "none",
      },
    },
  } as const,

  defaultVariants: {
    size: "md",
  },
});

/**
 * Fixed-size wrapper for the icon slot so the label alignment stays
 * predictable regardless of the icon glyph's intrinsic size. Sizes
 * with the button (18 / 20 / 24 px for sm / md / lg).
 */
export const StyledSocialButtonIconWrapper = styled(TamaguiView, {
  name: "UIKitSocialButtonIconWrapper",
  justifyContent: "center",
  alignItems: "center",

  variants: {
    size: {
      sm: { width: 18, height: 18 },
      md: { width: 20, height: 20 },
      lg: { width: 24, height: 24 },
    },
  } as const,

  defaultVariants: { size: "md" },
});

/**
 * Button label text. Colored from `social-button.tsx` at runtime
 * (provider-driven). `size` variant scales the font.
 */
export const StyledSocialButtonLabel = styled(TamaguiText, {
  name: "UIKitSocialButtonLabel",
  fontWeight: "600",

  variants: {
    size: {
      sm: { fontSize: 13, lineHeight: 16 },
      md: { fontSize: 15, lineHeight: 20 },
      lg: { fontSize: 17, lineHeight: 24 },
    },
  } as const,

  defaultVariants: { size: "md" },
});
