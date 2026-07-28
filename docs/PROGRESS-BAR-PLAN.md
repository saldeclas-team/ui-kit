# ProgressBar — design record

**Status:** planned for ui-kraken v0.10.0 (Batch 3 alongside Card + Divider + Spinner + Avatar + Badge). Determinate progress indicator — the counterpart to `Spinner` (indeterminate) for cases where completion percentage is known (uploads, downloads, multi-step forms, sync bars).

Living design doc for the `ProgressBar` primitive. Kept post-shipping so future contributors can understand the decisions behind the shape of the API, not just what it does today.

---

## Overview

Horizontal bar that fills from left to right as `value` progresses from `min` to `max` (0–100 by default). Extremely narrow surface: one prop for the value, one for the range if non-standard, one for size, plus optional label + palette + testID conventions. Complements `Spinner` (indeterminate loading) by covering the "we know exactly how much is done" case.

**Locked decisions:**

- **Determinate only.** Indeterminate progress (animated back-and-forth bar with no known endpoint) already has `Spinner` — a separate indeterminate ProgressBar would duplicate that role. Consumers who want indeterminate use `<Spinner />`.
- **`value` in the same units as `min` / `max`.** Default range is `0..100` so consumers can pass `<ProgressBar value={73} />` without setting up a range. Consumers who track raw counts pass `min={0} max={fileSize} value={bytesUploaded}` — no conversion at the callsite.
- **Value is clamped, not asserted.** `value < min` renders as 0%; `value > max` renders as 100%. Same guardrail every other stdlib clamps to. `NaN` renders as 0% (defensive) rather than crashing at layout time.
- **Three size presets — `sm` (track 4px) / `md` (8px, default) / `lg` (12px).** Track height presets cover the three common contexts: inline (`sm`), standalone bar (`md`), hero bar (`lg`). Consumers who need pixel-perfect heights pass a raw `number` via `size={16}`.
- **Two radius modes — `"full"` (default, pill) / `"none"` (straight bar).** Full is the modern convention; consumers who want the classic OS progress bar look pick `none`. No arbitrary radius prop — Tamagui `borderRadius={...}` via the spread handles that.
- **Optional label** — `showValueLabel` auto-renders `"{percent}%"`; `label` renders custom text. Both render ABOVE the bar in a row-with-space-between layout so the label sits at the same position regardless of the value. Setting neither hides the label region entirely (no wasted vertical space).
- **Three palette slots — `track` + `fill` + `label`.** Track is the empty background; fill is the completed portion; label is the text color (only read when `showValueLabel` / `label` is set). Neutral in both themes to match the muted-secondary tone of Spinner.
- **A11y first-class.** `accessibilityRole="progressbar"` + `accessibilityValue={{ min, max, now }}` so screen readers announce "50% of 100" naturally. Consumers override the label for domain-specific copy (`"Uploading photo"`).
- **Extends `YStack`.** Every Tamagui `YStackProps` flows through the `...rest` spread. `backgroundColor` is intentionally omitted from the spread — the track color owns it.

## API

### Props

```ts
export type ProgressBarSize = "sm" | "md" | "lg";
export type ProgressBarRadius = "full" | "none";

export type ProgressBarColorsInput = Partial<ProgressBarColors>;

export interface ProgressBarProps extends Omit<YStackProps, "backgroundColor"> {
  /** Current value. Clamped to `[min, max]`. Default: `0`. */
  value?: number;
  /** Range minimum. Default: `0`. */
  min?: number;
  /** Range maximum. Default: `100`. */
  max?: number;
  /**
   * Track height preset OR raw number.
   * `"sm"` → 4, `"md"` → 8 (default), `"lg"` → 12.
   */
  size?: ProgressBarSize | number;
  /** Corner radius mode. Default: `"full"` (pill). */
  radius?: ProgressBarRadius;
  /**
   * When true, renders `"{percent}%"` label above the bar. Ignored
   * if `label` is set (custom label wins). Default: `false`.
   */
  showValueLabel?: boolean;
  /**
   * Custom label text above the bar. Wins over `showValueLabel`.
   * When set, replaces the auto-generated percent label.
   */
  label?: string;
  /** Per-instance color override. */
  progressBarColors?: ProgressBarColorsInput;
  /** Root testID. Default: `"progress-bar"`. */
  testID?: string;
}
```

### Value clamping

| Input                       | Rendered percent                      |
| --------------------------- | ------------------------------------- |
| `value < min`               | 0%                                    |
| `value > max`               | 100%                                  |
| `value === NaN` / undefined | 0%                                    |
| `min > max` (invalid range) | 0% (defensive)                        |
| Normal range                | `((value - min) / (max - min)) * 100` |

### Label rendering rules

| Props                         | Renders                            |
| ----------------------------- | ---------------------------------- |
| `label` set                   | Custom label above the bar         |
| `showValueLabel` + no `label` | `"{percent}%"` above the bar       |
| Neither                       | No label region — track sits alone |

### Sub-element testIDs

- Root: `"progress-bar"` (overridable via `testID`).
- Track: `"{root}-track"`.
- Fill: `"{root}-fill"`.
- Label (when rendering): `"{root}-label"`.

### A11y

- `accessibilityRole="progressbar"` by default.
- `accessibilityValue={{ min, max, now: clampedValue }}` — screen readers announce progress natively (iOS: "50 percent"; Android: "50 of 100").
- `accessibilityLabel` defaults to `label` when set, or `"Progress"` otherwise. Consumers override with domain-specific copy (`"Uploading photo"`).

## Token schema

`progressBarColors` — 3 slots:

| Slot    | Paints                                                            |
| ------- | ----------------------------------------------------------------- |
| `track` | Background of the empty portion.                                  |
| `fill`  | Color of the completed portion.                                   |
| `label` | Color of the label text (when `showValueLabel` / `label` is set). |

### Default light palette

```ts
{ track: "#E5E7EB", fill: "#2563EB", label: "#111827" }
// gray-200 track + blue-600 fill + gray-900 label
```

### Default dark palette

```ts
{ track: "#374151", fill: "#60A5FA", label: "#F9FAFB" }
// gray-700 track + blue-400 fill + gray-50 label
```

### Merge helper

`mergeProgressBarColors(base, override?)` — same shape as every other merge helper. Early-return when `override` is null.

## File structure

```
packages/ui-kraken/src/components/progress-bar/
  ├─ progress-bar-types.ts            # ProgressBarProps + ProgressBarSize + ProgressBarRadius + ProgressBarColorsInput
  ├─ progress-bar.tsx                 # Component + clampValue + computePercent + resolveTrackHeight helpers
  ├─ progress-bar.spec.tsx            # 100% coverage
  ├─ progress-bar.stories.tsx         # Storybook stories
  ├─ README.md                        # Consumer-facing docs
  ├─ __snapshots__/                   # Auto-generated
  └─ index.ts                         # Barrel

packages/ui-kraken/src/tokens/defaults/progress-bar.ts   # Palettes + mergeProgressBarColors + spec
```

No styled file — track + fill are just `<YStack>` with computed `width` + `backgroundColor` at render time.

## Testing

### Behavioral coverage (~18 tests)

- Renders with default root testID (`"progress-bar"`).
- Custom `testID` overrides + propagates to track / fill / label sub-slots.
- Default `value=0` renders 0% width fill.
- Default `size="md"` → track height 8.
- Each size preset resolves correctly (`sm`→4, `md`→8, `lg`→12, raw number pass-through).
- Default `radius="full"` → borderRadius = size/2 on track + fill.
- `radius="none"` → borderRadius = 0.
- Value clamping: `value < min` → 0% fill.
- Value clamping: `value > max` → 100% fill.
- Value clamping: `NaN` → 0% fill.
- Custom `min` / `max` range: `min=0 max=200 value=100` → 50% fill.
- Label modes: `showValueLabel` → `"{percent}%"` renders.
- Label modes: custom `label` wins over `showValueLabel`.
- Label modes: no label props → no label sub-slot renders.
- Palette resolution: track/fill/label from provider.
- Per-instance `progressBarColors` override wins.
- Provider-level override propagates.
- Dark theme resolves the dark palette.
- A11y: `accessibilityValue` reflects clamped value + min/max.
- A11y: role + default label + consumer override.

### Structural snapshots (~4)

- Default (value=0, md, no label).
- 50% with value label (md, full radius).
- 75% with custom label (lg, none radius).
- Dark theme × sm × 30%.

### Defaults spec (`defaults/progress-bar.spec.ts`)

Same shape as other defaults specs — 4 tests covering both merge branches + light-vs-dark palette sanity.

## Storybook (~7 stories)

- `Default` — `value=50`.
- `Sizes` — sm / md / lg side-by-side.
- `WithValueLabel` — `showValueLabel` on.
- `WithCustomLabel` — `label="Uploading photo..."`.
- `CustomRange` — `min=0 max=200 value=120` (60%).
- `CustomColors` — brand-tinted fill + track.
- `DarkTheme` — dark palette applied via `<Theme name="dark">`.

## Example app screen

`apps/example/app/(pages)/components/progress-bar.tsx` — 4 sections:

1. Size showcase — sm / md / lg all at 50%.
2. Interactive — a controlled state with buttons to bump value ±10.
3. Custom range — file upload example (`max=1024000 value=650000` bytes).
4. Custom colors — brand-tinted fill.

## Non-goals

- **No indeterminate mode.** Use `<Spinner />` — a component that switches roles by prop pollutes the API.
- **No animated value transitions.** Consumers who want a smooth animation wrap the component in `<Animated.View>` and animate `value`. Baking animation into the primitive locks the timing curve.
- **No striped / gradient fill.** Solid color only. Consumers compose with `<LinearGradient>` (when we ship it) or `SVG` at the callsite.
- **No vertical orientation.** Vertical progress is rare enough to be a distinct primitive; ship if we see the pattern.
- **No `buffered` slot** (like video-player buffer bar). Media player is a distinct component with its own controls surface.
