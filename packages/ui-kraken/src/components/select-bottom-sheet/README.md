# SelectBottomSheet

Single-choice picker rendered as a trigger + native bottom sheet. Users tap the trigger to slide up a panel from the bottom of the screen; tapping an option or dragging down dismisses it. Common uses: filter selection on tablet layouts, form pickers where the modal would feel too heavy, action pickers on long-scroll screens.

Contrast with the two sibling variants:

- [`Select`](../select/README.md) — pure JS + RN `Modal`. Zero peer deps. Centered card. Cross-platform consistent.
- [`SelectNative`](../select-native/README.md) — SwiftUI Menu / Compose DropdownMenu via `@expo/ui`. Fully native affordance.
- **`SelectBottomSheet`** — native bottom sheet (SwiftUI on iOS, Material 3 on Android, vaul on web) via [`<BottomSheet>`](../bottom-sheet/README.md). Same `@expo/ui` peer as `SelectNative` / `SegmentedControl` / `DatePicker`.

All three share the same prop shape (options, value, onChange, label, helper/error, per-option disabled) so you can swap between them by changing the import name.

## Peer dependency — `@expo/ui`

SelectBottomSheet composes our own [`<BottomSheet>`](../bottom-sheet/README.md) internally, which wraps `@expo/ui/community/bottom-sheet`. Same peer as our other native components — one install unlocks all of them.

**Migrated from `@gorhom/bottom-sheet`** as of ui-kraken v0.9.x. Consumers upgrading from earlier versions can uninstall `@gorhom/bottom-sheet` and `react-native-gesture-handler` if no other code depends on them — SelectBottomSheet no longer requires either. See the CHANGELOG for the full migration notes.

**When `@expo/ui` is installed**: the trigger opens the native bottom-sheet on press. No provider setup required (unlike gorhom, `@expo/ui`'s sheet uses OS-native modal presentation).

**When `@expo/ui` is missing**: the trigger renders an inline `"Install \`@expo/ui\` to enable SelectBottomSheet."`hint colored with the`errorText` slot. The trigger is disabled at the accessibility level so screen readers announce it as un-interactive. The app does NOT crash.

## Provider setup

None required. Unlike the previous `@gorhom/bottom-sheet` backend, `@expo/ui/community/bottom-sheet` uses OS-native modal presentation — no `BottomSheetModalProvider` at the app root, no `GestureHandlerRootView`. Just mount `<UIKitProvider>` as usual and `<SelectBottomSheet>` works.

## Import

```tsx
import { SelectBottomSheet } from "ui-kraken";
```

## Props

| Prop                      | Type                               | Default                 | Description                                                                                                                                                                                                                                                                                               |
| ------------------------- | ---------------------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                 | `SelectBottomSheetOption<Value>[]` | —                       | Options rendered inside the sheet, in array order. Required.                                                                                                                                                                                                                                              |
| `value`                   | `Value \| null`                    | —                       | Currently-selected value, or `null` when none. Required (controlled).                                                                                                                                                                                                                                     |
| `onChange`                | `(value: Value) => void`           | —                       | Fires with the picked value when a sheet row is tapped. Required.                                                                                                                                                                                                                                         |
| `label`                   | `string`                           | —                       | Optional bold heading above the trigger.                                                                                                                                                                                                                                                                  |
| `helperText`              | `string`                           | —                       | Muted helper copy below the trigger. Overridden by `errorText`.                                                                                                                                                                                                                                           |
| `errorText`               | `string`                           | —                       | Error copy below the trigger. Overrides `helperText`.                                                                                                                                                                                                                                                     |
| `placeholder`             | `string`                           | `"Select…"`             | Text inside the trigger when `value` is `null`.                                                                                                                                                                                                                                                           |
| `sheetTitle`              | `string`                           | —                       | Optional bold title at the top of the sheet, above the option list.                                                                                                                                                                                                                                       |
| `disabled`                | `boolean`                          | `false`                 | Disable the trigger — sheet will not open.                                                                                                                                                                                                                                                                |
| `disabledOptions`         | `Value[]`                          | —                       | Disable a subset of options inside the sheet.                                                                                                                                                                                                                                                             |
| `snapPoints`              | `SelectBottomSheetSnapPoint[]`     | `["50%", "90%"]`        | Snap points for the sheet. Sheet opens at index 0 (50%), user can drag up to 90%. Two-point default because Android's Material 3 sheet requires ≥2 snap points to respect a partial state — see [`<BottomSheet>`'s "Why two default snap points"](../bottom-sheet/README.md#why-two-default-snap-points). |
| `radius`                  | `SelectBottomSheetRadius`          | `"md"`                  | Trigger border radius. `"none" \| "sm" \| "md" \| "lg" \| "pill" \| number`.                                                                                                                                                                                                                              |
| `selectBottomSheetColors` | `Partial<SelectBottomSheetColors>` | —                       | Per-instance color override. Missing slots fall through to the provider.                                                                                                                                                                                                                                  |
| `testID`                  | `string`                           | `"select-bottom-sheet"` | Root testID. Sub-elements derive `-label`, `-trigger`, `-trigger-text`, `-helper-text`, `-error-text`, `-sheet`, `-sheet-title`, `-option-{v}`, `-missing-peer`.                                                                                                                                          |

Every Tamagui `YStackProps` flows through the spread — `padding`, `margin`, `width`, `borderColor`, `pressStyle`, shorthand aliases, every accessibility prop, etc.

## Generic in the value type

```ts
type Country = "us" | "mx" | "ca";
const [country, setCountry] = useState<Country | null>(null);

<SelectBottomSheet<Country>
  options={[
    { value: "us", label: "United States" },
    { value: "mx", label: "Mexico" },
    { value: "ca", label: "Canada" },
  ]}
  value={country}
  onChange={setCountry}
/>;
```

## Behavior

- **Closed state** — trigger shows the selected option's label (or the `placeholder` when `value` is `null`).
- **Tap trigger** — sheet slides up from the bottom with drag-affordance handle at the top, backdrop dims the underlying screen.
- **Tap option** — `onChange(value)` fires, sheet closes.
- **Drag down or tap backdrop** — sheet closes without firing `onChange`.
- **Disabled trigger** — trigger renders at reduced opacity, sheet doesn't open.
- **Disabled options** — render at 50% opacity, swallow their own taps.
- **Missing peer dep** — trigger renders the missing-peer hint inline; taps are ignored.

## Color model

SelectBottomSheet has its own **`selectBottomSheetColors`** block on the token schema — 15 slots grouped as follows:

- **Trigger chrome (9)**: `background`, `backgroundDisabled`, `border`, `borderFocused` (painted while sheet is open), `borderError`, `text`, `textDisabled`, `placeholder`, `chevron`.
- **Surrounding labels (3)**: `label`, `helperText`, `errorText`.
- **Sheet chrome (3)**: `sheetBackground` (panel), `sheetHandle` (drag-affordance bar), `optionSelectedBackground` (row highlight).

```tsx
<UIKitProvider
  tokens={{
    selectBottomSheetColors: {
      borderFocused: "#7C3AED",
      sheetHandle: "#7C3AED",
      optionSelectedBackground: "#EDE9FE",
    },
  }}
>
  <App />
</UIKitProvider>
```

### Slots

| Slot                       | Paints                                                           |
| -------------------------- | ---------------------------------------------------------------- |
| `background`               | Trigger background in default + focused states.                  |
| `backgroundDisabled`       | Trigger background when `disabled`.                              |
| `border`                   | Trigger border in default state.                                 |
| `borderFocused`            | Trigger border while the sheet is open.                          |
| `borderError`              | Trigger border when `errorText` is set.                          |
| `text`                     | Selected-value text color inside the trigger.                    |
| `textDisabled`             | Trigger text color when `disabled`.                              |
| `placeholder`              | Placeholder text color when `value` is `null`.                   |
| `chevron`                  | Trailing chevron color.                                          |
| `label`                    | Bold heading above the trigger.                                  |
| `helperText`               | Muted helper text below the trigger.                             |
| `errorText`                | Error text below the trigger (also the missing-peer hint color). |
| `sheetBackground`          | Sheet panel background.                                          |
| `sheetHandle`              | Drag-affordance bar at the top of the sheet.                     |
| `optionSelectedBackground` | Row highlight for the currently-selected option in the sheet.    |

### Default palettes

**Light**: white trigger + white sheet, `#D1D5DB` border + handle, `#2563EB` focused border, `#111827` text, `#9CA3AF` placeholder / chevron, `#EEF2FF` selected-row highlight.

**Dark**: `#111827` trigger + sheet, `#374151` border + handle, `#60A5FA` focused border, `#F9FAFB` text, `rgba(96,165,250,0.16)` selected-row highlight.

## Usage

Basic:

```tsx
const [country, setCountry] = useState<string | null>(null);

<SelectBottomSheet
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

With sheet title + custom snap point:

```tsx
<SelectBottomSheet
  options={COUNTRIES}
  value={country}
  onChange={setCountry}
  label="Country"
  sheetTitle="Choose your country"
  snapPoints={["30%"]}
/>
```

Error state:

```tsx
<SelectBottomSheet
  options={COUNTRIES}
  value={null}
  onChange={setCountry}
  label="Country"
  errorText="Please pick a country."
/>
```

Fully disabled — read-only:

```tsx
<SelectBottomSheet options={COUNTRIES} value="us" onChange={() => undefined} disabled />
```

Per-instance brand palette:

```tsx
<SelectBottomSheet
  options={COUNTRIES}
  value={country}
  onChange={setCountry}
  selectBottomSheetColors={{
    borderFocused: "#7C3AED",
    sheetBackground: "#F5F3FF",
    sheetHandle: "#7C3AED",
  }}
/>
```

## Accessibility

- Trigger: `accessibilityRole="combobox"`, `accessibilityLabel={label ?? placeholder}`, `accessibilityState={{ disabled, expanded }}`.
- Each option: `accessibilityRole="menuitem"`, `accessibilityState={{ selected, disabled }}`, `accessibilityLabel={option.label}`.
- Missing-peer state: trigger's `accessibilityState.disabled` is `true`.

## Sub-element testIDs

- root: `"select-bottom-sheet"` (overridable via `testID`)
- label (when `label` set): `"{root}-label"`
- trigger: `"{root}-trigger"`
- trigger text (when peers available): `"{root}-trigger-text"`
- helper text (when set, no error): `"{root}-helper-text"`
- error text (when set): `"{root}-error-text"`
- sheet modal (when peers available): `"{root}-sheet"`
- sheet title (when `sheetTitle` set): `"{root}-sheet-title"`
- each option: `"{root}-option-{value}"`
- each option's label: `"{root}-option-{value}-label"`
- missing-peer hint (when peers NOT available): `"{root}-missing-peer"`

## Notes

- **Controlled only** — no `defaultValue` / uncontrolled mode.
- **Requires provider mount** — `<BottomSheetModalProvider>` must wrap the tree above SelectBottomSheet.
- **Snap points default to `["50%"]`** — enough for ~6-8 options without scroll. For long lists pass `["85%"]` or add `enableDynamicSizing` support in a future version.
- **Drag-down to close is always on** — matches the affordance every native bottom sheet uses. No prop to disable it in v1.

## Platform support

Delegates 100% to [`<BottomSheet>`](../bottom-sheet/README.md) — see its platform support table. Summary:

| Platform         | Status                      | Notes                                                                                                                              |
| ---------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| iOS              | ✅ (requires `@expo/ui`)    | SwiftUI `sheet` with detents.                                                                                                      |
| Android          | ✅ (requires `@expo/ui`)    | Material 3 `ModalBottomSheet` (Compose). Max 2 snap states (partial + expanded).                                                   |
| Web              | ✅ (no extra peer required) | `vaul` drawer (bundled inside `@expo/ui`).                                                                                         |
| Missing peer dep | ✅ safe fallback            | Trigger renders "Install `@expo/ui`" hint colored with the `errorText` slot. The app does NOT crash. Trigger is disabled for a11y. |
