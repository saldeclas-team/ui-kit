# Select — design record

**Status:** shipped on 2026-07-25 as part of [`COMPONENTS-BATCH-2-PLAN.md`](./COMPONENTS-BATCH-2-PLAN.md) Phase A. Split into three sibling components with the same prop shape but different backends: `Select` (this doc — pure JS + RN Modal), [`SelectNative`](./SELECT-NATIVE-PLAN.md) (via `@expo/ui`), [`SelectBottomSheet`](./SELECT-BOTTOM-SHEET-PLAN.md) (via `@gorhom/bottom-sheet`).

Living design doc for the `Select` primitive. Kept post-shipping so future contributors can understand the decisions behind the shape of the API, not just what it does today.

---

## Overview

Dropdown picker for single-value selection from a fixed list. Common uses: country pickers, category filters, sort-by controls, form dropdowns where the option set is known ahead of time. Contrast with:

- [`RadioGroup`](./RADIO-GROUP-PLAN.md) — 2-5 always-visible options, single-choice. Select is the same choice model but for LONGER lists where a modal makes more sense than always-visible rows.
- [`MultiSelect`](./MULTI-SELECT-PLAN.md) — chip-based multi-choice; Select is single-choice.

**Locked decisions:**

- **Naming**: `Select` — reads unambiguously as a form-field picker. `Picker` was considered but conflicts with `@react-native-picker/picker` (a common peer) and with iOS-specific "picker wheel" connotations. `Dropdown` is fine but Select is the standard HTML/web term consumers already know.
- **Pure JS + RN `Modal` backend** (locked): the batch-2 plan initially considered `@expo/ui` for native pickers. Chose pure JS because (a) `@expo/ui` is still in preview and its API is unstable; (b) a pure-JS Modal-based dropdown gives us cross-platform visual consistency and full theming control; (c) zero peer dep to install; (d) works on web via `react-native-web` without any extra shim. If demand emerges for native pickers, a `variant="native"` opt-in can be added in a future minor without breaking the pure-JS default.
- **Controlled only**: consumer holds `value: Value | null` in state, updates via `onChange`. No uncontrolled / defaultValue in v1 — mirrors RadioGroup / MultiSelect.
- **Generic in value type**: `<Select<Value extends string = string>>` — same generic slot as RadioGroup / MultiSelect for API symmetry. Consumers keep type-safety on `value`, `onChange`, and each `option.value`.
- **Options shape** identical to RadioGroup / MultiSelect: `Array<{ value: Value; label: string }>`. Swapping between the three components requires changing the component tag and adjusting `value` semantics; the options shape stays.
- **Optional `label`** — bold heading above the trigger. Same convention as Input / MultiSelect.
- **Optional `helperText` + `errorText`** — helperText is muted contextual copy, errorText overrides it when set. Same convention as Input.
- **`placeholder?: string`** — text shown inside the trigger when `value === null`. Default: `"Select…"`.
- **Optional `modalTitle?: string`** — heading rendered at the top of the modal panel. When omitted, the modal shows just the options list.
- **`disabled?: boolean`** disables the trigger. **`disabledOptions?: Value[]`** disables a subset of rows inside the modal (both dim visually AND ignore taps).
- **Trigger visual mirrors `Input`** — same border, background, radius, min-height. Reads as a form field to the user; the chevron on the right is the "dropdown" affordance.
- **Modal visual**: centered card with a semi-transparent backdrop. Tap outside closes without changing the value; tapping an option calls `onChange(option.value)` + closes. iOS-native "pageSheet" behavior is intentionally NOT used to keep visual parity with Android and web.
- **Own color block** on the token schema: `selectColors` with 15 slots — trigger chrome (7: `background`, `backgroundDisabled`, `border`, `borderFocused`, `borderError`, `text`, `textDisabled`), placeholder + chevron (2: `placeholder`, `chevron`), surrounding labels (3: `label`, `helperText`, `errorText`), modal chrome (3: `overlayBackground`, `menuBackground`, `menuTitle`).
- **Option colors** intentionally reuse the trigger's `text` + a shared `selectedBackground` slot — options don't get their own sub-block because keeping the palette shape manageable matters more than perfect visual customization. Consumers who need per-option theming reach for their own `renderOption` (out of scope for v1).
- **`radius` prop** — shared `RadiusValue` from `utils/radius`. Applied to the trigger; the modal card uses `radius.lg`.
- **Extends `YStack`** — vertical column (label + trigger + helper/error). Every Tamagui `YStackProps` flows through the spread.
- **Accessibility**: trigger `accessibilityRole="combobox"` + `accessibilityLabel={label ?? placeholder}` + `accessibilityState={{ disabled, expanded }}` + `accessibilityValue={{ text: selectedLabel ?? placeholder }}`. Modal sets `accessibilityViewIsModal`. Each option: `accessibilityRole="menuitem"` + selected state.

## API

### Props

```ts
export interface SelectOption<Value extends string = string> {
  value: Value;
  label: string;
}

export type SelectColorsInput = Partial<SelectColors>;

export interface SelectProps<Value extends string = string> extends Omit<
  GetProps<typeof StyledSelect>,
  "children" | "onChange"
> {
  options: SelectOption<Value>[];
  value: Value | null;
  onChange: (value: Value) => void;
  label?: string;
  helperText?: string;
  errorText?: string;
  placeholder?: string; // default: "Select…"
  modalTitle?: string;
  disabled?: boolean;
  disabledOptions?: Value[];
  radius?: RadiusValue;
  selectColors?: SelectColorsInput;
  testID?: string;
}
```

### Toggle behavior

- Tapping the trigger opens the modal (`expanded` a11y state → true).
- Tapping an option inside the modal fires `onChange(option.value)` and closes the modal.
- Tapping the backdrop closes the modal WITHOUT changing the value.
- When `disabled=true`, the trigger ignores taps.
- When an option is in `disabledOptions`, its row is dim + ignores taps.

### Sub-element testIDs

- root: `"select"` (overridable via `testID`)
- label: `"{root}-label"` (when `label` set)
- trigger: `"{root}-trigger"`
- current value text: `"{root}-value"`
- chevron: `"{root}-chevron"`
- modal container (only mounted when open): `"{root}-modal"`
- modal title: `"{root}-modal-title"` (when `modalTitle` set)
- each option: `"{root}-option-{value}"`
- each option's label: `"{root}-option-{value}-label"`
- helper text (when set + no error): `"{root}-helper-text"`
- error text (when set): `"{root}-error-text"`

### A11y

- Trigger: `accessibilityRole="combobox"`, `accessibilityLabel={label ?? placeholder}`, `accessibilityState={{ disabled, expanded }}`, `accessibilityValue={{ text: selectedLabel ?? placeholder }}`.
- Modal: `accessibilityViewIsModal` (iOS only, no-op on Android/web).
- Each option: `accessibilityRole="menuitem"`, `accessibilityState={{ selected, disabled }}`, `accessibilityLabel={option.label}`.

## Token schema

Select introduces its own **`selectColors`** block on `Tokens`. 15 slots (trigger + labels + modal + options).

```ts
export interface SelectColors {
  // Trigger chrome
  background: string;
  backgroundDisabled: string;
  border: string;
  borderFocused: string; // painted while the modal is open
  borderError: string;
  text: string;
  textDisabled: string;
  placeholder: string;
  chevron: string;
  // Surrounding labels
  label: string;
  helperText: string;
  errorText: string;
  // Modal chrome
  overlayBackground: string; // backdrop
  menuBackground: string; // card panel
  menuTitle: string;
  // Options (shared across all rows)
  optionSelectedBackground: string;
}
```

### Default light palette

Trigger mirrors `InputColors` for cohesion — a Select next to an Input reads as the same form-field family. Modal uses a semi-transparent black backdrop; menu card is white with a subtle border. Selected option gets a pale brand-blue tint.

### Default dark palette

Trigger inverts to gray-800 background; modal backdrop uses higher opacity for contrast on dark surfaces; menu card is `Surface.raised` dark.

### Flatten to Tamagui tokens

`flattenSelectColors()` produces `$uiSelect{PascalCase}` for every slot.

### Merge helper

`mergeSelectColors(base, override?)` — slot-based (flat), same signature as the other flat merge helpers.

## File structure

```
packages/ui-kraken/src/components/select/
├── select.tsx           # component logic + modal + resolvePalette
├── select.styled.ts     # StyledSelect (YStack), StyledSelectTrigger, StyledSelectLabel, StyledSelectHelperText, StyledSelectErrorText, StyledSelectModal, StyledSelectOption, StyledSelectOptionLabel, StyledSelectMenuTitle
├── select-types.ts      # SelectOption, SelectColorsInput, SelectProps
├── select.spec.tsx      # unit tests + describe("snapshots") block
├── select.stories.tsx   # Storybook (~7 stories)
├── README.md            # props table + usage + Platform support
└── index.ts             # explicit named exports
```

## Testing

**Coverage target: 100%** on `select.tsx`.

Behavioral coverage (~25 tests):

- Renders trigger + placeholder when value is null
- Renders trigger + selected label when value matches an option
- Renders trigger + placeholder when value doesn't match any option (defensive)
- Label / helperText / errorText mount toggles
- errorText overrides helperText
- Tapping the trigger opens the modal (`{root}-modal` becomes queryable)
- Tapping the backdrop closes the modal without firing onChange
- Tapping an option fires onChange with the option's value + closes
- disabled prop suppresses trigger tap
- disabledOptions dims + suppresses option tap (parametrized)
- Trigger border reflects state: default / focused (open) / error (parametrized)
- Trigger background reflects disabled state
- Per-instance selectColors override wins on each slot (parametrized)
- Provider palette propagation via useUIKit()
- Dark palette resolves when activeTheme='dark'
- radius prop maps correctly (parametrized 6 preset + number)
- Trigger accessibilityRole='combobox' + composed label + expanded state
- Option accessibilityRole='menuitem' + selected + disabled state
- Modal accessibilityViewIsModal (iOS only assertion)
- YStack pass-through (padding / margin / width) flows through

Structural snapshots (~4):

- Default light, closed, with value
- Default light, open, with 3 options + selected
- Dark palette, open with 3 options
- Error state, closed

## Storybook (~7 stories)

- `Default` (closed) — placeholder visible, no value
- `WithValue` (closed) — one option pre-selected
- `Open` (starts with the modal mounted for visual review)
- `WithHelperText`
- `WithErrorText`
- `Disabled`
- `DisabledSubset` — 1 of 4 options disabled
- `CustomColors` — brand-tinted per-instance override
- `DarkTheme`

## Example app screen

`apps/example/app/(pages)/components/select.tsx` — 5 sections:

1. **Basic** — a 4-option Select with `useState` + caption showing the current value.
2. **With label + helper text** — label + helper below the trigger.
3. **Error state** — one option pre-selected, error text below.
4. **Disabled subset** — 4 options, one disabled via `disabledOptions`.
5. **Per-instance brand palette** — Select with a purple accent on the trigger + selected option.

Plus route registration + row on the components home.

## Non-goals

- **No native picker backend** in v1. If demand emerges, add `variant="native"` in a future minor.
- **No search / filter bar** inside the modal. Long lists get a scrollable modal; consumers who need search wrap Select's modal themselves.
- **No async option loading** — options are consumer-controlled.
- **No `renderOption` slot** — full-custom rows are out of scope; the 15-slot palette covers 95% of theming needs.
- **No compound API** (`Select.Country`, etc.) — flat API.
- **No multi-select variant** — that's what `MultiSelect` is for.
- **No sheet presentation** in v1 — the `BottomSheet` primitive (Batch 2 #6) will let consumers compose their own sheet + list if needed.

## How to ship

Executed on branch `feat/duna-migration-batch-2`:

1. Token schema wiring (types + defaults + flatten + provider + barrels).
2. Component files: `select-types.ts` → `select.styled.ts` → `select.tsx` → `select.spec.tsx` (+ snapshots) → `select.stories.tsx` → `README.md` → `index.ts`.
3. Barrels: `components/index.ts` + `src/index.ts`.
4. Example: screen + route + components-home row.
5. Flip status here (`planned` → `shipped on <YYYY-MM-DD>`).
6. Flip Batch 2 plan doc: ⏳ → ✅ on Select's row (and update the peer-dep cell to reflect the "none — RN built-in Modal" decision).
7. Add `.changeset/*.md`.
8. Verify green + **100% coverage on `select.tsx`**.
9. Atomic commit with rich body.

## How to extend

- **Add `variant="native"`** using `@expo/ui` when its API stabilizes.
- **Add `searchable?: boolean`** — an input above the options list that filters visible rows.
- **Add a `renderOption?: (option, isSelected) => ReactNode` slot** for full-custom row content.
- **Add a `sheet: boolean` prop** once `BottomSheet` is available — swaps the centered modal for a bottom-sheet presentation.
- **Add uncontrolled mode** — `defaultValue?: Value` with internal state.
