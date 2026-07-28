---
"ui-kraken": minor
---

Add `ProgressBar` — determinate progress indicator. Horizontal bar that fills from left to right as `value` progresses from `min` to `max` (0–100 by default). Complements `Spinner` (indeterminate) for cases where completion percentage is known: uploads, downloads, multi-step forms, sync bars.

## API

- `<ProgressBar>` extends `YStack`; every Tamagui layout prop flows through the spread. Own props: `value` (default `0`), `min` (default `0`), `max` (default `100`), `size` (`"sm" | "md" | "lg" | number`, default `"md"`), `radius` (`"full" | "none"`, default `"full"`), `showValueLabel` (boolean), `label` (string), `progressBarColors` (per-instance palette override), `testID` (default `"progress-bar"`).
- Sizes: sm=4, md=8, lg=12 (track height in px). Raw numeric pass-through.
- Radius: `full` → pill (`borderRadius = height / 2`); `none` → straight bar.
- Value clamping: `value < min` → 0%; `value > max` → 100%; `NaN` → 0%; inverted range (`min > max`) → 0%; zero-width range (`min === max`) → 0%.
- Label: `label` wins over `showValueLabel`. Value label renders as rounded `"{percent}%"` above the bar in a `space-between` row. Neither set → no label region.
- A11y: `accessibilityRole="progressbar"` + `accessibilityValue={{ min, max, now: clampedValue }}` so screen readers announce native progress. `accessibilityLabel` defaults to `label` (or `"Progress"` otherwise).

## Token schema — own color block

`progressBarColors` — 3 slots: `track` (empty background), `fill` (completed portion), `label` (text color when label is set). Light `#E5E7EB` / `#2563EB` / `#111827` (gray-200 track + blue-600 fill + gray-900 label); dark `#374151` / `#60A5FA` / `#F9FAFB` (inverted).

Follows the each-component-owns-color-space rule. Full 13-step wiring: types + defaults + flatten (`$uiProgressBarTrack`, `$uiProgressBarFill`, `$uiProgressBarLabel`) + provider merge + barrels.

## Non-goals (documented)

- No indeterminate mode — use `<Spinner />`.
- No animated value transitions — consumers wrap in `<Animated.View>` themselves.
- No striped / gradient fill — solid color only.
- No vertical orientation — distinct primitive.
- No `buffered` slot — media-player concerns are their own component.

## Testing

56 component tests + 4 snapshots on `progress-bar.tsx` + 4 defaults-spec tests. 100% coverage across statements / branches / functions / lines on `progress-bar.tsx` + `defaults/progress-bar.ts`. Three exported pure helpers (`clampValue`, `computePercent`, `resolveTrackHeight`) tested branch-by-branch — including edge cases: NaN, inverted range, zero-width range, over/under-max clamping.

## Example app

New `/components/progress-bar` route with 4 sections: sizes showcase (sm/md/lg at 50%), interactive controlled state (buttons to bump ±10, reset), custom range (file upload example — 650 KB of 1 MB → 63%), custom label + brand-tinted color override.
