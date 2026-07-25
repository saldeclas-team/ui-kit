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
| `showBorderIOS`      | `boolean`                     | `false`           | Turn on the wrapper-frame chrome on iOS (background + border + padding + min-height). Off = 100% pure native picker. See below.      |
| `showBorderAndroid`  | `boolean`                     | `false`           | Turn on the wrapper-frame chrome on Android. Independent from `showBorderIOS`.                                                       |
| `radius`             | `SelectNativeRadius`          | `"md"`            | Frame border radius. Only applies when chrome is opted in (needs a border to render).                                                |
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

- **Frame chrome (background + border + padding + min-height)** is OFF by default on both platforms. The picker renders at its natural intrinsic size — SwiftUI `Menu` on iOS is just tinted text with a chevron, no background, no outline; Compose `DropdownMenu` on Android similarly renders as a bare button. This is the correct "100% native" look for most consumers.
- Opt into the chrome per-platform with `showBorderIOS` / `showBorderAndroid`. You can enable it only on one platform if you want Cupertino-clean on iOS and Material-framed on Android (or the reverse).
- **Native picker** — SwiftUI Menu on iOS, Compose DropdownMenu on Android. The trigger label reads the current option's `label`. Tapping opens the platform-native menu; picking fires `onChange`.
- **Disabled** — the picker is disabled at the native level (`enabled={false}` on iOS + Android). When chrome is on, the frame renders at reduced opacity.
- **Error state** — `errorText` forces the chrome ON so the invalid state stays legible (red border, framed backdrop, error copy below).
- **Missing peer dep** — the frame renders an "Install `@expo/ui`" hint instead of the picker. Chrome is forced ON so the hint has visual framing. No crash.

### Chrome ON vs. OFF

| Frame prop          | Chrome OFF (default) | Chrome ON                           |
| ------------------- | -------------------- | ----------------------------------- |
| `backgroundColor`   | `"transparent"`      | `background` / `backgroundDisabled` |
| `borderWidth`       | `0`                  | `1`                                 |
| `paddingHorizontal` | `0`                  | `$uiSpacingMd`                      |
| `paddingTop`        | `12`                 | `$uiSpacingSm`                      |
| `paddingBottom`     | `0`                  | `$uiSpacingSm`                      |
| `minHeight`         | `0`                  | `48`                                |

`paddingTop: 12` is the only chrome that stays in borderless mode — just enough breathing room so the label above doesn't visually glue to the picker's trigger text. No `paddingBottom` and no `minHeight` because they would leave invisible whitespace below the picker, which makes subsequent sections read as "raised" / floating (that's the exact regression we hit when we first tried `minHeight: 44` with `justifyContent: "center"`).

The `label`, `helperText`, and `errorText` slots always render regardless of chrome state — those live outside the frame.

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

Basic (fully native — no chrome):

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

Framed on both platforms (input-shaped picker):

```tsx
<SelectNative
  options={COUNTRIES}
  value={country}
  onChange={setCountry}
  label="Country"
  showBorderIOS
  showBorderAndroid
/>
```

Cupertino-clean on iOS, Material-framed on Android:

```tsx
<SelectNative
  options={COUNTRIES}
  value={country}
  onChange={setCountry}
  label="Country"
  showBorderAndroid
/>
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
- **Trigger is a Tamagui `Text` inside `MenuView`** — we own the trigger visual so RN layout is deterministic. Menu popup interior (checkmark, popup background, row hover) is still painted by the platform (SwiftUI / Compose). Every trigger color slot is themable: `text`, `textDisabled`, `placeholder`, `chevron`.
- **No search / filter bar** — same as Select. The native menu is best for short-to-medium lists (<30 items). For long lists reach for `Select`.

## Platform support

| Platform         | Status                          | Notes                                                                                                                                            |
| ---------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| iOS              | ✅ (requires `@expo/ui`)        | SwiftUI `Menu` via `MenuView` from `@expo/ui/community/menu`. Selected option renders a native checkmark.                                        |
| Android          | ✅ (requires `@expo/ui`)        | Jetpack Compose `DropdownMenu` via the same `MenuView`. Selected option renders a native checkmark.                                              |
| Web              | ⚠️ (`Host` + `Picker` fallback) | `MenuView` doesn't fire actions on web; we fall back to `@expo/ui`'s `Host + Picker` which renders a plain HTML `<select>`-like element.         |
| Missing peer dep | ✅ safe fallback                | Frame renders "Install `@expo/ui`" hint colored with the `errorText` slot. The app does NOT crash and other ui-kraken components are unaffected. |
