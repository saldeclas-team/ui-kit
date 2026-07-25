import type { ReactNode } from "react";
import type { GetProps } from "tamagui";

import type { ExternalLinkColors } from "../../tokens/tokens-types";
import type { StyledExternalLink } from "./external-link.styled";

/**
 * Per-instance override input for `<ExternalLink>`. Partial of the
 * full `ExternalLinkColors` palette; missing slots fall through to
 * the provider-resolved defaults.
 */
export type ExternalLinkColorsInput = Partial<ExternalLinkColors>;

/**
 * `ExternalLinkProps` re-declares only the props we own. Every
 * Tamagui style prop that `StyledExternalLink` (an XStack) accepts
 * flows through the `...rest` spread with types inferred from
 * `GetProps<typeof StyledExternalLink>` — padding, margin, width,
 * `hitSlop`, `pressRetentionOffset`, every accessibility prop, etc.
 */
export interface ExternalLinkProps extends Omit<
  GetProps<typeof StyledExternalLink>,
  "onPress" | "children"
> {
  /** URL to open. Required. */
  url: string;
  /**
   * Visible label. Strings auto-wrap in a styled underlined Text;
   * ReactNodes render as-is (for custom label layouts).
   */
  children: ReactNode;
  /** Optional leading icon slot. Any ReactNode; tone-tinted. */
  icon?: ReactNode;
  /**
   * Override for the default trailing arrow glyph (`↗`). Consumer
   * brings any ReactNode when their design system ships a specific
   * external-link icon.
   */
  trailingIcon?: ReactNode;
  /**
   * Hide the trailing icon entirely (useful for inline body-copy
   * links where a trailing arrow reads noisy).
   */
  hideTrailingIcon?: boolean;
  /** Disable the link (renders at 50% opacity, ignores taps). */
  disabled?: boolean;
  /**
   * Optional pre-open hook. Runs before the URL opens. Return
   * `false` (or a promise that resolves to `false`) to prevent the
   * default open behavior — useful for analytics guards or custom
   * URL rewriting.
   */
  onPress?: () => boolean | Promise<boolean> | void | Promise<void>;
  /**
   * Per-instance color override. Missing slots fall through to the
   * provider-resolved palette.
   */
  externalLinkColors?: ExternalLinkColorsInput;
  /**
   * Root testID. Sub-elements derive:
   * `{root}-icon`, `{root}-label`, `{root}-trailing-icon`.
   */
  testID?: string;
}
