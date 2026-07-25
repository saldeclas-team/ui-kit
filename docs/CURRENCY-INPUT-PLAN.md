# CurrencyInput — design record

**Status:** shipped on 2026-07-25 in ui-kraken v0.8.0 as part of [`COMPONENTS-BATCH-1-PLAN.md`](./COMPONENTS-BATCH-1-PLAN.md) Phase A.

Living design doc for the `CurrencyInput` primitive. Kept post-shipping so future contributors can understand the decisions behind the shape of the API, not just what it does today.

---

## Overview

Numeric input formatted as currency. Common uses: prices in checkout flows, invoice amounts, income / expense entry, budget builders, payment forms, currency converters.

**Locked decisions:**

- **Naming**: `CurrencyInput` — matches `react-currency-input-field` (the de-facto web standard) and reads unambiguously ("MoneyInput" is casual and locks the vocabulary to informal contexts).
- **Numeric API, not string**: `value: number | null` + `onChangeValue: (v: number | null) => void`. The consumer stores a `number` in their form state; the component owns all formatting / parsing. No string round-trips at the consumer boundary.
- **`null` for empty**: consumer distinguishes "not set" from "zero" cleanly. Ships alongside `number` in the same slot instead of using a sentinel.
- **Locale-aware formatting via `Intl.NumberFormat`**: separator (`,` vs `.`) and grouping (`1,234,567` vs `1.234.567` vs `1 234 567`) resolve from the `locale` prop. Default `"en-US"`.
- **Configurable decimals**: `decimals` prop (default `0` for currencies like COP / JPY that have no fractional units; set to `2` for USD / EUR).
- **Configurable prefix**: `prefix` prop (default `"$"`). Set to `""` to hide it entirely; set to `"€"` / `"₡"` / `"COP $"` / etc. for other currencies. Prefix is a plain string that lives INSIDE the input wrapper, visually attached to the number.
- **Wraps RN `TextInput`**: same as `Input`. Every `TextInputProps` (minus the ones we manage — `value`, `onChangeText`, `keyboardType`, `style`) flows through `...rest`. `keyboardType` is derived: `"number-pad"` when `decimals === 0`, `"decimal-pad"` when `decimals > 0`.
- **`InputComponent?` slot**: same as `Input` — accepts alternate underlying `TextInput` implementations (e.g. `BottomSheetTextInput` from `@gorhom/bottom-sheet`).
- **Own color block on the token schema**: `currencyInputColors` with 12 slots (Input's 11 + `prefix` for the currency-symbol color). Provider-level + per-instance overrides.
- **Icon slots**: `leftIcon?` + `rightIcon?`, same as `Input`. Rare for currency inputs — usually `prefix` fills the leading space — but supported for symmetry with `Input` and for consumers who want, e.g., a clear button on the right.
- **Value / display sync**: internal `useState` holds the formatted display string; a `useEffect` re-syncs when the external `value` changes (form reset, prop update). A `useRef` tracks the last emitted value so our own emits do not trigger the effect and clobber the display.
- **Accessibility**: minimum **48 × 48 px** touch target; `accessibilityLabel` derived from `label` when provided; `accessibilityState={{ disabled }}` propagates.

## API

### Props

`CurrencyInputProps` re-declares only props that are OURS. Every `TextInputProps` (except the four we own — `value`, `onChangeText`, `keyboardType`, `style`) flows through `...rest` with types inferred from `Omit<TextInputProps, "value" | "onChangeText" | "keyboardType" | "style">`.

```ts
export type CurrencyInputRadius = number | "none" | "sm" | "md" | "lg" | "pill";

export type CurrencyInputColorsInput = Partial<CurrencyInputColors>;

export interface CurrencyInputProps extends Omit<
  TextInputProps,
  "value" | "onChangeText" | "keyboardType" | "style"
> {
  /** Controlled numeric value. `null` = empty. */
  value: number | null;
  /** Fires on every keystroke with the parsed numeric value (or `null`). */
  onChangeValue: (value: number | null) => void;
  /** Optional bold label rendered above the input. Also becomes the wrapper `accessibilityLabel`. */
  label?: string;
  /** Optional muted helper text rendered below the input. Hidden when `error` is set. */
  helperText?: string;
  /** Error message. When set (non-empty), activates the error border style and replaces `helperText`. */
  error?: string;
  /** Currency prefix rendered inside the input wrapper. Default: `"$"`. Set `""` to hide. */
  prefix?: string;
  /** Maximum decimal places. Default: `0` (integer-only). `2` for USD / EUR. */
  decimals?: number;
  /**
   * BCP 47 locale for thousands + decimal separators. Default: `"en-US"`.
   * Examples: `"en-US"` (1,234.56), `"es-CO"` (1.234,56), `"de-DE"` (1.234,56), `"ja-JP"` (1,234).
   */
  locale?: string;
  /** Optional leading icon slot (before the prefix). Rare for currency — usually the prefix fills that space. */
  leftIcon?: ReactNode;
  /** Optional trailing icon slot (e.g., clear button). */
  rightIcon?: ReactNode;
  /** Disables editing + focus and dims the surface. */
  disabled?: boolean;
  /** Border radius on the input wrapper. Default: `"md"`. */
  radius?: CurrencyInputRadius;
  /**
   * Alternate `TextInput` implementation. Defaults to RN `TextInput`.
   * Pass `BottomSheetTextInput` from `@gorhom/bottom-sheet` when the input
   * renders inside a bottom sheet.
   */
  InputComponent?: ComponentType<TextInputProps & { ref?: Ref<TextInput> }>;
  /** Per-instance color override. Missing slots fall through to the provider palette. */
  currencyInputColors?: CurrencyInputColorsInput;
  /**
   * Root testID. Sub-elements derive:
   * `{testID}-label`, `{testID}-wrapper`, `{testID}-prefix`, `{testID}-input`,
   * `{testID}-left-icon`, `{testID}-right-icon`, `{testID}-helper`, `{testID}-error`.
   */
  testID?: string;
}
```

### Format + parse helpers (internal, unit-tested)

Two pure functions co-located with the component. Not exported from the public barrel in v1 (add later if consumer demand emerges).

```ts
export function formatCurrency(
  value: number | null,
  options: { locale: string; decimals: number }
): string;

export function parseCurrency(
  text: string,
  options: { locale: string; decimals: number }
): number | null;
```

**`formatCurrency`**: uses `Intl.NumberFormat(locale, { maximumFractionDigits: decimals, minimumFractionDigits: 0 })`. Returns `""` for `null` and `NaN`. Truncates fractional digits beyond `decimals` (Intl's `maximumFractionDigits` rounds; we accept that behaviour).

**`parseCurrency`**:

- `decimals === 0` (integer mode): strips every non-digit character (including the locale's thousands separator, the prefix, and any user typos). Preserves an optional leading `-`. Returns `null` if the result is empty or `"-"` alone.
- `decimals > 0` (decimal mode): auto-detects the locale's decimal separator via `Intl.NumberFormat(locale).formatToParts(1.1)`, allows exactly one occurrence, strips everything else non-digit. Normalizes to `.` for `parseFloat`. Rounds to `decimals` places.

### Radius

`CurrencyInputRadius = "none" | "sm" | "md" | "lg" | "pill" | number` — same shape as `InputRadius`. Default `"md"`.

### Per-instance override

```tsx
<CurrencyInput
  value={amount}
  onChangeValue={setAmount}
  currencyInputColors={{ borderFocused: "#7C3AED", prefix: "#7C3AED" }}
/>
```

### A11y

- Same rules as `Input`: RN `TextInput` has native accessibility handling; `accessibilityLabel` defaults to `label` when provided; `accessibilityState={{ disabled }}` propagates; wrapper `minHeight: 48`.
- `accessibilityValue={{ text: displayString }}` is added so VoiceOver / TalkBack announce the formatted amount (e.g. "1,234.56") instead of just the raw digits the user typed.

### Sub-element testIDs

Root `testID` (default `"currency-input"`) propagates:

- `{testID}` — root container
- `{testID}-label` — label (when `label` is set)
- `{testID}-wrapper` — visual wrapper with the border
- `{testID}-prefix` — currency prefix (when `prefix.length > 0`)
- `{testID}-input` — the underlying `TextInput` (or the `InputComponent` override)
- `{testID}-left-icon` — left icon slot (when `leftIcon != null`)
- `{testID}-right-icon` — right icon slot (when `rightIcon != null`)
- `{testID}-helper` — helper text (when `helperText != null && !error`)
- `{testID}-error` — error message (when `error != null && error.length > 0`)

## Token schema

CurrencyInput introduces its own **`currencyInputColors`** block on `Tokens`. Zero reuse of other component palettes.

```tsx
<UIKitProvider
  tokens={{
    currencyInputColors: {
      borderFocused: "#7C3AED",
      prefix: "#7C3AED",
    },
  }}
>
  <App />
</UIKitProvider>
```

### `CurrencyInputColors` interface

Slot-based, 12 slots (11 inherited-in-spirit from `InputColors` + `prefix` for the currency-symbol text):

```ts
export interface CurrencyInputColors {
  background: string;
  backgroundDisabled: string;
  border: string;
  borderFocused: string;
  borderError: string;
  text: string;
  textDisabled: string;
  placeholder: string;
  /** Currency prefix text color (the "$" glyph inside the wrapper). */
  prefix: string;
  label: string;
  helperText: string;
  errorText: string;
}
```

### Default light + dark palettes

Same defaults as `Input` plus a muted `prefix` (gray-500 light / gray-400 dark) so the symbol reads as secondary against the value the user types.

## File structure

```
packages/ui-kraken/src/components/currency-input/
├── currency-input.tsx          # component logic + resolvePalette + resolveRadius
├── currency-input.styled.ts    # StyledCurrencyInputContainer + Label + Wrapper + Prefix + IconSlot + Helper + Error
├── currency-input-types.ts     # types
├── currency-input.spec.tsx     # component tests + snapshots
├── format-currency.ts          # pure formatter
├── format-currency.spec.ts     # formatter tests
├── parse-currency.ts           # pure parser
├── parse-currency.spec.ts      # parser tests
├── currency-input.stories.tsx  # Storybook
├── README.md                   # public docs
└── index.ts                    # explicit named exports
```

Token / provider wiring per [`creating-component-tamagui` Section 11](../.agents/skills/creating-component-tamagui/SKILL.md).

## Testing

**Coverage target: 100%** on the component, formatter, and parser (per the maintainer's rule "todo probado por favor").

### `format-currency.spec.ts` (~12 tests)

- `null` → `""`
- `NaN` → `""`
- `0` → `"0"`
- Integer thousands (`1234` → `"1,234"` with `en-US`, `"1.234"` with `es-CO`, `"1 234"` with `fr-FR`)
- Large integer (`1234567` → `"1,234,567"`)
- Decimal respected (`1234.56` with `decimals=2` → `"1,234.56"`; with `decimals=0` → `"1,235"` after Intl rounding)
- Negative number (`-500` → `"-500"`)
- `decimals=2` on `en-US`, `es-CO`, `de-DE`, `ja-JP`

### `parse-currency.spec.ts` (~16 tests)

- Empty string → `null`
- Whitespace-only → `null`
- Only prefix (`"$"`) → `null`
- Integer digits (`"1234"`) → `1234`
- With thousands separator (`"1,234,567"` `en-US`) → `1234567`
- With locale's separator (`"1.234"` `es-CO`) → `1234`
- With prefix (`"$1,234"`) → `1234`
- With mixed noise (`"abc$1,234xyz"`) → `1234`
- Decimal mode (`decimals=2`, `en-US`): `"1,234.56"` → `1234.56`
- Decimal mode (`decimals=2`, `es-CO`): `"1.234,56"` → `1234.56`
- Multiple decimal separators — first wins, rest strip
- Only decimal separator (`"."`) → `null`
- Leading minus (`"-500"`) → `-500`
- Just `"-"` → `null`
- Fractional beyond `decimals` — rounded (`"1.239"` with `decimals=2` → `1.24`)
- `decimals=0` strips any decimal-looking input (`"1.5"` → `15` since `.` is a separator in integer mode)

### `currency-input.spec.tsx` (~20 tests + 12 snapshots)

- Renders formatted `value` on the underlying TextInput
- Fires `onChangeValue` with parsed number on text change
- Fires `onChangeValue(null)` when input is cleared
- Renders `label` when provided; omits when not
- Renders `prefix` when non-empty; omits when `prefix=""`
- Renders `helperText`, hides when `error` is set
- Renders `error`, activates error border
- `disabled` sets `editable=false` + `accessibilityState.disabled`
- `leftIcon` / `rightIcon` slots
- Focus / blur flip the wrapper border (via `await act(async ...)` — same jest-expo quirk as Input)
- Error state wins over focused state
- Per-instance `currencyInputColors` override
- Provider-level override propagates
- `radius` resolver (parametrized `it.each` over pill / none / lg / raw)
- External `value` change re-syncs the display (useEffect path)
- `keyboardType` is `"number-pad"` when `decimals=0` and `"decimal-pad"` when `decimals > 0`
- `accessibilityValue.text` matches the formatted display
- `InputComponent` prop swaps the underlying input
- Locale change reformats the display

Snapshots: default, with label, with prefix, without prefix, with helper, with error, with icons, disabled, dark theme, radius pill, custom colors, `es-CO` locale with `decimals=2`.

## Storybook (~9 stories)

- `Default` — bare, `"$"` prefix, empty
- `USD` — `decimals=2`, `locale="en-US"`, label "Amount"
- `COP` — `decimals=0`, `locale="es-CO"`, prefix `"COP $"`, label "Monto"
- `EUR` — `decimals=2`, `locale="es-ES"`, prefix `"€"`, label "Importe"
- `WithError` — invalid state
- `Disabled` — pre-filled, non-editable
- `NoPrefix` — `prefix=""`, plain numeric-format input
- `CustomColors` — brand-purple override
- `DarkTheme` — inside `<Theme name="dark">`

## Example app screen

`apps/example/app/(pages)/components/currency-input.tsx` — 5 sections:

1. **Basic** — `$` prefix, integer, live readout of the numeric value
2. **USD with decimals** — `en-US` + `decimals=2`
3. **COP** — `es-CO` + `decimals=0` + `"COP $"` prefix
4. **Disabled** — pre-filled read-only
5. **Custom colors** — brand override

Plus route registration in `_layout.tsx` (`headerBackTitle: "Components"`) and a new row in the components home with `status: "shipped"`.

## Non-goals

- **No currency-symbol library** — consumer passes the prefix string; no `Intl.DisplayNames` lookup or currency-code-to-symbol table. Keeps the dep surface tiny; consumers who need it wrap in a helper.
- **No thousands-grouping toggle** — `Intl.NumberFormat` groups by default per locale; there is no `useGrouping: false` prop. If a consumer needs raw digits with no grouping, they use a plain `Input` with `keyboardType="number-pad"`.
- **No min / max value clamping** — validation belongs in the consumer (via `error` prop from `react-hook-form` etc.). Ships without an opinion.
- **No `Currency` sub-component** — everything ships on the flat props (`prefix`, `decimals`, `locale`). No `CurrencyInput.USD` / `CurrencyInput.EUR` presets.
- **No `defaultValue` / uncontrolled mode** — controlled only, same rule as `Input`.
- **`format-currency` / `parse-currency` not exported publicly in v1** — internal helpers. Consumer demand can promote them later.

## How to ship

Executed on branch `feat/duna-migration-batch-1`:

1. Token schema wiring (types + defaults + flatten + provider + barrels).
2. Component files in order: `currency-input-types.ts` → `format-currency.ts` + `.spec.ts` → `parse-currency.ts` + `.spec.ts` → `currency-input.styled.ts` → `currency-input.tsx` → `currency-input.spec.tsx` (+ regenerate snapshots) → `currency-input.stories.tsx` → `README.md` → `index.ts`.
3. Barrels: `components/index.ts` + `src/index.ts`.
4. Example app: screen + route + components-home row.
5. Flip status here (`planned` → `shipped on <YYYY-MM-DD>`).
6. Flip Batch 1 plan doc: ⏳ → ✅ on CurrencyInput's row.
7. Verify green + **100% coverage on the three new files** (`currency-input.tsx`, `format-currency.ts`, `parse-currency.ts`) via `pnpm --filter ui-kraken test:coverage`.
8. Atomic commit with rich body.

## How to extend

- **Expose `formatCurrency` / `parseCurrency`** — promote to public barrel if consumers ask.
- **Preset compound API** (`CurrencyInput.USD` / `.EUR` / `.COP`) — thin sugars over prop combos.
- **Currency-symbol lookup** — optional `currencyCode?: "USD" | "EUR" | ...` that fills `prefix` via `Intl.NumberFormat(...).formatToParts()`.
- **Async validation slot** — `validating?: boolean` that renders a spinner in place of `rightIcon` while a server check runs.
- **Compact display mode** — `compact?: boolean` for `"1.2K"` / `"1.2M"` formatting on read-only displays (probably belongs in a separate `CurrencyText` component, not on the input).
