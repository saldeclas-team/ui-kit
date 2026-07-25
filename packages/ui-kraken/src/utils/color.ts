/**
 * Pure color-math utilities. No dependencies on Tamagui, tokens, or React.
 * All hex parsers accept `#RGB` and `#RRGGBB` and throw on anything else.
 */

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
 * Clamp `v` to the closed interval `[min, max]`.
 */
export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/**
 * Convert a `#RGB` or `#RRGGBB` hex to HSL. Returns `[hue, saturation,
 * lightness]` in the [0, 1] range.
 */
export function hexToHsl(hex: string): [number, number, number] {
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

/**
 * Convert HSL back to a `#RRGGBB` hex string. Inputs are in [0, 1].
 */
export function hslToHex(h: number, s: number, l: number): string {
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

/**
 * Convert a `#RGB` or `#RRGGBB` hex to `[r, g, b]` in 0-255. Throws on
 * anything else so callers do not silently accept `rgba(...)` or named
 * colors that this pipeline does not support.
 */
export function parseHex(hex: string): [number, number, number] {
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

/**
 * Format three 0-255 channel values as a `#RRGGBB` hex string (uppercase).
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0").toUpperCase()).join("");
}

// -- private helpers --

function hueToRgb(p: number, q: number, t: number): number {
  let x = t;
  if (x < 0) x += 1;
  if (x > 1) x -= 1;
  if (x < 1 / 6) return p + (q - p) * 6 * x;
  if (x < 1 / 2) return q;
  if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
  return p;
}
