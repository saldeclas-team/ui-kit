import { Text, View, styled } from "tamagui";

export const StyledButton = styled(View, {
  name: "UIKitButton",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: "$uiSpacingSm",
  minHeight: 48,
  borderRadius: "$uiRadiusMd",
  paddingHorizontal: "$uiSpacingMd",
  pressStyle: { scale: 0.98, opacity: 0.9 },

  variants: {
    tone: {
      primary: {
        backgroundColor: "$uiButtonPrimaryBackground",
        borderWidth: 0,
      },
      secondary: {
        backgroundColor: "$uiButtonSecondaryBackground",
        borderWidth: 0,
      },
      outline: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "$uiButtonOutlineBorder",
      },
      ghost: {
        backgroundColor: "transparent",
        borderWidth: 0,
      },
      destructive: {
        backgroundColor: "$uiButtonDestructiveBackground",
        borderWidth: 0,
      },
    },
    size: {
      sm: {
        minHeight: 36,
        paddingHorizontal: "$uiSpacingSm",
        borderRadius: "$uiRadiusSm",
      },
      md: {
        minHeight: 48,
        paddingHorizontal: "$uiSpacingMd",
        borderRadius: "$uiRadiusMd",
      },
      lg: {
        minHeight: 56,
        paddingHorizontal: "$uiSpacingLg",
        borderRadius: "$uiRadiusLg",
      },
    },
    disabled: {
      true: {
        opacity: 0.45,
        pointerEvents: "none",
      },
    },
    // NOTE: elevation lives in Button.tsx (theme-aware runtime). Keeping it
    // out of the styled variant means there is exactly ONE place to change
    // shadow values, and it can react to `useUIKit().activeTheme` — which
    // static styled() variants cannot.
  } as const,

  defaultVariants: {
    tone: "primary",
    size: "md",
  },
});

export const StyledButtonLabel = styled(Text, {
  name: "UIKitButtonLabel",
  fontWeight: "600",

  variants: {
    tone: {
      primary: { color: "$uiButtonPrimaryLabel" },
      secondary: { color: "$uiButtonSecondaryLabel" },
      outline: { color: "$uiButtonOutlineLabel" },
      ghost: { color: "$uiButtonGhostLabel" },
      destructive: { color: "$uiButtonDestructiveLabel" },
    },
    size: {
      sm: { fontSize: 13 },
      md: { fontSize: 15 },
      lg: { fontSize: 17 },
    },
  } as const,

  defaultVariants: {
    tone: "primary",
    size: "md",
  },
});
