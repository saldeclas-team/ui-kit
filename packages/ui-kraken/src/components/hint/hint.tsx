import { forwardRef } from "react";
import type { ComponentRef } from "react";

import { IconTintOverride } from "../icon-tint-override";

import { useUIKit } from "../../provider/use-ui-kit";
import type { HintColors, HintToneColors } from "../../tokens/tokens-types";
import {
  StyledHint,
  StyledHintBody,
  StyledHintContent,
  StyledHintIconWrapper,
  StyledHintTitle,
} from "./hint.styled";
import type { HintColorsInput, HintProps, HintTone } from "./hint-types";

type HintRef = ComponentRef<typeof StyledHint>;

/**
 * Inline contextual hint / tip row. Smaller and quieter than `Alert`
 * — use next to form fields, at the bottom of sections, or embedded
 * in a screen paragraph to guide the user with a short bit of copy.
 *
 * Five tones (neutral / info / success / warning / danger) share the
 * same 3-slot palette (text / icon / background). Two emphasis modes
 * (ghost / soft) toggle whether the background renders.
 *
 * Consumers usually reach it via the compound shortcuts (`Hint.Info`,
 * `Hint.Success`, `Hint.Warning`, `Hint.Danger`); the top-level `<Hint>`
 * also works with the `tone` prop and defaults to `"neutral"`.
 */
const BaseHint = forwardRef<HintRef, HintProps>(function BaseHint(
  {
    tone = "neutral",
    emphasis = "ghost",
    dense = false,
    icon,
    title,
    children,
    hintColors,
    testID,
    ...rest
  },
  ref
) {
  const { tokens } = useUIKit();
  const rootId = testID ?? "hint";
  const palette = resolvePalette(tone, tokens.hintColors, hintColors);
  const spacing = dense
    ? {
        paddingHorizontal: "$uiSpacingSm" as const,
        paddingVertical: "$uiSpacingXs" as const,
        gap: "$uiSpacingXs" as const,
      }
    : {};

  return (
    <StyledHint
      ref={ref}
      testID={rootId}
      backgroundColor={emphasis === "soft" ? palette.background : "transparent"}
      accessibilityRole="text"
      accessibilityLiveRegion={LIVE_REGION[tone]}
      {...spacing}
      {...rest}
    >
      {icon != null ? (
        <StyledHintIconWrapper testID={`${rootId}-icon`}>
          <IconTintOverride color={palette.icon}>{icon}</IconTintOverride>
        </StyledHintIconWrapper>
      ) : null}

      <StyledHintContent>
        {title != null && title.length > 0 && (
          <StyledHintTitle testID={`${rootId}-title`} color={palette.text}>
            {title}
          </StyledHintTitle>
        )}
        {children != null && (
          <StyledHintBody testID={`${rootId}-body`} color={palette.text}>
            {children}
          </StyledHintBody>
        )}
      </StyledHintContent>
    </StyledHint>
  );
});

/**
 * Resolve the effective 3-slot palette for a given tone. Starts from
 * the provider-resolved `hintColors[tone]` block, then applies the
 * per-instance `hintColors?` override on top. Missing per-instance
 * fields fall through.
 */
function resolvePalette(
  tone: HintTone,
  hintColors: HintColors,
  override: HintColorsInput | undefined
): HintToneColors {
  const base = hintColors[tone];
  if (override == null) return base;
  return {
    text: override.text ?? base.text,
    icon: override.icon ?? base.icon,
    background: override.background ?? base.background,
  };
}

const LIVE_REGION: Record<HintTone, "none" | "polite" | "assertive"> = {
  neutral: "none",
  info: "none",
  success: "none",
  warning: "polite",
  danger: "polite",
};

function makeToneShortcut(tone: HintTone) {
  return forwardRef<HintRef, HintProps>(function HintToneShortcut(props, ref) {
    return <BaseHint ref={ref} tone={tone} {...props} />;
  });
}

const HintInfo = makeToneShortcut("info");
const HintSuccess = makeToneShortcut("success");
const HintWarning = makeToneShortcut("warning");
const HintDanger = makeToneShortcut("danger");

/**
 * Dual export: `<Hint>message</Hint>` renders `tone="neutral"` by
 * default. `<Hint.Info>` / `<Hint.Success>` / `<Hint.Warning>` /
 * `<Hint.Danger>` are pre-configured shortcuts. Same pattern as
 * `Alert.Info` and `Button.Primary`.
 */
export const Hint = Object.assign(BaseHint, {
  Info: HintInfo,
  Success: HintSuccess,
  Warning: HintWarning,
  Danger: HintDanger,
});

export type { HintColorsInput, HintEmphasis, HintProps, HintTone } from "./hint-types";
