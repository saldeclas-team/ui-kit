# BottomSheet

Modal bottom sheet with snap points, native backdrop, and swipe-to-dismiss. Ref-controlled (imperative `present() / dismiss()`), pure shell — the consumer puts arbitrary content inside. Wraps [`@expo/ui/community/bottom-sheet`](https://docs.expo.dev/versions/latest/sdk/ui/drop-in-replacements/bottomsheet/), a drop-in replacement for `@gorhom/bottom-sheet` that uses native platform sheets under the hood.

Reach for `BottomSheet` for confirmation dialogs, edit-profile forms, action sheets, share menus, or any modal panel that slides from the bottom. For a picker specifically, use [`SelectBottomSheet`](../select-bottom-sheet/README.md).

## Peer dependency — `@expo/ui`

Same peer as `SelectNative` / `SegmentedControl` / `DatePicker`. No new install needed if any of those work. Missing peer → renders a "Install `@expo/ui`" hint colored with `missingPeer`; the app does NOT crash.

## Native backends per platform

- **iOS**: SwiftUI `sheet` with detents (the real system sheet).
- **Android**: Material 3 `ModalBottomSheet` (Compose).
- **Web**: `vaul` drawer (bundled inside `@expo/ui`, no extra peer).

## Import

```tsx
import { BottomSheet, type BottomSheetRef } from "ui-kraken";
```

## Props

| Prop                   | Type                            | Default          | Description                                                                                                                           |
| ---------------------- | ------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `children`             | `ReactNode`                     | —                | Sheet content. Rendered inside a `<BottomSheetView>`. Consumer puts anything. Required.                                               |
| `snapPoints`           | `readonly (string \| number)[]` | `["50%", "90%"]` | Snap point heights in order (smallest → largest). Percentages or px. Sheet opens at index 0. See "Why two default snap points" below. |
| `onChange`             | `(index: number) => void`       | —                | Fires when snap position changes. `-1` = closed, `0+` = open at that index.                                                           |
| `onDismiss`            | `() => void`                    | —                | Fires after the sheet fully dismisses.                                                                                                |
| `enablePanDownToClose` | `boolean`                       | `true`           | Whether swipe-down or backdrop-tap can dismiss the sheet. iOS ties both to this single flag (SwiftUI limitation).                     |
| `enableDynamicSizing`  | `boolean`                       | `false`          | Fit height to content (ignore snap points). Cannot combine with explicit `snapPoints`.                                                |
| `radius`               | `BottomSheetRadius`             | `"lg"`           | Corner radius. **Web-only** — iOS + Android use OS-standard shape. Accepted for API symmetry.                                         |
| `bottomSheetColors`    | `Partial<BottomSheetColors>`    | —                | Per-instance color override. 5 slots.                                                                                                 |
| `testID`               | `string`                        | `"bottom-sheet"` | Root testID. Sub-elements: `-sheet` (native sheet), `-view` (inner container), `-missing-peer` (fallback).                            |

## Ref API

Access via `useRef<BottomSheetRef>(null)`:

```tsx
const sheetRef = useRef<BottomSheetRef>(null);

<Button onPress={() => sheetRef.current?.present()}>Open</Button>
<BottomSheet ref={sheetRef}>...</BottomSheet>
```

| Method               | Description                                                                       |
| -------------------- | --------------------------------------------------------------------------------- |
| `present(index?)`    | Open the sheet. Optional `index` selects a snap point (0-based, defaults to `0`). |
| `dismiss()`          | Close the sheet. Fires `onDismiss` after animation.                               |
| `snapToIndex(index)` | Snap to a specific snap-point index.                                              |
| `expand()`           | Snap to the LAST snap point (fully open).                                         |
| `collapse()`         | Snap to the FIRST snap point.                                                     |

## Behavior

- **Modal-only presentation.** `@expo/ui`'s bottom-sheet is inherently modal — no inline "persistent peek" (Google Maps-style drawer). For inline sheets, use `@gorhom/bottom-sheet` directly.
- **Backdrop always present.** Every platform gets a scrim (dark overlay) behind the sheet. iOS + Android use OS-standard scrim (not themable); web (vaul) uses the `backdrop` palette slot.
- **Swipe-to-dismiss + backdrop-tap** both controlled by `enablePanDownToClose` (iOS SwiftUI can't separate them).
- **Android supports 2 snap states max** — partial (~50%) + expanded. If you pass `["25%", "50%", "90%"]`, the middle one is ignored on Android. iOS + web get the full list.
- **The sheet re-mounts `<UIKitContext.Provider>` inside its body** defensively — `@expo/ui` uses `Host + RNHostView` which should preserve React context inline, but the ceremony is cheap and shields us if a future `@expo/ui` version switches to a native portal. Same pattern as SelectBottomSheet.

### Why two default snap points

`snapPoints` defaults to `["50%", "90%"]` — TWO snap points, not just `["50%"]`. This is deliberate: Android's Material 3 `ModalBottomSheet` treats sheets with a single snap point as `skipPartiallyExpanded=true`, which makes the sheet jump straight to fully expanded (~90%+) on open and never respect the requested partial height. Passing partial + expanded gives Android a real partial state to open at (50%) and lets the user drag up to 90%. iOS respects both detents natively and defaults to the first one.

If you want a sheet that opens at a specific single height on both platforms, use `enableDynamicSizing` instead (fits to content) or pass exactly two snap points where both should be reachable via drag.

## Color model

`bottomSheetColors` — 5 slots. Small palette because native platforms own most sheet chrome (handle indicator, backdrop opacity, corner radius are OS-managed on iOS + Android; only web accepts them fully).

| Slot          | Paints                                                                                                                             |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `background`  | Sheet body background. Android accepts via `containerColor`. iOS ignores (SwiftUI sheet uses system background). Web full support. |
| `backdrop`    | Scrim behind the sheet. **Web only** — iOS + Android use their OS-native scrim (not themable).                                     |
| `handle`      | Drag indicator color at the top. **Web only** — iOS + Android render the OS-standard handle.                                       |
| `divider`     | Optional divider color between sheet body and a consumer-supplied header. Consumers ignore if their layout has no divider.         |
| `missingPeer` | Text color for the "install `@expo/ui`" fallback hint.                                                                             |

### Default palettes

**Light**: `background` `#FFFFFF` (matches raised-elevation surface), `backdrop` `rgba(0,0,0,0.5)`, `handle` `#9CA3AF` (gray-400), `divider` `#E5E7EB` (gray-200), `missingPeer` `#DC2626` (danger red).

**Dark**: `background` `#1C1C1E` (raised dark surface), `backdrop` `rgba(0,0,0,0.7)` (heavier scrim in dark mode), `handle` `#6B7280` (gray-500), `divider` `#374151` (gray-700), `missingPeer` `#F87171` (dark danger).

## Usage

Basic sheet with a button trigger:

```tsx
const sheetRef = useRef<BottomSheetRef>(null);

<Button onPress={() => sheetRef.current?.present()}>Open</Button>
<BottomSheet ref={sheetRef} onDismiss={() => console.log("dismissed")}>
  <View style={{ padding: 24 }}>
    <Text>Sheet content</Text>
    <Button onPress={() => sheetRef.current?.dismiss()}>Close</Button>
  </View>
</BottomSheet>
```

Multiple snap points:

```tsx
<BottomSheet ref={sheetRef} snapPoints={["25%", "50%", "90%"]}>
  <ScrollView>...</ScrollView>
</BottomSheet>
```

Form inside sheet:

```tsx
<BottomSheet ref={sheetRef} snapPoints={["70%"]}>
  <View style={{ padding: 24 }}>
    <Input label="Name" value={name} onChangeText={setName} />
    <Button onPress={handleSave}>Save</Button>
  </View>
</BottomSheet>
```

Non-dismissible (require explicit close):

```tsx
<BottomSheet ref={sheetRef} enablePanDownToClose={false}>
  <ConfirmationContent onConfirm={handleConfirm} onCancel={handleCancel} />
</BottomSheet>
```

Fit-to-content (no snap points):

```tsx
<BottomSheet ref={sheetRef} enableDynamicSizing>
  <ShortMessage />
</BottomSheet>
```

Brand-tinted palette:

```tsx
<BottomSheet ref={sheetRef} bottomSheetColors={{ background: "#F5F3FF", divider: "#7C3AED" }}>
  ...
</BottomSheet>
```

## Sub-element testIDs

- root: `"bottom-sheet"` (overridable via `testID`)
- native sheet: `"{root}-sheet"`
- inner container: `"{root}-view"`
- missing-peer hint (when `@expo/ui` NOT available): `"{root}-missing-peer"`

## Notes

- **No `handleComponent` / `backdropComponent` / `backgroundComponent`** — `@expo/ui` doesn't honor custom chrome on native. Consumers who need custom sheet chrome fall back to `@gorhom/bottom-sheet` directly.
- **No inline (non-modal) variant** — `@expo/ui` is modal-only. Add a follow-up if a real use case surfaces.
- **Android max 2 snap states** — see behavior note above.
- **`radius` is currently accepted but not forwarded to web (vaul)** — added for API symmetry with other components; wire-through to vaul is a follow-up.
- **The Tamagui-in-portal ceremony is cheap insurance** — @expo/ui likely doesn't need it (uses `Host` for context propagation), but keeping the `<UIKitContext.Provider>` re-mount inside the sheet body means we're safe if a future @expo/ui version restructures.

## Platform support

| Platform         | Status                      | Notes                                                                                        |
| ---------------- | --------------------------- | -------------------------------------------------------------------------------------------- |
| iOS              | ✅ (requires `@expo/ui`)    | SwiftUI `sheet` with detents. Backdrop + swipe-to-dismiss handled by SwiftUI.                |
| Android          | ✅ (requires `@expo/ui`)    | Material 3 `ModalBottomSheet` (Compose). Max 2 snap states (partial + expanded).             |
| Web              | ✅ (no extra peer required) | vaul drawer (bundled inside `@expo/ui`). Full snap point support + accepts our full palette. |
| Missing peer dep | ✅ safe fallback            | Renders "Install `@expo/ui`" hint colored with `missingPeer`. The app does NOT crash.        |

## Related

- [`SelectBottomSheet`](../select-bottom-sheet/README.md) — pre-formatted single-option picker in a bottom sheet. Currently uses `@gorhom/bottom-sheet` directly; scheduled for migration to `@expo/ui/community/bottom-sheet` in a follow-up PR (which will also remove `@gorhom/bottom-sheet` and `react-native-gesture-handler` from ui-kraken's peers).
