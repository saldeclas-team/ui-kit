import { forwardRef } from "react";
import type { ComponentRef } from "react";
import type { AccessibilityRole } from "react-native";

import { IconTintOverride } from "../icon-tint-override";

import { useUIKit } from "../../provider/use-ui-kit";
import type { AlertColors, AlertVariantColors } from "../../tokens/tokens-types";
import { resolveRadius } from "../../utils/radius";
import {
  StyledAlert,
  StyledAlertBody,
  StyledAlertContent,
  StyledAlertIconWrapper,
  StyledAlertTitle,
} from "./alert.styled";
import type { AlertProps, AlertVariant, AlertVariantColorsInput } from "./alert-types";

type AlertRef = ComponentRef<typeof StyledAlert>;

/**
 * Standalone Alert primitive. Four semantic variants (info / success /
 * warning / danger), optional title + optional icon slot + optional
 * per-instance color override. Consumer brings their own icon — no
 * dependency on an icon library.
 *
 * Consumers usually reach it via the compound shortcuts (`Alert.Info`,
 * `Alert.Success`, ...); the top-level `<Alert>` also works with the
 * `variant` prop and defaults to `"info"`.
 */
const BaseAlert = forwardRef<AlertRef, AlertProps>(function BaseAlert(
  { variant = "info", title, children, icon, radius = "md", alertColors, testID, ...rest },
  ref
) {
  const { tokens } = useUIKit();
  const rootId = testID ?? "alert";
  const palette = resolvePalette(variant, tokens.alertColors, alertColors);
  const resolvedBorderRadius = resolveRadius(radius);

  return (
    <StyledAlert
      ref={ref}
      testID={rootId}
      backgroundColor={palette.background}
      borderColor={palette.border}
      borderWidth={palette.border != null ? 1 : undefined}
      borderRadius={resolvedBorderRadius}
      accessibilityRole={ACCESSIBILITY_ROLE[variant]}
      accessibilityLiveRegion={variant === "danger" ? "assertive" : "polite"}
      {...rest}
    >
      {icon != null ? (
        <StyledAlertIconWrapper testID={`${rootId}-icon`} style={{ opacity: 1 }}>
          <IconTintOverride color={palette.icon}>{icon}</IconTintOverride>
        </StyledAlertIconWrapper>
      ) : null}

      <StyledAlertContent>
        {title != null && title.length > 0 && (
          <StyledAlertTitle testID={`${rootId}-title`} color={palette.text}>
            {title}
          </StyledAlertTitle>
        )}
        {children != null && (
          <StyledAlertBody testID={`${rootId}-body`} color={palette.text}>
            {children}
          </StyledAlertBody>
        )}
      </StyledAlertContent>
    </StyledAlert>
  );
});

/**
 * Resolve the effective 4-slot palette for a given variant. Starts from
 * the provider-resolved `alertColors[variant]` block, then applies the
 * per-instance `alertColors?` override on top. Missing per-instance
 * fields fall through to the provider palette.
 */
function resolvePalette(
  variant: AlertVariant,
  alertColors: AlertColors,
  override: AlertVariantColorsInput | undefined
): AlertVariantColors {
  const base = alertColors[variant];
  if (override == null) return base;
  return {
    background: override.background ?? base.background,
    text: override.text ?? base.text,
    icon: override.icon ?? base.icon,
    border: override.border ?? base.border,
  };
}

const ACCESSIBILITY_ROLE: Record<AlertVariant, AccessibilityRole> = {
  info: "alert",
  success: "alert",
  warning: "alert",
  danger: "alert",
};

function makeVariantShortcut(variant: AlertVariant) {
  return forwardRef<AlertRef, AlertProps>(function AlertVariantShortcut(props, ref) {
    return <BaseAlert ref={ref} variant={variant} {...props} />;
  });
}

const AlertInfo = makeVariantShortcut("info");
const AlertSuccess = makeVariantShortcut("success");
const AlertWarning = makeVariantShortcut("warning");
const AlertDanger = makeVariantShortcut("danger");

/**
 * Dual export: `<Alert>message</Alert>` renders `variant="info"` by
 * default. `<Alert.Info>` / `<Alert.Success>` / `<Alert.Warning>` /
 * `<Alert.Danger>` are pre-configured shortcuts. Same pattern as
 * `Button.Primary` and `Text.H1`.
 */
export const Alert = Object.assign(BaseAlert, {
  Info: AlertInfo,
  Success: AlertSuccess,
  Warning: AlertWarning,
  Danger: AlertDanger,
});

export type { AlertProps, AlertRadius, AlertVariant, AlertVariantColorsInput } from "./alert-types";
