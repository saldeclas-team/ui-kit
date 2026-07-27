# ImagePickerSheet

Bottom-sheet image picker with three action rows: **Take photo** (camera) / **Choose from library** (gallery) / **Cancel**. Wraps [`expo-image-picker`](https://docs.expo.dev/versions/latest/sdk/imagepicker/) for the actual picking and composes our own [`<BottomSheet>`](../bottom-sheet/README.md) for the sheet UI.

Reach for `ImagePickerSheet` for profile-photo pickers, receipt / attachment uploads, message media picking, and anywhere the user needs to pick one image or video.

## Peer dependencies — `expo-image-picker` + `@expo/ui`

Two optional peers, both registered with `optional: true` in `ui-kraken`'s `peerDependenciesMeta`. Consumers who don't use ImagePickerSheet don't have to install either.

- **`expo-image-picker`** — the actual picker. Required to open the camera / gallery.
- **`@expo/ui`** — inherited from our `<BottomSheet>` dependency. Required for the sheet UI itself.

**When both installed**: full functionality. `useRef<ImagePickerSheetRef>().present()` opens the sheet.

**When either is missing**: opening the sheet renders an "Install X" hint inside the sheet body instead of the action rows. The app does NOT crash. The hint dynamically lists only the packages that are actually missing.

## Import

```tsx
import { ImagePickerSheet, type ImagePickerSheetRef, type PickedAsset } from "ui-kraken";
```

## Props

| Prop                     | Type                                            | Default                 | Description                                                                                                                                                       |
| ------------------------ | ----------------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onPick`                 | `(asset: PickedAsset \| null) => void`          | —                       | Fires with the picked asset, or `null` when the user cancelled INSIDE the OS picker UI. NEVER fires when the user taps our Cancel row (silent dismiss). Required. |
| `onPermissionDenied`     | `(source: "camera" \| "library") => void`       | —                       | Fires when a permission grant is denied. Consumer typically shows a toast or "go to Settings" hint here.                                                          |
| `mediaTypes`             | `"images" \| "videos" \| "livePhotos" \| Array` | `"images"`              | Media types accepted. Forwarded to `expo-image-picker`.                                                                                                           |
| `allowsEditing`          | `boolean`                                       | `false`                 | Show cropping UI after picking.                                                                                                                                   |
| `aspect`                 | `[number, number]`                              | —                       | Fixed aspect ratio for the crop editor (e.g. `[1, 1]` for square).                                                                                                |
| `quality`                | `number` (0-1)                                  | `1`                     | JPEG compression quality.                                                                                                                                         |
| `videoMaxDuration`       | `number`                                        | —                       | Max recording duration in seconds (video only).                                                                                                                   |
| `sheetTitle`             | `string`                                        | `"Choose photo"`        | Bold title at the top of the sheet. Pass `""` to hide.                                                                                                            |
| `cameraLabel`            | `string`                                        | `"Take photo"`          | Label for the camera action row.                                                                                                                                  |
| `galleryLabel`           | `string`                                        | `"Choose from library"` | Label for the gallery action row.                                                                                                                                 |
| `cancelLabel`            | `string`                                        | `"Cancel"`              | Label for the cancel action row.                                                                                                                                  |
| `cameraIcon`             | `ReactNode`                                     | —                       | Optional icon left of the camera label. Bring your own icon component.                                                                                            |
| `galleryIcon`            | `ReactNode`                                     | —                       | Same as `cameraIcon` but for the gallery row.                                                                                                                     |
| `radius`                 | `ImagePickerSheetRadius`                        | `"md"`                  | Action row corner radius.                                                                                                                                         |
| `imagePickerSheetColors` | `Partial<ImagePickerSheetColors>`               | —                       | Per-instance color override. 8 slots.                                                                                                                             |
| `testID`                 | `string`                                        | `"image-picker-sheet"`  | Root testID. Sub-elements: `-sheet`, `-title`, `-camera`, `-gallery`, `-cancel`, `-missing-peer`.                                                                 |

## Ref API

```tsx
const pickerRef = useRef<ImagePickerSheetRef>(null);

<Button onPress={() => pickerRef.current?.present()}>Change photo</Button>
<ImagePickerSheet ref={pickerRef} onPick={handlePick} />
```

| Method      | Description                             |
| ----------- | --------------------------------------- |
| `present()` | Open the action sheet.                  |
| `dismiss()` | Close the action sheet without picking. |

## Behavior

- **Consumer opens the sheet via `ref.current?.present()`** — typically from a button. No trigger baked in.
- **Sheet uses `enableDynamicSizing`** internally — height fits the three action rows exactly, no wasted space.
- **On tap of camera / gallery row**: sheet dismisses → we request the appropriate permission → launch the OS picker → fire `onPick(asset)` on success or `onPick(null)` if the user cancelled inside the OS UI.
- **On tap of Cancel row**: sheet dismisses silently. `onPick` does NOT fire.
- **Permission denial**: fires `onPermissionDenied?(source)` if the consumer provided it, else silent dismiss.
- **Web**: the "Take photo" row is HIDDEN (browsers can't launch a native camera). Only "Choose from library" + "Cancel" render.
- **Cancel row is styled destructive** (`cancelText` slot, typically red) per iOS action-sheet convention.

## Color model

`imagePickerSheetColors` — 8 slots grouped:

### Sheet chrome (2, forwarded to BottomSheet)

| Slot              | Paints                                          |
| ----------------- | ----------------------------------------------- |
| `sheetBackground` | Sheet body background.                          |
| `sheetHandle`     | Drag handle at the top of the sheet (web only). |

### Action rows (5)

| Slot                      | Paints                                                                                         |
| ------------------------- | ---------------------------------------------------------------------------------------------- |
| `actionBackground`        | Default row background.                                                                        |
| `actionBackgroundPressed` | Row background while pressed (feedback color).                                                 |
| `actionText`              | Camera + gallery row label text.                                                               |
| `actionIcon`              | Icon slot color (if the consumer passes `cameraIcon` / `galleryIcon` as raw glyphs).           |
| `cancelText`              | Cancel row label text. Also colors the "install X" fallback hint. Typically red (destructive). |
| `divider`                 | Thin line between action rows.                                                                 |

### Default palettes

**Light**: white sheet + white rows, `#F3F4F6` pressed feedback, `#111827` action text, `#DC2626` cancel (danger red), `#E5E7EB` dividers.

**Dark**: `#1C1C1E` sheet + rows (iOS dark-mode action sheet convention), `#2C2C2E` pressed, `#F9FAFB` action text, `#F87171` cancel, `#374151` dividers.

## Usage

Basic profile-photo picker:

```tsx
const pickerRef = useRef<ImagePickerSheetRef>(null);
const [photo, setPhoto] = useState<string | null>(null);

<Button onPress={() => pickerRef.current?.present()}>Change photo</Button>;
{
  photo != null && <Image source={{ uri: photo }} style={{ width: 96, height: 96 }} />;
}
<ImagePickerSheet ref={pickerRef} onPick={(asset) => asset != null && setPhoto(asset.uri)} />;
```

Square avatar with crop:

```tsx
<ImagePickerSheet
  ref={pickerRef}
  onPick={handlePick}
  allowsEditing
  aspect={[1, 1]}
  quality={0.8}
  sheetTitle="Change avatar"
/>
```

Receipt scanner with custom labels:

```tsx
<ImagePickerSheet
  ref={pickerRef}
  onPick={handleReceipt}
  sheetTitle="Add receipt"
  cameraLabel="Scan receipt"
  galleryLabel="Pick from photos"
  quality={1}
/>
```

Permission-denied handling:

```tsx
<ImagePickerSheet
  ref={pickerRef}
  onPick={handlePick}
  onPermissionDenied={(source) =>
    toast.error(
      source === "camera"
        ? "Enable camera in Settings to take photos"
        : "Enable photo library access in Settings"
    )
  }
/>
```

Video picking:

```tsx
<ImagePickerSheet
  ref={pickerRef}
  onPick={handleVideo}
  mediaTypes="videos"
  videoMaxDuration={60}
  cameraLabel="Record video"
  galleryLabel="Choose video"
/>
```

## Sub-element testIDs

- root: `"image-picker-sheet"` (overridable via `testID`)
- underlying BottomSheet: `"{root}-sheet"`
- title (when set): `"{root}-title"`
- camera row (hidden on web): `"{root}-camera"`
- gallery row: `"{root}-gallery"`
- cancel row: `"{root}-cancel"`
- missing-peer hint (when peer(s) unavailable): `"{root}-missing-peer"`

## Notes

- **`radius` prop is accepted but not currently wired** to the styled action rows — it's there for API symmetry with other components (all our sheets accept a radius prop). Will land in a follow-up if consumer feedback needs it.
- **No custom action rows** — three fixed actions. Consumers who need arbitrary actions compose their own with raw `<BottomSheet>`.
- **No multi-select** — v1 picks one asset. `allowsMultipleSelection` on `launchImageLibraryAsync` is a follow-up.
- **No file picker / documents** — that's `expo-document-picker`, separate component.
- **No inline preview** — after `onPick` fires, the sheet is closed. Consumer displays the preview in their own layout.
- **Web only supports library, not camera** — the camera row is hidden. `body.supportsCamera` is `false`.

## Platform support

Delegates the sheet UI to [`<BottomSheet>`](../bottom-sheet/README.md) and the image picking to `expo-image-picker`. Summary:

| Platform         | Status                                                       | Notes                                                                                                             |
| ---------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| iOS              | ✅ (requires `@expo/ui` + `expo-image-picker`)               | SwiftUI sheet + `launchCameraAsync` / `launchImageLibraryAsync`. Full support.                                    |
| Android          | ✅ (requires `@expo/ui` + `expo-image-picker`)               | Material 3 sheet + `expo-image-picker`. Full support.                                                             |
| Web              | ⚠️ (library-only, requires `@expo/ui` + `expo-image-picker`) | vaul sheet + `<input type="file">` via `expo-image-picker`. Camera row hidden.                                    |
| Missing peer dep | ✅ safe fallback                                             | Sheet renders "Install X" hint colored with `cancelText`. App does NOT crash. Dynamic — lists only missing peers. |
