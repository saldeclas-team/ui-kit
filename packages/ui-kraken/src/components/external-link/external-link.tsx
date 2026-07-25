import { useCallback } from "react";
import type { ComponentRef, ReactNode } from "react";
import { Text } from "react-native";

import { useUIKit } from "../../provider/use-ui-kit";
import type { ExternalLinkColors } from "../../tokens/tokens-types";
import type { ExternalLinkColorsInput, ExternalLinkProps } from "./external-link-types";
import {
  StyledExternalLink,
  StyledExternalLinkIconWrapper,
  StyledExternalLinkLabel,
  StyledExternalLinkTrailingIconWrapper,
} from "./external-link.styled";
import { openExternalUrl } from "./open-url";

type ExternalLinkRef = ComponentRef<typeof StyledExternalLink>;

/**
 * Tappable link that opens a URL in the platform browser. Prefers an
 * in-app browser via `expo-web-browser` when installed; falls back to
 * RN `Linking.openURL` (system browser) otherwise. Router-agnostic —
 * does NOT depend on `expo-router` or `react-navigation`.
 *
 * ```tsx
 * <ExternalLink url="https://example.com">Read more</ExternalLink>
 * ```
 *
 * Palette derived from `tokens.externalLinkColors` on the provider,
 * overridable per-instance via the `externalLinkColors?` prop.
 */
export function ExternalLink({
  url,
  children,
  icon,
  trailingIcon,
  hideTrailingIcon = false,
  disabled = false,
  onPress,
  externalLinkColors,
  testID,
  accessibilityRole = "link",
  accessibilityLabel,
  ...rest
}: ExternalLinkProps) {
  const { tokens } = useUIKit();
  const rootId = testID ?? "external-link";
  const palette = resolvePalette(tokens.externalLinkColors, externalLinkColors);
  const composedLabel = accessibilityLabel ?? (typeof children === "string" ? children : url);

  const handlePress = useCallback(async () => {
    if (onPress) {
      const result = await onPress();
      if (result === false) return;
    }
    await openExternalUrl(url);
  }, [onPress, url]);

  return (
    <StyledExternalLink
      // Ref typing on Tamagui XStack forwards to the underlying host;
      // ExternalLinkRef is `ComponentRef<typeof StyledExternalLink>`.
      testID={rootId}
      disabled={disabled}
      onPress={handlePress}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={composedLabel}
      accessibilityState={disabled ? { disabled: true } : undefined}
      {...rest}
    >
      {icon != null ? (
        <StyledExternalLinkIconWrapper testID={`${rootId}-icon`}>
          <IconTintOverride color={palette.icon}>{icon}</IconTintOverride>
        </StyledExternalLinkIconWrapper>
      ) : null}

      {typeof children === "string" ? (
        <StyledExternalLinkLabel
          testID={`${rootId}-label`}
          color={palette.label}
          textDecorationColor={palette.label}
        >
          {children}
        </StyledExternalLinkLabel>
      ) : (
        <IconTintOverride color={palette.label} testID={`${rootId}-label`}>
          {children}
        </IconTintOverride>
      )}

      {!hideTrailingIcon && (
        <StyledExternalLinkTrailingIconWrapper testID={`${rootId}-trailing-icon`}>
          {trailingIcon ?? <Text style={{ color: palette.icon, fontWeight: "700" }}>↗</Text>}
        </StyledExternalLinkTrailingIconWrapper>
      )}
    </StyledExternalLink>
  );
}

/**
 * Merge the per-instance `externalLinkColors?` override on top of
 * the provider-resolved palette. Missing slots fall through.
 */
function resolvePalette(
  base: ExternalLinkColors,
  override: ExternalLinkColorsInput | undefined
): ExternalLinkColors {
  if (override == null) return base;
  return { ...base, ...override };
}

/**
 * The icon / children slots are `ReactNode` (consumer brings any
 * element) so we cannot style their color from CSS. This wrapper
 * sets a `color` on a plain `<Text>`-like container that MOST icon
 * libraries and Text children pick up via inheritance. Falls back
 * gracefully — content that ignores color renders as-is.
 */
function IconTintOverride({
  color,
  children,
  testID,
}: {
  color: string;
  children: ReactNode;
  testID?: string;
}): ReactNode {
  return (
    <Text testID={testID} style={{ color }}>
      {children}
    </Text>
  );
}

// Ref type re-exported for consumers who need it (e.g. focus() calls).
export type { ExternalLinkRef };

export type { ExternalLinkColorsInput, ExternalLinkProps } from "./external-link-types";
