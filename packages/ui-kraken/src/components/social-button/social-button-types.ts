import type { ReactNode } from "react";
import type { GetProps } from "tamagui";

import type { SocialButtonProviderColors } from "../../tokens/tokens-types";
import type { StyledSocialButton } from "./social-button.styled";

/**
 * OAuth provider identifier. Drives the resolved palette lookup +
 * the compound-shortcut default (`SocialButton.Google` picks
 * `"google"`).
 *
 * `generic` is a brand-agnostic fallback for providers not in the
 * default set (custom SSO, LinkedIn, X, Discord, GitLab, ...) —
 * consumers can also override any per-provider palette via the
 * per-instance `socialButtonColors` prop.
 */
export type SocialButtonProvider =
  "google" | "apple" | "facebook" | "github" | "microsoft" | "generic";

/**
 * Size variant. Same scale as Button (40 / 48 / 56 px min-height).
 */
export type SocialButtonSize = "sm" | "md" | "lg";

/**
 * Border radius selector. Same shape as `ButtonRadius`: preset names
 * resolve to the theme scale, `"pill"` is fully rounded, a raw
 * number is passed through as pixels.
 */
export type SocialButtonRadius = number | "none" | "sm" | "md" | "lg" | "pill";

/**
 * Per-instance override input for `<SocialButton>`. Partial of one
 * provider's slots — the provider is already picked (via the
 * `provider` prop or a compound shortcut like `SocialButton.Google`),
 * so this only needs the slots inside that provider, all optional.
 * Missing slots fall through to the provider-resolved palette.
 */
export type SocialButtonColorsInput = Partial<SocialButtonProviderColors>;

/**
 * `SocialButtonProps` re-declares only the props we own. Every
 * Tamagui style prop that `StyledSocialButton` accepts flows through
 * the `...rest` spread with types inferred from
 * `GetProps<typeof StyledSocialButton>`.
 */
export interface SocialButtonProps extends Omit<
  GetProps<typeof StyledSocialButton>,
  "children" | "onPress"
> {
  /** OAuth provider. Drives the resolved palette + compound-shortcut default. */
  provider: SocialButtonProvider;
  /** Button label (e.g. `"Continue with Google"`). Localized by the consumer. */
  label: string;
  /**
   * Provider logo. Consumer brings any ReactNode; SocialButton does
   * NOT ship logos (trademark + icon-library choice).
   */
  icon?: ReactNode;
  /** Standard press handler. */
  onPress?: () => void;
  /** Disable the button (renders at 45% opacity, ignores taps). */
  disabled?: boolean;
  /**
   * Show a loading spinner in place of the icon. Also disables the
   * press to prevent double-submits.
   */
  loading?: boolean;
  /** Size variant. Defaults to `"md"` (48 px min-height). */
  size?: SocialButtonSize;
  /** Border radius. Defaults to `"md"`. */
  radius?: SocialButtonRadius;
  /**
   * Per-instance color override for THIS button's resolved provider.
   * Missing slots fall through to the provider-resolved palette.
   */
  socialButtonColors?: SocialButtonColorsInput;
  /**
   * Root testID. Sub-elements derive:
   * `{root}-icon`, `{root}-label`, `{root}-loader`.
   */
  testID?: string;
}
