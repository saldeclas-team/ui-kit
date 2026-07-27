---
"ui-kraken": patch
---

Migrate `SelectBottomSheet` from raw `@gorhom/bottom-sheet` to our own `<BottomSheet>` (which wraps `@expo/ui/community/bottom-sheet`).

## What changed

- `SelectBottomSheet` now composes `<BottomSheet>` internally instead of hand-rolling the gorhom modal + backdrop + TamaguiProvider re-mount.
- Removed `gorhom-probe.ts` + its spec — replaced by our BottomSheet's `isBottomSheetAvailable` probe.
- Simplified state management: dropped the `isPresentedRef` guard, the `open` → gorhom-ref-sync `useEffect`, and the double-present regression tests (those behaviors no longer exist — we use ref-based imperative calls without state syncing).
- Missing-peer hint now says "Install `@expo/ui`" instead of the multi-package "Install `@gorhom/bottom-sheet` + `react-native-gesture-handler`" string.
- No public API change — same props, same ref shape, same palette (SelectBottomSheet still owns its 15-slot palette; `sheetBackground` and `sheetHandle` slots are now mapped onto BottomSheet's smaller palette when it composes).

## Consumer impact

**Zero code changes required.** Consumers upgrading from earlier versions can uninstall `@gorhom/bottom-sheet` and `react-native-gesture-handler` if no other code depends on them — SelectBottomSheet no longer requires either. If you keep them installed, nothing breaks; they're just unused by ui-kraken.

**Provider setup simplified.** No more `<BottomSheetModalProvider>` at the app root, no more `<GestureHandlerRootView>` wrapping. `@expo/ui`'s bottom-sheet uses OS-native modal presentation.

## Behavioral improvements

- **Native affordances** — SwiftUI sheet on iOS, Material 3 sheet on Android, `vaul` drawer on web (instead of gorhom's JS simulation).
- **No portal ceremony** — our `<BottomSheet>` handles Tamagui context re-mount internally, so consumers who put Tamagui components inside the sheet body (`<Input>`, `<Button>`, etc.) don't hit the "Can't find Tamagui configuration" error.

## Behavioral changes to be aware of

- **Android: only 2 snap states** — if you pass `snapPoints={["25%", "50%", "90%"]}`, Android reduces to partial + expanded (middle ignored). Was 3-state under gorhom.
- **Backdrop is always present** — gorhom had none by default; we always show one via the native OS scrim.
- **iOS `enablePanDownToClose` ties swipe + backdrop-tap** — SwiftUI limitation. Was always separable under gorhom but the default was the same.
- **Custom `handleComponent` / `backdropComponent` / `backgroundComponent` no longer honored** — @expo/ui's sheet uses OS-managed chrome on native. Wasn't exposed on SelectBottomSheet's public API anyway (SelectBottomSheet's own props stayed the same); noting for consumers who might have monkey-patched.

## Testing

+7 net tests. Removed 5 gorhom-specific regression tests (double-present, zombie state, backdrop component wiring) that no longer apply. Added 2 tests for the new palette-mapping surface (`sheetBackground` / `sheetHandle` → BottomSheet's `bottomSheetColors`). 976 tests total, all passing.

## Peer-dep cleanup — deferred

`@gorhom/bottom-sheet` and `react-native-gesture-handler` are still declared as optional peers in `ui-kraken`'s `package.json` — no code in ui-kraken requires them anymore, but the declarations are left in place for this PR so consumers upgrading don't get peer-warning spam mid-migration. **Follow-up PR** will remove them from the peer list once we've validated the migration in device use.
