import { forwardRef } from "react";
import type { ComponentRef } from "react";
import { ActivityIndicator, View } from "react-native";

import { useKraken } from "../../provider/use-kraken";
import { StyledButton, StyledButtonLabel } from "./button.styled";
import type { ButtonElevation, ButtonProps, ButtonRadius, ButtonTone } from "./button-types";

type ButtonRef = ComponentRef<typeof StyledButton>;

/**
 * Compound Button. Consumers usually reach it via `Button.Primary`,
 * `Button.Secondary`, `Button.Outline`, `Button.Ghost`, `Button.Destructive`
 * — the top-level `Button` is aliased to `Button.Primary` for the common case.
 *
 * Per-instance color overrides use the `buttonColors` prop — same slots as the
 * provider-level palette for this variant (`{ background?, label, border? }`),
 * with every field optional. Missing slots fall through to the theme.
 */
const BaseButton = forwardRef<ButtonRef, ButtonProps>(function BaseButton(
  {
    children,
    tone = "primary",
    size = "md",
    radius,
    elevation = "none",
    disabled,
    loading,
    leftIcon,
    rightIcon,
    buttonColors,
    testID,
    ...rest
  },
  ref
) {
  const rootId = testID ?? "button";
  const isInactive = Boolean(disabled) || Boolean(loading);
  const resolvedBorderRadius = resolveRadius(radius);
  const darkBorder = useDarkElevationBorder(tone, elevation, buttonColors?.border);

  return (
    <StyledButton
      ref={ref}
      testID={rootId}
      tone={tone}
      size={size}
      elevation={elevation}
      disabled={isInactive}
      backgroundColor={buttonColors?.background}
      borderColor={buttonColors?.border ?? darkBorder?.color}
      borderWidth={darkBorder?.width}
      borderRadius={resolvedBorderRadius}
      accessibilityRole="button"
      accessibilityState={{ disabled: isInactive, busy: Boolean(loading) }}
      {...rest}
    >
      {loading ? (
        <View testID={`${rootId}-loader`}>
          <ActivityIndicator color={buttonColors?.label ?? undefined} />
        </View>
      ) : leftIcon != null ? (
        <View testID={`${rootId}-left-icon`}>{leftIcon}</View>
      ) : null}

      {children != null && (
        <StyledButtonLabel
          testID={`${rootId}-label`}
          tone={tone}
          size={size}
          color={buttonColors?.label}
        >
          {children}
        </StyledButtonLabel>
      )}

      {rightIcon != null && !loading && <View testID={`${rootId}-right-icon`}>{rightIcon}</View>}
    </StyledButton>
  );
});

/**
 * Dark-mode elevation swap. Black shadows are invisible on a dark surface, so
 * on dark tones we render a subtle translucent-white border whose opacity
 * scales with the elevation level. `outline` and `ghost` already control their
 * own border, and any per-instance `buttonColors.border` override wins over
 * this — we only apply the visual when we know we would otherwise render an
 * invisible shadow.
 */
function useDarkElevationBorder(
  tone: ButtonTone,
  elevation: ButtonElevation,
  overrideBorder: string | undefined
): { color: string; width: number } | undefined {
  const { activeTheme } = useKraken();
  if (activeTheme !== "dark") return undefined;
  if (elevation === "none") return undefined;
  if (tone === "outline" || tone === "ghost") return undefined;
  if (overrideBorder != null) return undefined;
  return { color: DARK_ELEVATION_BORDER[elevation], width: 1 };
}

const DARK_ELEVATION_BORDER: Record<Exclude<ButtonElevation, "none">, string> = {
  sm: "rgba(255,255,255,0.05)",
  md: "rgba(255,255,255,0.10)",
  lg: "rgba(255,255,255,0.15)",
};

/**
 * Resolve the `radius` prop to a value the styled `borderRadius` prop accepts.
 * Numeric values pass through unchanged. Presets map to Tamagui theme tokens
 * so they respect the consumer's coarse `radius` knob on `KrakenProvider`.
 * `"pill"` is the special "fully rounded" case. Returns `undefined` when the
 * prop is not provided so the size variant's default radius wins.
 */
function resolveRadius(radius: ButtonRadius | undefined): number | string | undefined {
  if (radius === undefined) return undefined;
  if (typeof radius === "number") return radius;
  if (radius === "none") return 0;
  if (radius === "pill") return 9999;
  const capitalized = radius.charAt(0).toUpperCase() + radius.slice(1);
  return `$krakenRadius${capitalized}`;
}

function makeToneVariant(tone: ButtonTone) {
  return forwardRef<ButtonRef, ButtonProps>(function ToneVariant(props, ref) {
    return <BaseButton ref={ref} tone={tone} {...props} />;
  });
}

const ButtonPrimary = makeToneVariant("primary");
const ButtonSecondary = makeToneVariant("secondary");
const ButtonOutline = makeToneVariant("outline");
const ButtonGhost = makeToneVariant("ghost");
const ButtonDestructive = makeToneVariant("destructive");

/**
 * Dual export: `<Button>Save</Button>` behaves like `<Button.Primary>Save</Button.Primary>`
 * for the 80% case, and `Button.Primary` / `.Secondary` / `.Outline` /
 * `.Ghost` / `.Destructive` work as compound variants for the 20%.
 */
export const Button = Object.assign(ButtonPrimary, {
  Primary: ButtonPrimary,
  Secondary: ButtonSecondary,
  Outline: ButtonOutline,
  Ghost: ButtonGhost,
  Destructive: ButtonDestructive,
});
