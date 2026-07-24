import { forwardRef } from "react";
import type { ComponentRef } from "react";

import { useUIKit } from "../../provider/use-ui-kit";
import { StyledText } from "./text.styled";
import type { TextColor, TextIntensity, TextProps, TextVariant } from "./text-types";

type TextRef = ComponentRef<typeof StyledText>;

/**
 * Standalone text primitive. 13 HTML-familiar variants (h1..h6, subtitle1/2,
 * body1/2, caption, overline, label), 14 semantic color slots, and an
 * optional intensity modulator.
 *
 * Consumers usually reach it via the compound shortcuts (`<Text.H1>`,
 * `<Text.Body1>`, …) — the top-level `<Text>` also works with the `variant`
 * prop and defaults to `"body2"`.
 *
 * Every RN Text prop and every Tamagui style prop flows through, so
 * `onPress`, `numberOfLines`, `selectable`, `textAlign`,
 * `adjustsFontSizeToFit`, `accessibilityLabel`, `padding`, `pressStyle`,
 * etc. all just work.
 */
const BaseText = forwardRef<TextRef, TextProps>(function BaseText(
  { children, variant = "body2", color = "primary", intensity = "normal", ...rest },
  ref
) {
  const { tokens } = useUIKit();
  const resolvedColor = resolveColor(color, tokens.textColors);
  const opacity = intensity === "subtle" ? 0.65 : 1;
  const weightBump = intensity === "strong" ? STRONG_WEIGHT_FOR_VARIANT[variant] : undefined;

  return (
    <StyledText
      ref={ref}
      variant={variant}
      color={resolvedColor}
      opacity={opacity}
      fontWeight={weightBump}
      {...rest}
    >
      {children}
    </StyledText>
  );
});

/**
 * If `color` matches one of the TextColors slot names, look it up in
 * the resolved theme tokens. Otherwise treat it as a raw color string (hex,
 * rgb, rgba, named color) and pass it straight through to the RN Text.
 */
function resolveColor(color: string, textColors: Record<TextColor, string>): string {
  if (color in textColors) return textColors[color as TextColor];
  return color;
}

/**
 * When `intensity="strong"`, bump the variant's base fontWeight one step.
 * Undefined means "keep the variant's default weight" (i.e. base was already
 * 700+ or intensity is normal/subtle).
 */
const STRONG_WEIGHT_FOR_VARIANT: Record<TextVariant, "600" | "700" | undefined> = {
  h1: undefined, // already 700
  h2: undefined, // already 700
  h3: undefined, // already 700
  h4: "700", // 600 → 700
  h5: "700",
  h6: "700",
  subtitle1: "700", // 500 → 700
  subtitle2: "700",
  body1: "600", // 400 → 600
  body2: "600",
  caption: "600",
  overline: "700",
  label: "700",
};

function makeVariantShortcut(variant: TextVariant) {
  return forwardRef<TextRef, TextProps>(function TextVariantShortcut(props, ref) {
    return <BaseText ref={ref} variant={variant} {...props} />;
  });
}

const TextH1 = makeVariantShortcut("h1");
const TextH2 = makeVariantShortcut("h2");
const TextH3 = makeVariantShortcut("h3");
const TextH4 = makeVariantShortcut("h4");
const TextH5 = makeVariantShortcut("h5");
const TextH6 = makeVariantShortcut("h6");
const TextSubtitle1 = makeVariantShortcut("subtitle1");
const TextSubtitle2 = makeVariantShortcut("subtitle2");
const TextBody1 = makeVariantShortcut("body1");
const TextBody2 = makeVariantShortcut("body2");
const TextCaption = makeVariantShortcut("caption");
const TextOverline = makeVariantShortcut("overline");
const TextLabel = makeVariantShortcut("label");

/**
 * Dual export: `<Text>Hello</Text>` renders `variant="body2"` by default.
 * `<Text.H1>` / `<Text.Body1>` / `<Text.Caption>` etc. are pre-configured
 * shortcuts for the 13 variants. Same pattern as `Button.Primary`.
 */
export const Text = Object.assign(BaseText, {
  H1: TextH1,
  H2: TextH2,
  H3: TextH3,
  H4: TextH4,
  H5: TextH5,
  H6: TextH6,
  Subtitle1: TextSubtitle1,
  Subtitle2: TextSubtitle2,
  Body1: TextBody1,
  Body2: TextBody2,
  Caption: TextCaption,
  Overline: TextOverline,
  Label: TextLabel,
});

export type { TextColor, TextIntensity, TextProps, TextVariant };
