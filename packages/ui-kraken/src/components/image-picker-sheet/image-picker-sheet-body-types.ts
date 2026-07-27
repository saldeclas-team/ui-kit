import type { ExpoImagePickerOptions, PickedAsset } from "./expo-image-picker-probe";

/**
 * Contract every platform's image-picker body must implement.
 * The shell owns the sheet UI (title + action rows + palette);
 * the body owns the peer-dep call (permissions + camera/library
 * launch) so per-platform quirks (Android 14 visual media picker,
 * iOS 17 limited library, web-only library) can diverge later.
 */
export interface ImagePickerBody {
  /**
   * Request camera permission + launch the OS camera UI. Resolves
   * with the picked asset, or `null` if the user cancelled inside
   * the camera UI. Rejects only on permission denial (caller
   * catches + notifies via `onPermissionDenied`).
   */
  pickFromCamera: (options: ExpoImagePickerOptions) => Promise<PickedAsset | null>;
  /**
   * Request media-library permission + launch the OS library UI.
   * Same resolution semantics as `pickFromCamera`.
   */
  pickFromLibrary: (options: ExpoImagePickerOptions) => Promise<PickedAsset | null>;
  /**
   * Whether this platform supports the camera. Web returns
   * `false` (browsers can't launch a native camera via
   * `expo-image-picker`), which the shell uses to hide the
   * "Take photo" row.
   */
  supportsCamera: boolean;
}

/**
 * Custom error thrown when a permission is denied. The shell
 * catches this and routes to `onPermissionDenied?(source)`.
 */
export class PermissionDeniedError extends Error {
  readonly source: "camera" | "library";
  constructor(source: "camera" | "library") {
    super(`${source} permission denied`);
    this.name = "PermissionDeniedError";
    this.source = source;
  }
}
