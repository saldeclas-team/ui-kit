/**
 * Peer-dep detection for `@expo/ui`. Runs at module import time
 * (once). Same shape as `ExternalLink`'s `open-url.ts` — try /
 * catch require so consumers who did NOT install `@expo/ui` still
 * import ui-kraken without a Metro error; the SelectNative
 * component then renders a fallback message at runtime.
 *
 * We only need `Host` (the RN → SwiftUI / Compose bridge container)
 * and `Picker` (the actual dropdown). Types are declared inline as
 * `any` — the SelectNative component uses its own strongly-typed
 * wrapper over these, so we don't need to leak `@expo/ui`'s types
 * into ui-kraken's public surface.
 */

interface ExpoUIModule {
  Host: React.ComponentType<{
    matchContents?: boolean;
    children?: React.ReactNode;
    style?: unknown;
  }>;
  Picker: React.ComponentType<{
    selectedValue: string | number;
    onValueChange: (value: string | number) => void;
    appearance?: "menu" | "wheel";
    enabled?: boolean;
    children?: React.ReactNode;
    testID?: string;
  }> & {
    Item: React.ComponentType<{ label: string; value: string | number }>;
  };
}

let expoUI: ExpoUIModule | null = null;

try {
  // Attempted at import time; if @expo/ui isn't installed the
  // require throws and we keep `expoUI` as null.
  expoUI = require("@expo/ui") as ExpoUIModule;
} catch {
  expoUI = null;
}

/**
 * Whether the `@expo/ui` peer dep is available in the current
 * runtime. When `false`, `<SelectNative>` renders a placeholder
 * hint at the native frame position telling the consumer to
 * install the peer dep — the app does NOT crash.
 */
export function isExpoUIAvailable(): boolean {
  return expoUI != null;
}

/**
 * Return the `Host` component from `@expo/ui`, or `null` when the
 * peer dep isn't installed. Callers must null-check before use.
 */
export function getExpoUIHost(): ExpoUIModule["Host"] | null {
  return expoUI?.Host ?? null;
}

/**
 * Return the `Picker` component (with attached `Item` sub-
 * component) from `@expo/ui`, or `null` when the peer dep isn't
 * installed. Callers must null-check before use.
 */
export function getExpoUIPicker(): ExpoUIModule["Picker"] | null {
  return expoUI?.Picker ?? null;
}
