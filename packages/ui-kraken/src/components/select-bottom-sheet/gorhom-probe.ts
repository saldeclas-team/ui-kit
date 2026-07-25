/**
 * Peer-dep detection for `@gorhom/bottom-sheet` +
 * `react-native-gesture-handler`. Runs at module import time
 * (once). Same shape as `SelectNative`'s `expo-ui-probe.ts` /
 * `ExternalLink`'s `open-url.ts` — try / catch require so
 * consumers who did NOT install either peer still import
 * ui-kraken without a Metro error; the SelectBottomSheet
 * component then renders a fallback message at runtime.
 *
 * `react-native-gesture-handler` is a transitive requirement of
 * `@gorhom/bottom-sheet` — if the consumer only installs
 * @gorhom/bottom-sheet without gesture-handler, the sheet still
 * fails at runtime. We probe both so the missing-peer hint can
 * be precise about what's still needed.
 */

interface GorhomModule {
  BottomSheetModal: React.ComponentType<Record<string, unknown>>;
  BottomSheetView: React.ComponentType<Record<string, unknown>>;
  BottomSheetBackdrop: React.ComponentType<Record<string, unknown>>;
  BottomSheetModalProvider: React.ComponentType<{
    children?: React.ReactNode;
  }>;
}

let gorhom: GorhomModule | null = null;
let gestureHandlerAvailable = false;

try {
  gorhom = require("@gorhom/bottom-sheet") as GorhomModule;
} catch {
  gorhom = null;
}

try {
  require("react-native-gesture-handler");
  gestureHandlerAvailable = true;
} catch {
  gestureHandlerAvailable = false;
}

/**
 * Whether both peer deps needed by SelectBottomSheet are
 * available at runtime. When `false`, `<SelectBottomSheet>`
 * renders a placeholder hint listing the missing packages — the
 * app does NOT crash.
 */
export function areBottomSheetPeersAvailable(): boolean {
  return gorhom != null && gestureHandlerAvailable;
}

/**
 * Return the list of missing peer package names. Empty array when
 * everything is available. Used by the SelectBottomSheet fallback
 * to render an actionable "install X, Y" message.
 */
export function missingBottomSheetPeers(): string[] {
  const missing: string[] = [];
  if (gorhom == null) missing.push("@gorhom/bottom-sheet");
  if (!gestureHandlerAvailable) missing.push("react-native-gesture-handler");
  return missing;
}

/**
 * Return the `@gorhom/bottom-sheet` module namespace, or `null`
 * when the peer isn't installed. Callers must null-check before
 * use.
 */
export function getGorhomModule(): GorhomModule | null {
  return gorhom;
}
