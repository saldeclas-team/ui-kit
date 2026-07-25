import { parseCurrency } from "./parse-currency";

describe("parseCurrency — integer mode (decimals=0)", () => {
  const opts = { locale: "en-US", decimals: 0 };

  it("returns null for an empty string", () => {
    expect(parseCurrency("", opts)).toBeNull();
  });

  it("returns null for whitespace-only", () => {
    expect(parseCurrency("   ", opts)).toBeNull();
  });

  it("returns null for prefix-only", () => {
    expect(parseCurrency("$", opts)).toBeNull();
  });

  it("returns null for just a minus sign", () => {
    expect(parseCurrency("-", opts)).toBeNull();
  });

  it("parses plain digits", () => {
    expect(parseCurrency("1234", opts)).toBe(1234);
  });

  it("strips the en-US thousands separator", () => {
    expect(parseCurrency("1,234,567", opts)).toBe(1234567);
  });

  it("strips the prefix and separators together", () => {
    expect(parseCurrency("$1,234", opts)).toBe(1234);
  });

  it("strips arbitrary non-numeric noise", () => {
    expect(parseCurrency("abc $1,234 xyz", opts)).toBe(1234);
  });

  it("treats es-CO separator (`.`) as noise in integer mode", () => {
    expect(parseCurrency("1.234", { locale: "es-CO", decimals: 0 })).toBe(1234);
  });

  it("parses leading negative", () => {
    expect(parseCurrency("-500", opts)).toBe(-500);
  });
});

describe("parseCurrency — decimal mode (decimals=2)", () => {
  const usOpts = { locale: "en-US", decimals: 2 };
  const coOpts = { locale: "es-CO", decimals: 2 };

  it("returns null for empty", () => {
    expect(parseCurrency("", usOpts)).toBeNull();
  });

  it("returns null for lone decimal separator (en-US)", () => {
    expect(parseCurrency(".", usOpts)).toBeNull();
  });

  it("returns null for lone minus with a separator", () => {
    // "-." → cleaned to "-." → forParse "-." → parseFloat("-.") is NaN
    expect(parseCurrency("-.", usOpts)).toBeNull();
  });

  it("parses en-US formatted value", () => {
    expect(parseCurrency("1,234.56", usOpts)).toBe(1234.56);
  });

  it("parses es-CO formatted value (`.` thousands, `,` decimal)", () => {
    expect(parseCurrency("1.234,56", coOpts)).toBe(1234.56);
  });

  it("strips the prefix + separators", () => {
    expect(parseCurrency("$1,234.56", usOpts)).toBe(1234.56);
  });

  it("keeps only the first decimal separator when the user typed multiple", () => {
    // en-US: "." is the decimal. "1.2.3" → keep first ".", strip rest → "1.23"
    expect(parseCurrency("1.2.3", usOpts)).toBe(1.23);
  });

  it("rounds fractional beyond `decimals`", () => {
    expect(parseCurrency("1.239", usOpts)).toBe(1.24);
  });

  it("handles negative decimals", () => {
    expect(parseCurrency("-1,234.56", usOpts)).toBe(-1234.56);
  });

  it("returns null when only invalid characters remain", () => {
    expect(parseCurrency("abc", usOpts)).toBeNull();
  });
});

describe("parseCurrency — decimal separator fallback", () => {
  // If a runtime somehow returns no "decimal" part from
  // `Intl.NumberFormat.formatToParts(1.1)` (theoretical — every real
  // BCP 47 locale exposes it), the parser falls back to `.` so it
  // stays deterministic. Mock Intl.NumberFormat to force that path.
  it('falls back to "." when Intl.NumberFormat exposes no decimal part', () => {
    const spy = jest.spyOn(Intl, "NumberFormat").mockImplementation(
      () =>
        ({
          formatToParts: () => [
            { type: "integer", value: "1" },
            { type: "fraction", value: "1" },
          ],
          format: (n: number) => String(n),
        }) as unknown as Intl.NumberFormat
    );
    try {
      expect(parseCurrency("1.5", { locale: "en-US", decimals: 2 })).toBe(1.5);
    } finally {
      spy.mockRestore();
    }
  });
});
