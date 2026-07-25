# MultiSelect — design record

**Status:** shipped on 2026-07-26 in ui-kraken v0.8.0 as part of [`COMPONENTS-BATCH-1-PLAN.md`](./COMPONENTS-BATCH-1-PLAN.md) Phase B.

Living design doc for the `MultiSelect` primitive. Kept post-shipping so future contributors can understand the decisions behind the shape of the API, not just what it does today.

---

## Overview

Multi-choice selector rendered as a wrap of pill chips. The user taps a chip to toggle its membership in the selection. Common uses: tag pickers, filter panels, category selection on onboarding, feature-flag toggles on admin screens.

Contrast with [`RadioGroup`](./RADIO-GROUP-PLAN.md) — RadioGroup is single-choice with row-style cards; MultiSelect is multi-choice with compact horizontal chips. Both share the "controlled, generic in value type, options array" shape so consumers can swap between them with minimal API drift.

**Locked decisions:**

- **Naming**: `MultiSelect` — reads unambiguously as "pick many". `TagSelect` / `ChipGroup` were considered but MultiSelect is the more general framing (chips are the visual, multi-select is the behavior).
- **Chip visual language**: each option renders as a rounded pill; selected chips have a filled background + label color, unselected chips have a border-only appearance with a muted label. No checkboxes inside chips — the fill state IS the check state.
- **Wrap layout**: chips lay out horizontally with `flex-wrap`, so long lists gracefully break to multiple rows. No horizontal scroll — the primitive assumes the parent gives it enough vertical room.
- **Controlled only**: consumer holds the `value: Value[]` in state and updates via `onChange`. No uncontrolled / defaultValue in v1 — mirrors RadioGroup's philosophy.
- **Generic in value type** — `<Value extends string = string>` so consumers keep type-safety on `value`, `onChange`, and each `option.value`. Same generic slot as RadioGroup for API symmetry.
- **Options shape** identical to RadioGroup: `Array<{ value: Value; label: string }>`. Consumers can swap RadioGroup ↔ MultiSelect by changing `value` from `Value` to `Value[]` and `onChange` accordingly.
- **Optional bold `label`** above the group (rendered when the prop is passed) — same convention as RadioGroup / Input.
- **Optional `helperText` + `errorText` below** — helperText is muted contextual copy, errorText overrides it when set. Same convention as Input / CurrencyInput.
- **`disabled?: boolean`** disables every chip. **`disabledOptions?: Value[]`** disables a subset (both dim visually AND ignore taps).
- **Own color block on the token schema**: `multiSelectColors` with 9 slots — 3 for selected state (`selectedBackground`, `selectedLabel`, `selectedBorder`), 3 for unselected (`unselectedBackground`, `unselectedLabel`, `unselectedBorder`), plus `groupLabel` / `helperText` / `errorText`.
- **Per-instance override**: `multiSelectColors?: Partial<MultiSelectColors>` — any subset of the 9 slots; missing slots fall through to the provider palette.
- **`radius` prop** for chip radius. Default `"pill"` since chips are the whole point.
- **Extends `YStack`** — MultiSelect is a vertical stack (label + chip wrap row + helper/error). Every Tamagui `YStackProps` flows through.
- **Accessibility**: group has `accessibilityRole="list"`, each chip has `accessibilityRole="checkbox"` + `accessibilityState.checked`. The `label` prop is forwarded as the group's `accessibilityLabel` so screen readers announce "Categorías, list" before iterating chips.

## API

### Props

```ts
export interface MultiSelectOption<Value extends string = string> {
  value: Value;
  label: string;
}

export type MultiSelectRadius = number | "none" | "sm" | "md" | "lg" | "pill";

export type MultiSelectColorsInput = Partial<MultiSelectColors>;

export interface MultiSelectProps<Value extends string = string> extends Omit<
  GetProps<typeof StyledMultiSelect>,
  "children" | "onChange"
> {
  /** Options rendered as chips (in array order). */
  options: MultiSelectOption<Value>[];
  /** Currently-selected values. Membership order matches option order at render time. */
  value: Value[];
  /** Fires on toggle with the next selection array (add or remove). */
  onChange: (value: Value[]) => void;
  /** Optional bold heading rendered above the chip row. */
  label?: string;
  /** Muted helper copy below the chip row. Overridden by `errorText` when set. */
  helperText?: string;
  /** Error copy below the chip row. Overrides `helperText`. */
  errorText?: string;
  /** Disable every chip. */
  disabled?: boolean;
  /** Disable a subset of chips by value. Overrides individual chip presses. */
  disabledOptions?: Value[];
  /** Chip border radius. Defaults to `"pill"` — chips are the whole point. */
  radius?: MultiSelectRadius;
  /**
   * Per-instance color override. Missing slots fall through to the
   * provider-resolved palette.
   */
  multiSelectColors?: MultiSelectColorsInput;
  /**
   * Root testID. Sub-elements derive:
   * `{root}-label`, `{root}-chips`, `{root}-chip-{value}`,
   * `{root}-chip-{value}-label`, `{root}-helper-text`, `{root}-error-text`.
   */
  testID?: string;
}
```

### Toggle behavior

- Tapping an unselected chip appends its value to `value` (via `onChange`).
- Tapping a selected chip removes its value from `value`.
- The next-value array is passed to `onChange` — the primitive never mutates the incoming `value`.
- When `disabled` OR the option is in `disabledOptions`, taps are ignored (no `onChange` fires).

### Per-instance override

```tsx
<MultiSelect
  options={FILTERS}
  value={selected}
  onChange={setSelected}
  multiSelectColors={{
    selectedBackground: "#4C1D95",
    selectedLabel: "#FFFFFF",
  }}
/>
```

### Sub-element testIDs

- root: `"multi-select"` (overridable via `testID`)
- label (when `label` set): `"{root}-label"`
- chip wrap container: `"{root}-chips"`
- each chip: `"{root}-chip-{value}"`
- each chip's label: `"{root}-chip-{value}-label"`
- helper text (when set + no error): `"{root}-helper-text"`
- error text (when set): `"{root}-error-text"`

### A11y

- Group: `accessibilityRole="list"`, `accessibilityLabel={label}` when `label` set.
- Each chip: `accessibilityRole="checkbox"`, `accessibilityState={{ checked: isSelected, disabled: chipDisabled }}`, `accessibilityLabel={option.label}`.

## Token schema

MultiSelect introduces its own **`multiSelectColors`** block on `Tokens`. Zero reuse of RadioGroup / Button palettes — chips carry their own visual weight and evolve independently.

```tsx
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
</UIKitProvider>
```

### `MultiSelectColors` interface

Slot-based, 9 slots.

```ts
export interface MultiSelectColors {
  /** Chip background when selected. */
  selectedBackground: string;
  /** Chip label text color when selected. */
  selectedLabel: string;
  /** Chip border color when selected. */
  selectedBorder: string;
  /** Chip background when unselected. */
  unselectedBackground: string;
  /** Chip label text color when unselected. */
  unselectedLabel: string;
  /** Chip border color when unselected. */
  unselectedBorder: string;
  /** Bold heading above the chip row. */
  groupLabel: string;
  /** Muted helper copy below the chip row. */
  helperText: string;
  /** Error copy below the chip row (overrides helperText when `errorText` set). */
  errorText: string;
}
```

### Default light palette

Chip selected = solid brand blue; unselected = white background with a light gray border. Text colors switch between white (on brand fill) and gray-700 (on white ground).

```ts
export const DEFAULT_LIGHT_MULTI_SELECT_COLORS: MultiSelectColors = {
  selectedBackground: "#2563EB",
  selectedLabel: "#FFFFFF",
  selectedBorder: "#2563EB",
  unselectedBackground: "#FFFFFF",
  unselectedLabel: "#374151",
  unselectedBorder: "#D1D5DB",
  groupLabel: "#0B0B0F",
  helperText: "#6B7280",
  errorText: "#DC2626",
};
```

### Default dark palette

Chip selected uses a lighter brand blue so it pops on dark; unselected is transparent so it reads as a hollow outline against `Surface.base`.

```ts
export const DEFAULT_DARK_MULTI_SELECT_COLORS: MultiSelectColors = {
  selectedBackground: "#60A5FA",
  selectedLabel: "#0B0B0F",
  selectedBorder: "#60A5FA",
  unselectedBackground: "transparent",
  unselectedLabel: "#F5F5F7",
  unselectedBorder: "#374151",
  groupLabel: "#F5F5F7",
  helperText: "#9CA3AF",
  errorText: "#F87171",
};
```

### Flatten to Tamagui tokens

`flattenMultiSelectColors()` produces the flat `$uiMultiSelect{PascalCase}` token map wired into `buildConfig()`:

```
uiMultiSelectSelectedBackground
uiMultiSelectSelectedLabel
uiMultiSelectSelectedBorder
uiMultiSelectUnselectedBackground
uiMultiSelectUnselectedLabel
uiMultiSelectUnselectedBorder
uiMultiSelectGroupLabel
uiMultiSelectHelperText
uiMultiSelectErrorText
```

### Merge helper

```ts
export function mergeMultiSelectColors(
  base: MultiSelectColors,
  override?: Partial<MultiSelectColors>
): MultiSelectColors;
```

Same signature as `mergeInputColors` / `mergeSurfaceColors`.

## File structure

```
packages/ui-kraken/src/components/multi-select/
├── multi-select.tsx           # component logic + toggle helper + resolvePalette
├── multi-select.styled.ts     # StyledMultiSelect (YStack), StyledMultiSelectChips (XStack wrap),
│                              # StyledMultiSelectChip, StyledMultiSelectChipLabel,
│                              # StyledMultiSelectGroupLabel, StyledMultiSelectHelperText,
│                              # StyledMultiSelectErrorText
├── multi-select-types.ts      # MultiSelectOption, MultiSelectRadius, MultiSelectColorsInput,
│                              # MultiSelectProps
├── multi-select.spec.tsx      # unit tests + describe("snapshots") block
├── multi-select.stories.tsx   # Storybook (~7 stories)
├── README.md                  # props table + usage + Platform support
└── index.ts                   # explicit named exports
```

Token / provider wiring per [`creating-component-tamagui` Section 11](../.agents/skills/creating-component-tamagui/SKILL.md).

## Testing

**Coverage target: 100%** on the component.

### Behavioral coverage (~22 tests)

- Renders `label`, chips, and helper text when passed
- Omits `label` / helper / error when unset
- `errorText` overrides `helperText` when both set (only `-error-text` appears)
- Chip count matches `options.length`; each chip has the derived testID
- Tapping an unselected chip fires `onChange` with `[...value, chipValue]`
- Tapping a selected chip fires `onChange` with `value` minus that value
- Toggle preserves order of remaining values (append at end, remove keeps positions)
- `disabled` prop suppresses all `onChange` calls (parametrized: tap selected + unselected)
- `disabledOptions` prop suppresses `onChange` for that value only
- Selected chip paints selected slots (background / label / border) — parametrized across the 3 slots
- Unselected chip paints unselected slots — parametrized across the 3 slots
- Per-instance `multiSelectColors` override wins on each slot (parametrized across the 9 slots)
- Provider-level palette propagates via `useUIKit()`
- Dark palette resolves when `activeTheme === "dark"`
- `radius` prop maps to correct value on each of `none` / `sm` / `md` / `lg` / `pill` / number
- Group `accessibilityRole="list"` + `accessibilityLabel={label}`
- Each chip `accessibilityRole="checkbox"` + `accessibilityState={{ checked, disabled }}`
- `helperText` / `errorText` painted from correct palette slots
- `groupLabel` painted from the correct palette slot
- YStack pass-through (padding, margin, width) flows through the spread

### Structural snapshots (~4)

- Default palette + 3 options, none selected
- Default + 3 options, 2 selected
- Default + errorText present (overrides helperText)
- Dark palette + 3 options, 1 selected

## Storybook (~7 stories)

- `Default` — 4 chips, none selected
- `Preselected` — 4 chips, 2 selected
- `WithLabel` — group label + 4 chips
- `WithHelperText` — helper text below the chips
- `WithErrorText` — error text overrides helper
- `Disabled` — all chips disabled
- `DisabledSubset` — 1 of 4 chips disabled via `disabledOptions`
- `CustomColors` — brand-tinted per-instance override
- `DarkTheme` — 4 chips in dark mode

## Example app screen

`apps/example/app/(pages)/components/multi-select.tsx` — 5 sections:

1. **Basic** — 4 chips (topics), controlled via `useState`.
2. **With label + helper text** — label above, helper below.
3. **Error state** — one chip pre-selected, error text below.
4. **Disabled subset** — 3 chips enabled + 1 disabled via `disabledOptions`.
5. **Per-instance brand palette** — chips with a custom purple selected fill.

Plus route registration + row on the components home.

## Non-goals

- **No search / filter bar** built in. Consumers who need "type to filter" wrap MultiSelect in their own input + filter logic. Adding it would blur the primitive.
- **No async option loading** — options are fully controlled by the consumer.
- **No "select all" / "clear all" affordance** — those are consumer-level buttons that call `onChange([])` or `onChange(options.map(o => o.value))`.
- **No max-selection limit built in** — consumers gate `onChange` in their handler when they need a cap.
- **No uncontrolled / defaultValue** — mirrors RadioGroup's controlled-only stance.
- **No custom chip renderer** — consumers who need fully-custom chips reach for `Pressable` + `Text` themselves.

## How to ship

Executed on branch `feat/duna-migration-batch-1`:

1. Token schema wiring (types + defaults + flatten + provider + barrels).
2. Component files: `multi-select-types.ts` → `multi-select.styled.ts` → `multi-select.tsx` → `multi-select.spec.tsx` (+ snapshots) → `multi-select.stories.tsx` → `README.md` → `index.ts`.
3. Barrels: `components/index.ts` + `src/index.ts`.
4. Example: screen + route + components-home row.
5. Flip status here (`planned` → `shipped on <YYYY-MM-DD>`).
6. Flip Batch 1 plan doc: ⏳ → ✅ on MultiSelect's row.
7. Verify green + **100% coverage on `multi-select.tsx`** via `pnpm --filter ui-kraken test:coverage`.
8. Atomic commit with rich body.

## How to extend

- **Add `maxSelection?: number`** — cap the `value.length`; ignore taps that would exceed it. Cleaner than requiring consumers to gate `onChange` themselves.
- **Add a `renderChip?: (option, isSelected) => ReactNode` slot** — for consumers who need trailing icons, avatars, or custom chip content.
- **Add a `searchable?: boolean` mode** — an input above the chip row that filters the visible chips. Would require an additional input palette slot.
- **Add an uncontrolled mode** — `defaultValue?: Value[]` with internal state. Mirrors what RadioGroup would need if it grows uncontrolled support.
