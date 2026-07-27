/**
 * Peer-dep detection for `react-native-safe-area-context`. Runs
 * at module import time (once). Consumers who did NOT install
 * the peer still import ui-kraken without a Metro error; the
 * ScreenContainer shell falls back to hardcoded reasonable
 * defaults per platform (documented in the component doc).
 *
 * Unlike our other native-peer probes (BottomSheet, DatePicker,
 * ImagePickerSheet) which need to expose a full module + get*
 * function, this probe exposes just the ONE hook we use:
 * `useSafeAreaInsets`. That's the only bit of safe-area-context
 * that ScreenContainer touches.
 */

export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface SafeAreaContextModule {
  useSafeAreaInsets: () => SafeAreaInsets;
}

let safeAreaModule: SafeAreaContextModule | null = null;

try {
  safeAreaModule = require("react-native-safe-area-context") as SafeAreaContextModule;
} catch {
  safeAreaModule = null;
}

/**
 * Whether `react-native-safe-area-context` is available in the
 * current runtime. When `false`, ScreenContainer uses hardcoded
 * fallback insets (44/24 top on iOS/Android, 20/0 bottom).
 */
export function isSafeAreaContextAvailable(): boolean {
  return safeAreaModule != null;
}

/**
 * Return the `useSafeAreaInsets` hook from the peer, or `null`
 * when it isn't installed. Callers must null-check + fall back
 * before use.
 */
export function getUseSafeAreaInsets(): (() => SafeAreaInsets) | null {
  return safeAreaModule?.useSafeAreaInsets ?? null;
}
