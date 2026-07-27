---
"ui-kraken": minor
---

Add `ImagePickerSheet` — bottom-sheet image picker with camera / gallery / cancel action rows. Second (and last) component of Batch 2 Phase B. Composes our own `<BottomSheet>` for the sheet UI and wraps `expo-image-picker` for the actual picking.

## API

- Ref-controlled: `useRef<ImagePickerSheetRef>(null)` + `ref.current?.present() / dismiss()`. No baked-in trigger — consumer wires their own button.
- Three fixed action rows: **Take photo** (camera), **Choose from library** (gallery), **Cancel**.
- Cancel row is styled destructive (`cancelText` slot, typically red) per iOS action-sheet convention.
- `onPick(asset | null)` fires with the picked asset OR `null` when the user cancelled INSIDE the OS picker UI. Cancel row taps are silent dismiss — no `onPick` fires.
- `onPermissionDenied?(source: "camera" | "library")` fires when a permission grant is denied. Consumer typically toasts a "go to Settings" hint.
- Standard `expo-image-picker` options forwarded: `mediaTypes`, `allowsEditing`, `aspect`, `quality`, `videoMaxDuration`.
- Custom labels (`cameraLabel`, `galleryLabel`, `cancelLabel`, `sheetTitle`) + optional icon slots (`cameraIcon`, `galleryIcon` — bring your own).

Standard testID surface: `-sheet`, `-title`, `-camera`, `-gallery`, `-cancel`, `-missing-peer`.

## Peer dependencies

Two optional peers:

- **`expo-image-picker`** — new to ui-kraken's peer list. Added to `peerDependencies` with `optional: true`. Consumers who don't use ImagePickerSheet don't have to install it.
- **`@expo/ui`** — inherited from our BottomSheet dependency (already required by SelectNative / SegmentedControl / DatePicker / BottomSheet).

Missing either peer → sheet body renders "Install X" hint (dynamic — lists only the packages actually missing). App does NOT crash.

## Platform behavior

- **iOS + Android**: full support. Camera + gallery via `expo-image-picker`. Permissions requested inline (request-then-launch pattern).
- **Web**: library-only. `body.supportsCamera=false` → the camera row is HIDDEN (browsers can't launch a native camera). Gallery uses `<input type="file">` internally via `expo-image-picker`.

## Architecture — platform-split per the `native-bridges-platform-split` rule

Even though iOS + Android bodies are functionally identical today (both call `expo-image-picker` with the same shape), the split is mandatory per the rule for two reasons:

1. **Bug containment** — if `expo-image-picker` breaks on one platform, the fix lives in that one body.
2. **Per-platform backend swap-ability** — we can swap the picker on ONE platform (e.g. to `react-native-image-picker` on Android) without touching the other.

Web genuinely diverges: no camera + no explicit permission request (browser file picker prompts implicitly).

File layout: `image-picker-sheet-body.{ios,android,web,tsx}` + shared `image-picker-sheet-body-types.ts` (contract + `PermissionDeniedError` class). Shell owns palette + sheet UI + peer detection + missing-peer fallback + ref forwarding.

## Palette — 8 slots (each component owns its color space)

- **Sheet chrome (2)**: `sheetBackground`, `sheetHandle` — forwarded to the internally composed `<BottomSheet>` via palette mapping (same pattern as SelectBottomSheet).
- **Action rows (5)**: `actionBackground`, `actionBackgroundPressed`, `actionText`, `actionIcon`, `cancelText` (destructive), `divider`.
- **Fallback (0)**: reuses `cancelText` for the "install X" hint since it's semantically destructive-toned anyway.

Default light + dark palettes mirror iOS action-sheet convention (white/gray-900 sheets with red Cancel).

## Testing (+57 tests, 1047 total)

- 27 shell tests: all three action rows, custom labels, ref methods, permission denial routing, custom options forwarding, peer-missing fallback (three variants: BottomSheet missing / expo-image-picker missing / both missing), web-mode camera row hidden, palette mapping to BottomSheet, dark palette, custom icons, snapshots.
- 9 iOS body tests: permission grant → launch → return asset, denial throws PermissionDeniedError, cancel returns null, missing peer returns null. Same for library.
- 9 Android body tests: same coverage.
- 6 web body tests: `supportsCamera=false`, camera is no-op, library full flow, permission handling for API symmetry.
- 3 fallback body tests.
- 2 probe tests: both branches.

## Example app

New `/components/image-picker-sheet` route with 6 sections: basic profile photo, square crop avatar (`allowsEditing + aspect=[1,1]`), receipt scanner with custom labels, video picker (`mediaTypes='videos'`), permission denial handling with visible hint, themed palette (brand purple).

## Peer dep also added to apps/example

`expo-image-picker@57.0.6` — required for the device demo to actually open the OS camera / gallery. Consumers of ui-kraken need to add it themselves via `pnpm add expo-image-picker` (or `npx expo install expo-image-picker` for managed workflows).
