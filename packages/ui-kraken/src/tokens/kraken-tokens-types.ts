/**
 * Coarse token schema exposed to consumers of KrakenProvider. Six knobs cover
 * every ui-kraken component in v0.x. Hex-only in v0.1 — parser for rgb() /
 * named colors is deferred to a later minor (see docs/PLAN.md §2.6).
 */
export interface KrakenTokens {
  primaryColor: string;
  secondaryColor: string;
  textPrimaryColor: string;
  textSecondaryColor: string;
  radius: number;
  spacing: number;
}

/**
 * Result of `coarseToFineTokens`. Component styled files consume this shape
 * indirectly via Tamagui theme tokens named `$kraken*`. The internal shape
 * uses short keys for readability; the Tamagui token key is `kraken` + PascalCase(key).
 */
export interface ResolvedKrakenTokens {
  color: {
    primary3: string;
    primary9: string;
    primary10: string;
    primary11: string;
    secondary3: string;
    secondary9: string;
    secondary10: string;
    secondary11: string;
    danger9: string;
    danger10: string;
    textPrimary: string;
    textSecondary: string;
    textOnPrimary: string;
    textOnSecondary: string;
    textOnDanger: string;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    pill: number;
  };
  space: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}
