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
 * some values do `<UIKitProvider buttonColors={{ primary: {...} }}>` and the
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
 * Color slots for one Alert variant. All four semantic variants (info /
 * success / warning / danger) fill the same slot set. `background`, `text`,
 * and `icon` are required; `border` is optional (undefined = no border
 * renders on the row).
 *
 * There is no separate `disabled` slot — Alert is display-only in v1;
 * disabled state is not a concept. If a consumer needs a muted alert they
 * pass a per-instance `alertColors` override with lower-contrast values.
 */
export interface AlertVariantColors {
  /** Row background color. */
  background: string;
  /** Title + body text color. */
  text: string;
  /** Icon glyph color (applied via wrapper `color` prop). */
  icon: string;
  /** Optional border color. When set, a 1 px border renders. */
  border?: string;
}

/**
 * All Alert variant palettes. Every field is required at the provider level
 * so the theme is always fully populated. Consumers who only want to change
 * some variants do `<UIKitProvider alertColors={{ danger: {...} }}>` and the
 * missing variants merge with the defaults (see `mergeAlertColors`).
 */
export interface AlertColors {
  info: AlertVariantColors;
  success: AlertVariantColors;
  warning: AlertVariantColors;
  danger: AlertVariantColors;
}

/**
 * Input color palette. Slot-based (no variants — Input has a single
 * visual pattern with state-driven surface changes handled by the
 * component logic itself). 11 slots cover every surface + state
 * combination the wrapper and inner elements paint.
 */
export interface InputColors {
  /** Wrapper background color in the default and focused states. */
  background: string;
  /** Wrapper background color in the disabled state. */
  backgroundDisabled: string;
  /** Border color in the default state (unfocused, no error). */
  border: string;
  /** Border color when the input has focus. */
  borderFocused: string;
  /** Border color when `error` is set. Overrides `borderFocused`. */
  borderError: string;
  /** Text color for the value typed in the input. */
  text: string;
  /** Text color when `disabled`. */
  textDisabled: string;
  /** Placeholder text color. */
  placeholder: string;
  /** Bold label text color (rendered above the input). */
  label: string;
  /** Muted helper text color (rendered below the input when no error). */
  helperText: string;
  /** Error text color (rendered below the input when `error` is set). */
  errorText: string;
}

/**
 * Surface color palette. Slot-based, 4 semantic elevation levels each
 * with a single background color. Inspired by Material 3's
 * SurfaceContainer scale but simpler (4 levels, no auto-tint math, no
 * shadow bindings).
 */
export interface SurfaceColors {
  /** Standard app background. */
  base: string;
  /** Cards, list items, elevated content on top of the base surface. */
  raised: string;
  /** Modals, sheets, dropdowns — highest visual layer. */
  overlay: string;
  /** Inset areas — form sections, code blocks, muted regions. */
  sunken: string;
}

/**
 * CurrencyInput color palette. Slot-based. Mirrors `InputColors` plus a
 * `prefix` slot for the currency-symbol text color (the `"$"` / `"€"` /
 * etc. that renders inside the wrapper next to the number).
 */
export interface CurrencyInputColors {
  /** Wrapper background color in the default + focused states. */
  background: string;
  /** Wrapper background color in the disabled state. */
  backgroundDisabled: string;
  /** Border color in the default state (unfocused, no error). */
  border: string;
  /** Border color when the input has focus. */
  borderFocused: string;
  /** Border color when `error` is set. Overrides `borderFocused`. */
  borderError: string;
  /** Text color for the value typed in the input. */
  text: string;
  /** Text color when `disabled`. */
  textDisabled: string;
  /** Placeholder text color. */
  placeholder: string;
  /** Currency prefix text color (the "$" glyph inside the wrapper). */
  prefix: string;
  /** Bold label text color (rendered above the input). */
  label: string;
  /** Muted helper text color (rendered below the input when no error). */
  helperText: string;
  /** Error text color (rendered below the input when `error` is set). */
  errorText: string;
}

/**
 * RadioGroup color palette. Slot-based (no variants — RadioGroup has a
 * single visual pattern, just different states per option).
 *
 * - Selected + unselected borders paint both the outer row card and the
 *   inner ring around the dot — one color pair covers both surfaces.
 * - `dot` is the filled inner dot on the currently-selected option.
 * - `label` is the option label text; `groupLabel` is the bold heading
 *   above the group (rendered when the `label` prop is passed).
 * - Backgrounds are optional. Undefined means "transparent row".
 */
export interface RadioGroupColors {
  /** Ring border + row border when the option is selected. */
  selectedBorder: string;
  /** Ring border + row border when the option is NOT selected. */
  unselectedBorder: string;
  /** Inner filled dot on the selected option. */
  dot: string;
  /** Option label text color. */
  label: string;
  /** Group heading text color (the `label` prop on `<RadioGroup>`). */
  groupLabel: string;
  /** Subtle row background tint when option is selected. Optional. */
  selectedBackground?: string;
  /** Row background when option is NOT selected. Optional (transparent). */
  unselectedBackground?: string;
}

/**
 * Coarse token schema exposed to consumers of `<UIKitProvider>`.
 * Ships Button (`buttonColors`), Text (`textColors`), Alert
 * (`alertColors`), and RadioGroup (`radioGroupColors`) blocks. Future
 * minor releases will add `cardColors`, `inputColors`, etc. — grouped by
 * component role in the same way, one block per component that owns its
 * color space.
 */
export interface Tokens {
  buttonColors: ButtonColors;
  textColors: TextColors;
  alertColors: AlertColors;
  radioGroupColors: RadioGroupColors;
  inputColors: InputColors;
  currencyInputColors: CurrencyInputColors;
  surfaceColors: SurfaceColors;
  radius: number;
  spacing: number;
}

/**
 * Result of resolving the coarse schema into what components read at runtime.
 * Colors pass through as-is; kept as a separate type so we can add derived
 * scales later without breaking the provider contract.
 */
export interface ResolvedTokens {
  buttonColors: ButtonColors;
  textColors: TextColors;
  alertColors: AlertColors;
  radioGroupColors: RadioGroupColors;
  inputColors: InputColors;
  currencyInputColors: CurrencyInputColors;
  surfaceColors: SurfaceColors;
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
