import type { ScreenContainerColors } from "../tokens-types";

/**
 * Default light-mode ScreenContainer palette. Background matches
 * `DEFAULT_LIGHT_SURFACE_COLORS.base` so a ScreenContainer reads
 * as the base app surface. Status bar background matches.
 * fallbackPadding is a sentinel string — never rendered as color;
 * see the component doc for numeric fallback values.
 */
export const DEFAULT_LIGHT_SCREEN_CONTAINER_COLORS: ScreenContainerColors = {
  background: "#FFFFFF",
  statusBarBackground: "#FFFFFF",
  fallbackPadding: "hardcoded-defaults",
};

/**
 * Default dark-mode ScreenContainer palette. Background matches
 * `DEFAULT_DARK_SURFACE_COLORS.base`.
 */
export const DEFAULT_DARK_SCREEN_CONTAINER_COLORS: ScreenContainerColors = {
  background: "#0B0B0F",
  statusBarBackground: "#0B0B0F",
  fallbackPadding: "hardcoded-defaults",
};

/**
 * Merge partial ScreenContainer-color overrides on top of a base
 * palette. Missing slots fall through.
 */
export function mergeScreenContainerColors(
  base: ScreenContainerColors,
  override?: Partial<ScreenContainerColors>
): ScreenContainerColors {
  if (override == null) return base;
  return { ...base, ...override };
}
