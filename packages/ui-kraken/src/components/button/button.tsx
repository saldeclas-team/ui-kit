import { forwardRef } from "react";
import type { ComponentRef } from "react";
import { ActivityIndicator, View } from "react-native";

import { useUIKit } from "../../provider/use-ui-kit";
import { resolveRadius } from "../../utils/radius";
import { StyledButton, StyledButtonLabel } from "./button.styled";
import type { ButtonElevation, ButtonProps, ButtonTone } from "./button-types";

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
  const elevationStyle = useElevationStyle(tone, elevation, buttonColors?.border);

  return (
    <StyledButton
      ref={ref}
      testID={rootId}
      tone={tone}
      size={size}
      disabled={isInactive}
      backgroundColor={buttonColors?.background}
      borderColor={buttonColors?.border ?? elevationStyle.borderColor}
      borderWidth={elevationStyle.borderWidth}
      borderRadius={resolvedBorderRadius}
      shadowColor={elevationStyle.shadowColor}
      shadowOpacity={elevationStyle.shadowOpacity}
      shadowRadius={elevationStyle.shadowRadius}
      shadowOffset={elevationStyle.shadowOffset}
      elevationAndroid={elevationStyle.elevationAndroid}
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

interface ElevationStyle {
  shadowColor: string;
  shadowOpacity: number;
  shadowRadius: number;
  shadowOffset: { width: number; height: number };
  elevationAndroid: number;
  borderColor: string | undefined;
  borderWidth: number | undefined;
}

/**
 * Compute the full shadow + border config for this Button. All elevation
 * values live here (not in the styled variant) so we can pick different
 * strategies per theme in one place:
 *
 * - **Light mode**: iOS uses `shadow*` props with strong opacity, Android
 *   uses native `elevation`. Both cast a black shadow that reads on white.
 * - **Dark mode**: black shadows are invisible against a dark surface, so
 *   we cancel every shadow / elevation prop and instead render a subtle
 *   translucent-white border whose opacity scales with the level.
 *
 * `outline` and `ghost` tones do not participate in the dark-border swap
 * because they already draw their own border. A per-instance
 * `buttonColors.border` override wins over the dark swap.
 */
function useElevationStyle(
  tone: ButtonTone,
  elevation: ButtonElevation,
  overrideBorder: string | undefined
): ElevationStyle {
  const { activeTheme } = useUIKit();
  const isDark = activeTheme === "dark";

  if (elevation === "none") return FLAT_ELEVATION;

  if (isDark) {
    const flat = { ...FLAT_ELEVATION };
    const canSwap = tone !== "outline" && tone !== "ghost" && overrideBorder == null;
    if (canSwap) {
      flat.borderColor = DARK_ELEVATION_BORDER[elevation];
      flat.borderWidth = 1;
    }
    return flat;
  }

  return LIGHT_ELEVATION[elevation];
}

const FLAT_ELEVATION: ElevationStyle = {
  shadowColor: "transparent",
  shadowOpacity: 0,
  shadowRadius: 0,
  shadowOffset: { width: 0, height: 0 },
  elevationAndroid: 0,
  borderColor: undefined,
  borderWidth: undefined,
};

const LIGHT_ELEVATION: Record<Exclude<ButtonElevation, "none">, ElevationStyle> = {
  sm: {
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevationAndroid: 2,
    borderColor: undefined,
    borderWidth: undefined,
  },
  md: {
    shadowColor: "#000000",
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevationAndroid: 4,
    borderColor: undefined,
    borderWidth: undefined,
  },
  lg: {
    shadowColor: "#000000",
    shadowOpacity: 0.24,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevationAndroid: 8,
    borderColor: undefined,
    borderWidth: undefined,
  },
};

const DARK_ELEVATION_BORDER: Record<Exclude<ButtonElevation, "none">, string> = {
  sm: "rgba(255,255,255,0.10)",
  md: "rgba(255,255,255,0.18)",
  lg: "rgba(255,255,255,0.28)",
};

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
