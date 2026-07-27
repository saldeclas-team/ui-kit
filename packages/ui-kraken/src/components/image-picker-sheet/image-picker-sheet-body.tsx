import type { ImagePickerBody } from "./image-picker-sheet-body-types";

/**
 * Non-iOS / non-Android / non-web fallback. Metro should always
 * pick one of the platform variants; this file only fires in
 * Node test harnesses that don't set `Platform.OS`.
 *
 * Both pick methods resolve `null` (no-op). `supportsCamera` is
 * false so the shell hides that row in the unlikely event this
 * fallback body renders.
 */
export const imagePickerBody: ImagePickerBody = {
  supportsCamera: false,
  async pickFromCamera() {
    return null;
  },
  async pickFromLibrary() {
    return null;
  },
};
