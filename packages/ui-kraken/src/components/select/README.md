# Select

Single-choice picker rendered as a trigger + centered modal card. Users tap the trigger to open a full-screen modal listing every option; tapping an option selects it and closes the modal. Common uses: country / currency / language picker on forms, "sort by" dropdown on lists, category picker where the whole list should be visible at once.

Contrast with [`MultiSelect`](../multi-select/README.md) and [`RadioGroup`](../radio-group/README.md) — RadioGroup is single-choice with cards always visible (best for ≤5 short options), MultiSelect is multi-choice chips, Select is single-choice hidden behind a trigger (best when the option count is large or when screen space is tight). All three are controlled and generic in the value type so consumers can swap between them with minimal API drift.

Select is the **pure-JS variant** — its backend is `<Modal>` from `react-native` with a centered card panel. Zero peer deps, cross-platform consistent, fully-controllable palette (16 slots). If you prefer a fully native affordance (SwiftUI Menu on iOS, Compose Picker on Android), reach for `SelectNative` (peer dep: `@expo/ui`). If you want a bottom-sheet with drag-to-dismiss, reach for `SelectBottomSheet` (peer dep: `@gorhom/bottom-sheet`).

## Import

```tsx
import { Select } from "ui-kraken";
```

## Props

| Prop              | Type                     | Default     | Description                                                                                                                                                                      |
| ----------------- | ------------------------ | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`         | `SelectOption<Value>[]`  | —           | Options rendered inside the modal list, in array order. Required.                                                                                                                |
| `value`           | `Value \| null`          | —           | Currently-selected value, or `null` when none. Required (controlled).                                                                                                            |
| `onChange`        | `(value: Value) => void` | —           | Fires with the picked value when a modal row is tapped. Required.                                                                                                                |
| `label`           | `string`                 | —           | Optional bold heading above the trigger.                                                                                                                                         |
| `helperText`      | `string`                 | —           | Muted helper copy below the trigger. Overridden by `errorText`.                                                                                                                  |
| `errorText`       | `string`                 | —           | Error copy below the trigger. Overrides `helperText`.                                                                                                                            |
| `placeholder`     | `string`                 | `"Select…"` | Text rendered inside the trigger when `value` is `null` (or doesn't match any option).                                                                                           |
| `modalTitle`      | `string`                 | —           | Optional bold title at the top of the modal card. Omitted when unset.                                                                                                            |
| `disabled`        | `boolean`                | `false`     | Disable the trigger — modal will not open on press.                                                                                                                              |
| `disabledOptions` | `Value[]`                | —           | Disable a subset of options inside the modal list.                                                                                                                               |
| `radius`          | `SelectRadius`           | `"md"`      | Trigger border radius. `"none" \| "sm" \| "md" \| "lg" \| "pill" \| number`.                                                                                                     |
| `selectColors`    | `Partial<SelectColors>`  | —           | Per-instance color override. Missing slots fall through to the provider.                                                                                                         |
| `testID`          | `string`                 | `"select"`  | Root testID. Sub-elements derive `-label`, `-trigger`, `-trigger-text`, `-helper-text`, `-error-text`, `-modal`, `-modal-overlay`, `-modal-title`, `-modal-list`, `-option-{v}`. |

Every Tamagui `YStackProps` flows through the spread — `padding`, `margin`, `width`, `borderColor`, `pressStyle`, shorthand aliases (`px`, `py`, `mx`, `br`), every accessibility prop, etc.

## Generic in the value type

```ts
type Country = "us" | "mx" | "ca";
const [country, setCountry] = useState<Country | null>(null);

<Select<Country>
  options={[
    { value: "us", label: "United States" },
    { value: "mx", label: "Mexico" },
    { value: "ca", label: "Canada" },
  ]}
  value={country}
  onChange={setCountry}
/>;
```

Same generic slot as `MultiSelect` / `RadioGroup` — swap between the three by changing `value: Value` ↔ `value: Value[]` ↔ `value: Value | null` and `onChange` accordingly.

## Behavior

- **Closed state** — trigger shows the selected option's label (or the `placeholder` when `value` is `null` or doesn't match any option).
- **Tap trigger** — modal opens with a fade animation, backdrop dims the underlying screen, option list scrolls if it overflows.
- **Tap option** — `onChange(value)` fires, modal closes.
- **Tap backdrop or press hardware back** (Android) — modal closes without firing `onChange`.
- **Disabled trigger** — modal doesn't open, chevron / text render at reduced opacity.
- **Disabled options** — render at 50% opacity, swallow their own taps (no `onChange`).

## Color model

Select has its own **`selectColors`** block on the token schema — 16 slots grouped as follows:

- **Trigger chrome (9)**: `background`, `backgroundDisabled`, `border`, `borderFocused` (painted while modal is open), `borderError`, `text`, `textDisabled`, `placeholder`, `chevron`.
- **Surrounding labels (3)**: `label`, `helperText`, `errorText`.
- **Modal chrome (3)**: `overlayBackground`, `menuBackground`, `menuTitle`.
- **Option row (1)**: `optionSelectedBackground` — highlight for the currently-selected option in the list.

```tsx
import { UIKitProvider } from "ui-kraken";

<UIKitProvider
  tokens={{
    selectColors: {
      borderFocused: "#7C3AED",
      chevron: "#7C3AED",
      optionSelectedBackground: "#F5F3FF",
    },
  }}
  dark={{
    selectColors: {
      borderFocused: "#A78BFA",
      chevron: "#A78BFA",
      optionSelectedBackground: "rgba(167, 139, 250, 0.2)",
    },
  }}
>
  <App />
</UIKitProvider>;
```

### Slots

| Slot                       | Paints                                                            |
| -------------------------- | ----------------------------------------------------------------- |
| `background`               | Trigger background in default + focused states.                   |
| `backgroundDisabled`       | Trigger background when `disabled`.                               |
| `border`                   | Trigger border in default state.                                  |
| `borderFocused`            | Trigger border while the modal is open.                           |
| `borderError`              | Trigger border when `errorText` is set (overrides borderFocused). |
| `text`                     | Selected-value text color inside the trigger.                     |
| `textDisabled`             | Trigger text color when `disabled`.                               |
| `placeholder`              | Placeholder text color (when `value` is `null`).                  |
| `chevron`                  | Trailing chevron color.                                           |
| `label`                    | Bold heading rendered above the trigger.                          |
| `helperText`               | Muted helper text below the trigger.                              |
| `errorText`                | Error text below the trigger (overrides helperText).              |
| `overlayBackground`        | Backdrop color behind the modal panel.                            |
| `menuBackground`           | Modal card panel background.                                      |
| `menuTitle`                | Optional modal title text color.                                  |
| `optionSelectedBackground` | Row highlight for the currently-selected option.                  |

### Default palettes

**Light**: white trigger, `#D1D5DB` border, `#2563EB` focused border, `#111827` text, `#9CA3AF` placeholder / chevron muted, `rgba(17,24,39,0.55)` backdrop, `#EEF2FF` selected-row highlight.

**Dark**: `#111827` trigger, `#374151` border, `#60A5FA` focused border, `#F9FAFB` text, `#6B7280` placeholder, `rgba(0,0,0,0.65)` backdrop, `rgba(96,165,250,0.16)` selected-row highlight.

## Usage

Basic:

```tsx
const [country, setCountry] = useState<string | null>(null);

<Select
  options={[
    { value: "us", label: "United States" },
    { value: "mx", label: "Mexico" },
    { value: "ca", label: "Canada" },
  ]}
  value={country}
  onChange={setCountry}
  label="Country"
/>;
```

With modal title + helper text:

```tsx
<Select
  options={COUNTRIES}
  value={country}
  onChange={setCountry}
  label="Country"
  modalTitle="Choose your country"
  helperText="Used for billing address auto-completion."
/>
```

Error state:

```tsx
<Select
  options={COUNTRIES}
  value={null}
  onChange={setCountry}
  label="Country"
  errorText="Please pick a country."
/>
```

Disabled subset — a couple of options are ineligible while the rest remain tappable:

```tsx
<Select
  options={COUNTRIES}
  value={country}
  onChange={setCountry}
  disabledOptions={["br", "ar"]}
  label="Country"
/>
```

Fully disabled — read-only view of a saved selection:

```tsx
<Select options={COUNTRIES} value="us" onChange={() => undefined} disabled />
```

Per-instance brand palette:

```tsx
<Select
  options={COUNTRIES}
  value={country}
  onChange={setCountry}
  selectColors={{
    borderFocused: "#7C3AED",
    chevron: "#7C3AED",
    optionSelectedBackground: "#F5F3FF",
  }}
/>
```

## Accessibility

- Trigger: `accessibilityRole="combobox"`, `accessibilityLabel={label ?? placeholder}`, `accessibilityState={{ disabled, expanded }}` — the `expanded` flag reflects whether the modal is open.
- Each option: `accessibilityRole="menuitem"`, `accessibilityState={{ selected, disabled }}`, `accessibilityLabel={option.label}`.
- Backdrop: `accessibilityRole="button"`, `accessibilityLabel="Close"`.

Screen readers announce the trigger by its label, then iterate each option row announcing "United States, menu item, selected" / "Mexico, menu item".

## Sub-element testIDs

- root: `"select"` (overridable via `testID`)
- label (when `label` set): `"{root}-label"`
- trigger: `"{root}-trigger"`
- trigger text (current value or placeholder): `"{root}-trigger-text"`
- helper text (when set, no error): `"{root}-helper-text"`
- error text (when set): `"{root}-error-text"`
- modal root: `"{root}-modal"`
- modal backdrop: `"{root}-modal-overlay"`
- modal title (when `modalTitle` set): `"{root}-modal-title"`
- modal scroll list: `"{root}-modal-list"`
- each option: `"{root}-option-{value}"`
- each option's label: `"{root}-option-{value}-label"`

## Notes

- **Controlled only** — no `defaultValue` / uncontrolled mode in v1. Mirrors MultiSelect / RadioGroup.
- **No search / filter bar** built in. If the option count is large enough to need one, either wrap Select with your own filter state or reach for a custom implementation.
- **Modal-based, not sheet-based** — the modal renders as a centered card over a dimmed backdrop. If you want a drag-to-dismiss bottom-sheet, reach for `SelectBottomSheet`.
- **Pure JS backend** — the picker uses `<Modal>` + `<ScrollView>` from `react-native`, no peer deps. If you want the fully-native SwiftUI Menu / Compose Picker feel, reach for `SelectNative` (requires `@expo/ui`).

## Platform support

| Platform | Status | Notes                                                                                                   |
| -------- | ------ | ------------------------------------------------------------------------------------------------------- |
| iOS      | ✅     | RN `Modal` with `animationType="fade"`. Backdrop tap + option pick close it.                            |
| Android  | ✅     | RN `Modal` + hardware back button dismisses via `onRequestClose`.                                       |
| Web      | ✅     | Via `react-native-web`. Trigger renders as `<div role="combobox">`; options as `<div role="menuitem">`. |
