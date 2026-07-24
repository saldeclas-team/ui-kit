/**
 * Color slots for one Button variant. Each variant fills only the slots that
 * apply to it: `primary` / `secondary` / `destructive` use `background + label`;
 * `outline` uses `border + label`; `ghost` uses `label` only.
 *
 * There is no separate `inactive` / `disabled` slot — the Button component
 * applies `opacity: 0.45` when disabled or loading, which works uniformly
 * across every variant. If a consumer needs a truly custom disabled color
 * they can pass it per-instance via `buttonColors.background`.
 */
export interface KrakenButtonVariantColors {
  /** Surface color. Ignored by `outline` and `ghost`. */
  background?: string;
  /** Label / text color. Every variant uses this. */
  label: string;
  /** Border color. Only `outline` renders a border. */
  border?: string;
}

/**
 * All Button variant palettes. Every field is required at the provider level
 * so the theme is always fully populated. Consumers who only want to change
 * some values do `<KrakenProvider buttonColors={{ primary: {...} }}>` and the
 * missing variants merge with the defaults (see `mergeButtonColors`).
 */
export interface KrakenButtonColors {
  primary: KrakenButtonVariantColors;
  secondary: KrakenButtonVariantColors;
  outline: KrakenButtonVariantColors;
  ghost: KrakenButtonVariantColors;
  destructive: KrakenButtonVariantColors;
}

/**
 * Coarse token schema exposed to consumers of `<KrakenProvider>`.
 * v0.2 ships only what Button needs (`buttonColors` + `radius` + `spacing`).
 * Future minor releases will add `textColors`, `cardColors`, etc. — grouped
 * by component role in the same way.
 */
export interface KrakenTokens {
  buttonColors: KrakenButtonColors;
  radius: number;
  spacing: number;
}

/**
 * Result of resolving the coarse schema into what components read at runtime.
 * v0.2 the resolved shape is nearly identical to the input — kept as a
 * separate type so we can add derived scales later without breaking the
 * provider contract.
 */
export interface ResolvedKrakenTokens {
  buttonColors: KrakenButtonColors;
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
