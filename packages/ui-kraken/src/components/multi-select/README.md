# MultiSelect

Multi-choice selector rendered as a wrap of pill chips. Users tap a chip to toggle its membership in the selection. Common uses: tag pickers, filter panels, category selection on onboarding, feature-flag toggles on admin screens.

Contrast with [`RadioGroup`](../radio-group/README.md) — RadioGroup is single-choice with row-style cards; MultiSelect is multi-choice with compact horizontal chips. Both are controlled and generic in the value type so consumers can swap between them with minimal API drift.

## Import

```tsx
import { MultiSelect } from "ui-kraken";
```

## Props

| Prop                | Type                         | Default          | Description                                                                                                                 |
| ------------------- | ---------------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `options`           | `MultiSelectOption<Value>[]` | —                | Chips to render, in array order. Required.                                                                                  |
| `value`             | `Value[]`                    | —                | Currently-selected values. Required (controlled).                                                                           |
| `onChange`          | `(value: Value[]) => void`   | —                | Fires with the next selection array (add or remove). Required.                                                              |
| `label`             | `string`                     | —                | Optional bold heading above the chip row.                                                                                   |
| `helperText`        | `string`                     | —                | Muted helper copy below the chips. Overridden by `errorText`.                                                               |
| `errorText`         | `string`                     | —                | Error copy below the chips. Overrides `helperText`.                                                                         |
| `disabled`          | `boolean`                    | `false`          | Disable every chip.                                                                                                         |
| `disabledOptions`   | `Value[]`                    | —                | Disable a subset of chips by value.                                                                                         |
| `radius`            | `MultiSelectRadius`          | `"pill"`         | Chip border radius. Chips look best as pills.                                                                               |
| `multiSelectColors` | `Partial<MultiSelectColors>` | —                | Per-instance color override. Missing slots fall through to the provider.                                                    |
| `testID`            | `string`                     | `"multi-select"` | Root testID. Sub-elements derive `-label`, `-chips`, `-chip-{value}`, `-chip-{value}-label`, `-helper-text`, `-error-text`. |

Every Tamagui `YStackProps` flows through the spread — `padding`, `margin`, `width`, `borderColor`, `pressStyle`, shorthand aliases (`px`, `py`, `mx`, `br`), every accessibility prop, etc.

## Generic in the value type

```ts
type Category = "design" | "engineering" | "product";
const [selected, setSelected] = useState<Category[]>([]);

<MultiSelect<Category>
  options={[
    { value: "design", label: "Design" },
    { value: "engineering", label: "Engineering" },
    { value: "product", label: "Product" },
  ]}
  value={selected}
  onChange={setSelected}
/>;
```

Same generic slot as `RadioGroup` — swap between the two by changing `value: Value` ↔ `value: Value[]` and `onChange` accordingly.

## Toggle behavior

- Tapping an unselected chip appends its value to `value` (via `onChange`).
- Tapping a selected chip removes its value from `value`.
- The next-value array is passed to `onChange` — the primitive never mutates the incoming `value`.
- When `disabled` OR the option is in `disabledOptions`, taps are ignored (no `onChange` fires; chips render at 50% opacity).

## Color model

MultiSelect has its own **`multiSelectColors`** block on the token schema — 9 slots.

```tsx
import { UIKitProvider } from "ui-kraken";

<UIKitProvider
  tokens={{
    multiSelectColors: {
      selectedBackground: "#2563EB",
      selectedLabel: "#FFFFFF",
      selectedBorder: "#2563EB",
      unselectedBackground: "#FFFFFF",
      unselectedLabel: "#374151",
      unselectedBorder: "#D1D5DB",
    },
  }}
  dark={{
    multiSelectColors: {
      selectedBackground: "#60A5FA",
      selectedLabel: "#0B0B0F",
      selectedBorder: "#60A5FA",
      unselectedBackground: "transparent",
      unselectedLabel: "#F5F5F7",
      unselectedBorder: "#374151",
    },
  }}
>
  <App />
</UIKitProvider>;
```

### Slots

| Slot                   | Paints                                                         |
| ---------------------- | -------------------------------------------------------------- |
| `selectedBackground`   | Chip background when selected.                                 |
| `selectedLabel`        | Chip label text color when selected.                           |
| `selectedBorder`       | Chip border color when selected.                               |
| `unselectedBackground` | Chip background when unselected.                               |
| `unselectedLabel`      | Chip label text color when unselected.                         |
| `unselectedBorder`     | Chip border color when unselected.                             |
| `groupLabel`           | Bold heading above the chip row.                               |
| `helperText`           | Muted helper copy below the chip row.                          |
| `errorText`            | Error copy below the chip row (overrides helperText when set). |

### Default palettes

**Light**: selected `#2563EB` fill · `#FFFFFF` label · unselected `#FFFFFF` fill · `#D1D5DB` border · `#374151` label · groupLabel `#0B0B0F` · helperText `#6B7280` · errorText `#DC2626`.

**Dark**: selected `#60A5FA` fill (lighter brand blue) · `#0B0B0F` label (near-black flips for contrast on the light chip) · unselected `transparent` fill · `#374151` border · `#F5F5F7` label · groupLabel `#F5F5F7` · helperText `#9CA3AF` · errorText `#F87171`.

## Usage

Basic:

```tsx
const [selected, setSelected] = useState<string[]>([]);

<MultiSelect
  options={[
    { value: "design", label: "Design" },
    { value: "engineering", label: "Engineering" },
    { value: "product", label: "Product" },
  ]}
  value={selected}
  onChange={setSelected}
/>;
```

With label + helper text:

```tsx
<MultiSelect
  options={TOPICS}
  value={selected}
  onChange={setSelected}
  label="Topics you follow"
  helperText="Pick any number to tailor your feed."
/>
```

Error state:

```tsx
<MultiSelect
  options={TOPICS}
  value={[]}
  onChange={setSelected}
  label="Topics"
  errorText="Please pick at least one."
/>
```

Disabled subset — one option is ineligible while the others remain interactive:

```tsx
<MultiSelect
  options={TOPICS}
  value={selected}
  onChange={setSelected}
  disabledOptions={["ops"]}
  label="Topics (Ops on hold)"
/>
```

Fully disabled — read-only view of a saved selection:

```tsx
<MultiSelect options={TOPICS} value={saved} onChange={() => undefined} disabled />
```

Per-instance brand palette:

```tsx
<MultiSelect
  options={TOPICS}
  value={selected}
  onChange={setSelected}
  multiSelectColors={{
    selectedBackground: "#7C3AED",
    selectedLabel: "#FFFFFF",
    selectedBorder: "#7C3AED",
  }}
/>
```

## Accessibility

- Group: `accessibilityRole="list"`, `accessibilityLabel={label}` when `label` set.
- Each chip: `accessibilityRole="checkbox"`, `accessibilityState={{ checked, disabled }}`, `accessibilityLabel={option.label}`.

Screen readers announce the group by its `label` (or nothing if unset), then iterate each chip announcing "Design, checkbox, checked" / "Engineering, checkbox, unchecked".

## Sub-element testIDs

- root: `"multi-select"` (overridable via `testID`)
- label (when `label` set): `"{root}-label"`
- chips wrap container: `"{root}-chips"`
- each chip: `"{root}-chip-{value}"`
- each chip's label: `"{root}-chip-{value}-label"`
- helper text (when set, no error): `"{root}-helper-text"`
- error text (when set): `"{root}-error-text"`

## Notes

- **Controlled only** — no `defaultValue` / uncontrolled mode in v1. Mirrors RadioGroup's stance.
- **No search / filter bar** built in. Wrap MultiSelect in your own input + filter logic if you need "type to filter".
- **No max-selection cap** — gate `onChange` in your handler if you need one (`if (next.length > 3) return`).
- **No "select all" / "clear all"** — call `onChange(options.map(o => o.value))` or `onChange([])` from your own button.
- **No async option loading** — options are fully consumer-controlled.
- **No custom chip renderer** — for fully-custom chips (trailing icons, avatars), reach for `Pressable` + `Text` yourself.

## Platform support

| Platform | Status | Notes                                                                                  |
| -------- | ------ | -------------------------------------------------------------------------------------- |
| iOS      | ✅     | Native rendering via `YStack` / `XStack`.                                              |
| Android  | ✅     | Native rendering.                                                                      |
| Web      | ✅     | Via `react-native-web`. Chips render as `<div>` with `aria-checked` / `aria-disabled`. |
