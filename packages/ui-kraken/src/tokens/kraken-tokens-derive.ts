import type { KrakenTokens, ResolvedKrakenTokens } from "./kraken-tokens-types";

/**
 * Fallback tokens when a consumer mounts `<KrakenProvider>` without any
 * overrides. Blue-600 primary (Tailwind #2563EB) chosen because it's a
 * broadly recognized, WCAG-AA-on-white "default brand blue".
 */
export const DEFAULT_KRAKEN_TOKENS: KrakenTokens = {
  primaryColor: "#2563EB",
  secondaryColor: "#0EA5E9",
  textPrimaryColor: "#0B0B0F",
  textSecondaryColor: "#5B6472",
  radius: 12,
  spacing: 8,
};

/**
 * Danger color is not part of the coarse KrakenTokens schema in v0.1 — every
 * app uses roughly the same "red-600" for destructive actions. Pinning it
 * here keeps Button.Destructive predictable without adding a knob users
 * rarely touch.
 */
const DANGER_BASE = "#DC2626";

/**
 * Adjust a hex color's lightness by `amount` (in [-1, 1]). Positive lightens,
 * negative darkens. Cheap HSL round-trip; enough for tint/shade math in v0.1.
 */
export function tint(hex: string, amount: number): string {
  const [h, s, l] = hexToHsl(hex);
  const newL = clamp(l + amount, 0, 1);
  return hslToHex(h, s, newL);
}

/**
 * Derive the full token set consumed by ui-kraken components from the coarse
 * knobs the user provides. Pure — safe to call inside a `useMemo`.
 */
export function coarseToFineTokens(tokens: KrakenTokens): ResolvedKrakenTokens {
  const { primaryColor, secondaryColor, textPrimaryColor, textSecondaryColor, radius, spacing } =
    tokens;

  return {
    color: {
      primary3: tint(primaryColor, 0.4),
      primary9: primaryColor,
      primary10: tint(primaryColor, -0.06),
      primary11: tint(primaryColor, -0.14),
      secondary3: tint(secondaryColor, 0.4),
      secondary9: secondaryColor,
      secondary10: tint(secondaryColor, -0.06),
      secondary11: tint(secondaryColor, -0.14),
      danger9: DANGER_BASE,
      danger10: tint(DANGER_BASE, -0.06),
      textPrimary: textPrimaryColor,
      textSecondary: textSecondaryColor,
      textOnPrimary: "#FFFFFF",
      textOnSecondary: "#FFFFFF",
      textOnDanger: "#FFFFFF",
    },
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
  if (max === min) {
    return [0, 0, l];
  }
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
