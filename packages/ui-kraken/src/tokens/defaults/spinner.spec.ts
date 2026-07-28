import {
  DEFAULT_DARK_SPINNER_COLORS,
  DEFAULT_LIGHT_SPINNER_COLORS,
  mergeSpinnerColors,
} from "./spinner";

/**
 * Ensures the merge helper's `override == null` early-return branch
 * is exercised (the primary code path is hit via the provider merge
 * pipeline, but the guard branch only fires when a consumer omits
 * the palette entirely — worth a direct assertion so a future
 * refactor can't accidentally drop the guard).
 */
describe("mergeSpinnerColors", () => {
  it("returns the base palette unchanged when no override is passed", () => {
    const result = mergeSpinnerColors(DEFAULT_LIGHT_SPINNER_COLORS);
    expect(result).toBe(DEFAULT_LIGHT_SPINNER_COLORS);
  });

  it("returns the base palette unchanged when override is null / undefined", () => {
    const result = mergeSpinnerColors(DEFAULT_DARK_SPINNER_COLORS, undefined);
    expect(result).toBe(DEFAULT_DARK_SPINNER_COLORS);
  });

  it("merges partial overrides on top of the base palette", () => {
    const result = mergeSpinnerColors(DEFAULT_LIGHT_SPINNER_COLORS, {
      color: "#7C3AED",
    });
    expect(result.color).toBe("#7C3AED");
  });

  it("dark palette differs from light on the color slot", () => {
    // Sanity — catches accidental cross-palette copy in a future edit.
    expect(DEFAULT_DARK_SPINNER_COLORS.color).not.toBe(DEFAULT_LIGHT_SPINNER_COLORS.color);
  });
});
