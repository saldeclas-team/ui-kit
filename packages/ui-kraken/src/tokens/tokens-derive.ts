import type {
  ButtonColors,
  ButtonVariantColors,
  TextColors,
  Tokens,
  ResolvedTokens,
} from "./tokens-types";

/**
 * Default light-mode Button palette. Tuned to work on a white / near-white
 * surface with WCAG AA contrast for the label color.
 */
export const DEFAULT_LIGHT_BUTTON_COLORS: ButtonColors = {
  primary: { background: "#2563EB", label: "#FFFFFF" },
  secondary: { background: "#0EA5E9", label: "#FFFFFF" },
  outline: { border: "#2563EB", label: "#2563EB" },
  ghost: { label: "#2563EB" },
  destructive: { background: "#DC2626", label: "#FFFFFF" },
};

/**
 * Default dark-mode Button palette. Uses lighter brand shades so they pop on
 * a dark surface, and inverts the label colors where needed for contrast.
 */
export const DEFAULT_DARK_BUTTON_COLORS: ButtonColors = {
  primary: { background: "#3B82F6", label: "#FFFFFF" },
  secondary: { background: "#38BDF8", label: "#0B0B0F" },
  outline: { border: "#60A5FA", label: "#60A5FA" },
  ghost: { label: "#60A5FA" },
  destructive: { background: "#EF4444", label: "#FFFFFF" },
};

/**
 * Default light-mode Text palette. Tuned for WCAG AA contrast on white
 * surfaces. Semantic colors mirror the brand primary (Blue-600) and the
 * standard Tailwind/Material palette for success / warning / danger / info.
 */
export const DEFAULT_LIGHT_TEXT_COLORS: TextColors = {
  primary: "#0B0B0F",
  secondary: "#5B6472",
  tertiary: "#9CA3AF",
  disabled: "#D1D5DB",
  inverse: "#FFFFFF",
  interactive: "#2563EB",
  success: "#059669",
  warning: "#D97706",
  danger: "#DC2626",
  info: "#0284C7",
  onPrimary: "#FFFFFF",
  onSecondary: "#FFFFFF",
  onSuccess: "#FFFFFF",
  onDanger: "#FFFFFF",
};

/**
 * Default dark-mode Text palette. Lighter brand hues, near-white foreground
 * text, gray-scale hierarchy adjusted for readability against dark surfaces.
 * `onSecondary` and `onSuccess` flip to near-black because the corresponding
 * dark-mode Button `background` for those variants is a light color.
 */
export const DEFAULT_DARK_TEXT_COLORS: TextColors = {
  primary: "#F5F5F7",
  secondary: "#9CA3AF",
  tertiary: "#6B7280",
  disabled: "#4B5563",
  inverse: "#0B0B0F",
  interactive: "#60A5FA",
  success: "#34D399",
  warning: "#FBBF24",
  danger: "#F87171",
  info: "#38BDF8",
  onPrimary: "#FFFFFF",
  onSecondary: "#0B0B0F",
  onSuccess: "#0B0B0F",
  onDanger: "#FFFFFF",
};

/**
 * Fallback tokens when a consumer mounts `<KrakenProvider>` without any
 * overrides. Uses the light-mode palette by default.
 */
export const DEFAULT_TOKENS: Tokens = {
  buttonColors: DEFAULT_LIGHT_BUTTON_COLORS,
  textColors: DEFAULT_LIGHT_TEXT_COLORS,
  radius: 12,
  spacing: 8,
};

/**
 * Fallback dark tokens when a consumer opts into dark mode without passing
 * their own `dark` prop.
 */
export const DEFAULT_DARK_TOKENS: Tokens = {
  buttonColors: DEFAULT_DARK_BUTTON_COLORS,
  textColors: DEFAULT_DARK_TEXT_COLORS,
  radius: 12,
  spacing: 8,
};

/**
 * Merge a partial per-variant override on top of a base variant palette.
 * Missing fields fall through — a consumer who only wants to change
 * `primary.background` should not have to re-declare `primary.label`.
 */
export function mergeButtonVariantColors(
  base: ButtonVariantColors,
  override?: Partial<ButtonVariantColors>
): ButtonVariantColors {
  if (override == null) return base;
  return { ...base, ...override };
}

/**
 * Merge partial button-color overrides across every variant.
 */
export function mergeButtonColors(
  base: ButtonColors,
  override?: Partial<Record<keyof ButtonColors, Partial<ButtonVariantColors>>>
): ButtonColors {
  if (override == null) return base;
  return {
    primary: mergeButtonVariantColors(base.primary, override.primary),
    secondary: mergeButtonVariantColors(base.secondary, override.secondary),
    outline: mergeButtonVariantColors(base.outline, override.outline),
    ghost: mergeButtonVariantColors(base.ghost, override.ghost),
    destructive: mergeButtonVariantColors(base.destructive, override.destructive),
  };
}

/**
 * Merge partial text-color overrides on top of a base palette. Missing slots
 * fall through — consumers only declare the slots they want to change.
 */
export function mergeTextColors(base: TextColors, override?: Partial<TextColors>): TextColors {
  if (override == null) return base;
  return { ...base, ...override };
}

/**
 * Adjust a hex color's lightness by `amount` (in [-1, 1]). Positive lightens,
 * negative darkens. Cheap HSL round-trip; useful for consumers who want to
 * derive shade variations without a full color library.
 */
export function tint(hex: string, amount: number): string {
  const [h, s, l] = hexToHsl(hex);
  const newL = clamp(l + amount, 0, 1);
  return hslToHex(h, s, newL);
}

/**
 * Resolve the coarse token schema into the shape components consume. In v0.3
 * colors pass through unchanged; only the radius / space scales are derived.
 * Pure — safe to call inside a `useMemo`.
 */
export function coarseToFineTokens(tokens: Tokens): ResolvedTokens {
  const { buttonColors, textColors, radius, spacing } = tokens;
  return {
    buttonColors,
    textColors,
    radius: {
      sm: radius * 0.5,
      md: radius,
      lg: radius * 1.5,
      pill: 9999,
    },
    space: {
      xs: spacing * 0.5,
      sm: spacing,
      md: spacing * 2,
      lg: spacing * 3,
      xl: spacing * 4,
    },
  };
}

// -- private helpers --

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function hexToHsl(hex: string): [number, number, number] {
  const parsed = parseHex(hex);
  const r = parsed[0] / 255;
  const g = parsed[1] / 255;
  const b = parsed[2] / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  if (s === 0) {
    const v = Math.round(l * 255);
    return rgbToHex(v, v, v);
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = Math.round(hueToRgb(p, q, h + 1 / 3) * 255);
  const g = Math.round(hueToRgb(p, q, h) * 255);
  const b = Math.round(hueToRgb(p, q, h - 1 / 3) * 255);
  return rgbToHex(r, g, b);
}

function hueToRgb(p: number, q: number, t: number): number {
  let x = t;
  if (x < 0) x += 1;
  if (x > 1) x -= 1;
  if (x < 1 / 6) return p + (q - p) * 6 * x;
  if (x < 1 / 2) return q;
  if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
  return p;
}

function parseHex(hex: string): [number, number, number] {
  const clean = hex.replace(/^#/, "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  if (full.length !== 6) {
    throw new Error(`ui-kraken tokens: expected a #RRGGBB or #RGB hex color, got "${hex}"`);
  }
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0").toUpperCase()).join("");
}
