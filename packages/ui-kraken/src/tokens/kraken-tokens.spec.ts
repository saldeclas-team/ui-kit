import { DEFAULT_KRAKEN_TOKENS, coarseToFineTokens, tint } from "./kraken-tokens-derive";

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
  it("uses the provided primary color as primary9", () => {
    const out = coarseToFineTokens({
      ...DEFAULT_KRAKEN_TOKENS,
      primaryColor: "#FF6B00",
    });
    expect(out.color.primary9).toBe("#FF6B00");
  });

  it("derives radius scale from the base radius", () => {
    const out = coarseToFineTokens({ ...DEFAULT_KRAKEN_TOKENS, radius: 16 });
    expect(out.radius).toMatchObject({ sm: 8, md: 16, lg: 24, pill: 9999 });
  });

  it("derives spacing scale from the base spacing", () => {
    const out = coarseToFineTokens({ ...DEFAULT_KRAKEN_TOKENS, spacing: 10 });
    expect(out.space).toMatchObject({ xs: 5, sm: 10, md: 20, lg: 30, xl: 40 });
  });

  it("passes through text colors unchanged", () => {
    const out = coarseToFineTokens({
      ...DEFAULT_KRAKEN_TOKENS,
      textPrimaryColor: "#111827",
      textSecondaryColor: "#6B7280",
    });
    expect(out.color.textPrimary).toBe("#111827");
    expect(out.color.textSecondary).toBe("#6B7280");
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
