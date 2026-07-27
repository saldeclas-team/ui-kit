import {
  DEFAULT_DARK_DATE_PICKER_COLORS,
  DEFAULT_LIGHT_DATE_PICKER_COLORS,
  mergeDatePickerColors,
} from "./date-picker";

/**
 * Ensures the merge helper's `override == null` early-return branch
 * is exercised (the primary code path is hit via the provider merge
 * pipeline, but the guard branch only fires when a consumer omits
 * the palette entirely — worth a direct assertion so a future
 * refactor can't accidentally drop the guard).
 */
describe("mergeDatePickerColors", () => {
  it("returns the base palette unchanged when no override is passed", () => {
    const result = mergeDatePickerColors(DEFAULT_LIGHT_DATE_PICKER_COLORS);
    expect(result).toBe(DEFAULT_LIGHT_DATE_PICKER_COLORS);
  });

  it("returns the base palette unchanged when override is null / undefined", () => {
    const result = mergeDatePickerColors(DEFAULT_DARK_DATE_PICKER_COLORS, undefined);
    expect(result).toBe(DEFAULT_DARK_DATE_PICKER_COLORS);
  });

  it("merges partial overrides on top of the base palette", () => {
    const result = mergeDatePickerColors(DEFAULT_LIGHT_DATE_PICKER_COLORS, {
      accent: "#7C3AED",
      borderFocused: "#A78BFA",
    });
    expect(result.accent).toBe("#7C3AED");
    expect(result.borderFocused).toBe("#A78BFA");
    // Untouched slots fall through from the base.
    expect(result.background).toBe(DEFAULT_LIGHT_DATE_PICKER_COLORS.background);
    expect(result.text).toBe(DEFAULT_LIGHT_DATE_PICKER_COLORS.text);
    expect(result.chevron).toBe(DEFAULT_LIGHT_DATE_PICKER_COLORS.chevron);
  });

  it("dark palette differs from light on background + text + accent slots", () => {
    // Sanity — catches accidental cross-palette copy in a future edit.
    expect(DEFAULT_DARK_DATE_PICKER_COLORS.background).not.toBe(
      DEFAULT_LIGHT_DATE_PICKER_COLORS.background
    );
    expect(DEFAULT_DARK_DATE_PICKER_COLORS.text).not.toBe(DEFAULT_LIGHT_DATE_PICKER_COLORS.text);
    expect(DEFAULT_DARK_DATE_PICKER_COLORS.accent).not.toBe(
      DEFAULT_LIGHT_DATE_PICKER_COLORS.accent
    );
  });
});
