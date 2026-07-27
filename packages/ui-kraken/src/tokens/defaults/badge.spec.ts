import {
  DEFAULT_DARK_BADGE_COLORS,
  DEFAULT_LIGHT_BADGE_COLORS,
  mergeBadgeColors,
  mergeBadgeToneColors,
} from "./badge";

/**
 * Ensures both merge helpers' `override == null` early-return
 * branches are exercised (the primary code path is hit via the
 * provider merge pipeline, but the guard branch only fires when a
 * consumer omits the palette entirely — worth a direct assertion
 * so a future refactor can't accidentally drop the guard).
 */
describe("mergeBadgeToneColors", () => {
  it("returns the base tone palette unchanged when no override is passed", () => {
    const result = mergeBadgeToneColors(DEFAULT_LIGHT_BADGE_COLORS.primary);
    expect(result).toBe(DEFAULT_LIGHT_BADGE_COLORS.primary);
  });

  it("returns the base unchanged when override is undefined", () => {
    const result = mergeBadgeToneColors(DEFAULT_DARK_BADGE_COLORS.danger, undefined);
    expect(result).toBe(DEFAULT_DARK_BADGE_COLORS.danger);
  });

  it("merges partial slot overrides on top of the base tone palette", () => {
    const result = mergeBadgeToneColors(DEFAULT_LIGHT_BADGE_COLORS.success, {
      background: "#7C3AED",
    });
    expect(result.background).toBe("#7C3AED");
    // Untouched slots fall through.
    expect(result.text).toBe(DEFAULT_LIGHT_BADGE_COLORS.success.text);
  });
});

describe("mergeBadgeColors — cross-tone merge", () => {
  it("returns the base palette unchanged when no override is passed", () => {
    const result = mergeBadgeColors(DEFAULT_LIGHT_BADGE_COLORS);
    expect(result).toBe(DEFAULT_LIGHT_BADGE_COLORS);
  });

  it("returns the base palette unchanged when override is undefined", () => {
    const result = mergeBadgeColors(DEFAULT_DARK_BADGE_COLORS, undefined);
    expect(result).toBe(DEFAULT_DARK_BADGE_COLORS);
  });

  it("merges partial tone overrides across every tone", () => {
    const result = mergeBadgeColors(DEFAULT_LIGHT_BADGE_COLORS, {
      danger: { background: "#7C3AED" },
    });
    expect(result.danger.background).toBe("#7C3AED");
    // Untouched slots + tones fall through.
    expect(result.danger.text).toBe(DEFAULT_LIGHT_BADGE_COLORS.danger.text);
    expect(result.success).toEqual(DEFAULT_LIGHT_BADGE_COLORS.success);
  });
});

describe("Light vs dark palette sanity", () => {
  it.each(["neutral", "primary", "success", "warning", "danger"] as const)(
    "dark tone '%s' differs from light on background + text",
    (tone) => {
      expect(DEFAULT_DARK_BADGE_COLORS[tone].background).not.toBe(
        DEFAULT_LIGHT_BADGE_COLORS[tone].background
      );
      expect(DEFAULT_DARK_BADGE_COLORS[tone].text).not.toBe(DEFAULT_LIGHT_BADGE_COLORS[tone].text);
    }
  );
});
