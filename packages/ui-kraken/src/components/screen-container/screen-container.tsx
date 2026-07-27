import { useEffect } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StatusBar } from "react-native";

import { useUIKit } from "../../provider/use-ui-kit";
import { resolvePalette } from "../../utils/resolve-palette";
import { getUseSafeAreaInsets, isSafeAreaContextAvailable } from "./safe-area-probe";
import type { SafeAreaInsets } from "./safe-area-probe";
import { StyledScreenContainer, StyledScreenContainerInner } from "./screen-container-styled";
import type {
  ScreenContainerEdge,
  ScreenContainerProps,
  ScreenContainerStatusBarStyle,
} from "./screen-container-types";

const DEFAULT_EDGES: readonly ScreenContainerEdge[] = ["top", "bottom", "left", "right"];

/**
 * Hardcoded fallback insets used when
 * `react-native-safe-area-context` isn't installed. Reasonable
 * defaults per platform — iOS notch/status bar heights, iOS home-
 * indicator zone, Android status bar height. Better than 0 (which
 * would put content behind system chrome).
 */
const FALLBACK_INSETS: SafeAreaInsets = {
  top: Platform.OS === "ios" ? 44 : 24,
  bottom: Platform.OS === "ios" ? 34 : 0,
  left: 0,
  right: 0,
};

/**
 * Lazily cached hook reference — resolved on first render, not
 * at module load. Two reasons for the lazy pattern:
 *
 * 1. **Jest.mock timing** — jest hoists `jest.mock()` factories
 *    to the top of a spec file but does NOT hoist the outer
 *    `const mockGetHook = jest.fn(...)` variable initializers.
 *    A module-load-time `getUseSafeAreaInsets()` call would
 *    execute before `mockGetHook` gets its function value,
 *    crashing with "mockGetHook is not a function".
 * 2. **Rules of hooks** — we need to call the SAME hook every
 *    render. Resolving once on first render and caching means
 *    the returned reference is stable across all subsequent
 *    renders, so the "always same hook" invariant holds.
 *
 * The cached function is either the real `useSafeAreaInsets`
 * from the peer OR a fallback thunk that returns hardcoded
 * per-platform insets. Consumers see identical shape either way.
 */
let cachedInsetsHook: (() => SafeAreaInsets) | null = null;
function resolveInsetsHook(): () => SafeAreaInsets {
  if (cachedInsetsHook == null) {
    cachedInsetsHook = getUseSafeAreaInsets() ?? (() => FALLBACK_INSETS);
  }
  return cachedInsetsHook;
}

/**
 * Test-only reset. In production the cached hook stays stable
 * for the lifetime of the app (a peer either exists or it
 * doesn't — it never toggles at runtime). Tests that want to
 * exercise both branches call this between renders to reset the
 * cache.
 */
export function __resetInsetsHookCache(): void {
  cachedInsetsHook = null;
}

/**
 * Safe-area-aware screen wrapper. Consolidates the boilerplate
 * every RN screen typically writes (SafeAreaView + StatusBar +
 * KeyboardAvoidingView + themed background) into one component.
 *
 * ```tsx
 * <ScreenContainer>
 *   <YourScreenContent />
 * </ScreenContainer>
 * ```
 *
 * ### What consumers get for free
 *
 * - Safe-area padding (via `useSafeAreaInsets()` from
 *   `react-native-safe-area-context`) applied as PADDING (not
 *   margin) — so the palette background extends behind the
 *   status bar / home indicator instead of leaving them black.
 * - Themed background from `screenContainerColors.background`
 *   (follows `activeTheme` via the provider).
 * - Auto status bar content style — flips to
 *   `"light-content"` on dark theme, `"dark-content"` on light
 *   theme. Override with the `statusBarStyle` prop.
 * - Optional `<KeyboardAvoidingView>` wrap via `keyboardBehavior`
 *   prop. Opt-in — most screens don't need it.
 *
 * ### Why no platform split
 *
 * Unlike our other Batch 2 native-bridge components,
 * ScreenContainer consumes `react-native-safe-area-context` ONLY
 * via `useSafeAreaInsets()` — a hook that returns four numbers.
 * We don't render any native component from the peer; we render
 * a plain RN `<View>` with computed padding. That's closer to
 * how components consume RN's own `useWindowDimensions()` — the
 * native code lives entirely inside the peer, we just consume
 * the value. Single-file implementation.
 *
 * ### Missing-peer fallback
 *
 * When `react-native-safe-area-context` isn't installed, the
 * shell falls back to hardcoded per-platform insets (44/24 top,
 * 34/0 bottom on iOS/Android). Not perfect but way better than
 * crashing or showing content under the notch. Documented as
 * suboptimal in the README.
 */
export function ScreenContainer({
  children,
  edges = DEFAULT_EDGES,
  keyboardBehavior = "none",
  keyboardVerticalOffset,
  statusBarStyle = "auto",
  scrollable = false,
  scrollProps,
  screenContainerColors,
  testID,
}: ScreenContainerProps) {
  const { tokens, activeTheme } = useUIKit();
  const rootId = testID ?? "screen-container";
  const palette = resolvePalette(tokens.screenContainerColors, screenContainerColors);
  // Resolve the insets hook once per app-load (cached at module
  // level) then call it. Even though `useInsets` is dynamically
  // resolved, `resolveInsetsHook()` returns the SAME function
  // for every render — hooks-order invariant holds.
  const useInsets = resolveInsetsHook();
  const insets = useInsets();

  // Effective status bar content — `"auto"` follows the theme.
  const barStyle = resolveBarStyle(statusBarStyle, activeTheme);

  // Manage the status bar as a side effect so we don't insert an
  // extra <StatusBar> element into the tree. RN's imperative API
  // is safe to call repeatedly on prop changes.
  useEffect(() => {
    StatusBar.setBarStyle(barStyle, true);
    if (Platform.OS === "android") {
      StatusBar.setBackgroundColor(palette.statusBarBackground, true);
    }
  }, [barStyle, palette.statusBarBackground]);

  // Build padding object from insets. Only apply the edges the
  // consumer opted into.
  const padding = buildEdgePadding(insets, edges);

  // Inner element renders either a ScrollView (scrollable=true)
  // or a plain flex View. Keeping the ternary here (not
  // extracting to a helper) makes the render tree obvious at a
  // glance — the actual JSX shape is what a maintainer looks
  // for when debugging scroll or KAV interactions.
  const inner = scrollable ? (
    <ScrollView
      testID={`${rootId}-scroll-view`}
      style={{ flex: 1, backgroundColor: palette.background }}
      // ScrollView's default contentContainerStyle doesn't
      // flex; consumers who want centered / justified content
      // pass their own via `scrollProps`. We spread scrollProps
      // AFTER our own defaults so consumers can override.
      {...scrollProps}
    >
      {children}
    </ScrollView>
  ) : (
    <StyledScreenContainerInner backgroundColor={palette.background}>
      {children}
    </StyledScreenContainerInner>
  );

  return (
    <StyledScreenContainer
      testID={rootId}
      backgroundColor={palette.background}
      paddingTop={padding.top}
      paddingBottom={padding.bottom}
      paddingLeft={padding.left}
      paddingRight={padding.right}
    >
      {keyboardBehavior === "none" ? (
        inner
      ) : (
        <KeyboardAvoidingView
          testID={`${rootId}-keyboard-avoiding`}
          behavior={keyboardBehavior}
          keyboardVerticalOffset={keyboardVerticalOffset}
          style={{ flex: 1 }}
        >
          {inner}
        </KeyboardAvoidingView>
      )}
    </StyledScreenContainer>
  );
}

/**
 * Map our high-level `statusBarStyle` prop to RN's
 * `StatusBar.setBarStyle` string. `"auto"` chooses based on
 * theme.
 */
function resolveBarStyle(
  style: ScreenContainerStatusBarStyle,
  activeTheme: "light" | "dark"
): "light-content" | "dark-content" {
  if (style === "light") return "light-content";
  if (style === "dark") return "dark-content";
  return activeTheme === "dark" ? "light-content" : "dark-content";
}

/**
 * Compute the padding-per-edge object from insets. Only edges
 * in the `edges` array get inset; the rest are 0.
 */
function buildEdgePadding(
  insets: SafeAreaInsets,
  edges: readonly ScreenContainerEdge[]
): { top: number; bottom: number; left: number; right: number } {
  return {
    top: edges.includes("top") ? insets.top : 0,
    bottom: edges.includes("bottom") ? insets.bottom : 0,
    left: edges.includes("left") ? insets.left : 0,
    right: edges.includes("right") ? insets.right : 0,
  };
}

export { isSafeAreaContextAvailable };

export type {
  ScreenContainerColorsInput,
  ScreenContainerEdge,
  ScreenContainerKeyboardBehavior,
  ScreenContainerProps,
  ScreenContainerScrollProps,
  ScreenContainerStatusBarStyle,
} from "./screen-container-types";
