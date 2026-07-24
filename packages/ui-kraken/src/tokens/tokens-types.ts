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
export interface ButtonVariantColors {
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
export interface ButtonColors {
  primary: ButtonVariantColors;
  secondary: ButtonVariantColors;
  outline: ButtonVariantColors;
  ghost: ButtonVariantColors;
  destructive: ButtonVariantColors;
}

/**
 * Text-color palette exposed to standalone `<Text>` components. Fourteen
 * slots grouped in three semantic buckets:
 *
 * - **Hierarchy (5)** — `primary`, `secondary`, `tertiary`, `disabled`, `inverse`.
 *   For content on standard app surfaces. `inverse` is the text color meant
 *   for a surface whose background contrasts against the active theme
 *   (e.g. dark text on a light card in dark mode).
 * - **Semantic (5)** — `interactive`, `success`, `warning`, `danger`, `info`.
 *   Meaning-carrying slots for links, feedback messages, etc.
 * - **On-* (4)** — `onPrimary`, `onSecondary`, `onSuccess`, `onDanger`. Text
 *   colors used specifically when the text sits on top of a solid brand
 *   surface (e.g. label inside a filled Button, text on a Toast). Auto-contrast
 *   is intentionally NOT applied — consumers pick the right `on-*` explicitly.
 */
export interface TextColors {
  primary: string;
  secondary: string;
  tertiary: string;
  disabled: string;
  inverse: string;
  interactive: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  onPrimary: string;
  onSecondary: string;
  onSuccess: string;
  onDanger: string;
}

/**
 * Coarse token schema exposed to consumers of `<KrakenProvider>`.
 * v0.3 ships Button (`buttonColors`) + Text (`textColors`). Future minor
 * releases will add `cardColors`, `inputColors`, etc. — grouped by component
 * role in the same way.
 */
export interface Tokens {
  buttonColors: ButtonColors;
  textColors: TextColors;
  radius: number;
  spacing: number;
}

/**
 * Result of resolving the coarse schema into what components read at runtime.
 * Colors pass through as-is in v0.3; kept as a separate type so we can add
 * derived scales later without breaking the provider contract.
 */
export interface ResolvedTokens {
  buttonColors: ButtonColors;
  textColors: TextColors;
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
