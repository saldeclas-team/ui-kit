# Slider — design record

**Status:** planned for ui-kraken v0.10.0 (Batch 3 alongside Card + Divider + Spinner + Avatar + Badge + ProgressBar + Dialog). Interactive range input — the input counterpart to `ProgressBar` (readonly). Volume knobs, price ranges, brightness, blur radius, opacity — anywhere a consumer needs to pick a continuous or stepped value.

Living design doc for the `Slider` primitive. Kept post-shipping so future contributors can understand the decisions behind the shape of the API, not just what it does today.

---

## Overview

Horizontal draggable range input. Thumb slides along a track from `min` to `max`; value snaps to `step` increments. Visually shares the track / fill vocabulary with `ProgressBar` — a Slider and a ProgressBar at the same value read as related. Ships as **pure JS with RN's `PanResponder`**, no native peer — same rationale as the DatePicker web body: peer deps that need a native rebuild (like `@react-native-community/slider`) are avoided when a pure JS alternative works.

**Locked decisions:**

- **Pure JS with `PanResponder`, no native peer.** `@react-native-community/slider` would work but requires a dev-client native rebuild (same class of trap that broke ScreenContainer). PanResponder + `onLayout` for track measurement covers every use case at a fraction of the risk. When we hit a specific limitation (haptics on drag-end, iOS-native tint), we revisit — but not preemptively.
- **Controlled only** — `value` + `onValueChange` fire on every drag frame; `onSlidingComplete` fires on release. No uncontrolled `defaultValue` — the state-in-two-places bug that pattern always produces is worse than the boilerplate of `useState<number>`.
- **`step` snaps discretely.** Default is `1` (integers). Consumers who want continuous drag pass `step={0}` — no snap, floating-point values pass through. Consumers who want half-integers pass `step={0.5}`. Consumers who want a 5-value scale on `min=0 max=100` pass `step={25}`.
- **Value is clamped, not asserted.** `value < min` or `> max` renders at the corresponding end. Same guardrail as ProgressBar's `clampValue`.
- **Three size presets — `sm` (track 4, thumb 16) / `md` (track 6, thumb 20, default) / `lg` (track 8, thumb 24).** Thumb is always larger than track so the tap target is comfortable (Apple HIG minimum 44 is respected via `hitSlop`, not thumb size).
- **`disabled` opt-in.** When true, PanResponder rejects the gesture, the thumb dims (via palette override in the disabled path), and `accessibilityState.disabled` fires.
- **Own color block — 3 slots: `track` + `fill` + `thumb`.** Shares the track/fill vocabulary with ProgressBar so the two primitives read as a coherent family.
- **A11y as an increment/decrement adjustable.** `accessibilityRole="adjustable"` + `accessibilityValue={{ min, max, now }}` + `accessibilityActions={[{name: "increment"}, {name: "decrement"}]}` so VoiceOver / TalkBack can nudge the value by one step without a drag gesture. `onAccessibilityAction` maps to `step`.
- **Extends `YStack`.** Every Tamagui `YStackProps` flows through the `...rest` spread. `backgroundColor` is intentionally omitted (track palette owns it).

## API

### Props

```ts
export type SliderSize = "sm" | "md" | "lg";

export type SliderColorsInput = Partial<SliderColors>;

export interface SliderProps extends Omit<YStackProps, "backgroundColor"> {
  /** Current value. Controlled by the consumer. Clamped to `[min, max]`. */
  value: number;
  /** Fires on every drag frame with the new (clamped + snapped) value. */
  onValueChange: (value: number) => void;
  /** Fires on release with the final value. Optional. */
  onSlidingComplete?: (value: number) => void;
  /** Range minimum. Default: `0`. */
  min?: number;
  /** Range maximum. Default: `100`. */
  max?: number;
  /**
   * Snap increment. Default: `1`. Pass `0` for continuous
   * (floating-point) values.
   */
  step?: number;
  /**
   * Size preset. Track height + thumb size scale together:
   * `sm` → track 4 + thumb 16, `md` → 6 + 20 (default), `lg` → 8 + 24.
   */
  size?: SliderSize;
  /**
   * When true, the slider ignores drag gestures and dims the
   * thumb. Also sets `accessibilityState.disabled`. Default: `false`.
   */
  disabled?: boolean;
  /** Per-instance color override. */
  sliderColors?: SliderColorsInput;
  /** Root testID. Default: `"slider"`. */
  testID?: string;
}
```

### Sub-element testIDs

- Root: `"slider"` (overridable via `testID`).
- Track: `"{root}-track"`.
- Fill: `"{root}-fill"`.
- Thumb: `"{root}-thumb"`.

### A11y

- `accessibilityRole="adjustable"` — VoiceOver + TalkBack recognize the widget.
- `accessibilityValue={{ min, max, now: clampedValue }}` — announced as "50 of 100" / "50%".
- `accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}` — `onAccessibilityAction` bumps value by `step` (or 1 if `step === 0`).
- `accessibilityState={{ disabled }}` — dims + skipped by focus when true.
- `accessibilityLabel` — consumers set this per-instance to describe what the slider controls (`"Volume"`, `"Brightness"`).

## Token schema

`sliderColors` — 3 slots:

| Slot    | Paints                                              |
| ------- | --------------------------------------------------- |
| `track` | Background of the unfilled portion.                 |
| `fill`  | The filled portion from `min` to the current value. |
| `thumb` | The draggable circle.                               |

### Default light palette

```ts
{
  track: "#E5E7EB",   // gray-200 (matches Input/Card borders)
  fill: "#2563EB",    // blue-600 (primary action)
  thumb: "#FFFFFF",   // white; relies on borderColor from the panel bg for definition
}
```

### Default dark palette

```ts
{
  track: "#374151",   // gray-700
  fill: "#60A5FA",    // blue-400
  thumb: "#F9FAFB",   // gray-50
}
```

### Merge helper

`mergeSliderColors(base, override?)` — same shape as every other merge helper. Early-return when `override` is null.

## File structure

```
packages/ui-kraken/src/components/slider/
  ├─ slider-types.ts            # SliderProps + SliderSize + SliderColorsInput
  ├─ slider.tsx                 # Component + clampValue + snapToStep + computePercent + resolveTrackHeight + resolveThumbSize helpers
  ├─ slider.spec.tsx            # 100% coverage
  ├─ slider.stories.tsx         # Storybook stories
  ├─ README.md                  # Consumer-facing docs
  ├─ __snapshots__/             # Auto-generated
  └─ index.ts                   # Barrel

packages/ui-kraken/src/tokens/defaults/slider.ts   # Palettes + mergeSliderColors + spec
```

## Testing

### Behavioral coverage (~20 tests)

- Root testID default + custom override + sub-slot propagation.
- Default `size="md"` → track 6, thumb 20.
- Each size preset resolves correctly (sm, md, lg).
- Default `min=0 max=100 step=1`.
- Value clamping: `< min`, `> max`, `NaN`.
- Step snap: value snaps to nearest step (2.4 → 2 with step=1; 2.4 → 2.5 with step=0.5).
- `step=0` → no snap (continuous value passes through).
- PanResponder drag: onValueChange fires with clamped+snapped values as gesture moves.
- PanResponder release: onSlidingComplete fires with final value.
- Disabled: PanResponder rejects gesture, onValueChange doesn't fire.
- Disabled: accessibilityState.disabled = true.
- Palette resolution: track/fill/thumb from provider, per-instance override, provider override, dark theme.
- A11y: role adjustable, accessibilityValue reflects clamped value.
- A11y: onAccessibilityAction "increment" → onValueChange(value + step).
- A11y: onAccessibilityAction "decrement" → onValueChange(value - step).
- A11y: onAccessibilityAction with unknown action name is a no-op.
- Snapshot: default + sm + lg + dark theme.

### Defaults spec (`defaults/slider.spec.ts`)

Same shape as other defaults specs — 4 tests covering both merge branches + light-vs-dark palette sanity.

## Storybook (~6 stories)

- `Default` — controlled, `value=50`.
- `Sizes` — sm / md / lg side-by-side.
- `Stepped` — `step=25` on 0-100 (5-value scale) + `step=10`.
- `Continuous` — `step=0`, floating-point display.
- `Disabled` — dimmed thumb, no drag.
- `CustomColors` — brand-tinted track + fill + thumb.
- `DarkTheme` — dark palette via `<Theme name="dark">`.

## Example app screen

`apps/example/app/(pages)/components/slider.tsx` — 4 sections:

1. Volume — labeled `"Volume"`, 0–100, step 1, showing value inline.
2. Range with step — 0–100, step 25 (5-value scale).
3. Continuous — 0–1, step 0, showing 3-decimal value.
4. Disabled — same slider, `disabled={true}` next to the enabled one for contrast.

## Non-goals

- **No range slider (two thumbs).** A two-thumb range is a distinct primitive with its own gesture handling; ship as `<RangeSlider>` if we see the pattern.
- **No vertical orientation.** Vertical sliders are rare enough to defer.
- **No value label bubble that follows the thumb.** Consumers who want it render their own `<Text>` bound to the same state. Baking it in locks label styling.
- **No custom thumb component.** Consumers who want a shape / image thumb pass a custom View via `sliderColors` (background) — the shape stays a circle. A `renderThumb` prop is a distinct escape hatch; ship if we need it.
- **No haptic feedback on drag start / step / release.** Distinct concern; consumers wire `expo-haptics` in `onValueChange` themselves.
- **No native peer dep** (`@react-native-community/slider`) — same rationale as pure-JS bodies elsewhere; avoids the dev-client rebuild trap.
