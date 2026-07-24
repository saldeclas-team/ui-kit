import { Text as TamaguiText, styled } from "tamagui";

/**
 * Styled Tamagui Text with our type-scale variants. Colors are NOT set here
 * — `text.tsx` resolves the `color` prop (slot name OR raw hex) at runtime
 * so the same component can accept either kind of input.
 */
export const StyledText = styled(TamaguiText, {
  name: "KrakenText",
  color: "$krakenTextPrimary",

  variants: {
    variant: {
      h1: { fontSize: 40, lineHeight: 48, fontWeight: "700" },
      h2: { fontSize: 32, lineHeight: 40, fontWeight: "700" },
      h3: { fontSize: 28, lineHeight: 36, fontWeight: "700" },
      h4: { fontSize: 24, lineHeight: 32, fontWeight: "600" },
      h5: { fontSize: 20, lineHeight: 28, fontWeight: "600" },
      h6: { fontSize: 18, lineHeight: 24, fontWeight: "600" },
      subtitle1: { fontSize: 16, lineHeight: 24, fontWeight: "500" },
      subtitle2: { fontSize: 14, lineHeight: 20, fontWeight: "500" },
      body1: { fontSize: 16, lineHeight: 24, fontWeight: "400" },
      body2: { fontSize: 14, lineHeight: 20, fontWeight: "400" },
      caption: { fontSize: 12, lineHeight: 16, fontWeight: "400" },
      overline: {
        fontSize: 10,
        lineHeight: 16,
        fontWeight: "500",
        textTransform: "uppercase",
        letterSpacing: 0.5,
      },
      label: { fontSize: 14, lineHeight: 20, fontWeight: "500" },
    },
  } as const,

  defaultVariants: {
    variant: "body2",
  },
});
