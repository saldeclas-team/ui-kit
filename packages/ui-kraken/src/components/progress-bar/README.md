# ProgressBar

Determinate progress indicator — horizontal bar that fills from left to right as `value` progresses from `min` to `max`. Complements [`Spinner`](../spinner/README.md) (indeterminate) for cases where completion percentage is known: uploads, downloads, multi-step forms, sync bars.

## Import

```tsx
import { ProgressBar } from "ui-kraken";
```

## Props

| Prop                | Type                             | Default          | Description                                                      |
| ------------------- | -------------------------------- | ---------------- | ---------------------------------------------------------------- |
| `value`             | `number`                         | `0`              | Current value. Clamped to `[min, max]`.                          |
| `min`               | `number`                         | `0`              | Range minimum.                                                   |
| `max`               | `number`                         | `100`            | Range maximum.                                                   |
| `size`              | `"sm" \| "md" \| "lg" \| number` | `"md"`           | Track height preset (sm=4, md=8, lg=12) OR raw number.           |
| `radius`            | `"full" \| "none"`               | `"full"`         | Full → pill (`borderRadius = height / 2`); none → straight bar.  |
| `showValueLabel`    | `boolean`                        | `false`          | Renders `"{percent}%"` above the bar. Ignored if `label` is set. |
| `label`             | `string`                         | —                | Custom label above the bar. Wins over `showValueLabel`.          |
| `progressBarColors` | `Partial<ProgressBarColors>`     | —                | Per-instance color override.                                     |
| `testID`            | `string`                         | `"progress-bar"` | Root testID.                                                     |

Every Tamagui `YStackProps` also flows through the `...rest` spread. `backgroundColor` is intentionally omitted — override the track color via `progressBarColors`.

## Value clamping

| Input                       | Rendered percent                      |
| --------------------------- | ------------------------------------- |
| `value < min`               | 0%                                    |
| `value > max`               | 100%                                  |
| `value === NaN` / undefined | 0%                                    |
| `min > max` (invalid range) | 0% (defensive)                        |
| `min === max` (zero-width)  | 0% (defensive)                        |
| Normal range                | `((value - min) / (max - min)) × 100` |

## Label rendering rules

| Props                         | Renders                                |
| ----------------------------- | -------------------------------------- |
| `label` set                   | Custom label above the bar             |
| `showValueLabel` + no `label` | `"{percent}%"` above the bar (rounded) |
| Neither                       | No label region — track sits alone     |

## Color model

`progressBarColors` — 3 slots:

| Slot    | Paints                           |
| ------- | -------------------------------- |
| `track` | Background of the empty portion. |
| `fill`  | Color of the completed portion.  |
| `label` | Color of the label text.         |

### Default palettes

- **Light**: `track: "#E5E7EB"` (gray-200), `fill: "#2563EB"` (blue-600), `label: "#111827"` (gray-900).
- **Dark**: `track: "#374151"` (gray-700), `fill: "#60A5FA"` (blue-400), `label: "#F9FAFB"` (gray-50).

## Usage

### Basic

```tsx
<ProgressBar value={50} />
```

### With value label

```tsx
<ProgressBar value={73} showValueLabel />   {/* "73%" above the bar */}
```

### With custom label

```tsx
<ProgressBar value={40} label="Uploading photo…" />
<ProgressBar value={2} min={0} max={5} label="Step 2 of 5" size="lg" />
```

### Custom range (file upload)

```tsx
<ProgressBar value={bytesUploaded} min={0} max={fileSize} showValueLabel />
```

### Custom color

```tsx
// Per-instance
<ProgressBar
  value={50}
  progressBarColors={{ track: "#FFF7ED", fill: "#F97316", label: "#7C2D12" }}
/>

// Provider-wide
<UIKitProvider
  overrides={{
    light: { progressBarColors: { fill: "#7C3AED" } },
  }}
>
  ...
</UIKitProvider>
```

### Straight bar (no pill)

```tsx
<ProgressBar value={50} radius="none" />
```

## Sub-element testIDs

- Root: `"progress-bar"` (overridable via `testID`).
- Track: `"{root}-track"`.
- Fill: `"{root}-fill"`.
- Label (when rendering): `"{root}-label"`.

## Accessibility

- `accessibilityRole="progressbar"` by default.
- `accessibilityValue={{ min, max, now: clampedValue }}` — screen readers announce native progress (iOS: "50 percent"; Android: "50 of 100").
- `accessibilityLabel` defaults to `label` when set, or `"Progress"` otherwise. Consumers override with domain-specific copy (`"Uploading photo"`).

## Notes

- **No indeterminate mode** — use `<Spinner />` for the loading-without-known-end case.
- **No animated value transitions** — consumers who want a smooth animation wrap in `<Animated.View>` and animate `value` themselves.
- **No striped / gradient fill** — solid color only.
- **No vertical orientation** — a vertical progress bar is rare enough to be a distinct primitive.
- **No `buffered` slot** — media-player buffered bars are a distinct component.

## Platform support

| Platform | Status |
| -------- | ------ |
| iOS      | ✅     |
| Android  | ✅     |
| Web      | ✅     |
