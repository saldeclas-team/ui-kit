import {
  DEFAULT_DARK_KRAKEN_TOKENS,
  DEFAULT_KRAKEN_TOKENS,
  coarseToFineTokens,
  mergeButtonColors,
  mergeButtonVariantColors,
  mergeTextColors,
  tint,
} from "./kraken-tokens-derive";

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
});

describe("coarseToFineTokens", () => {
  it("passes buttonColors through unchanged", () => {
    const out = coarseToFineTokens(DEFAULT_KRAKEN_TOKENS);
    expect(out.buttonColors).toEqual(DEFAULT_KRAKEN_TOKENS.buttonColors);
  });

  it("derives radius scale from the base radius", () => {
    const out = coarseToFineTokens({ ...DEFAULT_KRAKEN_TOKENS, radius: 16 });
    expect(out.radius).toMatchObject({ sm: 8, md: 16, lg: 24, pill: 9999 });
  });

  it("derives spacing scale from the base spacing", () => {
    const out = coarseToFineTokens({ ...DEFAULT_KRAKEN_TOKENS, spacing: 10 });
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
    const base = DEFAULT_KRAKEN_TOKENS.buttonColors;
    expect(mergeButtonColors(base, undefined)).toBe(base);
  });

  it("only touches the variants the caller passed", () => {
    const base = DEFAULT_KRAKEN_TOKENS.buttonColors;
    const merged = mergeButtonColors(base, { primary: { background: "#FF0000" } });
    expect(merged.primary.background).toBe("#FF0000");
    expect(merged.primary.label).toBe(base.primary.label);
    expect(merged.secondary).toEqual(base.secondary);
  });
});

describe("mergeTextColors", () => {
  it("returns the base when the override is undefined", () => {
    const base = DEFAULT_KRAKEN_TOKENS.textColors;
    expect(mergeTextColors(base, undefined)).toBe(base);
  });

  it("keeps missing slots from the base and applies the ones passed", () => {
    const base = DEFAULT_KRAKEN_TOKENS.textColors;
    const merged = mergeTextColors(base, { primary: "#123456", danger: "#FF0000" });
    expect(merged.primary).toBe("#123456");
    expect(merged.danger).toBe("#FF0000");
    expect(merged.secondary).toBe(base.secondary);
    expect(merged.onPrimary).toBe(base.onPrimary);
  });
});

describe("defaults", () => {
  it("light defaults expose a filled palette for every Button variant", () => {
    const colors = DEFAULT_KRAKEN_TOKENS.buttonColors;
    for (const variant of ["primary", "secondary", "outline", "ghost", "destructive"] as const) {
      expect(colors[variant].label).toBeTruthy();
    }
  });

  it("dark defaults are different from light defaults for Button", () => {
    expect(DEFAULT_DARK_KRAKEN_TOKENS.buttonColors.primary).not.toEqual(
      DEFAULT_KRAKEN_TOKENS.buttonColors.primary
    );
  });

  it("light defaults expose every KrakenTextColors slot as a non-empty string", () => {
    const colors = DEFAULT_KRAKEN_TOKENS.textColors;
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
    expect(DEFAULT_DARK_KRAKEN_TOKENS.textColors.primary).not.toBe(
      DEFAULT_KRAKEN_TOKENS.textColors.primary
    );
    expect(DEFAULT_DARK_KRAKEN_TOKENS.textColors.tertiary).not.toBe(
      DEFAULT_KRAKEN_TOKENS.textColors.tertiary
    );
    expect(DEFAULT_DARK_KRAKEN_TOKENS.textColors.interactive).not.toBe(
      DEFAULT_KRAKEN_TOKENS.textColors.interactive
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
