import { forwardRef } from "react";
import type { ComponentRef } from "react";
import { ActivityIndicator, View } from "react-native";

import { StyledButton, StyledButtonLabel } from "./button.styled";
import type { ButtonProps, ButtonTone } from "./button-types";

type ButtonRef = ComponentRef<typeof StyledButton>;

/**
 * Compound Button. Consumers usually reach it via `Button.Primary`,
 * `Button.Secondary`, `Button.Ghost`, `Button.Destructive` — the top-level
 * `Button` is aliased to `Button.Primary` for the common case.
 *
 * Per-instance color overrides use grouped role props (see AGENTS.md and the
 * component skill): `buttonColors`, `textColors`, `iconColors`. Anything not
 * overridden falls through to the theme tokens provided by `KrakenProvider`.
 */
const BaseButton = forwardRef<ButtonRef, ButtonProps>(function BaseButton(
  {
    children,
    tone = "primary",
    size = "md",
    disabled,
    loading,
    leftIcon,
    rightIcon,
    buttonColors,
    textColors,
    iconColors,
    testID,
    ...rest
  },
  ref
) {
  const rootId = testID ?? "button";
  const isInactive = Boolean(disabled) || Boolean(loading);
  const backgroundOverride = pickColor(buttonColors, tone, disabled, loading);
  const labelColorOverride = pickColor(textColors, tone, disabled);
  const iconTintOverride = pickColor(iconColors, tone, disabled);

  return (
    <StyledButton
      ref={ref}
      testID={rootId}
      tone={tone}
      size={size}
      disabled={isInactive}
      backgroundColor={backgroundOverride}
      accessibilityRole="button"
      accessibilityState={{ disabled: isInactive, busy: Boolean(loading) }}
      {...rest}
    >
      {loading ? (
        <View testID={`${rootId}-loader`}>
          <ActivityIndicator color={iconTintOverride ?? undefined} />
        </View>
      ) : leftIcon != null ? (
        <View testID={`${rootId}-left-icon`}>{leftIcon}</View>
      ) : null}

      {children != null && (
        <StyledButtonLabel
          testID={`${rootId}-label`}
          tone={tone}
          size={size}
          color={labelColorOverride}
        >
          {children}
        </StyledButtonLabel>
      )}

      {rightIcon != null && !loading && <View testID={`${rootId}-right-icon`}>{rightIcon}</View>}
    </StyledButton>
  );
});

/**
 * Pick the effective color for a given tone from a grouped-color override
 * object. Precedence: state-specific slot (`disabled`, `loading`) wins over
 * tone-specific slot. Returns `undefined` when nothing overrides the theme.
 */
function pickColor(
  colors: { primary?: string; secondary?: string; disabled?: string; loading?: string } | undefined,
  tone: ButtonTone,
  disabled?: boolean,
  loading?: boolean
): string | undefined {
  if (colors == null) return undefined;
  if (loading === true && colors.loading != null) return colors.loading;
  if (disabled === true && colors.disabled != null) return colors.disabled;
  if (tone === "primary" || tone === "ghost" || tone === "destructive") return colors.primary;
  if (tone === "secondary") return colors.secondary;
  return undefined;
}

function makeToneVariant(tone: ButtonTone) {
  return forwardRef<ButtonRef, ButtonProps>(function ToneVariant(props, ref) {
    return <BaseButton ref={ref} tone={tone} {...props} />;
  });
}

const ButtonPrimary = makeToneVariant("primary");
const ButtonSecondary = makeToneVariant("secondary");
const ButtonGhost = makeToneVariant("ghost");
const ButtonDestructive = makeToneVariant("destructive");

/**
 * Dual export: `<Button>Save</Button>` behaves like `<Button.Primary>Save</Button.Primary>`
 * for the 80% case, and `Button.Primary` / `.Secondary` / `.Ghost` / `.Destructive`
 * work as compound variants for the 20%. See the component skill for rationale.
 */
export const Button = Object.assign(ButtonPrimary, {
  Primary: ButtonPrimary,
  Secondary: ButtonSecondary,
  Ghost: ButtonGhost,
  Destructive: ButtonDestructive,
});
