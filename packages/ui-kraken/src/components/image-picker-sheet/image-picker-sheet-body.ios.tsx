import { getExpoImagePicker } from "./expo-image-picker-probe";
import type { ExpoImagePickerOptions, PickedAsset } from "./expo-image-picker-probe";
import { PermissionDeniedError } from "./image-picker-sheet-body-types";
import type { ImagePickerBody } from "./image-picker-sheet-body-types";

/**
 * iOS image-picker body. Calls `expo-image-picker` directly for
 * both camera + library. Permission requests are triggered
 * inline (request-then-launch pattern) — iOS shows the system
 * permission dialog on first request; subsequent calls skip
 * straight to the picker.
 *
 * Split from Android per the `native-bridges-platform-split`
 * rule so future iOS-only tweaks (limited photo library
 * selection on iOS 17+, camera position preference) can land
 * here without touching Android.
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
