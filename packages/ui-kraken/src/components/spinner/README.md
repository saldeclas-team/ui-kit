# Spinner

Themed activity indicator. Wraps RN's built-in `ActivityIndicator` with palette-resolved color + size presets.

## Import

```tsx
import { Spinner } from "ui-kraken";
```

## Props

| Prop                 | Type                                                   | Default         | Description                                                                                                     |
| -------------------- | ------------------------------------------------------ | --------------- | --------------------------------------------------------------------------------------------------------------- |
| `size`               | `"sm" \| "md" \| "lg" \| number \| "small" \| "large"` | `"md"`          | Size preset (`sm`=20, `md`=32, `lg`=48) OR raw number OR RN's string values (pass-through).                     |
| `spinnerColors`      | `Partial<SpinnerColors>`                               | —               | Per-instance color override. Only the `color` slot is read.                                                     |
| `animating`          | `boolean`                                              | `true`          | Whether the spinner animates. When `false`, renders a static circle (or hides depending on `hidesWhenStopped`). |
| `accessibilityRole`  | `AccessibilityRole`                                    | `"progressbar"` | ARIA role. Override at the callsite if the spinner isn't announcing progress.                                   |
| `accessibilityLabel` | `string`                                               | `"Loading"`     | Screen reader label. Override with domain-specific copy (`"Saving..."`, `"Loading messages"`).                  |
| `testID`             | `string`                                               | `"spinner"`     | Root testID.                                                                                                    |

Every other RN `ActivityIndicatorProps` (`hidesWhenStopped`, `style`, etc.) also flows through the spread. `color` + `size` are owned by ui-kraken — override via `spinnerColors` (color) or the `size` prop (dimension).

## Color model

`spinnerColors` — 1 slot:

| Slot    | Paints                              |
| ------- | ----------------------------------- |
| `color` | The spinner's animated ring / dots. |

### Default palettes

- **Light**: `color: "#6B7280"` (gray-500) — muted secondary tone.
- **Dark**: `color: "#9CA3AF"` (gray-400) — visible on dark backgrounds.

## Usage

### Default

```tsx
<Spinner />
```

### Size presets

```tsx
<Spinner size="sm" />   {/* 20px */}
<Spinner size="md" />   {/* 32px */}
<Spinner size="lg" />   {/* 48px */}
<Spinner size={64} />   {/* raw px */}
```

### With label — loading-row composition

```tsx
<View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
  <Spinner size="sm" />
  <Text>Loading…</Text>
</View>
```

### Custom color

```tsx
// Per-instance
<Spinner spinnerColors={{ color: "#7C3AED" }} />

// Provider-wide (every Spinner gets brand purple)
<UIKitProvider
  overrides={{
    light: { spinnerColors: { color: "#7C3AED" } },
  }}
>
  ...
</UIKitProvider>
```

### Domain-specific accessibility label

```tsx
<Spinner accessibilityLabel="Saving changes..." />
```

### Static (frozen) placeholder

```tsx
<Spinner animating={false} />
```

## Accessibility

- `accessibilityRole="progressbar"` by default — matches ARIA's role for indeterminate progress.
- `accessibilityLabel="Loading"` default.
- `accessibilityState.busy` reflects the `animating` prop so assistive tech announces the state correctly.

## Sub-element testIDs

Spinner is a single element — no sub-slots. Root testID overridable via `testID`.

## Notes

- **No "dots" / "bars" variants** — the native `ActivityIndicator` is the standard. Custom SVG variants would open a design-consistency can of worms.
- **No `label` prop** — consumers compose the loading row themselves: `<Row><Spinner /><Text>Loading…</Text></Row>`.
- **No determinate progress-bar variant** — a determinate progress bar is a distinct primitive.
- **Size string vs number** — presets (`sm/md/lg`) are for the common case; consumers who need pixel-perfect sizes pass a `number`. RN's `"small"` / `"large"` strings are also supported for consumers who prefer the native defaults.

## Platform support

| Platform | Status                                  |
| -------- | --------------------------------------- |
| iOS      | ✅ (UIActivityIndicatorView)            |
| Android  | ✅ (ProgressBar)                        |
| Web      | ✅ (CSS animation via react-native-web) |
