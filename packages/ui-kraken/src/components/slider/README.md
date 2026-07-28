# Slider

Horizontal draggable range input. Thumb slides along a track from `min` to `max`; value snaps to `step` increments (or floats freely with `step={0}`). Pure JS via RN's `PanResponder` — no native peer.

The input counterpart to [`ProgressBar`](../progress-bar/README.md) (readonly). Volume knobs, price ranges, brightness, opacity — anywhere a consumer picks a continuous or stepped value.

## Import

```tsx
import { Slider } from "ui-kraken";
```

## Props

| Prop                | Type                      | Default    | Description                                                                |
| ------------------- | ------------------------- | ---------- | -------------------------------------------------------------------------- |
| `value`             | `number`                  | —          | Current value. Controlled by the consumer. Clamped to `[min, max]`.        |
| `onValueChange`     | `(value: number) => void` | —          | Fires on every drag frame with the new (clamped + snapped) value.          |
| `onSlidingComplete` | `(value: number) => void` | —          | Fires on release with the final value. Optional.                           |
| `min`               | `number`                  | `0`        | Range minimum.                                                             |
| `max`               | `number`                  | `100`      | Range maximum.                                                             |
| `step`              | `number`                  | `1`        | Snap increment. Pass `0` for continuous floating-point values.             |
| `size`              | `"sm" \| "md" \| "lg"`    | `"md"`     | Track + thumb size preset (sm → 4/16, md → 6/20, lg → 8/24).               |
| `disabled`          | `boolean`                 | `false`    | When true, ignores drag + dims thumb + sets `accessibilityState.disabled`. |
| `sliderColors`      | `Partial<SliderColors>`   | —          | Per-instance color override.                                               |
| `testID`            | `string`                  | `"slider"` | Root testID.                                                               |

Every Tamagui `YStackProps` also flows through the `...rest` spread. `backgroundColor` is intentionally omitted — override the track color via `sliderColors`.

## Color model

`sliderColors` — 3 slots:

| Slot    | Paints                                              |
| ------- | --------------------------------------------------- |
| `track` | Background of the unfilled portion.                 |
| `fill`  | The filled portion from `min` to the current value. |
| `thumb` | The draggable circle.                               |

Track + fill mirror ProgressBar's palette so a Slider and a ProgressBar at the same value read as related.

### Default palettes

- **Light**: `track: "#E5E7EB"`, `fill: "#2563EB"`, `thumb: "#FFFFFF"`.
- **Dark**: `track: "#374151"`, `fill: "#60A5FA"`, `thumb: "#F9FAFB"`.

## Usage

### Basic controlled slider

```tsx
import { Slider } from "ui-kraken";
import { useState } from "react";

function VolumeControl() {
  const [volume, setVolume] = useState(50);
  return <Slider value={volume} onValueChange={setVolume} accessibilityLabel="Volume" />;
}
```

### Stepped (rating scale)

```tsx
<Slider value={rating} onValueChange={setRating} min={0} max={5} step={1} />
```

### Continuous (floating-point)

```tsx
<Slider value={opacity} onValueChange={setOpacity} min={0} max={1} step={0} />
```

### Custom range (file upload progress override)

```tsx
<Slider min={0} max={1024000} step={0} value={bytesUploaded} onValueChange={handleChange} />
```

### Only care about final value

```tsx
<Slider value={draft} onValueChange={setDraft} onSlidingComplete={handleCommit} />
```

### Custom color

```tsx
<Slider
  value={value}
  onValueChange={setValue}
  sliderColors={{ track: "#FFF7ED", fill: "#F97316", thumb: "#7C2D12" }}
/>
```

## Sub-element testIDs

- Root: `"slider"` (overridable via `testID`).
- Track: `"{root}-track"`.
- Fill: `"{root}-fill"`.
- Thumb: `"{root}-thumb"`.

## Accessibility

- `accessibilityRole="adjustable"` — VoiceOver + TalkBack recognize the widget.
- `accessibilityValue={{ min, max, now: clampedValue }}` — announced as "50 of 100".
- `accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}` — nudges by `step` (or 1 if `step === 0`).
- `accessibilityState={{ disabled }}` — dims + skipped by focus when true.
- `accessibilityLabel` — set this to describe what the slider controls (`"Volume"`, `"Brightness"`).

## Notes

- **Pure JS via PanResponder + `onLayout`** — no native peer needed. Same rationale as our other pure-JS bodies: peers requiring a native rebuild are avoided when possible.
- **Value is clamped** — `value < min` renders at 0%, `value > max` at 100%. `NaN` falls back to `min`.
- **Zero-width track** — before `onLayout` fires, the trackWidth is `0` and drag events fall back to the current clamped value (no garbage emitted on the first pre-layout frame).

## Non-goals

- **No range slider (two thumbs)** — distinct primitive; ship `<RangeSlider>` if we see the pattern.
- **No vertical orientation** — vertical sliders are rare enough to defer.
- **No value label bubble that follows the thumb** — consumers render their own `<Text>` bound to the same state.
- **No custom thumb component** — consumers who want a shape / image thumb pass a custom View via `sliderColors` (background).
- **No haptic feedback on drag** — consumers wire `expo-haptics` in `onValueChange` themselves.
- **No native peer dep** (`@react-native-community/slider`) — avoids the dev-client rebuild trap.

## Platform support

| Platform | Status                                       |
| -------- | -------------------------------------------- |
| iOS      | ✅                                           |
| Android  | ✅                                           |
| Web      | ✅ (PanResponder works via react-native-web) |
