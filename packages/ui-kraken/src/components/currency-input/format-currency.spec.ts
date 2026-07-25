import { formatCurrency } from "./format-currency";

describe("formatCurrency", () => {
  it('returns "" for null', () => {
    expect(formatCurrency(null, { locale: "en-US", decimals: 0 })).toBe("");
  });

  it('returns "" for NaN', () => {
    expect(formatCurrency(Number.NaN, { locale: "en-US", decimals: 0 })).toBe("");
  });

  it('returns "0" for zero', () => {
    expect(formatCurrency(0, { locale: "en-US", decimals: 0 })).toBe("0");
  });

  it("formats en-US thousands with comma", () => {
    expect(formatCurrency(1234, { locale: "en-US", decimals: 0 })).toBe("1,234");
  });

  it("formats es-CO thousands with dot", () => {
    expect(formatCurrency(1234, { locale: "es-CO", decimals: 0 })).toBe("1.234");
  });

  it("formats large integer with grouping", () => {
    expect(formatCurrency(1234567, { locale: "en-US", decimals: 0 })).toBe("1,234,567");
  });

  it("keeps decimals when decimals > 0", () => {
    expect(formatCurrency(1234.56, { locale: "en-US", decimals: 2 })).toBe("1,234.56");
  });

  it("rounds decimals via Intl when value exceeds decimals", () => {
    // Intl uses banker's rounding for .5 but plain rounding here.
    expect(formatCurrency(1234.5, { locale: "en-US", decimals: 0 })).toBe("1,235");
  });

  it("respects the es-CO decimal separator", () => {
    expect(formatCurrency(1234.56, { locale: "es-CO", decimals: 2 })).toBe("1.234,56");
  });

  it("formats negative numbers", () => {
    expect(formatCurrency(-500, { locale: "en-US", decimals: 0 })).toBe("-500");
  });

  it("omits trailing decimals when the value is a whole number and minimumFractionDigits=0", () => {
    expect(formatCurrency(1000, { locale: "en-US", decimals: 2 })).toBe("1,000");
  });

  it("handles ja-JP (no fractional in typical JPY use)", () => {
    expect(formatCurrency(1234, { locale: "ja-JP", decimals: 0 })).toBe("1,234");
  });
});
