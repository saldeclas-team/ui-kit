import {
  DEFAULT_DARK_TOKENS,
  DEFAULT_TOKENS,
  mergeAlertColors,
  mergeAlertVariantColors,
  mergeButtonColors,
  mergeButtonVariantColors,
  mergeCurrencyInputColors,
  mergeInputColors,
  mergeRadioGroupColors,
  mergeRefreshControlColors,
  mergeSurfaceColors,
  mergeTextColors,
} from "./defaults";
import { tint } from "../utils/color";
import { coarseToFineTokens } from "./tokens-derive";

describe("tint", () => {
  it("returns the same color at amount=0", () => {
    expect(tint("#2563EB", 0)).toBe("#2563EB");
  });

  it("darkens a color when amount is negative", () => {
    const base = tint("#2563EB", 0);
    const darker = tint("#2563EB", -0.1);
    expect(darker).not.toBe(base);
    expect(sumRgb(darker)).toBeLessThan(sumRgb(base));
  });

  it("lightens a color when amount is positive", () => {
    const base = tint("#2563EB", 0);
    const lighter = tint("#2563EB", 0.2);
    expect(sumRgb(lighter)).toBeGreaterThan(sumRgb(base));
  });

  it("accepts a 3-char shorthand hex", () => {
    expect(tint("#25E", 0)).toBe("#2255EE");
  });

  it("throws on malformed hex", () => {
    expect(() => tint("not-a-hex", 0)).toThrow(/expected a #RRGGBB/);
  });

  // Exercise the `max === g` and `max === b` branches inside `hexToHsl`
  // that the blue-only tests above miss. Round-tripping a color through
  // `tint(color, 0)` reads the hex through hexToHsl and writes it back
  // through hslToHex, so both sides get hit.
  it("round-trips a green-dominant color through the HSL cycle", () => {
    expect(tint("#22C55E", 0)).toBe("#22C55E");
  });

  it("round-trips a red-dominant color through the HSL cycle", () => {
    expect(tint("#EF4444", 0)).toBe("#EF4444");
  });

  it("round-trips a grayscale color (saturation = 0) through the HSL cycle", () => {
    // Hits the `s === 0` early return inside hslToHex.
    expect(tint("#808080", 0)).toBe("#808080");
  });
});

describe("coarseToFineTokens", () => {
  it("passes buttonColors through unchanged", () => {
    const out = coarseToFineTokens(DEFAULT_TOKENS);
    expect(out.buttonColors).toEqual(DEFAULT_TOKENS.buttonColors);
  });

  it("derives radius scale from the base radius", () => {
    const out = coarseToFineTokens({ ...DEFAULT_TOKENS, radius: 16 });
    expect(out.radius).toMatchObject({ sm: 8, md: 16, lg: 24, pill: 9999 });
  });

  it("derives spacing scale from the base spacing", () => {
    const out = coarseToFineTokens({ ...DEFAULT_TOKENS, spacing: 10 });
    expect(out.space).toMatchObject({ xs: 5, sm: 10, md: 20, lg: 30, xl: 40 });
  });
});

describe("mergeButtonVariantColors", () => {
  it("returns the base when the override is undefined", () => {
    const base = { background: "#000", label: "#FFF" };
    expect(mergeButtonVariantColors(base, undefined)).toBe(base);
  });

  it("keeps missing slots from the base", () => {
    const merged = mergeButtonVariantColors(
      { background: "#000", label: "#FFF" },
      { background: "#FF0000" }
    );
    expect(merged).toEqual({ background: "#FF0000", label: "#FFF" });
  });
});

describe("mergeButtonColors", () => {
  it("returns the base when the override is undefined", () => {
    const base = DEFAULT_TOKENS.buttonColors;
    expect(mergeButtonColors(base, undefined)).toBe(base);
  });

  it("only touches the variants the caller passed", () => {
    const base = DEFAULT_TOKENS.buttonColors;
    const merged = mergeButtonColors(base, { primary: { background: "#FF0000" } });
    expect(merged.primary.background).toBe("#FF0000");
    expect(merged.primary.label).toBe(base.primary.label);
    expect(merged.secondary).toEqual(base.secondary);
  });
});

describe("mergeTextColors", () => {
  it("returns the base when the override is undefined", () => {
    const base = DEFAULT_TOKENS.textColors;
    expect(mergeTextColors(base, undefined)).toBe(base);
  });

  it("keeps missing slots from the base and applies the ones passed", () => {
    const base = DEFAULT_TOKENS.textColors;
    const merged = mergeTextColors(base, { primary: "#123456", danger: "#FF0000" });
    expect(merged.primary).toBe("#123456");
    expect(merged.danger).toBe("#FF0000");
    expect(merged.secondary).toBe(base.secondary);
    expect(merged.onPrimary).toBe(base.onPrimary);
  });
});

describe("mergeAlertVariantColors", () => {
  it("returns the base when the override is undefined", () => {
    const base = { background: "#EFF6FF", text: "#0284C7", icon: "#0284C7" };
    expect(mergeAlertVariantColors(base, undefined)).toBe(base);
  });

  it("keeps missing slots from the base and applies the ones passed", () => {
    const merged = mergeAlertVariantColors(
      { background: "#EFF6FF", text: "#0284C7", icon: "#0284C7" },
      { background: "#4A0000", border: "#FCA5A5" }
    );
    expect(merged).toEqual({
      background: "#4A0000",
      text: "#0284C7",
      icon: "#0284C7",
      border: "#FCA5A5",
    });
  });
});

describe("mergeAlertColors", () => {
  it("returns the base when the override is undefined", () => {
    const base = DEFAULT_TOKENS.alertColors;
    expect(mergeAlertColors(base, undefined)).toBe(base);
  });

  it("only touches the variants the caller passed", () => {
    const base = DEFAULT_TOKENS.alertColors;
    const merged = mergeAlertColors(base, { danger: { background: "#4A0000" } });
    expect(merged.danger.background).toBe("#4A0000");
    expect(merged.danger.text).toBe(base.danger.text);
    expect(merged.info).toEqual(base.info);
    expect(merged.success).toEqual(base.success);
    expect(merged.warning).toEqual(base.warning);
  });
});

describe("mergeRadioGroupColors", () => {
  it("returns the base when the override is undefined", () => {
    const base = DEFAULT_TOKENS.radioGroupColors;
    expect(mergeRadioGroupColors(base, undefined)).toBe(base);
  });

  it("keeps missing slots from the base and applies the ones passed", () => {
    const base = DEFAULT_TOKENS.radioGroupColors;
    const merged = mergeRadioGroupColors(base, {
      selectedBorder: "#FF6B00",
      dot: "#FF6B00",
    });
    expect(merged.selectedBorder).toBe("#FF6B00");
    expect(merged.dot).toBe("#FF6B00");
    expect(merged.unselectedBorder).toBe(base.unselectedBorder);
    expect(merged.label).toBe(base.label);
    expect(merged.groupLabel).toBe(base.groupLabel);
  });
});

describe("mergeInputColors", () => {
  it("returns the base when the override is undefined", () => {
    const base = DEFAULT_TOKENS.inputColors;
    expect(mergeInputColors(base, undefined)).toBe(base);
  });

  it("keeps missing slots from the base and applies the ones passed", () => {
    const base = DEFAULT_TOKENS.inputColors;
    const merged = mergeInputColors(base, {
      borderFocused: "#FF6B00",
      background: "#FFF7ED",
    });
    expect(merged.borderFocused).toBe("#FF6B00");
    expect(merged.background).toBe("#FFF7ED");
    expect(merged.border).toBe(base.border);
    expect(merged.borderError).toBe(base.borderError);
    expect(merged.label).toBe(base.label);
    expect(merged.errorText).toBe(base.errorText);
  });
});

describe("mergeCurrencyInputColors", () => {
  it("returns the base when the override is undefined", () => {
    const base = DEFAULT_TOKENS.currencyInputColors;
    expect(mergeCurrencyInputColors(base, undefined)).toBe(base);
  });

  it("keeps missing slots from the base and applies the ones passed", () => {
    const base = DEFAULT_TOKENS.currencyInputColors;
    const merged = mergeCurrencyInputColors(base, {
      prefix: "#FF6B00",
    });
    expect(merged.prefix).toBe("#FF6B00");
    expect(merged.text).toBe(base.text);
    expect(merged.placeholder).toBe(base.placeholder);
  });
});

describe("mergeSurfaceColors", () => {
  it("returns the base when the override is undefined", () => {
    const base = DEFAULT_TOKENS.surfaceColors;
    expect(mergeSurfaceColors(base, undefined)).toBe(base);
  });

  it("keeps missing slots from the base and applies the ones passed", () => {
    const base = DEFAULT_TOKENS.surfaceColors;
    const merged = mergeSurfaceColors(base, {
      raised: "#FFF7ED",
    });
    expect(merged.raised).toBe("#FFF7ED");
    expect(merged.base).toBe(base.base);
    expect(merged.overlay).toBe(base.overlay);
    expect(merged.sunken).toBe(base.sunken);
  });
});

describe("mergeRefreshControlColors", () => {
  it("returns the base when the override is undefined", () => {
    const base = DEFAULT_TOKENS.refreshControlColors;
    expect(mergeRefreshControlColors(base, undefined)).toBe(base);
  });

  it("keeps missing slots from the base and applies the ones passed", () => {
    const base = DEFAULT_TOKENS.refreshControlColors;
    const merged = mergeRefreshControlColors(base, {
      spinner: "#7C3AED",
    });
    expect(merged.spinner).toBe("#7C3AED");
    expect(merged.background).toBe(base.background);
    expect(merged.title).toBe(base.title);
  });
});

describe("defaults", () => {
  it("light defaults expose a filled palette for every Button variant", () => {
    const colors = DEFAULT_TOKENS.buttonColors;
    for (const variant of ["primary", "secondary", "outline", "ghost", "destructive"] as const) {
      expect(colors[variant].label).toBeTruthy();
    }
  });

  it("dark defaults are different from light defaults for Button", () => {
    expect(DEFAULT_DARK_TOKENS.buttonColors.primary).not.toEqual(
      DEFAULT_TOKENS.buttonColors.primary
    );
  });

  it("light defaults expose every TextColors slot as a non-empty string", () => {
    const colors = DEFAULT_TOKENS.textColors;
    for (const slot of [
      "primary",
      "secondary",
      "tertiary",
      "disabled",
      "inverse",
      "interactive",
      "success",
      "warning",
      "danger",
      "info",
      "onPrimary",
      "onSecondary",
      "onSuccess",
      "onDanger",
    ] as const) {
      expect(colors[slot]).toBeTruthy();
    }
  });

  it("dark textColors defaults differ from light on the hierarchy slots", () => {
    expect(DEFAULT_DARK_TOKENS.textColors.primary).not.toBe(DEFAULT_TOKENS.textColors.primary);
    expect(DEFAULT_DARK_TOKENS.textColors.tertiary).not.toBe(DEFAULT_TOKENS.textColors.tertiary);
    expect(DEFAULT_DARK_TOKENS.textColors.interactive).not.toBe(
      DEFAULT_TOKENS.textColors.interactive
    );
  });
});

function sumRgb(hex: string): number {
  const clean = hex.replace(/^#/, "");
  return (
    parseInt(clean.slice(0, 2), 16) +
    parseInt(clean.slice(2, 4), 16) +
    parseInt(clean.slice(4, 6), 16)
  );
}
