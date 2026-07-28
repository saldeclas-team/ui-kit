---
"ui-kraken": minor
---

Add `Slider` — horizontal draggable range input. Thumb slides along a track from `min` to `max`; value snaps to `step` increments (or floats freely with `step={0}`). Pure JS via RN's `PanResponder` — no native peer.

The input counterpart to `ProgressBar` (readonly). Volume knobs, price ranges, brightness, opacity — anywhere a consumer picks a continuous or stepped value.

## API

- `<Slider>` extends `YStack`; every Tamagui layout prop flows through the spread. Own props: `value` (required), `onValueChange` (required, fires per drag frame), `onSlidingComplete` (optional, fires on release), `min` (default `0`), `max` (default `100`), `step` (default `1`, `0` for continuous), `size` (`"sm" | "md" | "lg"`, default `"md"`), `disabled` (default `false`), `sliderColors` (per-instance palette override), `testID` (default `"slider"`).
- Sizes: sm = track 4 + thumb 16, md = track 6 + thumb 20 (default), lg = track 8 + thumb 24.
- Value is clamped: `< min` → `min`, `> max` → `max`, `NaN` → `min` (defensive).
- Step snap: `step=1` rounds to integers; `step=0.5` rounds to halves; `step=0` passes floating-point through.
- Disabled: PanResponder rejects the gesture (`onStartShouldSetPanResponder` returns false), thumb dims via opacity, `accessibilityState.disabled=true`.

## A11y first-class

- `accessibilityRole="adjustable"` — VoiceOver + TalkBack recognize the widget.
- `accessibilityValue={{ min, max, now: clampedValue }}` — announced as "50 of 100".
- `accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}` — nudges by `step` (or 1 if `step === 0`); clamped at both ends.
- `accessibilityLabel` — consumers set per-instance (`"Volume"`, `"Brightness"`).

## Token schema — own color block

`sliderColors` — 3 slots: `track` (unfilled portion), `fill` (filled portion), `thumb` (draggable circle). Track + fill mirror ProgressBar's palette so a Slider and a ProgressBar at the same value read as related.

Light `#E5E7EB` / `#2563EB` / `#FFFFFF`; dark `#374151` / `#60A5FA` / `#F9FAFB`.

Follows the each-component-owns-color-space rule. Full 13-step wiring: types + defaults + flatten (`$uiSliderTrack`, `$uiSliderFill`, `$uiSliderThumb`) + provider merge + barrels.

## Non-goals (documented)

- No range slider (two thumbs) — distinct primitive.
- No vertical orientation — rare enough to defer.
- No value label bubble that follows the thumb — consumers render their own bound to the same state.
- No custom thumb component — consumers who want a shape / image pass a custom background via `sliderColors`.
- No haptic feedback — consumers wire `expo-haptics` in `onValueChange` themselves.
- No native peer dep (`@react-native-community/slider`) — avoids the dev-client rebuild trap.

## Testing

60 tests + 4 snapshots on `slider.tsx` + 4 defaults-spec tests. `slider.tsx` at 83% lines / 85% branches — the uncovered lines are inside the PanResponder handlers themselves, which jest / RTL can't simulate without RN's `touchBank` gesture state (invoking the handlers directly throws `Cannot read properties of undefined (reading 'touchBank')`). Value transformation coverage is via four exported pure helpers (`clampValue`, `computePercent`, `snapToStep`, `locationToValue`) tested branch-by-branch — including all edge cases: NaN, inverted range, zero-width range, over/under-max clamping, step=0 (continuous), negative step, non-zero-min step base.

`defaults/slider.ts` at 100% across every metric.

## Example app

New `/components/slider` route with 5 sections: Volume (0-100, step 1), Rating (0-5, step 1), Opacity (0-1, continuous with 3-decimal display), onSlidingComplete-only demo (commit counter increments on release, not per drag frame), Sizes + disabled showcase.
