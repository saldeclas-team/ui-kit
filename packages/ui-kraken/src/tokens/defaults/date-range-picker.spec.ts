import {
  DEFAULT_DARK_DATE_RANGE_PICKER_COLORS,
  DEFAULT_LIGHT_DATE_RANGE_PICKER_COLORS,
  mergeDateRangePickerColors,
} from "./date-range-picker";

/**
 * Ensures the merge helper's `override == null` early-return branch
 * is exercised (the primary code path is hit via the provider merge
 * pipeline, but the guard branch only fires when a consumer omits
 * the palette entirely — worth a direct assertion so a future
 * refactor can't accidentally drop the guard).
 */
describe("mergeDateRangePickerColors", () => {
  it("returns the base palette unchanged when no override is passed", () => {
    const result = mergeDateRangePickerColors(DEFAULT_LIGHT_DATE_RANGE_PICKER_COLORS);
    expect(result).toBe(DEFAULT_LIGHT_DATE_RANGE_PICKER_COLORS);
  });

  it("returns the base palette unchanged when override is null / undefined", () => {
    const result = mergeDateRangePickerColors(DEFAULT_DARK_DATE_RANGE_PICKER_COLORS, undefined);
    expect(result).toBe(DEFAULT_DARK_DATE_RANGE_PICKER_COLORS);
  });

  it("merges partial overrides on top of the base palette", () => {
    const result = mergeDateRangePickerColors(DEFAULT_LIGHT_DATE_RANGE_PICKER_COLORS, {
      border: "#7C3AED",
      separator: "#A78BFA",
    });
    expect(result.border).toBe("#7C3AED");
    expect(result.separator).toBe("#A78BFA");
    // Untouched slots fall through.
    expect(result.background).toBe(DEFAULT_LIGHT_DATE_RANGE_PICKER_COLORS.background);
    expect(result.accent).toBe(DEFAULT_LIGHT_DATE_RANGE_PICKER_COLORS.accent);
  });

  it("dark palette differs from light on trigger + separator slots", () => {
    // Sanity — catches accidental cross-palette copy in a future edit.
    expect(DEFAULT_DARK_DATE_RANGE_PICKER_COLORS.background).not.toBe(
      DEFAULT_LIGHT_DATE_RANGE_PICKER_COLORS.background
    );
    expect(DEFAULT_DARK_DATE_RANGE_PICKER_COLORS.separator).not.toBe(
      DEFAULT_LIGHT_DATE_RANGE_PICKER_COLORS.separator
    );
  });
});
