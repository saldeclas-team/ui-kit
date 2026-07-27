---
"ui-kraken": minor
---

Add `ScreenContainer` — safe-area-aware screen wrapper. Last component of Batch 2 (Phase C).

Consolidates the boilerplate every RN screen typically writes (SafeAreaView + StatusBar + KeyboardAvoidingView + themed background) into one component with sensible defaults. Small scope by design — the point is DX consistency across every screen in an app, not new functionality.

## API

- `<ScreenContainer>{children}</ScreenContainer>` — wrap your screen content, done.
- `edges` prop (default `["top", "bottom", "left", "right"]`) — which safe-area edges to inset. Consumers with bottom tab bars pass `["top", "left", "right"]` to opt out.
- `keyboardBehavior` prop (default `"none"`) — opt into `<KeyboardAvoidingView>` wrap. Recommended split: `Platform.OS === "ios" ? "padding" : "height"`.
- `keyboardVerticalOffset` — additional vertical offset for the KAV (useful when screen sits below a nav header).
- `statusBarStyle` prop (default `"auto"`) — flips to `"light-content"` on dark theme, `"dark-content"` on light theme. Force with `"light"` / `"dark"`.
- Standard `screenContainerColors` palette + `testID` (with `-keyboard-avoiding` sub-element when the KAV wrap is present).

## Peer dependency

`react-native-safe-area-context` — new to ui-kraken's peer list. Added as `optional: true`. When installed, insets come from `useSafeAreaInsets()`; when missing, ScreenContainer falls back to hardcoded per-platform defaults (44/24 top on iOS/Android, 34/0 bottom). No crash, but documented as suboptimal — consumers should install for accurate insets.

Consumers also need to mount `<SafeAreaProvider>` at app root — otherwise the hook returns all-zero insets. The README documents both setup requirements.

## Why no platform split

Unlike our other Batch 2 native-bridge components (BottomSheet renders `<@expo/ui.BottomSheet>` directly, ImagePickerSheet calls `expo-image-picker.launchCameraAsync()`), ScreenContainer consumes `react-native-safe-area-context` ONLY via `useSafeAreaInsets()` — a hook that returns four numbers. We don't render any native component from the peer; we render a plain RN `<View>` with computed padding.

That's structurally closer to how components consume RN's own `useWindowDimensions()`. Single-file implementation. If a future divergence emerges (e.g. web's `env(safe-area-inset-top)` handling), we'll split at that moment.

## Palette — 3 slots (each component owns its color space)

- `background` — container background (extends into inset zones so status bar / home indicator don't stay black).
- `statusBarBackground` — Android status-bar background via `StatusBar.setBackgroundColor()`. iOS translucent → ignored. Web ignored.
- `fallbackPadding` — documentation sentinel; signals that the missing-peer fallback uses hardcoded numeric defaults. Not rendered as color.

Defaults mirror `DEFAULT_LIGHT_SURFACE_COLORS.base` / `DEFAULT_DARK_SURFACE_COLORS.base`.

## Testing (+23 tests, 1070 total)

- 21 shell tests: default testID, custom testID, children render, default all-4 edges insets, `edges` prop restricts inset sides, empty edges zeroes padding, light + dark palette, per-instance override, no KAV wrap by default, KAV wrap present for `padding` / `height`, `statusBarStyle='auto'` flips per theme, forced `light` / `dark` styles, missing-peer fallback insets, 3 snapshots (default light, keyboard-avoiding, dark + custom edges).
- 2 probe tests: both branches.

## Example app

New `/components/screen-container` route. Unlike other example screens, this one uses ScreenContainer at its outermost layer — the source IS the demo. Includes a form section with the recommended `Platform.OS === "ios" ? "padding" : "height"` split so consumers can see keyboard-avoiding in action.

## Batch 2 status

With ScreenContainer, **Batch 2 is COMPLETE**:
- Phase A (form controls): 6/6 ✅
- Phase B (overlays): 2/2 ✅ (Toast dropped from scope)
- Phase C (layout): 1/1 ✅

Ready for PR + v0.9.0 release.
