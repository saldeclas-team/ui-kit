import {
  DEFAULT_DARK_AVATAR_COLORS,
  DEFAULT_LIGHT_AVATAR_COLORS,
  mergeAvatarColors,
} from "./avatar";

/**
 * Ensures the merge helper's `override == null` early-return branch
 * is exercised (the primary code path is hit via the provider merge
 * pipeline, but the guard branch only fires when a consumer omits
 * the palette entirely — worth a direct assertion so a future
 * refactor can't accidentally drop the guard).
 */
describe("mergeAvatarColors", () => {
  it("returns the base palette unchanged when no override is passed", () => {
    const result = mergeAvatarColors(DEFAULT_LIGHT_AVATAR_COLORS);
    expect(result).toBe(DEFAULT_LIGHT_AVATAR_COLORS);
  });

  it("returns the base palette unchanged when override is null / undefined", () => {
    const result = mergeAvatarColors(DEFAULT_DARK_AVATAR_COLORS, undefined);
    expect(result).toBe(DEFAULT_DARK_AVATAR_COLORS);
  });

  it("merges partial overrides on top of the base palette", () => {
    const result = mergeAvatarColors(DEFAULT_LIGHT_AVATAR_COLORS, {
      background: "#7C3AED",
    });
    expect(result.background).toBe("#7C3AED");
    // Untouched slots fall through.
    expect(result.text).toBe(DEFAULT_LIGHT_AVATAR_COLORS.text);
  });

  it("dark palette differs from light on background + text slots", () => {
    // Sanity — catches accidental cross-palette copy in a future edit.
    expect(DEFAULT_DARK_AVATAR_COLORS.background).not.toBe(DEFAULT_LIGHT_AVATAR_COLORS.background);
    expect(DEFAULT_DARK_AVATAR_COLORS.text).not.toBe(DEFAULT_LIGHT_AVATAR_COLORS.text);
  });
});
