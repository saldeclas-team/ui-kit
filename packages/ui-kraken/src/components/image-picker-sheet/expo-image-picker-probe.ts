/**
 * Peer-dep detection for `expo-image-picker`. Runs at module
 * import time (once). Same shape as our other native-peer probes
 * (BottomSheet's @expo/ui probe, DatePicker's datetime probe) —
 * try / catch require so consumers who did NOT install
 * `expo-image-picker` still import ui-kraken without a Metro
 * error; the ImagePickerSheet shell renders a fallback hint at
 * runtime.
 */

/**
 * Result asset shape from `launchCameraAsync` /
 * `launchImageLibraryAsync`. Narrow copy of `expo-image-picker`'s
 * public type — kept local so consumers who don't import from
 * `expo-image-picker` still get the type when reading `onPick`.
 */
export interface PickedAsset {
  uri: string;
  width: number;
  height: number;
  type?: "image" | "video" | "livePhoto" | "pairedVideo";
  fileName?: string | null;
  fileSize?: number;
  mimeType?: string;
  duration?: number | null;
}

/**
 * The subset of `expo-image-picker`'s option shape our sheet
 * forwards. Curated — we skip legacy / deprecated options.
 */
export interface ExpoImagePickerOptions {
  mediaTypes?: "images" | "videos" | "livePhotos" | Array<"images" | "videos" | "livePhotos">;
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  videoMaxDuration?: number;
}

/**
 * Shape of the module we lazy-load. Only the four functions our
 * component uses.
 */
interface ExpoImagePickerModule {
  launchCameraAsync: (options?: ExpoImagePickerOptions) => Promise<{
    canceled: boolean;
    assets?: PickedAsset[] | null;
  }>;
  launchImageLibraryAsync: (options?: ExpoImagePickerOptions) => Promise<{
    canceled: boolean;
    assets?: PickedAsset[] | null;
  }>;
  requestCameraPermissionsAsync: () => Promise<{ granted: boolean; status: string }>;
  requestMediaLibraryPermissionsAsync: (
    writeOnly?: boolean
  ) => Promise<{ granted: boolean; status: string }>;
}

let imagePickerModule: ExpoImagePickerModule | null = null;

try {
  imagePickerModule = require("expo-image-picker") as ExpoImagePickerModule;
} catch {
  imagePickerModule = null;
}

/**
 * Whether `expo-image-picker` is available in the current
 * runtime. When `false`, `<ImagePickerSheet>` renders a
 * placeholder hint telling the consumer to install the peer —
 * the app does NOT crash.
 */
export function isImagePickerAvailable(): boolean {
  return imagePickerModule != null;
}

/**
 * Return the `expo-image-picker` module namespace, or `null` when
 * the peer isn't installed. Callers must null-check before use.
 */
export function getExpoImagePicker(): ExpoImagePickerModule | null {
  return imagePickerModule;
}
