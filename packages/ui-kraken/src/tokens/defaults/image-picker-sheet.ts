import type { ImagePickerSheetColors } from "../tokens-types";

/**
 * Default light-mode ImagePickerSheet palette. Sheet chrome
 * mirrors `DEFAULT_LIGHT_BOTTOM_SHEET_COLORS` so an ImagePickerSheet
 * reads flush next to other sheets. Action rows use light-gray
 * backgrounds (like iOS action sheets) with dark text. Cancel is
 * red (destructive) per iOS convention.
 */
export const DEFAULT_LIGHT_IMAGE_PICKER_SHEET_COLORS: ImagePickerSheetColors = {
  sheetBackground: "#FFFFFF",
  sheetHandle: "#9CA3AF",
  actionBackground: "#FFFFFF",
  actionBackgroundPressed: "#F3F4F6",
  actionText: "#111827",
  actionIcon: "#6B7280",
  cancelText: "#DC2626",
  divider: "#E5E7EB",
};

/**
 * Default dark-mode ImagePickerSheet palette. Action rows on
 * dark-mode iOS action sheets use elevated gray-800 backgrounds
 * with light text; cancel stays red.
 */
export const DEFAULT_DARK_IMAGE_PICKER_SHEET_COLORS: ImagePickerSheetColors = {
  sheetBackground: "#1C1C1E",
  sheetHandle: "#6B7280",
  actionBackground: "#1C1C1E",
  actionBackgroundPressed: "#2C2C2E",
  actionText: "#F9FAFB",
  actionIcon: "#9CA3AF",
  cancelText: "#F87171",
  divider: "#374151",
};

/**
 * Merge partial ImagePickerSheet-color overrides on top of a base
 * palette. Missing slots fall through.
 */
export function mergeImagePickerSheetColors(
  base: ImagePickerSheetColors,
  override?: Partial<ImagePickerSheetColors>
): ImagePickerSheetColors {
  if (override == null) return base;
  return { ...base, ...override };
}
