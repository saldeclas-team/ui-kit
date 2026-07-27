import {
  DEFAULT_DARK_BOTTOM_SHEET_COLORS,
  DEFAULT_LIGHT_BOTTOM_SHEET_COLORS,
  mergeBottomSheetColors,
} from "./bottom-sheet";

/**
 * Ensures the merge helper's `override == null` early-return branch
 * is exercised (the primary code path is hit via the provider merge
 * pipeline, but the guard branch only fires when a consumer omits
 * the palette entirely — worth a direct assertion so a future
 * refactor can't accidentally drop the guard).
 */
describe("mergeBottomSheetColors", () => {
  it("returns the base palette unchanged when no override is passed", () => {
    const result = mergeBottomSheetColors(DEFAULT_LIGHT_BOTTOM_SHEET_COLORS);
    expect(result).toBe(DEFAULT_LIGHT_BOTTOM_SHEET_COLORS);
  });

  it("returns the base palette unchanged when override is null / undefined", () => {
    const result = mergeBottomSheetColors(DEFAULT_DARK_BOTTOM_SHEET_COLORS, undefined);
    expect(result).toBe(DEFAULT_DARK_BOTTOM_SHEET_COLORS);
  });

  it("merges partial overrides on top of the base palette", () => {
    const result = mergeBottomSheetColors(DEFAULT_LIGHT_BOTTOM_SHEET_COLORS, {
      background: "#7C3AED",
      handle: "#A78BFA",
    });
    expect(result.background).toBe("#7C3AED");
    expect(result.handle).toBe("#A78BFA");
    // Untouched slots fall through from the base.
    expect(result.backdrop).toBe(DEFAULT_LIGHT_BOTTOM_SHEET_COLORS.backdrop);
    expect(result.divider).toBe(DEFAULT_LIGHT_BOTTOM_SHEET_COLORS.divider);
    expect(result.missingPeer).toBe(DEFAULT_LIGHT_BOTTOM_SHEET_COLORS.missingPeer);
  });

  it("dark palette differs from light on background + backdrop + handle slots", () => {
    // Sanity — catches accidental cross-palette copy in a future edit.
    expect(DEFAULT_DARK_BOTTOM_SHEET_COLORS.background).not.toBe(
      DEFAULT_LIGHT_BOTTOM_SHEET_COLORS.background
    );
    expect(DEFAULT_DARK_BOTTOM_SHEET_COLORS.backdrop).not.toBe(
      DEFAULT_LIGHT_BOTTOM_SHEET_COLORS.backdrop
    );
    expect(DEFAULT_DARK_BOTTOM_SHEET_COLORS.handle).not.toBe(
      DEFAULT_LIGHT_BOTTOM_SHEET_COLORS.handle
    );
  });
});
