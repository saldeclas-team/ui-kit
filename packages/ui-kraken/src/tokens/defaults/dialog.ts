import type { DialogColors } from "../tokens-types";

/**
 * Default light-mode Dialog palette. Backdrop uses 50% black
 * (standard iOS + Material dim); panel is pure white; title uses
 * gray-900; body uses gray-700 for slightly softer secondary text.
 */
export const DEFAULT_LIGHT_DIALOG_COLORS: DialogColors = {
  backdrop: "rgba(0, 0, 0, 0.5)",
  background: "#FFFFFF",
  title: "#111827",
  body: "#374151",
};

/**
 * Default dark-mode Dialog palette. Deeper backdrop (70%) to keep
 * contrast against a dark background; panel uses gray-800; title +
 * body invert to the lighter grays for readable text on dark.
 */
export const DEFAULT_DARK_DIALOG_COLORS: DialogColors = {
  backdrop: "rgba(0, 0, 0, 0.7)",
  background: "#1F2937",
  title: "#F9FAFB",
  body: "#D1D5DB",
};

/**
 * Merge partial Dialog-color overrides on top of a base palette.
 * Missing slots fall through. Same shape as every other component
 * merge helper.
 */
export function mergeDialogColors(
  base: DialogColors,
  override?: Partial<DialogColors>
): DialogColors {
  if (override == null) return base;
  return { ...base, ...override };
}
