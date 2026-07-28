# Spinner — design record

**Status:** planned for ui-kraken v0.10.0 (alongside Card + Divider in Batch 3). Small building-block primitive for loading states inside Cards, Buttons, list rows, and empty-state screens.

Living design doc for the `Spinner` primitive. Kept post-shipping so future contributors can understand the decisions behind the shape of the API, not just what it does today.

---

## Overview

Themed activity indicator. Wraps RN's built-in `ActivityIndicator` with palette-resolved color + size presets that read naturally at the callsite (`size="md"` vs raw pixel numbers). Extremely narrow surface — one prop for size, one for animating state, plus the standard palette + testID conventions every ui-kraken primitive has.

**Locked decisions:**

- **Wrap RN's `ActivityIndicator`, don't re-implement.** Every RN platform already ships a native activity indicator; ui-kraken's job is theming + preset sizes, not building a new spinner. We inherit whatever the OS renders (UIActivityIndicatorView on iOS, ProgressBar on Android, DOM `<div>` with CSS animation on web via react-native-web).
- **Three size presets — `"sm"` (20px) / `"md"` (32px) / `"lg"` (48px)** — mapped to RN's `size` prop as a number. Consumers who need a specific pixel size pass it as a `size={number}`. RN's original `"small"` / `"large"` string values are supported too via the pass-through spread.
- **One palette slot: `color`.** Spinner has exactly one color — the spinner tint. Light default `#6B7280` (gray-500); dark default `#9CA3AF` (gray-400). Matches muted secondary text tones so a Spinner reads as "in-progress" without competing with actual content.
- **`animating` defaults to `true`.** Native ActivityIndicator would render a static circle when `animating={false}` + `hidesWhenStopped={false}` — we keep this behavior for opt-out cases (static placeholder) but default to true because 99% of the time consumers want it spinning.
- **`accessibilityLabel` defaults to `"Loading"`** — screen readers should announce "Loading" when they land on a spinner. Consumers override for domain-specific copy (`"Loading messages"`, `"Saving..."`).
- **Own color block on the token schema.** Follows the [each-component-owns-color-space rule](../CLAUDE.md) — `spinnerColors` with one slot.

## API

### Props

```ts
export type SpinnerSize = "sm" | "md" | "lg";

export type SpinnerColorsInput = Partial<SpinnerColors>;

export interface SpinnerProps extends Omit<ActivityIndicatorProps, "color" | "size"> {
  /**
   * Size preset OR raw number OR RN's string values.
   * `"sm"` → 20px, `"md"` → 32px, `"lg"` → 48px.
   * Default: `"md"`.
   */
  size?: SpinnerSize | number | "small" | "large";
  /**
   * Per-instance color override. Only the `color` slot is read but
   * the input shape accepts the full palette for consistency with
   * other components' override APIs.
   */
  spinnerColors?: SpinnerColorsInput;
  /** Root testID. Default: `"spinner"`. */
  testID?: string;
}
```

### Size resolution

| Prop value            | Resolved                                        |
| --------------------- | ----------------------------------------------- |
| `"sm"`                | `20`                                            |
| `"md"` (default)      | `32`                                            |
| `"lg"`                | `48`                                            |
| `"small"` / `"large"` | Pass-through to RN as-is (native default sizes) |
| `number`              | Pass-through as-is                              |

### Sub-element testIDs

Spinner is a single element — no sub-slots. Root testID overridable via `testID`.

### A11y

- `accessibilityRole="progressbar"` by default — matches the ARIA role for indeterminate progress.
- `accessibilityLabel="Loading"` default — override with domain-specific copy at the callsite.
- `accessibilityState.busy={animating}` — reflects the visual state to assistive tech.

## Token schema

`spinnerColors` — 1 slot:

| Slot    | Paints                              |
| ------- | ----------------------------------- |
| `color` | The spinner's animated ring / dots. |

### Default palettes

- **Light**: `color: "#6B7280"` (gray-500) — muted secondary tone.
- **Dark**: `color: "#9CA3AF"` (gray-400) — visible on dark backgrounds.

### Merge helper

`mergeSpinnerColors(base, override?)` — same shape as every other merge helper. Early-return when `override` is null.

## File structure

```
packages/ui-kraken/src/components/spinner/
  ├─ spinner-types.ts           # SpinnerProps + SpinnerSize + SpinnerColorsInput
  ├─ spinner.tsx                # Component + resolveSize helper
  ├─ spinner.spec.tsx           # 100% coverage
  ├─ spinner.stories.tsx        # Storybook stories
  ├─ README.md                  # Consumer-facing docs
  ├─ __snapshots__/             # Auto-generated
  └─ index.ts                   # Barrel

packages/ui-kraken/src/tokens/defaults/spinner.ts   # Palettes + mergeSpinnerColors + spec
```

No styled file — Spinner is just a `<ActivityIndicator>` with `color` + `size` computed at render time.

## Testing

### Behavioral coverage (~10 tests)

- Renders with default root testID (`"spinner"`).
- Custom `testID` overrides the root.
- Default `size="md"` → resolves to `32`.
- Each preset resolves to its px value (`sm`→20, `md`→32, `lg`→48).
- Raw numeric size passes through.
- RN string values (`"small"`, `"large"`) pass through untouched.
- Default color comes from provider's `spinnerColors.color`.
- Per-instance `spinnerColors={{ color: "..." }}` overrides the provider palette.
- Dark theme resolves the dark `spinnerColors.color`.
- `animating` defaults to `true`; consumer override wins.
- `accessibilityRole` defaults to `"progressbar"`; consumer override wins.
- `accessibilityLabel` defaults to `"Loading"`; consumer override wins.

### Structural snapshots (~3)

- Default (`size="md"`).
- Small (`size="sm"`).
- Dark theme × large.

### Defaults spec (`defaults/spinner.spec.ts`)

Same shape as `bottom-sheet.spec.ts` / `divider.spec.ts` — 4 tests covering both merge branches + light-vs-dark palette sanity.

## Storybook (~5 stories)

- `Default` — `size="md"`.
- `Sizes` — sm / md / lg side-by-side.
- `CustomColor` — brand-tinted spinner via per-instance `spinnerColors`.
- `InsideButton` — spinner as a button loading indicator (composition example).
- `DarkTheme` — dark palette via `<Theme name="dark">`.

## Example app screen

`apps/example/app/(pages)/components/spinner.tsx` — 4 sections:

1. Size showcase — sm / md / lg + a raw numeric (`size={64}`).
2. Custom color — brand-tinted spinner via per-instance `spinnerColors`.
3. In-context — spinner inside a Card (loading placeholder) and next to a text row.
4. Static — `animating={false}` for the frozen-state placeholder.

## Non-goals

- **No "dots" / "bars" / other visual variants.** The native ActivityIndicator is the standard — implementing custom SVG variants opens a design-consistency can of worms.
- **No `label` prop for "Loading..." text next to the spinner.** Consumers compose that themselves: `<Row><Spinner /><Text>Loading…</Text></Row>`. A labeled loading state is not a distinct primitive.
- **No progress-bar variant.** A determinate progress bar is a distinct primitive (see the `ProgressBar` non-goal in Batch 2's plan).
- **No auto-color-from-parent-Button-tone.** Button that shows loading state passes `<Spinner spinnerColors={{ color: ... }} />` explicitly if it needs to match its own tint.
