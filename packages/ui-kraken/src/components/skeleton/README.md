# Skeleton

Animated placeholder for loading states. Stamp Skeletons in the shape of the content that will replace them — a rounded rectangle where a `Text.H4` will render, a pill-shaped circle where an avatar will render, a stack of narrow rectangles where a paragraph will render. The pulse animation signals "content is coming" without committing to a specific shape.

## Import

```tsx
import { Skeleton } from "ui-kraken";
```

## Props

| Prop             | Type                      | Default      | Description                                                                                  |
| ---------------- | ------------------------- | ------------ | -------------------------------------------------------------------------------------------- |
| `variant`        | `"pulse" \| "static"`     | `"pulse"`    | `pulse` fades between `base` and `highlight` on a loop; `static` paints a solid `base` fill. |
| `radius`         | `SkeletonRadius`          | `"md"`       | Border-radius shorthand. Explicit `style={{ borderRadius }}` wins.                           |
| `skeletonColors` | `Partial<SkeletonColors>` | —            | Per-instance color override. Missing slots fall through to the provider.                     |
| `testID`         | `string`                  | `"skeleton"` | Root testID. The animated highlight layer uses `${testID}-highlight`.                        |

Every RN `ViewProps` (except `children`, which the primitive owns) flows through the spread — `style`, `accessibilityRole`, `accessibilityLabel`, `pointerEvents`, `onLayout`, etc.

### Sizing

Set `width` + `height` via `style`. Numbers or percentage strings — no `size` prop; width / height cover the two orthogonal dimensions.

```tsx
<Skeleton style={{ width: 240, height: 16 }} />          // text line
<Skeleton style={{ width: "100%", height: 120 }} radius="lg" /> // image slot
<Skeleton style={{ width: 48, height: 48 }} radius="pill" />    // avatar circle
```

### `radius` prop

| Value    | Border radius                                                        |
| -------- | -------------------------------------------------------------------- |
| `"none"` | `0`                                                                  |
| `"sm"`   | `radius.sm` from the theme (default scale `6`)                       |
| `"md"`   | `radius.md` from the theme (default scale `12`, this is the default) |
| `"lg"`   | `radius.lg` from the theme (default scale `18`)                      |
| `"pill"` | `9999` — RN clamps to `min(width, height) / 2` for perfect circles   |

## Color model

Skeleton has its own **`skeletonColors`** block on the token schema — 2 slots.

```tsx
import { UIKitProvider } from "ui-kraken";

<UIKitProvider
  tokens={{
    skeletonColors: {
      base: "#E5E7EB",
      highlight: "#F3F4F6",
    },
  }}
  dark={{
    skeletonColors: {
      base: "#1F2937",
      highlight: "#374151",
    },
  }}
>
  <App />
</UIKitProvider>;
```

### Slots

| Slot        | Paints                                                          |
| ----------- | --------------------------------------------------------------- |
| `base`      | The fill at rest. Also the resting color in `variant="static"`. |
| `highlight` | The peak of the pulse animation (crossfade top).                |

### Default palettes

**Light**: `#E5E7EB` base (gray-200) · `#F3F4F6` highlight (gray-100).

**Dark**: `#1F2937` base (gray-800) · `#374151` highlight (gray-700). Both stay visible against `Surface.base` in dark mode.

## Usage

Text placeholder — three stacked lines of decreasing width read as a paragraph:

```tsx
<View style={{ gap: 8 }}>
  <Skeleton style={{ width: 240, height: 14 }} />
  <Skeleton style={{ width: 200, height: 14 }} />
  <Skeleton style={{ width: 160, height: 14 }} />
</View>
```

Avatar + label row — the shape most feed items open with:

```tsx
<View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
  <Skeleton radius="pill" style={{ width: 48, height: 48 }} />
  <View style={{ gap: 6, flex: 1 }}>
    <Skeleton style={{ width: 140, height: 14 }} />
    <Skeleton style={{ width: 90, height: 12 }} />
  </View>
</View>
```

Card placeholder — avatar row + big image slot:

```tsx
<Surface level="raised" padding={16} borderRadius={12} gap={12}>
  {/* avatar row from above */}
  <Skeleton radius="lg" style={{ width: "100%", height: 160 }} />
</Surface>
```

Reduced-motion opt-out:

```tsx
const reduceMotion = useAccessibilityReduceMotion();
<Skeleton variant={reduceMotion ? "static" : "pulse"} style={{ width: 240, height: 16 }} />;
```

Per-instance brand-tinted skeleton:

```tsx
<Skeleton
  style={{ width: 240, height: 16 }}
  skeletonColors={{ base: "#DBEAFE", highlight: "#EFF6FF" }}
/>
```

## Accessibility

Defaults:

```ts
accessibilityRole = "progressbar";
accessibilityLabel = "Loading";
```

Both flow through pass-through so you can localize the label (`"Cargando la sección de perfil"`) or drop the role entirely on decorative placeholders. Once the real content mounts, unmount the Skeleton — leaving it in the tree announces "loading" indefinitely to screen readers.

## Notes

- **Pulse only in v1** — no shimmer. Shimmer needs `LinearGradient` or Reanimated + Skia and doubles the API surface. If you need shimmer, wrap the Skeleton in a gradient overlay.
- **No `count` prop** — `Array.from({ length: n }).map((_, i) => <Skeleton key={i} />)` is fine and gives you full control over per-item sizing.
- **No compound API** (`Skeleton.Avatar`, `Skeleton.Card`) — presets rot as designs evolve. Compose from the primitive.
- **No auto-`hidden`** — Skeleton stays mounted until the consumer swaps it. The primitive has no idea what "loaded" means.

## Platform support

| Platform | Status | Notes                                                                                            |
| -------- | ------ | ------------------------------------------------------------------------------------------------ |
| iOS      | ✅     | Native `View` + `react-native-reanimated` worklets (UI thread).                                  |
| Android  | ✅     | Native `View` + `react-native-reanimated` worklets (UI thread).                                  |
| Web      | ✅     | Via `react-native-web`. Reanimated runs on the main thread; opacity crossfade animates smoothly. |
