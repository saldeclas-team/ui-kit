import {
  DEFAULT_DARK_SLIDER_COLORS,
  DEFAULT_LIGHT_SLIDER_COLORS,
  mergeSliderColors,
} from "./slider";

/**
 * Ensures the merge helper's `override == null` early-return branch
 * is exercised (the primary code path is hit via the provider merge
 * pipeline, but the guard branch only fires when a consumer omits
 * the palette entirely — worth a direct assertion so a future
 * refactor can't accidentally drop the guard).
 */
describe("mergeSliderColors", () => {
  it("returns the base palette unchanged when no override is passed", () => {
    const result = mergeSliderColors(DEFAULT_LIGHT_SLIDER_COLORS);
    expect(result).toBe(DEFAULT_LIGHT_SLIDER_COLORS);
  });

  it("returns the base palette unchanged when override is null / undefined", () => {
    const result = mergeSliderColors(DEFAULT_DARK_SLIDER_COLORS, undefined);
    expect(result).toBe(DEFAULT_DARK_SLIDER_COLORS);
  });

  it("merges partial overrides on top of the base palette", () => {
    const result = mergeSliderColors(DEFAULT_LIGHT_SLIDER_COLORS, {
      fill: "#7C3AED",
    });
    expect(result.fill).toBe("#7C3AED");
    // Untouched slots fall through.
    expect(result.track).toBe(DEFAULT_LIGHT_SLIDER_COLORS.track);
    expect(result.thumb).toBe(DEFAULT_LIGHT_SLIDER_COLORS.thumb);
  });

  it("dark palette differs from light across all slots", () => {
    // Sanity — catches accidental cross-palette copy in a future edit.
    expect(DEFAULT_DARK_SLIDER_COLORS.track).not.toBe(DEFAULT_LIGHT_SLIDER_COLORS.track);
    expect(DEFAULT_DARK_SLIDER_COLORS.fill).not.toBe(DEFAULT_LIGHT_SLIDER_COLORS.fill);
    expect(DEFAULT_DARK_SLIDER_COLORS.thumb).not.toBe(DEFAULT_LIGHT_SLIDER_COLORS.thumb);
  });
});
