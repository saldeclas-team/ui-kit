import type { MultiSelectColors } from "../tokens-types";

/**
 * Default light-mode MultiSelect palette.
 *
 * - Selected chip: solid brand blue-600 fill + white label.
 * - Unselected chip: white fill + gray-300 border + gray-700 label
 *   (reads as a hollow outline on a white app background).
 * - `groupLabel` matches `Text.primary` (near-black), `helperText`
 *   matches `Text.secondary` (gray-500), `errorText` matches
 *   `Text.danger` (red-600).
 */
export const DEFAULT_LIGHT_MULTI_SELECT_COLORS: MultiSelectColors = {
  selectedBackground: "#2563EB",
  selectedLabel: "#FFFFFF",
  selectedBorder: "#2563EB",
  unselectedBackground: "#FFFFFF",
  unselectedLabel: "#374151",
  unselectedBorder: "#D1D5DB",
  groupLabel: "#0B0B0F",
  helperText: "#6B7280",
  errorText: "#DC2626",
};

/**
 * Default dark-mode MultiSelect palette.
 *
 * - Selected chip: lighter brand blue-400 fill so it pops on dark;
 *   label flips to near-black for contrast on the light chip fill.
 * - Unselected chip: transparent fill (reads as a hollow outline
 *   against `Surface.base` near-black) + gray-700 border + gray-100
 *   label.
 */
export const DEFAULT_DARK_MULTI_SELECT_COLORS: MultiSelectColors = {
  selectedBackground: "#60A5FA",
  selectedLabel: "#0B0B0F",
  selectedBorder: "#60A5FA",
  unselectedBackground: "transparent",
  unselectedLabel: "#F5F5F7",
  unselectedBorder: "#374151",
  groupLabel: "#F5F5F7",
  helperText: "#9CA3AF",
  errorText: "#F87171",
};

/**
 * Merge partial MultiSelect-color overrides on top of a base palette.
 * Missing slots fall through. Slot-based, same shape as
 * `mergeInputColors` / `mergeSurfaceColors`.
 */
export function mergeMultiSelectColors(
  base: MultiSelectColors,
  override?: Partial<MultiSelectColors>
): MultiSelectColors {
  if (override == null) return base;
  return { ...base, ...override };
}
