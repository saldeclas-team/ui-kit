---
"ui-kraken": minor
---

Add `BottomSheet` — modal bottom sheet with snap points, backdrop, and swipe-to-dismiss. First component of Batch 2 Phase B (overlays).

Ref-controlled — the consumer holds a `useRef<BottomSheetRef>()` and calls `ref.current?.present() / dismiss() / snapToIndex() / expand() / collapse()`. Pure shell scope: the consumer puts arbitrary content inside (forms, lists, custom UI); no built-in `<BottomSheet.Header>` / `<BottomSheet.Actions>` helpers.

## Backend: `@expo/ui/community/bottom-sheet`

Uses the native sheet primitive on each platform via the same `@expo/ui` peer we already require for SelectNative / SegmentedControl / DatePicker:

- **iOS**: SwiftUI `sheet` with detents (the real system sheet).
- **Android**: Material 3 `ModalBottomSheet` (Compose).
- **Web**: `vaul` drawer with spring-physics gestures (bundled inside `@expo/ui`, no extra peer).

Chose `@expo/ui/community/bottom-sheet` over raw `@gorhom/bottom-sheet` because:

1. **Native affordances** — real SwiftUI / Material 3 sheets, not JS simulation.
2. **No `react-native-gesture-handler` peer** — removes one peer + one native install for consumers.
3. **Same peer as our other native components** — `@expo/ui` is our single umbrella peer for native primitives.
4. **Backdrop always present** — better default than gorhom (which had none).
5. **Zero extra deps on web** — vaul is bundled.

Concessions accepted per platform:

- **Android: only 2 snap states max** (partial ~50% + expanded). Passing 3+ snap points still works but the middle one is ignored on Android. Covers 95% of real-world sheet UX.
- **Modal-only presentation** — no inline "persistent peek" sheet (Google Maps style). Aligned with the modal-only scope decision.
- **iOS `enablePanDownToClose` ties swipe + backdrop-tap dismissal** — SwiftUI doesn't allow separating them. Native behavior.
- **`handleComponent` / `backdropComponent` / `backgroundComponent` not honored on native** — the OS manages them. Web accepts styles fully.

## API

- **Ref**: `useRef<BottomSheetRef>(null)` with methods `present(index?)`, `dismiss()`, `snapToIndex(index)`, `expand()`, `collapse()`.
- **Props**: `snapPoints?: readonly (string | number)[]` (default `["50%"]`), `enablePanDownToClose` (default `true`), `enableDynamicSizing`, `onChange(index)`, `onDismiss()`, `radius` (accepted for API symmetry — currently web-only follow-up), `bottomSheetColors` per-instance palette, `testID`.

Standard testID surface: `-sheet` (native sheet), `-view` (inner container), `-missing-peer` (fallback).

## Palette — 5 slots (each component owns its color space)

Per the "each component owns its color space" rule, BottomSheet declares its own `BottomSheetColors` block. Small palette because native platforms own most sheet chrome (handle indicator, backdrop opacity, corner radius are OS-managed on iOS + Android; only web accepts them fully):

- `background` — sheet body. Android via `containerColor`, iOS ignored (SwiftUI system background), web full.
- `backdrop` — scrim. Web only; iOS + Android use OS-native scrim.
- `handle` — drag indicator. Web only; iOS + Android render OS-standard handle.
- `divider` — optional divider color between sheet body and consumer-supplied header.
- `missingPeer` — text color for the "install `@expo/ui`" fallback hint.

## Provider ceremony

Re-mounts `<UIKitContext.Provider>` inside the sheet body defensively — `@expo/ui` uses `Host + RNHostView` which should preserve React context inline, but the ceremony is cheap and shields us if a future `@expo/ui` version switches to a native portal. Same pattern as SelectBottomSheet.

## Testing (+27 tests, 981 total)

25 shell tests covering: default testID + custom root, sheet + view sub-elements, children render inside, default + custom snapPoints, index=-1 default, enablePanDownToClose default true + override false, enableDynamicSizing forwards, background from palette, per-instance override wins, dark palette, onChange fires, all 6 ref methods forward correctly, missing-peer hint (both branches: probe false + probe true with null getters), radius accepted, 3 snapshots (default light, missing peer, dark).

2 probe tests: both branches (peer resolves / peer throws).

## Example app

New `/components/bottom-sheet` route with 6 sections: basic 50% sheet with dismiss counter, multi-snap 25/50/90, form inside sheet, non-dismissible, fit-to-content (enableDynamicSizing), brand-tinted palette.

## Not in this PR (deferred)

SelectBottomSheet (Batch 2 #1b, already shipped) currently uses raw `@gorhom/bottom-sheet`. Migration to `@expo/ui/community/bottom-sheet` is a separate follow-up PR — we validate the new BottomSheet in real device use first. When migrated, we'll remove `@gorhom/bottom-sheet` and `react-native-gesture-handler` from `ui-kraken`'s peer list entirely, consolidating around `@expo/ui` as the single peer for native primitives.
