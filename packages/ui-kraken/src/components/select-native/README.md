# SelectNative

Single-choice picker rendered with the fully-native `@expo/ui` `Picker`. SwiftUI `Menu` on iOS + Jetpack Compose `DropdownMenu` on Android — the trigger button and the popup are both painted by the platform, not by us. Consumers get the platform-native affordance for free (haptics, animations, dark-mode chrome) at the cost of a peer dependency.

Contrast with [`Select`](../select/README.md) — Select is the pure-JS variant with an RN `Modal` backend and a fully-controllable palette (16 slots). SelectNative is smaller (7 palette slots — only the wrapper frame + labels are ours; the picker interior is native) and requires the optional `@expo/ui` peer dep. Reach for `Select` when you want cross-platform consistency and full control over every color; reach for `SelectNative` when you want the platform-native look and feel.

For the drag-to-dismiss bottom-sheet variant, reach for [`SelectBottomSheet`](../select-bottom-sheet/README.md) (peer deps: `@gorhom/bottom-sheet` + `react-native-gesture-handler`).

## Peer dependency — `@expo/ui`

SelectNative requires `@expo/ui` to actually render its native picker. The dependency is registered as **optional** in `ui-kraken`'s `peerDependenciesMeta` — consumers who don't use SelectNative don't have to install it.

**When installed** (`pnpm add @expo/ui`): the component renders the native `Host` + `Picker` combo and behaves as documented below.

**When missing**: the component renders a helpful inline hint inside the frame — `"Install \`@expo/ui\` to enable SelectNative."`— colored with the`errorText` slot. The app does NOT crash. Consumers see the missing dep at development time and can install it without hunting through Metro errors.

## Import

```tsx
import { SelectNative } from "ui-kraken";
```

## Props

| Prop                 | Type                          | Default           | Description                                                                                                                          |
| -------------------- | ----------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `options`            | `SelectNativeOption<Value>[]` | —                 | Options rendered in the native menu, in array order. Required.                                                                       |
| `value`              | `Value \| null`               | —                 | Currently-selected value, or `null` when none. Required (controlled).                                                                |
| `onChange`           | `(value: Value) => void`      | —                 | Fires with the picked value when the user picks a menu option. Required.                                                             |
| `label`              | `string`                      | —                 | Optional bold heading above the frame.                                                                                               |
| `helperText`         | `string`                      | —                 | Muted helper copy below the frame. Overridden by `errorText`.                                                                        |
| `errorText`          | `string`                      | —                 | Error copy below the frame. Overrides `helperText`.                                                                                  |
| `placeholderLabel`   | `string`                      | `"Select…"`       | Label of the invisible placeholder item that gets injected when `value` doesn't match any option. See "Placeholder injection" below. |
| `disabled`           | `boolean`                     | `false`           | Disable the picker — the native menu will not open.                                                                                  |
| `radius`             | `SelectNativeRadius`          | `"md"`            | Frame border radius. `"none" \| "sm" \| "md" \| "lg" \| "pill" \| number`.                                                           |
| `selectNativeColors` | `Partial<SelectNativeColors>` | —                 | Per-instance color override. Missing slots fall through to the provider.                                                             |
| `testID`             | `string`                      | `"select-native"` | Root testID. Sub-elements derive `-label`, `-frame`, `-picker`, `-helper-text`, `-error-text`, `-missing-peer`.                      |

Every Tamagui `YStackProps` flows through the spread — `padding`, `margin`, `width`, `borderColor`, `pressStyle`, shorthand aliases (`px`, `py`, `mx`, `br`), every accessibility prop, etc.

## Generic in the value type

Values may be `string` **or** `number` (matches `@expo/ui`'s `PickerItemValue`).

```ts
type Country = "us" | "mx" | "ca";
const [country, setCountry] = useState<Country | null>(null);

<SelectNative<Country>
  options={[
    { value: "us", label: "United States" },
    { value: "mx", label: "Mexico" },
    { value: "ca", label: "Canada" },
  ]}
  value={country}
  onChange={setCountry}
/>;

// Numeric example
const [year, setYear] = useState<number | null>(null);

<SelectNative<number>
  options={[
    { value: 2024, label: "2024" },
    { value: 2025, label: "2025" },
  ]}
  value={year}
  onChange={setYear}
/>;
```

## Placeholder injection

`@expo/ui`'s `Picker` requires `selectedValue` to match exactly one of the `Picker.Item` children. If it doesn't, the Android Compose implementation silently drops taps and the menu never opens.

To make `value={null}` (or a value that doesn't match) work reliably on both platforms, SelectNative **injects an invisible placeholder item** with the empty-string value at position 0 of the options list, using `placeholderLabel` for its display text. Once the user picks a real option, the placeholder is skipped on subsequent renders.

You can override the placeholder label per-instance:

```tsx
<SelectNative label="Country" placeholderLabel="— Pick one —" />
```

## Behavior

- **Frame** — always visible, wraps the native picker. Background / border / border-error come from the palette.
- **Native picker** — SwiftUI Menu on iOS, Compose DropdownMenu on Android. The trigger label reads the current option's `label`. Tapping opens the platform-native menu; picking fires `onChange`.
- **Disabled** — the picker is disabled at the native level (`enabled={false}` on iOS + Android). Frame renders at reduced opacity.
- **Missing peer dep** — the frame renders an "Install `@expo/ui`" hint instead of the picker. No crash.

## Color model

SelectNative has its own **`selectNativeColors`** block on the token schema — 7 slots. Deliberately smaller than [`selectColors`](../select/README.md#color-model) because the native picker owns its own interior chrome.

```tsx
import { UIKitProvider } from "ui-kraken";

<UIKitProvider
  tokens={{
    selectNativeColors: {
      border: "#7C3AED",
      background: "#F5F3FF",
    },
  }}
  dark={{
    selectNativeColors: {
      border: "#A78BFA",
      background: "#1F1B3A",
    },
  }}
>
  <App />
</UIKitProvider>;
```

### Slots

| Slot                 | Paints                                                          |
| -------------------- | --------------------------------------------------------------- |
| `label`              | Bold heading rendered above the trigger frame.                  |
| `background`         | Wrapper frame background in default state.                      |
| `backgroundDisabled` | Wrapper frame background when `disabled`.                       |
| `border`             | Wrapper frame border in default state.                          |
| `borderError`        | Wrapper frame border when `errorText` is set.                   |
| `helperText`         | Muted helper copy below the frame (no error).                   |
| `errorText`          | Error copy below the frame (also colors the missing-peer hint). |

### Default palettes

**Light**: white frame, `#D1D5DB` border, `#111827` label, `#6B7280` helper, `#DC2626` error / border-error.

**Dark**: `#111827` frame, `#374151` border, `#F9FAFB` label, `#9CA3AF` helper, `#F87171` error / border-error.

## Usage

Basic:

```tsx
const [country, setCountry] = useState<string | null>(null);

<SelectNative
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

With helper text:

```tsx
<SelectNative
  options={COUNTRIES}
  value={country}
  onChange={setCountry}
  label="Country"
  helperText="Uses the platform-native picker."
/>
```

Error state:

```tsx
<SelectNative
  options={COUNTRIES}
  value={null}
  onChange={setCountry}
  label="Country"
  errorText="Please pick a country."
/>
```

Fully disabled — read-only:

```tsx
<SelectNative options={COUNTRIES} value="us" onChange={() => undefined} disabled />
```

Brand-tinted wrapper:

```tsx
<SelectNative
  options={COUNTRIES}
  value={country}
  onChange={setCountry}
  selectNativeColors={{
    border: "#7C3AED",
    background: "#F5F3FF",
  }}
/>
```

## Accessibility

- Label: rendered as a `Text` above the frame. Screen readers announce it before the picker.
- Native picker: uses the platform's native accessibility semantics. On iOS: SwiftUI Menu announces as a menu button. On Android: Compose DropdownMenu announces as a dropdown.
- Helper / error text: rendered as `Text` after the frame. Screen readers announce it after the picker.

## Sub-element testIDs

- root: `"select-native"` (overridable via `testID`)
- label (when `label` set): `"{root}-label"`
- frame: `"{root}-frame"`
- native picker (when peer dep available): `"{root}-picker"`
- missing-peer hint (when peer dep NOT available): `"{root}-missing-peer"`
- helper text (when set, no error): `"{root}-helper-text"`
- error text (when set): `"{root}-error-text"`

## Notes

- **Controlled only** — no `defaultValue` / uncontrolled mode.
- **`appearance="menu"` fixed** — SelectNative always uses the compact menu appearance. If you need the iOS wheel picker for date-style interactions, use `DatePicker` (also Batch 2).
- **Native picker owns its interior chrome** — text color of the current selection, chevron, menu row highlight, and disabled dim are all painted by the platform. Only the wrapper frame + labels are themable.
- **No search / filter bar** — same as Select. The native menu is best for short-to-medium lists (<30 items). For long lists reach for `Select`.

## Platform support

| Platform         | Status                             | Notes                                                                                                                                            |
| ---------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| iOS              | ✅ (requires `@expo/ui`)           | SwiftUI `Menu`. Full haptic feedback + native chrome.                                                                                            |
| Android          | ✅ (requires `@expo/ui`)           | Jetpack Compose `DropdownMenu`. Placeholder injection makes `value=null` open the menu reliably.                                                 |
| Web              | ⚠️ (via `@expo/ui`'s web fallback) | `@expo/ui` renders a plain HTML `<select>`-like element on web. Not as visually integrated as the native platforms.                              |
| Missing peer dep | ✅ safe fallback                   | Frame renders "Install `@expo/ui`" hint colored with the `errorText` slot. The app does NOT crash and other ui-kraken components are unaffected. |
