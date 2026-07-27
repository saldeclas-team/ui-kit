import { getExpoImagePicker } from "./expo-image-picker-probe";
import type { ExpoImagePickerOptions, PickedAsset } from "./expo-image-picker-probe";
import { PermissionDeniedError } from "./image-picker-sheet-body-types";
import type { ImagePickerBody } from "./image-picker-sheet-body-types";

/**
 * Web image-picker body. `expo-image-picker` on web supports
 * `launchImageLibraryAsync` (uses `<input type="file">`
 * internally) but NOT `launchCameraAsync` — browsers can't open
 * the OS camera app.
 *
 * `supportsCamera=false` tells the shell to hide the "Take
 * photo" row on web. If the shell tried to open the camera
 * anyway (e.g. via a consumer-triggered edge path), the call
 * would resolve `null` — no crash.
 */
export const imagePickerBody: ImagePickerBody = {
  supportsCamera: false,

  async pickFromCamera(): Promise<PickedAsset | null> {
    // Camera isn't available on web. The shell hides the row
    // when supportsCamera is false, so this method should never
    // be called in practice; keep it as a safety no-op.
    return null;
  },

  async pickFromLibrary(options: ExpoImagePickerOptions): Promise<PickedAsset | null> {
    const mod = getExpoImagePicker();
    if (mod == null) return null;
    // Web doesn't require an explicit permission grant — the
    // browser's file-input picker prompts implicitly on click.
    // We still call the permission request so the shape stays
    // consistent with native; on web it resolves granted
    // immediately.
    const perm = await mod.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) throw new PermissionDeniedError("library");
    const result = await mod.launchImageLibraryAsync(options);
    if (result.canceled) return null;
    return result.assets?.[0] ?? null;
  },
};
