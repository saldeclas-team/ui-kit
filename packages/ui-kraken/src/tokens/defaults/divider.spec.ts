import {
  DEFAULT_DARK_DIVIDER_COLORS,
  DEFAULT_LIGHT_DIVIDER_COLORS,
  mergeDividerColors,
} from "./divider";

/**
 * Ensures the merge helper's `override == null` early-return branch
 * is exercised (the primary code path is hit via the provider merge
 * pipeline, but the guard branch only fires when a consumer omits
 * the palette entirely — worth a direct assertion so a future
 * refactor can't accidentally drop the guard).
 */
describe("mergeDividerColors", () => {
  it("returns the base palette unchanged when no override is passed", () => {
    const result = mergeDividerColors(DEFAULT_LIGHT_DIVIDER_COLORS);
    expect(result).toBe(DEFAULT_LIGHT_DIVIDER_COLORS);
  });

  it("returns the base palette unchanged when override is null / undefined", () => {
    const result = mergeDividerColors(DEFAULT_DARK_DIVIDER_COLORS, undefined);
    expect(result).toBe(DEFAULT_DARK_DIVIDER_COLORS);
  });

  it("merges partial overrides on top of the base palette", () => {
    const result = mergeDividerColors(DEFAULT_LIGHT_DIVIDER_COLORS, {
      line: "#7C3AED",
    });
    expect(result.line).toBe("#7C3AED");
  });

  it("dark palette differs from light on the line slot", () => {
    // Sanity — catches accidental cross-palette copy in a future edit.
    expect(DEFAULT_DARK_DIVIDER_COLORS.line).not.toBe(DEFAULT_LIGHT_DIVIDER_COLORS.line);
  });
});
