# Input

Single-line text input with label, helper text, error state, optional icon slots, and every RN `TextInput` prop flowing through. Provider-level + per-instance color overrides.

## Import

```tsx
import { Input } from "ui-kraken";
```

## Props

| Prop             | Type                                                 | Default     | Description                                                                                                  |
| ---------------- | ---------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------ |
| `value`          | `string`                                             | —           | **Required.** Controlled value.                                                                              |
| `onChangeText`   | `(value: string) => void`                            | —           | **Required.** Fires on every keystroke.                                                                      |
| `label`          | `string`                                             | —           | Optional bold label above the input. Also becomes the `accessibilityLabel`.                                  |
| `helperText`     | `string`                                             | —           | Muted helper text below the input. Hidden when `error` is set.                                               |
| `error`          | `string`                                             | —           | Error message. Activates error border, replaces `helperText`.                                                |
| `leftIcon`       | `ReactNode`                                          | —           | Optional leading icon slot. Consumer brings their own.                                                       |
| `rightIcon`      | `ReactNode`                                          | —           | Optional trailing icon slot. Consumer brings their own.                                                      |
| `disabled`       | `boolean`                                            | `false`     | Sets `editable={false}` on the underlying TextInput + dims the surface.                                      |
| `radius`         | `number \| "none" \| "sm" \| "md" \| "lg" \| "pill"` | `"md"`      | Border radius on the input wrapper.                                                                          |
| `InputComponent` | `ComponentType<TextInputProps>`                      | `TextInput` | Alternate underlying input. Pass `BottomSheetTextInput` when rendering inside `@gorhom/bottom-sheet`.        |
| `inputColors`    | `Partial<InputColors>`                               | —           | Per-instance color override. Missing slots fall through to the provider palette.                             |
| `testID`         | `string`                                             | `"input"`   | Root testID. Sub-elements: `-label`, `-wrapper`, `-input`, `-left-icon`, `-right-icon`, `-helper`, `-error`. |

Every other RN `TextInputProps` (except `style`) flows through the spread: `placeholder`, `keyboardType`, `secureTextEntry`, `autoCapitalize`, `autoCorrect`, `autoFocus`, `maxLength`, `onSubmitEditing`, `returnKeyType`, `accessibilityHint`, etc.

## Color model

Input has its own **`inputColors`** block on the token schema — 11 slots covering every surface + state combination. Override at the provider level to re-theme every input in the app:

```tsx
import { UIKitProvider } from "ui-kraken";

<UIKitProvider
  tokens={{
    inputColors: {
      borderFocused: "#7C3AED",
      borderError: "#B91C1C",
    },
  }}
  dark={{
    inputColors: {
      borderFocused: "#A78BFA",
    },
  }}
>
  <App />
</UIKitProvider>;
```

If you don't pass anything, ui-kraken ships sensible defaults tuned for WCAG AA contrast on both light and dark surfaces.

### Slots

| Slot                 | Paints                                             |
| -------------------- | -------------------------------------------------- |
| `background`         | Wrapper background (default + focused states).     |
| `backgroundDisabled` | Wrapper background when disabled.                  |
| `border`             | Border in the default (unfocused, no-error) state. |
| `borderFocused`      | Border when the input has focus.                   |
| `borderError`        | Border when `error` is set (overrides focused).    |
| `text`               | Value text color.                                  |
| `textDisabled`       | Value text color when `disabled`.                  |
| `placeholder`        | Placeholder text color.                            |
| `label`              | Bold label above the input.                        |
| `helperText`         | Muted helper text below.                           |
| `errorText`          | Error message text below.                          |

## Usage

Basic:

```tsx
import { useState } from "react";
import { Input } from "ui-kraken";

function NameField() {
  const [name, setName] = useState("");
  return (
    <Input label="Name" placeholder="How should we call you?" value={name} onChangeText={setName} />
  );
}
```

With error state:

```tsx
<Input
  label="Email"
  value={email}
  onChangeText={setEmail}
  error={touched && !isValidEmail(email) ? "Enter a valid email" : undefined}
/>
```

With helper text (hidden when error is present):

```tsx
<Input
  label="Password"
  value={password}
  onChangeText={setPassword}
  helperText="At least 8 characters"
  secureTextEntry
/>
```

With icons:

```tsx
import { Search, X } from "lucide-react-native";

<Input
  placeholder="Search…"
  value={query}
  onChangeText={setQuery}
  leftIcon={<Search size={18} />}
  rightIcon={query ? <X size={18} onPress={() => setQuery("")} /> : null}
/>;
```

Radius presets:

```tsx
<Input value={x} onChangeText={setX} radius="none" />
<Input value={x} onChangeText={setX} radius="pill" />
<Input value={x} onChangeText={setX} radius={24} />
```

Per-instance color override:

```tsx
<Input
  value={x}
  onChangeText={setX}
  label="Brand"
  inputColors={{
    border: "#FF6B00",
    borderFocused: "#FF6B00",
    background: "#FFF7ED",
    label: "#3B0A00",
  }}
/>
```

Inside a `@gorhom/bottom-sheet`:

```tsx
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";

<Input value={x} onChangeText={setX} label="Comment" InputComponent={BottomSheetTextInput} />;
```

Without the `InputComponent` swap, the keyboard-avoidance behaviour attached to the sheet would not fire on focus and the keyboard would cover the input.

## Accessibility

- The RN `TextInput` inside has native accessibility handling (VoiceOver / TalkBack).
- `accessibilityLabel` on the wrapper defaults to the `label` prop when provided.
- `accessibilityState={{ disabled }}` propagates.
- Wrapper has `minHeight: 48` — meets the touch-target minimum on every platform.

## Notes

- **Controlled only** — v1 does not ship `defaultValue` / uncontrolled mode. Wrap in `useState`.
- **No compound API** — flat props (`keyboardType`, `secureTextEntry`) are more flexible than `Input.Email` / `Input.Password`.
- **No multi-line** — a distinct `Textarea` component ships separately.
- **No masking** — currency masking lives in the sibling `CurrencyInput`; other masks belong in userland.
- **No `size` prop** — 48 px minimum touch target is universal for accessibility.

## Platform support

| Platform | Status | Notes                                                                                                                                                                                               |
| -------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| iOS      | ✅     | Full support. Native `TextInput`.                                                                                                                                                                   |
| Android  | ✅     | Full support. Native `TextInput`.                                                                                                                                                                   |
| Web      | ✅     | Via `react-native-web`. Renders as `<input>` DOM element. `accessibilityLabel` becomes `aria-label`; `accessibilityState.disabled` becomes `aria-disabled`; focus / blur / change events translate. |
