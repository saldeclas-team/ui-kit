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
    /**
     * Ask the RN → SwiftUI / Compose bridge to size the Host to
     * the platform content's intrinsic size. Accepts a `boolean`
     * (both axes) OR a per-axis toggle (matches @expo/ui's real
     * signature — needed so callers can e.g. match horizontal
     * but pin vertical via `style.height`).
     */
    matchContents?: boolean | { horizontal?: boolean; vertical?: boolean };
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

/**
 * `MenuView` action shape — mirrors `@expo/ui/community/menu`'s
 * `MenuAction` type. Kept inline so we don't pull `@expo/ui`
 * types into ui-kraken's public surface.
 */
interface MenuActionInput {
  id?: string;
  title: string;
  state?: "on" | "off";
  attributes?: { destructive?: boolean; disabled?: boolean; hidden?: boolean };
}

interface MenuViewComponent {
  MenuView: React.ComponentType<{
    title?: string;
    actions: MenuActionInput[];
    onPressAction?: (event: { nativeEvent: { event: string } }) => void;
    shouldOpenOnLongPress?: boolean;
    style?: unknown;
    testID?: string;
    children?: React.ReactNode;
  }>;
}

let expoUI: ExpoUIModule | null = null;
let expoUIMenu: MenuViewComponent | null = null;

try {
  // Attempted at import time; if @expo/ui isn't installed the
  // require throws and we keep `expoUI` as null.
  expoUI = require("@expo/ui") as ExpoUIModule;
} catch {
  expoUI = null;
}

try {
  // `MenuView` lives in a separate @expo/ui subpath. Fails
  // independently — some environments may have @expo/ui but not
  // the community submodule.
  expoUIMenu = require("@expo/ui/community/menu") as MenuViewComponent;
} catch {
  expoUIMenu = null;
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

/**
 * Return the `MenuView` component from `@expo/ui/community/menu`,
 * or `null` when the peer / submodule isn't available. The iOS
 * and Android `SelectNative` variants prefer this over
 * `Host + Picker` because it wraps a consumer-provided trigger
 * (avoiding the SwiftUI Menu intrinsic-size measurement race
 * that causes the "raised" bug on off-screen borderless
 * pickers).
 */
export function getExpoUIMenuView(): MenuViewComponent["MenuView"] | null {
  return expoUIMenu?.MenuView ?? null;
}
