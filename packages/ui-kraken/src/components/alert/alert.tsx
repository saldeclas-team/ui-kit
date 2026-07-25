import { forwardRef } from "react";
import type { ComponentRef } from "react";
import type { AccessibilityRole } from "react-native";

import { useUIKit } from "../../provider/use-ui-kit";
import type { TextColors } from "../../tokens/tokens-types";
import {
  StyledAlert,
  StyledAlertBody,
  StyledAlertContent,
  StyledAlertIconWrapper,
  StyledAlertTitle,
} from "./alert.styled";
import type { AlertColors, AlertProps, AlertRadius, AlertVariant } from "./alert-types";

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
  const palette = resolvePalette(variant, tokens.textColors, alertColors);
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
 * Resolve the effective 4-slot palette for a given variant + optional
 * per-instance override. Missing override fields fall through to the
 * variant-derived defaults (variant color at full opacity for
 * text/icon, at ~15% opacity for background).
 */
function resolvePalette(
  variant: AlertVariant,
  textColors: TextColors,
  override: AlertProps["alertColors"]
): AlertColors {
  const variantColor = textColors[VARIANT_TO_TEXT_SLOT[variant]];
  return {
    background: override?.background ?? withAlpha(variantColor, 0.15),
    border: override?.border,
    text: override?.text ?? variantColor,
    icon: override?.icon ?? variantColor,
  };
}

const VARIANT_TO_TEXT_SLOT: Record<AlertVariant, keyof TextColors> = {
  info: "info",
  success: "success",
  warning: "warning",
  danger: "danger",
};

const ACCESSIBILITY_ROLE: Record<AlertVariant, AccessibilityRole> = {
  info: "alert",
  success: "alert",
  warning: "alert",
  danger: "alert",
};

/**
 * Apply an alpha channel to a hex color. Supports `#RGB`, `#RRGGBB`,
 * and `#RRGGBBAA`. Non-hex inputs (rgb(), rgba(), named colors) are
 * returned as-is on the assumption the consumer already encoded any
 * desired alpha there.
 */
function withAlpha(color: string, alpha: number): string {
  const hexMatch = color.match(/^#([0-9a-f]{3,8})$/i);
  const raw = hexMatch?.[1];
  if (raw == null) return color;
  const clamped = Math.max(0, Math.min(1, alpha));
  const alphaHex = Math.round(clamped * 255)
    .toString(16)
    .padStart(2, "0");
  const normalized =
    raw.length === 3
      ? raw
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : raw.length === 6
        ? raw
        : raw.slice(0, 6);
  return `#${normalized}${alphaHex}`;
}

function resolveRadius(radius: AlertRadius): number | string | undefined {
  if (radius === "none") return 0;
  if (radius === "pill") return 9999;
  if (typeof radius === "number") return radius;
  const map: Record<Exclude<AlertRadius, "none" | "pill" | number>, string> = {
    sm: "$uiRadiusSm",
    md: "$uiRadiusMd",
    lg: "$uiRadiusLg",
  };
  return map[radius];
}

/**
 * The icon slot is `ReactNode` (consumer brings any icon component)
 * so we cannot style its color from CSS. This wrapper sets a `color`
 * on a plain `<Text>`-like container that MOST icon libraries pick
 * up via their `color` prop or inherited CSS `currentColor`. Falls
 * back gracefully — an icon that ignores color simply renders its
 * intrinsic color and Alert's palette does not apply to it.
 */
function IconTintOverride({
  color,
  children,
}: {
  color: string;
  children: React.ReactNode;
}): React.ReactNode {
  return <StyledAlertBody color={color}>{children}</StyledAlertBody>;
}

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

export type {
  AlertColors,
  AlertColorsInput,
  AlertProps,
  AlertRadius,
  AlertVariant,
} from "./alert-types";
