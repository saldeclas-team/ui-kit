# RadioGroup

Group of mutually-exclusive selectable options (single-choice picker). Controlled component, generic in the value type, vertical or horizontal layout, provider-level + per-instance color overrides.

## Import

```tsx
import { RadioGroup } from "ui-kraken";
```

## Props

| Prop               | Type                                                 | Default         | Description                                                                                                                      |
| ------------------ | ---------------------------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `value`            | `T \| null`                                          | —               | **Required.** Controlled selection. `null` = nothing selected.                                                                   |
| `onChange`         | `(value: T) => void`                                 | —               | **Required.** Fires on tap of an unselected option. Never fires for a tap on the already-selected option.                        |
| `options`          | `Array<{ value: T; label: string }>`                 | —               | **Required.** Enumerated choices. `label` is displayed; `value` is the identity.                                                 |
| `label`            | `string`                                             | —               | Optional bold heading rendered above the group. Also becomes the container `accessibilityLabel`.                                 |
| `disabled`         | `boolean`                                            | `false`         | Disables every option. Per-option disabling is a v1 non-goal.                                                                    |
| `orientation`      | `"vertical" \| "horizontal"`                         | `"vertical"`    | Layout direction. Horizontal is for tight segmented pickers ("S / M / L").                                                       |
| `radius`           | `number \| "none" \| "sm" \| "md" \| "lg" \| "pill"` | `"md"`          | Border radius on each option row. Presets map to the theme scale, `"pill"` is fully rounded. Ring around the dot stays circular. |
| `radioGroupColors` | `Partial<RadioGroupColors>`                          | —               | Per-instance color override. Missing slots fall through to the provider palette.                                                 |
| `testID`           | `string`                                             | `"radio-group"` | Root testID. Sub-elements derive: `{testID}-label`, `{testID}-option-{value}`, `{testID}-option-{value}-{circle,dot,label}`.     |

## Generic value type

`RadioGroup` is generic in `T extends string` so you keep type-safety on the selected value across the group:

```tsx
type Owner = "yes" | "no";
const [owner, setOwner] = useState<Owner | null>(null);

<RadioGroup<Owner>
  value={owner}
  onChange={setOwner} // (v: Owner) => void
  options={[
    { value: "yes", label: "Yes, it's mine" },
    { value: "no", label: "No, I rent it" },
  ]}
/>;
```

The generic defaults to `string` for the 80% case where you don't want to reach for the type param.

## Color model

RadioGroup has its own **`radioGroupColors`** block on the token schema. Override at the provider level to re-theme every radio in the app:

```tsx
import { UIKitProvider } from "ui-kraken";

<UIKitProvider
  tokens={{
    radioGroupColors: {
      selectedBorder: "#7C3AED",
      dot: "#7C3AED",
      selectedBackground: "#F5F3FF",
    },
  }}
  dark={{
    radioGroupColors: {
      selectedBorder: "#A78BFA",
      dot: "#A78BFA",
    },
  }}
>
  <App />
</UIKitProvider>;
```

If you don't pass anything, ui-kraken ships sensible defaults tuned for WCAG AA contrast on both light and dark surfaces.

For a one-off per-instance paint, use the `radioGroupColors` prop on the component.

### Slots

| Slot                   | Paints                                                         |              Required               |
| ---------------------- | -------------------------------------------------------------- | :---------------------------------: |
| `selectedBorder`       | Ring border + row border when the option is selected.          |                  ✓                  |
| `unselectedBorder`     | Ring border + row border when the option is NOT selected.      |                  ✓                  |
| `dot`                  | Inner filled dot on the selected option.                       |                  ✓                  |
| `label`                | Option label text color.                                       |                  ✓                  |
| `groupLabel`           | Group heading text color (the `label` prop on `<RadioGroup>`). |                  ✓                  |
| `selectedBackground`   | Subtle row background tint when option is selected.            | (optional — transparent when unset) |
| `unselectedBackground` | Row background when option is NOT selected.                    | (optional — transparent when unset) |

## Usage

Basic controlled group:

```tsx
import { useState } from "react";
import { RadioGroup } from "ui-kraken";

function Owner() {
  const [owner, setOwner] = useState<"yes" | "no" | null>(null);
  return (
    <RadioGroup
      label="Are you the vehicle owner?"
      value={owner}
      onChange={setOwner}
      options={[
        { value: "yes", label: "Yes, it's mine" },
        { value: "no", label: "No, I rent it" },
      ]}
      testID="onboarding-owner"
    />
  );
}
```

Horizontal segmented picker:

```tsx
<RadioGroup
  value={size}
  onChange={setSize}
  orientation="horizontal"
  options={[
    { value: "sm", label: "S" },
    { value: "md", label: "M" },
    { value: "lg", label: "L" },
  ]}
/>
```

Disabled group:

```tsx
<RadioGroup value="yes" onChange={() => undefined} options={OPTIONS} disabled />
```

Radius presets:

```tsx
<RadioGroup value={value} onChange={setValue} options={OPTIONS} radius="pill" />
<RadioGroup value={value} onChange={setValue} options={OPTIONS} radius="none" />
<RadioGroup value={value} onChange={setValue} options={OPTIONS} radius={24} />
```

Per-instance color override:

```tsx
<RadioGroup
  value={value}
  onChange={setValue}
  options={OPTIONS}
  radioGroupColors={{
    selectedBorder: "#059669",
    unselectedBorder: "#D1FAE5",
    dot: "#059669",
    label: "#064E3B",
    groupLabel: "#064E3B",
    selectedBackground: "#F0FDF4",
  }}
/>
```

## Accessibility

- Container gets `accessibilityRole="radiogroup"` + `accessibilityLabel` (set to the `label` prop when provided).
- Every option row gets `accessibilityRole="radio"` + `accessibilityState={{ selected, disabled }}`.
- Every option row meets a **48 × 48 px** minimum touch target.
- Tap on an already-selected option is a **no-op** (does not fire `onChange`) — matches native platform behavior.

## Notes

- **No standalone `<Radio>`** — a radio without a group is a poorly-designed checkbox. The pattern is enforced by only shipping the group.
- **No `defaultValue` / uncontrolled mode** — v1 is controlled only. Wrap in `useState`.
- **No per-option disabling** — the `disabled` prop disables the whole group. Per-option disabling can land as a follow-up minor.
- **No error state** — validation UX belongs in a future `FormField` wrapper.

## Platform support

| Platform | Status | Notes                                                                                                                                                     |
| -------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| iOS      | ✅     | Full support. `accessibilityRole="radio"` maps to VoiceOver's "radio button" trait.                                                                       |
| Android  | ✅     | Full support. `accessibilityRole="radio"` maps to TalkBack's "radio button" trait.                                                                        |
| Web      | ✅     | Via `react-native-web`. Renders as nested `<div>` / `<span>`. Roles become `role="radiogroup"` / `role="radio"` on the DOM; state becomes `aria-checked`. |
