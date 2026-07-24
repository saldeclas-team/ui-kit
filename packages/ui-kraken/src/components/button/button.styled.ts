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
        backgroundColor: "$krakenPrimary9",
        borderWidth: 0,
      },
      secondary: {
        backgroundColor: "$krakenSecondary9",
        borderWidth: 0,
      },
      ghost: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "$krakenPrimary9",
      },
      destructive: {
        backgroundColor: "$krakenDanger9",
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
      primary: { color: "$krakenTextOnPrimary" },
      secondary: { color: "$krakenTextOnSecondary" },
      ghost: { color: "$krakenPrimary11" },
      destructive: { color: "$krakenTextOnDanger" },
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
