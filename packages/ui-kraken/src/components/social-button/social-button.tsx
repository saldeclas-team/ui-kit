import { forwardRef } from "react";
import type { ComponentRef, ReactNode } from "react";
import { ActivityIndicator, View } from "react-native";

import { useUIKit } from "../../provider/use-ui-kit";
import type { SocialButtonColors, SocialButtonProviderColors } from "../../tokens/tokens-types";
import { resolveRadius } from "../../utils/radius";
import {
  StyledSocialButton,
  StyledSocialButtonIconWrapper,
  StyledSocialButtonLabel,
} from "./social-button.styled";
import type {
  SocialButtonColorsInput,
  SocialButtonProps,
  SocialButtonProvider,
} from "./social-button-types";

type SocialButtonRef = ComponentRef<typeof StyledSocialButton>;

/**
 * OAuth-provider button. Renders `"Continue with Google"` /
 * `"Sign in with Apple"` / etc. as a compact horizontal button
 * with the provider's logo on the left and a label on the right.
 *
 * Consumers usually reach it via the compound shortcuts
 * (`SocialButton.Google`, `SocialButton.Apple`, ...); the top-level
 * `<SocialButton>` also works with the `provider` prop.
 *
 * ```tsx
 * <SocialButton.Google
 *   onPress={handleGoogleSignIn}
 *   label="Continue with Google"
 *   icon={<GoogleLogo />}
 * />
 * ```
 *
 * Palette derived from `tokens.socialButtonColors` on the provider,
 * overridable per-instance via the `socialButtonColors?` prop.
 */
const BaseSocialButton = forwardRef<SocialButtonRef, SocialButtonProps>(function BaseSocialButton(
  {
    provider,
    label,
    icon,
    onPress,
    disabled = false,
    loading = false,
    size = "md",
    radius = "md",
    socialButtonColors,
    testID,
    accessibilityRole = "button",
    accessibilityLabel,
    accessibilityState,
    ...rest
  },
  ref
) {
  const { tokens } = useUIKit();
  const rootId = testID ?? "social-button";
  const palette = resolvePalette(provider, tokens.socialButtonColors, socialButtonColors);
  const resolvedBorderRadius = resolveRadius(radius);
  const isInactive = disabled || loading;

  return (
    <StyledSocialButton
      ref={ref}
      testID={rootId}
      size={size}
      disabled={isInactive}
      onPress={onPress}
      backgroundColor={palette.background}
      borderColor={palette.border}
      borderRadius={resolvedBorderRadius}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={accessibilityState ?? { disabled: isInactive, busy: loading }}
      {...rest}
    >
      {loading ? (
        <StyledSocialButtonIconWrapper testID={`${rootId}-loader`} size={size}>
          <ActivityIndicator color={palette.label} />
        </StyledSocialButtonIconWrapper>
      ) : icon != null ? (
        <StyledSocialButtonIconWrapper testID={`${rootId}-icon`} size={size}>
          <IconTintOverride color={palette.label}>{icon}</IconTintOverride>
        </StyledSocialButtonIconWrapper>
      ) : null}

      <StyledSocialButtonLabel testID={`${rootId}-label`} size={size} color={palette.label}>
        {label}
      </StyledSocialButtonLabel>
    </StyledSocialButton>
  );
});

/**
 * Resolve the effective 3-slot palette for a given provider. Starts
 * from the provider-resolved `socialButtonColors[provider]` block,
 * then applies the per-instance `socialButtonColors?` override on
 * top. Missing per-instance fields fall through.
 */
function resolvePalette(
  provider: SocialButtonProvider,
  socialButtonColors: SocialButtonColors,
  override: SocialButtonColorsInput | undefined
): SocialButtonProviderColors {
  const base = socialButtonColors[provider];
  if (override == null) return base;
  return {
    background: override.background ?? base.background,
    label: override.label ?? base.label,
    border: override.border ?? base.border,
  };
}

/**
 * Map the `radius` shorthand onto a `borderRadius` value. Numbers
 * and `"pill"` pass through directly; named preset values map onto
 * the theme's `$uiRadius*` token scale.
 */

/**
 * The icon slot is `ReactNode` (consumer brings any icon component)
 * so we cannot style its color from CSS. This wrapper sets a `color`
 * on a plain `<View>` container that MOST icon libraries pick up via
 * their `color` prop or inherited CSS `currentColor`. Falls back
 * gracefully — an icon that ignores color simply renders its
 * intrinsic color (which is usually the whole point for branded
 * logos like Google's multi-color G).
 */
function IconTintOverride({ color, children }: { color: string; children: ReactNode }): ReactNode {
  return <View style={{ ...({ color } as object) }}>{children}</View>;
}

function makeProviderShortcut(provider: SocialButtonProvider) {
  return forwardRef<SocialButtonRef, Omit<SocialButtonProps, "provider">>(
    function ProviderShortcut(props, ref) {
      return <BaseSocialButton ref={ref} provider={provider} {...props} />;
    }
  );
}

const SocialButtonGoogle = makeProviderShortcut("google");
const SocialButtonApple = makeProviderShortcut("apple");
const SocialButtonFacebook = makeProviderShortcut("facebook");
const SocialButtonGithub = makeProviderShortcut("github");
const SocialButtonMicrosoft = makeProviderShortcut("microsoft");
const SocialButtonGeneric = makeProviderShortcut("generic");

/**
 * Dual export: `<SocialButton provider="google" ...>` renders any
 * provider via the `provider` prop. `<SocialButton.Google>` /
 * `.Apple` / `.Facebook` / `.Github` / `.Microsoft` / `.Generic`
 * are pre-configured shortcuts for each default provider.
 */
export const SocialButton = Object.assign(BaseSocialButton, {
  Google: SocialButtonGoogle,
  Apple: SocialButtonApple,
  Facebook: SocialButtonFacebook,
  Github: SocialButtonGithub,
  Microsoft: SocialButtonMicrosoft,
  Generic: SocialButtonGeneric,
});

export type {
  SocialButtonColorsInput,
  SocialButtonProps,
  SocialButtonProvider,
  SocialButtonRadius,
  SocialButtonSize,
} from "./social-button-types";
