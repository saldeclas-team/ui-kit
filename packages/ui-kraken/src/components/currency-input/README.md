# CurrencyInput

Numeric input formatted as currency. Locale-aware separators, configurable decimals, configurable prefix. Consumer stores a `number` in form state; the component owns all formatting + parsing.

## Import

```tsx
import { CurrencyInput } from "ui-kraken";
```

## Props

| Prop                  | Type                                                 | Default            | Description                                                                                                                        |
| --------------------- | ---------------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `value`               | `number \| null`                                     | —                  | **Required.** Controlled numeric value. `null` = empty.                                                                            |
| `onChangeValue`       | `(value: number \| null) => void`                    | —                  | **Required.** Fires on every keystroke with the parsed numeric value (or `null`).                                                  |
| `label`               | `string`                                             | —                  | Optional bold label above the input. Also becomes the `accessibilityLabel`.                                                        |
| `helperText`          | `string`                                             | —                  | Muted helper text below the input. Hidden when `error` is set.                                                                     |
| `error`               | `string`                                             | —                  | Error message. Activates error border, replaces `helperText`.                                                                      |
| `prefix`              | `string`                                             | `"$"`              | Currency prefix rendered inside the wrapper. Set to `""` to hide entirely.                                                         |
| `decimals`            | `number`                                             | `0`                | Max decimal places. `0` for JPY / COP; `2` for USD / EUR.                                                                          |
| `locale`              | `string`                                             | `"en-US"`          | BCP 47 locale for thousands + decimal separators. `"en-US"` → `1,234.56`; `"es-CO"` / `"de-DE"` → `1.234,56`; `"ja-JP"` → `1,234`. |
| `leftIcon`            | `ReactNode`                                          | —                  | Optional leading icon (rendered before the prefix). Rare for currency.                                                             |
| `rightIcon`           | `ReactNode`                                          | —                  | Optional trailing icon (e.g., clear button).                                                                                       |
| `disabled`            | `boolean`                                            | `false`            | Sets `editable={false}` + dims the surface.                                                                                        |
| `radius`              | `number \| "none" \| "sm" \| "md" \| "lg" \| "pill"` | `"md"`             | Border radius on the input wrapper.                                                                                                |
| `InputComponent`      | `ComponentType<TextInputProps>`                      | `TextInput`        | Alternate underlying input. Pass `BottomSheetTextInput` when rendering inside `@gorhom/bottom-sheet`.                              |
| `currencyInputColors` | `Partial<CurrencyInputColors>`                       | —                  | Per-instance color override. Missing slots fall through to the provider palette.                                                   |
| `testID`              | `string`                                             | `"currency-input"` | Root testID. Sub-elements: `-label`, `-wrapper`, `-prefix`, `-input`, `-left-icon`, `-right-icon`, `-helper`, `-error`.            |

Every other RN `TextInputProps` (except `value`, `onChangeText`, `keyboardType`, `style`) flows through the spread. `keyboardType` is derived automatically: `"number-pad"` when `decimals === 0`, `"decimal-pad"` when `decimals > 0`.

## Color model

CurrencyInput has its own **`currencyInputColors`** block on the token schema — 12 slots (Input's 11 + `prefix` for the currency-symbol color).

```tsx
import { UIKitProvider } from "ui-kraken";

<UIKitProvider
  tokens={{
    currencyInputColors: {
      borderFocused: "#7C3AED",
      prefix: "#7C3AED",
    },
  }}
  dark={{
    currencyInputColors: {
      borderFocused: "#A78BFA",
      prefix: "#A78BFA",
    },
  }}
>
  <App />
</UIKitProvider>;
```

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
| `prefix`             | Currency prefix text color.                        |
| `label`              | Bold label above the input.                        |
| `helperText`         | Muted helper text below.                           |
| `errorText`          | Error message text below.                          |

## Usage

USD with cents:

```tsx
import { useState } from "react";
import { CurrencyInput } from "ui-kraken";

function Price() {
  const [price, setPrice] = useState<number | null>(null);
  return (
    <CurrencyInput
      label="Price"
      value={price}
      onChangeValue={setPrice}
      decimals={2}
      locale="en-US"
    />
  );
}
```

COP integers:

```tsx
<CurrencyInput
  label="Monto"
  value={amount}
  onChangeValue={setAmount}
  prefix="COP $"
  decimals={0}
  locale="es-CO"
/>
```

EUR with locale-aware separators:

```tsx
<CurrencyInput
  label="Importe"
  value={amount}
  onChangeValue={setAmount}
  prefix="€"
  decimals={2}
  locale="es-ES"
/>
// User types `1.234,56` — `onChangeValue` fires with `1234.56`.
```

Without a prefix (plain numeric input):

```tsx
<CurrencyInput value={qty} onChangeValue={setQty} prefix="" />
```

With error state:

```tsx
<CurrencyInput
  label="Amount"
  value={amount}
  onChangeValue={setAmount}
  error={touched && amount === null ? "Required" : undefined}
/>
```

Per-instance color override:

```tsx
<CurrencyInput
  value={amount}
  onChangeValue={setAmount}
  label="Brand"
  currencyInputColors={{
    border: "#FF6B00",
    borderFocused: "#FF6B00",
    background: "#FFF7ED",
    prefix: "#FF6B00",
  }}
/>
```

Inside a `@gorhom/bottom-sheet`:

```tsx
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";

<CurrencyInput value={amount} onChangeValue={setAmount} InputComponent={BottomSheetTextInput} />;
```

## Behaviour

- **Numeric API**: consumer stores `number | null` in state; no string round-trip at the boundary.
- **Live formatting**: on every keystroke, the input's display re-renders as a locale-formatted string; `onChangeValue` fires with the parsed `number` (or `null` for empty).
- **External `value` sync**: if the consumer resets the value via a form reset or a parent update, the display re-syncs via `useEffect` — a `useRef` tracks the last emit so our own emits do not ping-pong.
- **Keyboard type**: auto-selected — `"number-pad"` for integers, `"decimal-pad"` when `decimals > 0`.
- **`accessibilityValue.text`** is set to the current display string so VoiceOver / TalkBack announce the formatted value.

## Accessibility

- The RN `TextInput` inside has native accessibility handling (VoiceOver / TalkBack).
- `accessibilityLabel` on the wrapper defaults to the `label` prop when provided.
- `accessibilityState={{ disabled }}` propagates.
- `accessibilityValue={{ text: displayString }}` announces the formatted amount.
- Wrapper has `minHeight: 48` — meets the touch-target minimum on every platform.

## Notes

- **Controlled only** — v1 does not ship uncontrolled mode.
- **Prefix is a plain string** — no `Intl.DisplayNames` currency-code lookup. Consumer passes `"$"` / `"€"` / `"COP $"` / etc. explicitly.
- **No min / max clamping** — validation belongs in the consumer via the `error` prop (works well with `react-hook-form`).
- **No compound API** (`CurrencyInput.USD`) — flat props are more flexible.

## Platform support

| Platform | Status | Notes                                                                                                                   |
| -------- | ------ | ----------------------------------------------------------------------------------------------------------------------- |
| iOS      | ✅     | Full support. `keyboardType` maps to iOS's number / decimal keypads.                                                    |
| Android  | ✅     | Full support. `keyboardType` maps to Android's numeric / decimal input types.                                           |
| Web      | ✅     | Via `react-native-web`. Renders as `<input>` with `inputMode="decimal"` (when `decimals > 0`) or `inputMode="numeric"`. |
