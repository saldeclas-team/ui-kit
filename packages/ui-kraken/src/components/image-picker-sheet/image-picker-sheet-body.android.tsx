import { getExpoImagePicker } from "./expo-image-picker-probe";
import type { ExpoImagePickerOptions, PickedAsset } from "./expo-image-picker-probe";
import { PermissionDeniedError } from "./image-picker-sheet-body-types";
import type { ImagePickerBody } from "./image-picker-sheet-body-types";

/**
 * Android image-picker body. Functionally identical to iOS
 * today, split per the `native-bridges-platform-split` rule so
 * future Android-specific quirks can land here without
 * regressing iOS.
 *
 * ### Android-specific quirks to remember
 *
 * - **Android 14+ (API 34+)** introduced the "Selected Photos
 *   Access" permission (`READ_MEDIA_VISUAL_USER_SELECTED`) which
 *   is separate from the full media library permission.
 *   `expo-image-picker` handles this transparently but a future
 *   consumer request to expose it would live here.
 * - **Camera intent fallback**: Android devices without a camera
 *   app (rare — tablets, dev emulators) will fail
 *   `launchCameraAsync` with a specific error. Not caught here
 *   for v1; the promise rejection surfaces as an uncaught error
 *   the consumer's error boundary sees.
 * - **HEIF/HEIC support**: Android camera app returns JPEGs;
 *   iOS may return HEIF depending on device setting. Consumers
 *   who need cross-platform uniformity should transcode after
 *   pick.
 */
export const imagePickerBody: ImagePickerBody = {
  supportsCamera: true,

  async pickFromCamera(options: ExpoImagePickerOptions): Promise<PickedAsset | null> {
    const mod = getExpoImagePicker();
    if (mod == null) return null;
    const perm = await mod.requestCameraPermissionsAsync();
    if (!perm.granted) throw new PermissionDeniedError("camera");
    const result = await mod.launchCameraAsync(options);
    if (result.canceled) return null;
    return result.assets?.[0] ?? null;
  },

  async pickFromLibrary(options: ExpoImagePickerOptions): Promise<PickedAsset | null> {
    const mod = getExpoImagePicker();
    if (mod == null) return null;
    const perm = await mod.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) throw new PermissionDeniedError("library");
    const result = await mod.launchImageLibraryAsync(options);
    if (result.canceled) return null;
    return result.assets?.[0] ?? null;
  },
};
