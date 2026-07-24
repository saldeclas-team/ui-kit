import { Text, View, styled } from "tamagui";

export const StyledButton = styled(View, {
  name: "KrakenButton",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: "$krakenSpacingSm",
  minHeight: 48,
  borderRadius: "$krakenRadiusMd",
  paddingHorizontal: "$krakenSpacingMd",
  pressStyle: { scale: 0.98, opacity: 0.9 },

  variants: {
    tone: {
      primary: {
        backgroundColor: "$krakenButtonPrimaryBackground",
        borderWidth: 0,
      },
      secondary: {
        backgroundColor: "$krakenButtonSecondaryBackground",
        borderWidth: 0,
      },
      outline: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "$krakenButtonOutlineBorder",
      },
      ghost: {
        backgroundColor: "transparent",
        borderWidth: 0,
      },
      destructive: {
        backgroundColor: "$krakenButtonDestructiveBackground",
        borderWidth: 0,
      },
    },
    size: {
      sm: {
        minHeight: 36,
        paddingHorizontal: "$krakenSpacingSm",
        borderRadius: "$krakenRadiusSm",
      },
      md: {
        minHeight: 48,
        paddingHorizontal: "$krakenSpacingMd",
        borderRadius: "$krakenRadiusMd",
      },
      lg: {
        minHeight: 56,
        paddingHorizontal: "$krakenSpacingLg",
        borderRadius: "$krakenRadiusLg",
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
    // shadow values, and it can react to `useKraken().activeTheme` — which
    // static styled() variants cannot.
  } as const,

  defaultVariants: {
    tone: "primary",
    size: "md",
  },
});

export const StyledButtonLabel = styled(Text, {
  name: "KrakenButtonLabel",
  fontWeight: "600",

  variants: {
    tone: {
      primary: { color: "$krakenButtonPrimaryLabel" },
      secondary: { color: "$krakenButtonSecondaryLabel" },
      outline: { color: "$krakenButtonOutlineLabel" },
      ghost: { color: "$krakenButtonGhostLabel" },
      destructive: { color: "$krakenButtonDestructiveLabel" },
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
