import type { BottomSheetColors } from "../tokens-types";

/**
 * Default light-mode BottomSheet palette. Background mirrors
 * `DEFAULT_LIGHT_SURFACE_COLORS.raised` so a sheet reads flush
 * with raised-elevation cards. Backdrop uses black at 50% opacity
 * (web only — iOS + Android use their OS-native scrim). Handle
 * uses gray-400 to be visible on light backgrounds without
 * competing.
 */
export const DEFAULT_LIGHT_BOTTOM_SHEET_COLORS: BottomSheetColors = {
  background: "#FFFFFF",
  backdrop: "rgba(0,0,0,0.5)",
  handle: "#9CA3AF",
  divider: "#E5E7EB",
  missingPeer: "#DC2626",
};

/**
 * Default dark-mode BottomSheet palette. Background matches
 * `DEFAULT_DARK_SURFACE_COLORS.raised`; handle uses gray-500 to
 * stay visible against the dark-mode background.
 */
export const DEFAULT_DARK_BOTTOM_SHEET_COLORS: BottomSheetColors = {
  background: "#1C1C1E",
  backdrop: "rgba(0,0,0,0.7)",
  handle: "#6B7280",
  divider: "#374151",
  missingPeer: "#F87171",
};

/**
 * Merge partial BottomSheet-color overrides on top of a base
 * palette. Missing slots fall through.
 */
export function mergeBottomSheetColors(
  base: BottomSheetColors,
  override?: Partial<BottomSheetColors>
): BottomSheetColors {
  if (override == null) return base;
  return { ...base, ...override };
}
