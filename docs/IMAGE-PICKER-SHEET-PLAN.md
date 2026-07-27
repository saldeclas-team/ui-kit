# ImagePickerSheet — plan (Batch 2 Phase B #2)

Bottom sheet that wraps [`expo-image-picker`](https://docs.expo.dev/versions/latest/sdk/imagepicker/) with camera / gallery / cancel actions. Ref-controlled like [`<BottomSheet>`](../packages/ui-kraken/src/components/bottom-sheet/README.md). Ships as the second Batch 2 Phase B component.

Common use case: profile-photo picker, message attachment picker, receipt / document upload flow.

## Backend

- **Sheet UI**: our own [`<BottomSheet>`](../packages/ui-kraken/src/components/bottom-sheet/README.md) (which wraps `@expo/ui/community/bottom-sheet`). Native sheet on iOS / Android / web — same peer we already use.
- **Image picking**: `expo-image-picker` for `launchCameraAsync()` + `launchImageLibraryAsync()` + `useCameraPermissions()` + `useMediaLibraryPermissions()`.

Both are **optional peers**. `expo-image-picker` is a new peer for ui-kraken — added to `peerDependencies` with `optional: true`. Consumers who don't use ImagePickerSheet don't have to install it. Missing-peer detection follows the same probe pattern as `@expo/ui`.

## Why dogfood `<BottomSheet>` rather than embed the sheet code

Same reason SelectBottomSheet composes `<BottomSheet>`:

- Single source of truth for sheet chrome, palette wiring, Tamagui-context-in-portal ceremony.
- Automatic upgrade path when we improve `<BottomSheet>` (e.g. haptic feedback on snap, iOS scrim theming).
- Consistent visual across all our sheet-backed components (SelectBottomSheet, ImagePickerSheet, and any future ones).

The composition is thin — ImagePickerSheet just adds three action rows inside the sheet body + the image picking flow.

## API

```ts
export type ImagePickerSheetRadius = RadiusValue;
export type ImagePickerSheetColorsInput = Partial<ImagePickerSheetColors>;

/**
 * Result of a successful pick. Re-exported from expo-image-picker
 * so consumers get the full type without importing the peer.
 */
export type PickedAsset = ImagePickerAsset;

/**
 * Options forwarded to expo-image-picker's `launchCameraAsync` /
 * `launchImageLibraryAsync`. Curated subset — we don't expose
 * every option (some are legacy / deprecated). Consumers who need
 * escape-hatch options fork the component.
 */
export interface ImagePickerSheetOptions {
  /** Media types to accept. Default: `"images"`. */
  mediaTypes?: "images" | "videos" | "livePhotos" | Array<"images" | "videos" | "livePhotos">;
  /** Whether to show cropping UI after picking. Default: `false`. */
  allowsEditing?: boolean;
  /** Fixed aspect ratio for the crop editor (e.g. `[1, 1]` for square). */
  aspect?: [number, number];
  /** JPEG compression quality, 0..1. Default `1` (max quality). */
  quality?: number;
  /** Max recording duration in seconds (video only). */
  videoMaxDuration?: number;
}

export interface ImagePickerSheetRef {
  /** Open the action sheet. */
  present: () => void;
  /** Close the action sheet without picking. */
  dismiss: () => void;
}

export interface ImagePickerSheetProps extends ImagePickerSheetOptions {
  /**
   * Fires when the user picks an image / video. `null` when the
   * OS picker was opened but the user cancelled inside it. Never
   * fires when the user taps our Cancel row (silent dismiss).
   */
  onPick: (asset: PickedAsset | null) => void;
  /**
   * Fires when a permission is denied (camera or media library).
   * Consumers typically show a toast or a "go to Settings" hint
   * here. Optional — default behavior is a silent dismiss.
   */
  onPermissionDenied?: (source: "camera" | "library") => void;
  /** Optional bold title at the top of the sheet. Default: `"Choose photo"`. */
  sheetTitle?: string;
  /** Label for the camera action row. Default: `"Take photo"`. */
  cameraLabel?: string;
  /** Label for the gallery action row. Default: `"Choose from library"`. */
  galleryLabel?: string;
  /** Label for the cancel action row. Default: `"Cancel"`. */
  cancelLabel?: string;
  /**
   * Optional icon slot to the LEFT of the camera row label.
   * `ReactNode` — bring your own icon component. Not rendered
   * when omitted.
   */
  cameraIcon?: ReactNode;
  /** Same as `cameraIcon` but for the gallery row. */
  galleryIcon?: ReactNode;
  /** Row border radius. Default `"md"`. */
  radius?: ImagePickerSheetRadius;
  /**
   * Per-instance color overrides. Merged on top of the provider-
   * resolved palette; unspecified slots fall through.
   */
  imagePickerSheetColors?: ImagePickerSheetColorsInput;
  /**
   * Root testID. Sub-elements derive:
   * `-sheet` (the underlying BottomSheet), `-title`,
   * `-camera` (row), `-gallery` (row), `-cancel` (row),
   * `-missing-peer` (fallback when expo-image-picker isn't installed).
   */
  testID?: string;
}
```

Ref-controlled — consumers hold `useRef<ImagePickerSheetRef>()` and call `.present() / .dismiss()`:

```tsx
const pickerRef = useRef<ImagePickerSheetRef>(null);
const [photo, setPhoto] = useState<string | null>(null);

<Button onPress={() => pickerRef.current?.present()}>Change photo</Button>
<ImagePickerSheet
  ref={pickerRef}
  onPick={(asset) => setPhoto(asset?.uri ?? photo)}
  allowsEditing
  aspect={[1, 1]}
  quality={0.8}
/>
```

## Flow

1. Consumer calls `ref.current?.present()` → sheet slides up with three action rows.
2. User taps a row:
   - **Take photo** → sheet dismisses → we request camera permission (if not granted) → `launchCameraAsync(options)` → on success fire `onPick(asset)`, on cancel-inside-camera-UI fire `onPick(null)`.
   - **Choose from library** → sheet dismisses → we request media-library permission → `launchImageLibraryAsync(options)` → same result flow.
   - **Cancel** → sheet dismisses silently (no `onPick` fires).
3. If a permission is denied, we fire `onPermissionDenied(source)` if the consumer provided it; otherwise silent dismiss.

## Platform split (mandatory per `native-bridges-platform-split`)

```
components/image-picker-sheet/
├── image-picker-sheet-types.ts          (public props + ref)
├── image-picker-sheet-body-types.ts     (per-platform body contract)
├── image-picker-sheet-styled.ts         (Tamagui styled action rows + title)
├── image-picker-sheet.tsx               (SHELL — palette + ref + peer probe + BottomSheet composition)
├── image-picker-sheet-body.tsx          (fallback — no expo-image-picker)
├── image-picker-sheet-body.ios.tsx      (iOS — launchCameraAsync / launchImageLibraryAsync)
├── image-picker-sheet-body.android.tsx  (Android — same, may need per-platform permission handling)
├── image-picker-sheet-body.web.tsx      (web — expo-image-picker on web only supports library, not camera)
├── expo-image-picker-probe.ts           (try / catch require for expo-image-picker)
├── expo-image-picker-probe.spec.ts      (probe test — both branches)
├── image-picker-sheet.spec.tsx          (shell test)
├── image-picker-sheet-body.ios.spec.tsx (iOS body test)
├── image-picker-sheet-body.android.spec.tsx
├── image-picker-sheet-body.web.spec.tsx
├── image-picker-sheet-body.spec.tsx     (fallback body test)
├── image-picker-sheet.stories.tsx
├── README.md
└── index.ts
```

Even though iOS + Android call the same `expo-image-picker` API today, the split guards against future platform divergence (e.g. iOS 17+ limited photo library selection, Android 14+ visual media picker permission model). Web only supports the library, not the camera — that platform body renders a single "Choose from library" row.

## Color palette — 8 slots (each component owns its color space)

```ts
export interface ImagePickerSheetColors {
  // Sheet chrome — forwarded to BottomSheet
  sheetBackground: string;
  sheetHandle: string;
  // Action rows — the three action buttons inside the sheet
  actionBackground: string;
  actionBackgroundPressed: string;
  actionText: string;
  actionIcon: string;
  cancelText: string; // destructive tone (typically red)
  divider: string; // between action rows
}
```

Rationale for split: rows should read as "action buttons" with their own tone, distinct from the sheet's background. Cancel is styled destructive to match iOS action-sheet convention.

## Wiring plan (13 steps — matches BottomSheet)

1. `docs/IMAGE-PICKER-SHEET-PLAN.md` — this doc.
2. `tokens/tokens-types.ts` — add `ImagePickerSheetColors` interface + slot in `Tokens`.
3. `tokens/defaults/image-picker-sheet.ts` — `DEFAULT_LIGHT_IMAGE_PICKER_SHEET_COLORS` + dark + `mergeImagePickerSheetColors`.
4. `tokens/defaults/index.ts` — wire defaults into `DEFAULT_TOKENS` / `DEFAULT_DARK_TOKENS`, re-export.
5. `tokens/tokens-derive.ts` — pass through `imagePickerSheetColors`.
6. `tokens/tokens.ts` — flatten into Tamagui theme + config.
7. `utils/flatten.ts` — `flattenImagePickerSheetColors`.
8. `provider/provider-types.ts` — `ImagePickerSheetColorsInput` + TokensInput slot.
9. `provider/provider.tsx` — merge in both light + dark reducers.
10. `components/image-picker-sheet/` — new folder with all files listed above.
11. `components/index.ts` — re-export.
12. `src/index.ts` — top-level re-export.
13. Example app: `_layout.tsx` route + row on components home + `image-picker-sheet.tsx` screen.

Plus `packages/ui-kraken/package.json` — add `expo-image-picker` to `peerDependencies` with `optional: true` in `peerDependenciesMeta`. And a changeset.

## Non-goals for v1

- **No multi-select** — v1 picks one asset at a time. `allowsMultipleSelection` on `launchImageLibraryAsync` is a follow-up.
- **No file picker (documents / PDFs)** — that's `expo-document-picker`, separate component.
- **No custom action rows** — three fixed actions (camera / gallery / cancel). Consumers who need arbitrary actions compose their own with raw `<BottomSheet>`.
- **No inline preview** — after `onPick` fires the sheet is closed; consumer displays the preview in their own layout.
- **No Live Photos / Videos in the default `mediaTypes`** — default is `"images"` only. Consumers opt in via prop.
