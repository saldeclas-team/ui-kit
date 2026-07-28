import {
  DEFAULT_DARK_DIALOG_COLORS,
  DEFAULT_LIGHT_DIALOG_COLORS,
  mergeDialogColors,
} from "./dialog";

/**
 * Ensures the merge helper's `override == null` early-return branch
 * is exercised (the primary code path is hit via the provider merge
 * pipeline, but the guard branch only fires when a consumer omits
 * the palette entirely — worth a direct assertion so a future
 * refactor can't accidentally drop the guard).
 */
describe("mergeDialogColors", () => {
  it("returns the base palette unchanged when no override is passed", () => {
    const result = mergeDialogColors(DEFAULT_LIGHT_DIALOG_COLORS);
    expect(result).toBe(DEFAULT_LIGHT_DIALOG_COLORS);
  });

  it("returns the base palette unchanged when override is null / undefined", () => {
    const result = mergeDialogColors(DEFAULT_DARK_DIALOG_COLORS, undefined);
    expect(result).toBe(DEFAULT_DARK_DIALOG_COLORS);
  });

  it("merges partial overrides on top of the base palette", () => {
    const result = mergeDialogColors(DEFAULT_LIGHT_DIALOG_COLORS, {
      backdrop: "rgba(124, 58, 237, 0.5)",
    });
    expect(result.backdrop).toBe("rgba(124, 58, 237, 0.5)");
    // Untouched slots fall through.
    expect(result.background).toBe(DEFAULT_LIGHT_DIALOG_COLORS.background);
    expect(result.title).toBe(DEFAULT_LIGHT_DIALOG_COLORS.title);
    expect(result.body).toBe(DEFAULT_LIGHT_DIALOG_COLORS.body);
  });

  it("dark palette differs from light across all slots", () => {
    // Sanity — catches accidental cross-palette copy in a future edit.
    expect(DEFAULT_DARK_DIALOG_COLORS.backdrop).not.toBe(DEFAULT_LIGHT_DIALOG_COLORS.backdrop);
    expect(DEFAULT_DARK_DIALOG_COLORS.background).not.toBe(DEFAULT_LIGHT_DIALOG_COLORS.background);
    expect(DEFAULT_DARK_DIALOG_COLORS.title).not.toBe(DEFAULT_LIGHT_DIALOG_COLORS.title);
    expect(DEFAULT_DARK_DIALOG_COLORS.body).not.toBe(DEFAULT_LIGHT_DIALOG_COLORS.body);
  });
});
