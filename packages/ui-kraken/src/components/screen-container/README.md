# ScreenContainer

Safe-area-aware screen wrapper. Consolidates the boilerplate every RN screen typically writes (SafeAreaView + StatusBar + KeyboardAvoidingView + themed background) into one component with sensible defaults.

Last component of Batch 2 Phase C. Small scope by design — the point is DX consistency across every screen in an app, not new functionality.

## Import

```tsx
import { ScreenContainer } from "ui-kraken";
```

## Peer dependency — `react-native-safe-area-context`

Optional. Registered with `optional: true` in `peerDependenciesMeta`. When installed, insets come from the peer's `useSafeAreaInsets()` hook. When missing, ScreenContainer falls back to reasonable hardcoded defaults per platform (44/24 top on iOS/Android, 34/0 bottom) — the app does NOT crash, but consumers who care about pixel-accurate safe areas should install the peer.

```bash
npx expo install react-native-safe-area-context
```

Also mount `<SafeAreaProvider>` at your app root so the hook has an inset source to read from:

```tsx
import { SafeAreaProvider } from "react-native-safe-area-context";
import { UIKitProvider } from "ui-kraken";

<SafeAreaProvider>
  <UIKitProvider>{/* your app */}</UIKitProvider>
</SafeAreaProvider>;
```

Without `<SafeAreaProvider>`, the hook returns `{ top: 0, bottom: 0, left: 0, right: 0 }` — no insets applied. Not a crash but nothing is inset.

## Props

| Prop                     | Type                                            | Default                              | Description                                                                                                                         |
| ------------------------ | ----------------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `children`               | `ReactNode`                                     | —                                    | Screen content. Renders inside the safe-area padded container. Required.                                                            |
| `edges`                  | `readonly ScreenContainerEdge[]`                | `["top", "bottom", "left", "right"]` | Which safe-area edges to inset. Consumers with a bottom tab bar typically pass `["top", "left", "right"]` to opt out of the bottom. |
| `scrollable`             | `boolean`                                       | `false`                              | When `true`, renders a `<ScrollView>` as the inner element. Combines cleanly with `keyboardBehavior` (KAV wraps the ScrollView).    |
| `scrollProps`            | `Omit<ScrollViewProps, "children" \| "testID">` | —                                    | Escape-hatch props for the internal `<ScrollView>`. Common: `refreshControl`, `contentContainerStyle`, `keyboardShouldPersistTaps`. |
| `keyboardBehavior`       | `"none" \| "padding" \| "height" \| "position"` | `"none"`                             | `<KeyboardAvoidingView>` behavior. Default off (most screens don't need it). Consumers with forms opt in.                           |
| `keyboardVerticalOffset` | `number`                                        | —                                    | Additional vertical offset. Useful when the screen sits below a nav header of known height.                                         |
| `statusBarStyle`         | `"auto" \| "light" \| "dark"`                   | `"auto"`                             | Status bar content style. `"auto"` follows `activeTheme` (dark theme → light content).                                              |
| `screenContainerColors`  | `Partial<ScreenContainerColors>`                | —                                    | Per-instance color override. 3 slots.                                                                                               |
| `testID`                 | `string`                                        | `"screen-container"`                 | Root testID. Sub-elements: `-keyboard-avoiding` (when KAV wrap), `-scroll-view` (when `scrollable`).                                |

## Behavior

- **Insets applied as PADDING** (not margin) — the palette background extends behind the status bar / home indicator instead of leaving them black.
- **Themed background** from `screenContainerColors.background` — flips with `activeTheme` via the provider.
- **Auto status bar** — calls `StatusBar.setBarStyle(...)` on mount + prop changes. On Android also calls `setBackgroundColor(...)` with `statusBarBackground`.
- **KeyboardAvoidingView opt-in** — no wrapper by default. `keyboardBehavior='padding'` (iOS) or `'height'` (Android) is the conventional split.
- **Scroll opt-in** — pass `scrollable` to swap the inner container from a plain View to a `<ScrollView>`. For virtualized lists (`<FlashList>` / `<FlatList>`), leave `scrollable={false}` and let the list handle its own scrolling.

## Color model

`screenContainerColors` — 3 slots (small because the container is layout, not chrome):

| Slot                  | Paints                                                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `background`          | Container background (extends into inset zones).                                                                          |
| `statusBarBackground` | Android status-bar background via `StatusBar.setBackgroundColor()`. iOS translucent → ignored. Web ignored.               |
| `fallbackPadding`     | Documentation sentinel — never rendered as color. Signals that the missing-peer fallback uses hardcoded numeric defaults. |

### Default palettes

**Light**: `background` + `statusBarBackground` both `#FFFFFF` (matches `DEFAULT_LIGHT_SURFACE_COLORS.base`).

**Dark**: both `#0B0B0F` (matches `DEFAULT_DARK_SURFACE_COLORS.base`).

## Why no platform split

Unlike our other Batch 2 native-bridge components (BottomSheet renders `<@expo/ui.BottomSheet>` directly, ImagePickerSheet calls `expo-image-picker.launchCameraAsync()`), ScreenContainer consumes `react-native-safe-area-context` ONLY via `useSafeAreaInsets()` — a hook that returns four numbers. We don't render any native component from the peer.

That's structurally closer to how components consume RN's own `useWindowDimensions()` — the native code lives entirely inside the peer, we just consume the value. Single-file implementation. If a future divergence emerges (e.g. web's `env(safe-area-inset-top)` handling), we'll split at that moment.

## Usage

Basic — every screen in your app:

```tsx
<ScreenContainer>
  <MyScreenContent />
</ScreenContainer>
```

With a bottom tab bar (tab bar owns the bottom inset):

```tsx
<ScreenContainer edges={["top", "left", "right"]}>
  <TabScreen />
</ScreenContainer>
```

Form screen with keyboard avoidance (iOS + Android split):

```tsx
import { Platform } from "react-native";

<ScreenContainer
  keyboardBehavior={Platform.OS === "ios" ? "padding" : "height"}
  keyboardVerticalOffset={88} // navigation header height
>
  <SignInForm />
</ScreenContainer>;
```

Dark background regardless of theme:

```tsx
<ScreenContainer
  statusBarStyle="light"
  screenContainerColors={{ background: "#000000", statusBarBackground: "#000000" }}
>
  <VideoPlayerScreen />
</ScreenContainer>
```

Scrollable content — long form / feed / settings page:

```tsx
<ScreenContainer scrollable>
  <LongContent />
</ScreenContainer>
```

Scrollable with pull-to-refresh (composing our [`<RefreshControl>`](../refresh-control/README.md) from Batch 1):

```tsx
<ScreenContainer
  scrollable
  scrollProps={{
    refreshControl: <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />,
  }}
>
  <Feed items={items} />
</ScreenContainer>
```

Scrollable form with keyboard-avoiding + tap-through (`keyboardShouldPersistTaps='handled'` so tapping a button while the keyboard is open doesn't dismiss it first):

```tsx
<ScreenContainer
  scrollable
  keyboardBehavior={Platform.OS === "ios" ? "padding" : "height"}
  scrollProps={{ keyboardShouldPersistTaps: "handled" }}
>
  <LongForm />
</ScreenContainer>
```

Virtualized list (leave `scrollable={false}` — the list scrolls itself):

```tsx
<ScreenContainer edges={["top", "left", "right"]}>
  <FlashList data={rows} renderItem={...} />
</ScreenContainer>
```

## Sub-element testIDs

- root: `"screen-container"` (overridable via `testID`)
- keyboard-avoiding wrapper (present only when `keyboardBehavior !== "none"`): `"{root}-keyboard-avoiding"`
- scroll view (present only when `scrollable={true}`): `"{root}-scroll-view"`

## Notes

- **Pull-to-refresh** — pass ui-kraken's [`<RefreshControl>`](../refresh-control/README.md) (Batch 1) via `scrollProps.refreshControl`. Requires `scrollable={true}`.
- **Scroll is opt-in** — default is a plain View. Pass `scrollable` to enable, `scrollProps` for `refreshControl` / `contentContainerStyle` / etc.
- **Virtualized lists** — don't pass `scrollable={true}` if your child is a `<FlashList>` / `<FlatList>` with many rows. The list handles its own scrolling; putting it inside a ScrollView would double up.
- **No per-screen status-bar color** — `statusBarStyle` is coarse (`"auto" | "light" | "dark"`). Consumers who need pixel-perfect status-bar color use `expo-status-bar` directly.
- **No bottom-tab awareness** — the container doesn't know about tab bars. Pass `edges` explicitly for tab-bar layouts.
- **No background image / gradient** — solid background only. Compose full-bleed `<Image>` / `<LinearGradient>` inside as needed.
- **KeyboardAvoidingView platform behavior differs** even for the same `behavior` prop. If you want the conventional iOS-padding / Android-height split, pass `Platform.OS === "ios" ? "padding" : "height"` inline.

## Platform support

| Platform         | Status                                           | Notes                                                                                                                      |
| ---------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| iOS              | ✅ (recommends `react-native-safe-area-context`) | Insets from peer; status bar via `StatusBar.setBarStyle`. Translucent by default.                                          |
| Android          | ✅ (recommends `react-native-safe-area-context`) | Insets from peer; status bar via `setBarStyle` + `setBackgroundColor`.                                                     |
| Web              | ✅                                               | Insets come from CSS `env(safe-area-inset-*)` via the peer.                                                                |
| Missing peer dep | ✅ safe fallback                                 | Hardcoded per-platform defaults (44/24 top, 34/0 bottom). Documented as suboptimal — install the peer for accurate insets. |
