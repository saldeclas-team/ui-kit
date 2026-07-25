/**
 * Peer-dep detection for `@expo/ui/community/segmented-control`.
 * Runs at module import time (once). Same shape as
 * `select-native/expo-ui-probe.ts` — try / catch require so
 * consumers who did NOT install `@expo/ui` still import
 * ui-kraken without a Metro error; the SegmentedControl shell
 * renders a fallback message at runtime.
 *
 * Scoped to this component's folder rather than shared under
 * `utils/` so each component owns its native imports co-located
 * with the code that uses them. Future refactor: if 3+ components
 * duplicate this pattern, extract a shared `utils/expo-ui.ts`
 * with getters per submodule.
 */

interface SegmentedControlNativeEvent {
  nativeEvent: {
    selectedSegmentIndex: number;
    value: string;
  };
}

interface SegmentedControlModule {
  SegmentedControl: React.ComponentType<{
    values?: string[];
    selectedIndex?: number;
    enabled?: boolean;
    onChange?: (event: SegmentedControlNativeEvent) => void;
    onValueChange?: (value: string) => void;
    appearance?: "dark" | "light";
    tintColor?: string;
    style?: unknown;
    testID?: string;
  }>;
}

let segmentedModule: SegmentedControlModule | null = null;

try {
  segmentedModule = require("@expo/ui/community/segmented-control") as SegmentedControlModule;
} catch {
  segmentedModule = null;
}

/**
 * Whether `@expo/ui/community/segmented-control` is available in
 * the current runtime. When `false`, `<SegmentedControl>` renders
 * a placeholder hint at the control position telling the consumer
 * to install the peer dep — the app does NOT crash.
 */
export function isSegmentedControlAvailable(): boolean {
  return segmentedModule != null;
}

/**
 * Return the native `SegmentedControl` component from `@expo/ui`,
 * or `null` when the peer isn't installed. Callers must null-check
 * before use.
 */
export function getExpoUISegmentedControl(): SegmentedControlModule["SegmentedControl"] | null {
  return segmentedModule?.SegmentedControl ?? null;
}
