import type { ReactNode } from "react";

import type { ImagePickerSheetColors } from "../../tokens/tokens-types";
import type { RadiusValue } from "../../utils/radius";
import type { ExpoImagePickerOptions, PickedAsset } from "./expo-image-picker-probe";

/**
 * Radius scale for action row corners. Same shape as
 * `BottomSheetRadius` — numeric px or token key. Default `"md"`.
 */
export type ImagePickerSheetRadius = RadiusValue;

/**
 * Partial override for an ImagePickerSheet's palette.
 */
export type ImagePickerSheetColorsInput = Partial<ImagePickerSheetColors>;

/**
 * Re-export of the picked asset shape. Consumers who don't
 * import `expo-image-picker` directly still get the full type
 * when reading `onPick`'s argument.
 */
export type { PickedAsset } from "./expo-image-picker-probe";

/**
 * Imperative ref API. `useRef<ImagePickerSheetRef>()` +
 * `ref.current?.present() / dismiss()` to control the sheet.
 */
export interface ImagePickerSheetRef {
  /** Open the action sheet. */
  present: () => void;
  /** Close the action sheet without picking. */
  dismiss: () => void;
}

/**
 * Public props for `<ImagePickerSheet>` — action sheet with
 * three fixed rows (camera / gallery / cancel), wraps
 * `expo-image-picker` for the actual image picking.
 *
 * Requires the optional peer `expo-image-picker` (new to Batch 2
 * Phase B — no other ui-kraken component uses it). Also requires
 * `@expo/ui` (via the internally composed `<BottomSheet>`).
 * Missing either peer renders a "install X" hint; the app does
 * not crash.
 */
export interface ImagePickerSheetProps extends ExpoImagePickerOptions {
  /**
   * Fires when the user picks an image / video. `null` when the
   * OS picker was opened but the user cancelled INSIDE it (e.g.
   * tapped Cancel in the native camera UI). Never fires when the
   * user taps our own Cancel row — that's a silent dismiss.
   */
  onPick: (asset: PickedAsset | null) => void;
  /**
   * Fires when a permission is denied (camera or media library).
   * Consumers typically show a toast or "go to Settings" hint
   * here. Optional — default behavior on denial is silent
   * dismiss.
   */
  onPermissionDenied?: (source: "camera" | "library") => void;
  /** Optional bold title at the top of the sheet. Default: `"Choose photo"`. */
  sheetTitle?: string;
  /** Label for the camera action row. Default: `"Take photo"`. */
  cameraLabel?: string;
  /** Label for the gallery action row. Default: `"Choose from library"`. */
  galleryLabel?: string;
  /** Label for the cancel action row. Default: `"Cancel"`. */
  cancelLabel?: string;
  /**
   * Optional icon slot to the LEFT of the camera row label.
   * Bring your own icon component. Not rendered when omitted.
   */
  cameraIcon?: ReactNode;
  /** Same as `cameraIcon` but for the gallery row. */
  galleryIcon?: ReactNode;
  /** Row border radius. Default `"md"`. */
  radius?: ImagePickerSheetRadius;
  /** Per-instance color overrides. */
  imagePickerSheetColors?: ImagePickerSheetColorsInput;
  /**
   * Root testID. Sub-elements derive:
   * `-sheet` (underlying BottomSheet), `-title`, `-camera`,
   * `-gallery`, `-cancel`, `-missing-peer`.
   */
  testID?: string;
}
