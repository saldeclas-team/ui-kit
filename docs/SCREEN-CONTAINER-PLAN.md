# ScreenContainer — plan (Batch 2 Phase C)

Safe-area-aware screen wrapper. Consolidates the 15-line boilerplate every RN screen typically writes (SafeAreaView + StatusBar + KeyboardAvoidingView + themed background) into one component with sensible defaults.

Last component of Batch 2. Very small scope by design — the whole point is DX consistency, not new functionality.

## Backend

`react-native-safe-area-context` — the community standard for safe-area handling. Consumed via the `useSafeAreaInsets()` hook only. Optional peer, registered with `optional: true`.

## Why no platform split

Unlike our other Phase B / Phase C native-bridge components (BottomSheet renders `<@expo/ui.BottomSheet>` directly; ImagePickerSheet calls `expo-image-picker.launchCameraAsync()`), ScreenContainer consumes `react-native-safe-area-context` ONLY via `useSafeAreaInsets()` — a hook that returns `{top, bottom, left, right}` as numbers. We don't render any native component from the peer; we render a plain RN `<View>` with computed padding.

That's structurally closer to how components consume RN's own `useWindowDimensions()` or `Platform.OS` — the native code lives entirely inside safe-area-context; we just consume the value. No cross-platform API divergence.

Consequence: single-file implementation. If a future divergence emerges (e.g. web's `env(safe-area-inset-top)` handling), we'll split at that moment. For now, one file.

## API

```ts
export type ScreenContainerRadius = RadiusValue;
export type ScreenContainerColorsInput = Partial<ScreenContainerColors>;

/** Which safe-area edges to apply padding for. Same shape as `SafeAreaView`. */
export type ScreenContainerEdge = "top" | "bottom" | "left" | "right";

/** Behavior for `<KeyboardAvoidingView>`. `"none"` disables the wrap entirely. */
export type ScreenContainerKeyboardBehavior = "none" | "padding" | "height" | "position";

/** Status bar content style. `"auto"` mirrors `activeTheme` (dark theme = light content). */
export type ScreenContainerStatusBarStyle = "auto" | "light" | "dark";

export interface ScreenContainerProps extends Omit<
  GetProps<typeof StyledScreenContainer>,
  "children"
> {
  /** Screen content. Everything renders inside the safe-area padded container. */
  children: ReactNode;
  /**
   * Which safe-area edges to inset. Default: all 4 (`["top", "bottom",
   * "left", "right"]`). Consumers with a bottom tab bar typically pass
   * `["top", "left", "right"]` to opt out of the bottom inset (the tab
   * bar owns that space).
   */
  edges?: readonly ScreenContainerEdge[];
  /**
   * Keyboard-avoiding behavior. Default `"none"` — most screens don't
   * need it; consumers with forms opt in.
   *
   * - `"padding"` — recommended for iOS. Container grows downward with
   *   keyboard height as padding.
   * - `"height"` — recommended for Android. Container shrinks to fit
   *   above the keyboard.
   * - `"position"` — legacy; not usually recommended.
   * - `"none"` — no `<KeyboardAvoidingView>` wrap.
   *
   * NOTE: `react-native`'s `KeyboardAvoidingView` behaves differently
   * per platform even for the same `behavior` prop. If you want the
   * conventional "iOS: padding / Android: height" split, pass
   * `Platform.OS === "ios" ? "padding" : "height"` inline.
   */
  keyboardBehavior?: ScreenContainerKeyboardBehavior;
  /**
   * Status bar content style. Default `"auto"`.
   *
   * - `"auto"` — flips to `"light-content"` on dark theme and
   *   `"dark-content"` on light theme. Managed via `expo-status-bar`
   *   if installed, else falls back to RN's `<StatusBar>`.
   * - `"light"` — always light content (for dark backgrounds).
   * - `"dark"` — always dark content (for light backgrounds).
   */
  statusBarStyle?: ScreenContainerStatusBarStyle;
  /**
   * Per-instance color override. 3 slots.
   */
  screenContainerColors?: ScreenContainerColorsInput;
  /**
   * Root testID. Sub-elements derive:
   * `-keyboard-avoiding` (when `keyboardBehavior !== "none"`).
   */
  testID?: string;
}
```

## Palette — 3 slots (each component owns its color space)

```ts
export interface ScreenContainerColors {
  /** Container background — fills the whole screen. */
  background: string;
  /**
   * Android status-bar background (`translucent=false` mode). Ignored
   * on iOS (translucent by default). Web ignored.
   */
  statusBarBackground: string;
  /**
   * Web fallback when `react-native-safe-area-context` isn't
   * installed — plain padding value used instead of insets. Documented
   * so consumers know the fallback isn't invisible.
   */
  fallbackPadding: string;
}
```

Rationale for the small palette: ScreenContainer is layout ceremony, not chrome. Its only visible surface is the background. Everything else is padding/positioning.

## Behavior details

- **Consumer wraps their screen content**: `<ScreenContainer>{...}</ScreenContainer>`. No trigger, no ref.
- **Safe area insets applied as padding**, not margin — so the background color extends into the inset zones (behind the status bar / home indicator).
- **KeyboardAvoidingView** wraps the children ONLY when `keyboardBehavior !== "none"`. When `"none"`, no wrapper — flat tree.
- **Status bar management** is done via a light effect that calls `StatusBar.setBarStyle()` (iOS) + `StatusBar.setBackgroundColor()` (Android). We use RN's `<StatusBar>` component if `expo-status-bar` isn't detected, and prefer `expo-status-bar` when present (it plays better with `expo-router`'s stack transitions).
- **Missing peer fallback**: when `react-native-safe-area-context` isn't installed, `useSafeAreaInsets()` isn't available. We fall back to hardcoded reasonable defaults (`44` top on iOS, `24` on Android, `20` bottom on iOS home-indicator devices, `0` elsewhere). Better than crashing; documented as suboptimal in the README.

## Wiring plan (13 steps — matches BottomSheet)

1. `docs/SCREEN-CONTAINER-PLAN.md` — this doc.
2. `tokens/tokens-types.ts` — add `ScreenContainerColors` interface + slot in `Tokens`.
3. `tokens/defaults/screen-container.ts` — defaults + merge.
4. `tokens/defaults/index.ts` — wire.
5. `tokens/tokens-derive.ts` — pass through.
6. `tokens/tokens.ts` — flatten.
7. `utils/flatten.ts` — flattener.
8. `provider/provider-types.ts` — input type + slot.
9. `provider/provider.tsx` — merge.
10. `components/screen-container/` — types + styled + component + probe + spec + stories + README + index.
11. `components/index.ts` — export.
12. `src/index.ts` — top-level export.
13. Example screen + layout route + components-home row.

Plus `packages/ui-kraken/package.json` — add `react-native-safe-area-context` to `peerDependencies` with `optional: true`. Plus changeset.

## Non-goals for v1

- **No pull-to-refresh** — we already have `<RefreshControl>` (Batch 1). Consumer composes both.
- **No scroll behavior** — plain container. Consumer wraps with `ScrollView` if needed.
- **No status-bar per-screen theming** — `statusBarStyle` prop is coarse (auto / light / dark). Consumers who need pixel-perfect status-bar color use `expo-status-bar` directly.
- **No bottom-tab awareness** — the container doesn't know about tab bars. Consumers who need to skip the bottom inset pass `edges={["top", "left", "right"]}` explicitly.
- **No background image / gradient support** — solid background only. Composers can render a full-bleed `<Image>` / `<LinearGradient>` inside if needed.
