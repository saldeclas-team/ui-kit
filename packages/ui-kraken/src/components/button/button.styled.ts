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
    elevation: {
      none: {
        shadowColor: "transparent",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevationAndroid: 0,
      },
      sm: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevationAndroid: 1,
      },
      md: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevationAndroid: 3,
      },
      lg: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevationAndroid: 6,
      },
    },
  } as const,

  defaultVariants: {
    tone: "primary",
    size: "md",
    elevation: "none",
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
