# Input — design record

**Status:** shipped on 2026-07-25 in ui-kraken v0.8.0 as part of [`COMPONENTS-BATCH-1-PLAN.md`](./COMPONENTS-BATCH-1-PLAN.md) Phase A.

Living design doc for the `Input` primitive. Kept post-shipping so future contributors can understand the decisions behind the shape of the API, not just what it does today.

---

## Overview

Single-line text input. The most fundamental form primitive after Button — covers login, signup, search, filter, comment, and every other field where the user types a short string. Common uses: name / email / password fields, search bars, filter inputs, single-line editors.

**Locked decisions:**

- **Naming**: `Input` — matches Chakra, Mantine, shadcn/ui, Radix. Not `TextField` (Material-specific) — the wider community reads `Input` as the default text primitive; `TextField` reads as one of many.
- **Controlled only**: `value: string` + `onChangeText: (v: string) => void`. No `defaultValue` / uncontrolled mode in v1 — consumers wrap in `useState`. Uncontrolled mode ships later without breaking (same non-goal as RadioGroup).
- **Wraps RN `TextInput`**: every RN `TextInputProps` (except `style`) flows through `...rest`. Consumer passes `placeholder`, `keyboardType`, `secureTextEntry`, `autoCapitalize`, `autoCorrect`, `autoFocus`, `maxLength`, `onSubmitEditing`, `returnKeyType`, every accessibility prop, etc. without us re-declaring them on `InputProps`.
- **`InputComponent?` slot** — accepts a custom TextInput implementation (defaults to RN `TextInput`). Ships because Bottom Sheet libraries provide their own `BottomSheetTextInput` that must wrap the native input for keyboard-avoidance inside sheets to work. Consumer passes the alternate component when needed; no dep on the sheet library.
- **Icon slots** — `leftIcon?: ReactNode` + `rightIcon?: ReactNode` for search icon, clear button, secure-entry toggle, etc. Consumer brings their own icon (per `Icons via ReactNode prop` rule of Batch 1).
- **Colors — own token block**: `inputColors` on `Tokens` with 11 slots covering every surface + state combination. Provider-level overrides + per-instance overrides.
- **Per-instance override**: `inputColors?: Partial<InputColors>` prop.
- **Accessibility**: minimum **48 × 48 px** touch target; `accessibilityLabel` derived from `label` prop when provided; `accessibilityState={{ disabled }}` propagates.

## API

### Props

`InputProps` re-declares only props that are OURS. Every RN `TextInputProps` (minus `style`) flows through `...rest` with types inferred from `Omit<TextInputProps, "style">`.

```ts
export type InputRadius = number | "none" | "sm" | "md" | "lg" | "pill";

export type InputColorsInput = Partial<InputColors>;

export interface InputProps extends Omit<TextInputProps, "style"> {
  /** Controlled value. */
  value: string;
  /** Fires on every keystroke. */
  onChangeText: (value: string) => void;
  /** Optional bold label rendered above the input. Also becomes the `accessibilityLabel` when provided. */
  label?: string;
  /** Optional muted helper text rendered below the input. Hidden when `error` is set. */
  helperText?: string;
  /** Error message. When set, activates the error border style and replaces `helperText`. */
  error?: string;
  /** Optional leading icon slot. Consumer brings their own icon. */
  leftIcon?: ReactNode;
  /** Optional trailing icon slot. Consumer brings their own icon. */
  rightIcon?: ReactNode;
  /** Disables editing + focus and dims the surface. */
  disabled?: boolean;
  /** Border radius on the input wrapper. Default: `"md"`. */
  radius?: InputRadius;
  /**
   * Alternate `TextInput` implementation. Defaults to RN `TextInput`.
   * Use `BottomSheetTextInput` from `@gorhom/bottom-sheet` when the
   * input renders inside a bottom sheet so the keyboard-avoidance
   * behaviour attached to that sheet handles focus correctly.
   */
  InputComponent?: ComponentType<TextInputProps>;
  /** Per-instance color override. Missing slots fall through to the provider palette. */
  inputColors?: InputColorsInput;
  /**
   * Root testID. Sub-elements derive:
   * `{testID}-label`, `{testID}-wrapper`, `{testID}-input`,
   * `{testID}-left-icon`, `{testID}-right-icon`,
   * `{testID}-helper`, `{testID}-error`.
   */
  testID?: string;
}
```

### Radius

`InputRadius = "none" | "sm" | "md" | "lg" | "pill" | number` — same shape as `ButtonRadius` / `AlertRadius` / `RadioRadius`. Default `"md"`. Applies to the input wrapper.

### Per-instance override

```tsx
<Input
  value={search}
  onChangeText={setSearch}
  placeholder="Search"
  inputColors={{ borderFocused: "#7C3AED", background: "#F5F3FF" }}
/>
```

Every field on `Partial<InputColors>` is optional. Missing slots fall through to the provider-resolved palette.

### A11y

- The RN `TextInput` inside has native accessibility handling (VoiceOver / TalkBack read the current value + placeholder + secure-entry state automatically).
- `accessibilityLabel` on the wrapper defaults to the `label` prop when provided so screen readers announce "text field, `<label>`".
- `accessibilityState={{ disabled }}` propagates.
- Wrapper `minHeight: 48` — meets the touch-target minimum even when the intrinsic input height would be smaller.

### Sub-element testIDs

Root `testID` (default `"input"`) propagates deterministically:

- `{testID}` — root container (`<StyledInputContainer>`)
- `{testID}-label` — label element (present only when `label != null && label.length > 0`)
- `{testID}-wrapper` — visual wrapper around the input (the bordered box)
- `{testID}-input` — the actual `TextInput` (or the alternate `InputComponent`)
- `{testID}-left-icon` — left icon slot wrapper (present when `leftIcon != null`)
- `{testID}-right-icon` — right icon slot wrapper (present when `rightIcon != null`)
- `{testID}-helper` — helper text (present when `helperText != null && !error`)
- `{testID}-error` — error message (present when `error != null && error.length > 0`)

## Token schema

Input introduces its own **`inputColors`** block on `Tokens`. Zero reuse of other component palettes.

```tsx
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
</UIKitProvider>
```

### `InputColors` interface

Slot-based (no variants — Input has one visual pattern with state-driven overrides handled by the component logic itself). 11 slots covering every surface + state combination.

```ts
export interface InputColors {
  /** Wrapper background color in the default and focused states. */
  background: string;
  /** Wrapper background color in the disabled state. */
  backgroundDisabled: string;
  /** Border color in the default state (unfocused, no error). */
  border: string;
  /** Border color when the input has focus. */
  borderFocused: string;
  /** Border color when `error` is set. Overrides `borderFocused`. */
  borderError: string;
  /** Text color for the value typed in the input. */
  text: string;
  /** Text color when `disabled`. */
  textDisabled: string;
  /** Placeholder text color. */
  placeholder: string;
  /** Bold label text color (rendered above the input). */
  label: string;
  /** Muted helper text color (rendered below the input when no error). */
  helperText: string;
  /** Error text color (rendered below the input when `error` is set). */
  errorText: string;
}
```

### Default light palette

Tuned for WCAG AA contrast on white / near-white surfaces. Focused border mirrors the brand blue used by RadioGroup + Text `interactive`; error border mirrors Alert `danger`.

```ts
export const DEFAULT_LIGHT_INPUT_COLORS: InputColors = {
  background: "#FFFFFF",
  backgroundDisabled: "#F3F4F6",
  border: "#D1D5DB",
  borderFocused: "#2563EB",
  borderError: "#DC2626",
  text: "#0B0B0F",
  textDisabled: "#9CA3AF",
  placeholder: "#9CA3AF",
  label: "#0B0B0F",
  helperText: "#6B7280",
  errorText: "#DC2626",
};
```

### Default dark palette

```ts
export const DEFAULT_DARK_INPUT_COLORS: InputColors = {
  background: "#111827",
  backgroundDisabled: "#1F2937",
  border: "#374151",
  borderFocused: "#60A5FA",
  borderError: "#F87171",
  text: "#F5F5F7",
  textDisabled: "#6B7280",
  placeholder: "#6B7280",
  label: "#F5F5F7",
  helperText: "#9CA3AF",
  errorText: "#F87171",
};
```

### Flatten to Tamagui tokens

`flattenInputColors()` produces the flat `$ui*` token map:

```
uiInputBackground
uiInputBackgroundDisabled
uiInputBorder
uiInputBorderFocused
uiInputBorderError
uiInputText
uiInputTextDisabled
uiInputPlaceholder
uiInputLabel
uiInputHelperText
uiInputErrorText
```

Wired into both `themes.light` and `themes.dark`.

### Merge helper

```ts
export function mergeInputColors(base: InputColors, override?: Partial<InputColors>): InputColors;
```

Same signature as `mergeTextColors()` and `mergeRadioGroupColors()`.

## File structure

```
packages/ui-kraken/src/components/input/
├── input.tsx                # component logic + resolvePalette + resolveRadius helpers
├── input.styled.ts          # StyledInputContainer + StyledInputLabel + StyledInputWrapper + StyledInputIconSlot + StyledInputHelper + StyledInputError
├── input-types.ts           # InputRadius, InputColorsInput, InputProps
├── input.spec.tsx           # unit tests + describe("snapshots") block
├── input.stories.tsx        # Storybook (~8 stories)
├── README.md                # props table + usage + Platform support (iOS · Android · Web)
└── index.ts                 # explicit named exports (Input + 3 types)
```

Token / provider wiring (per [`creating-component-tamagui` Section 11](../.agents/skills/creating-component-tamagui/SKILL.md)):

- `packages/ui-kraken/src/tokens/tokens-types.ts` — add `InputColors` + `inputColors: InputColors` field on `Tokens` + `ResolvedTokens`
- `packages/ui-kraken/src/tokens/defaults/input.ts` — new file with defaults + `mergeInputColors`
- `packages/ui-kraken/src/tokens/defaults/index.ts` — aggregate `inputColors` into `DEFAULT_TOKENS` + `DEFAULT_DARK_TOKENS` + re-exports
- `packages/ui-kraken/src/utils/flatten.ts` — add `flattenInputColors`
- `packages/ui-kraken/src/utils/index.ts` — re-export
- `packages/ui-kraken/src/tokens/tokens.ts` — wire into `buildConfig()` + re-export defaults / merge
- `packages/ui-kraken/src/tokens/tokens-derive.ts` — pass `inputColors` through `coarseToFineTokens`
- `packages/ui-kraken/src/provider/provider-types.ts` — add `InputColorsInput` type + optional `inputColors?` on `TokensInput`
- `packages/ui-kraken/src/provider/provider.tsx` — extend `useMemo` merge for light + dark
- `packages/ui-kraken/src/provider/index.ts` — re-export `InputColorsInput`
- `packages/ui-kraken/src/tokens/index.ts` — re-export `InputColors` + defaults + merge

Barrel updates:

- `packages/ui-kraken/src/components/index.ts` — re-export `Input` + 3 types
- `packages/ui-kraken/src/index.ts` — public barrel

Example app:

- `apps/example/app/(pages)/components/input.tsx` — full showcase (6 sections)
- `apps/example/app/_layout.tsx` — register `Stack.Screen` with `headerBackTitle: "Components"`
- `apps/example/app/(pages)/index.tsx` — add Input catalog row with `status: "shipped"`

## Testing (Jest + RTL v14 + jest-expo)

Mock `./input.styled` with `rn.View` / `rn.Text` stubs; mock `../../provider/use-ui-kit` to return a `tokens.inputColors` block matching `DEFAULT_LIGHT_INPUT_COLORS`. Same shape as Alert / RadioGroup specs.

**Behavioral coverage** (~18 targeted tests):

- Renders the input with the controlled `value`
- Fires `onChangeText` with the new value on `changeText`
- Renders `label` when provided; omits the label testID when not
- Renders `helperText` when provided (and no error)
- Renders `error` when provided; hides `helperText` when both are present
- `disabled` sets `editable={false}` on the underlying TextInput
- `disabled` propagates to `accessibilityState.disabled` on the wrapper
- `leftIcon` renders under `{testID}-left-icon` when provided; omitted otherwise
- `rightIcon` renders under `{testID}-right-icon` when provided; omitted otherwise
- Focus event flips the wrapper's `focused` variant to `true`
- Blur event flips it back to `false`
- Error state overrides the focused border (`borderError` wins)
- Per-slot `inputColors` override applies (parametrized `it.each` over slots)
- `radius="pill"` → 9999; `"none"` → 0; preset → `$uiRadius*`; number passthrough
- `label` becomes the wrapper `accessibilityLabel`
- Provider-level palette overrides propagate through `useUIKit()`
- `InputComponent` prop swaps the underlying input (verify `getByTestId("...-input")` is the alternate component)
- Every RN `TextInputProps` flow-through works (`placeholder`, `secureTextEntry`, `maxLength`, etc.)

**Structural snapshots** (`describe("snapshots")`, ~12 total):

- Default (no label, no icons, empty value)
- With label
- With helperText
- With error (shows error state)
- With value
- With leftIcon
- With rightIcon
- With both icons
- Disabled state
- Dark theme
- Radius presets (pill)
- Per-instance `inputColors` override

## Storybook (~8 stories)

- `Default` — bare input, placeholder, no label
- `WithLabel` — label + placeholder
- `WithHelperText` — label + helper text
- `WithError` — label + error message + placeholder
- `WithIcons` — leftIcon + rightIcon
- `Disabled` — value + `disabled=true`
- `Password` — `secureTextEntry` + placeholder
- `CustomColors` — brand override via `inputColors`
- `DarkTheme` — inside `<Theme name="dark">`

## Example app screen

`apps/example/app/(pages)/components/input.tsx` — 6 sections using the `<Section>` wrapper:

1. **Basic** — controlled Input with placeholder, live-updates a readout below.
2. **With label + helper text** — full form-field example.
3. **With error state** — toggles an error message on/off from a button.
4. **With icons** — leading search icon + trailing clear button (both plain `<Text>` glyphs; consumer brings their own icon library).
5. **Disabled** — pre-filled value, non-editable.
6. **Radius presets** — 5 rows demonstrating each `radius` value.

Register the route in `_layout.tsx` (`headerBackTitle: "Components"`) and add a `status: "shipped"` catalog row in `(pages)/index.tsx`.

## Non-goals

Documented so future contributors know these were considered and deliberately deferred:

- **No `defaultValue` / uncontrolled mode** — v1 is controlled only. Consumers wrap in `useState`. Adding uncontrolled later is API-safe.
- **No compound API** (`Input.Email`, `Input.Password`) — flat props (`keyboardType`, `secureTextEntry`) are more flexible. Compound would fragment the surface without clear benefit.
- **No multi-line / textarea** — a distinct `Textarea` component belongs in a future batch. `numberOfLines` on the underlying TextInput flows through the spread if consumers need it as an escape hatch.
- **No character counter** — consumers combine `maxLength` (flows through) with their own counter Text. Ships as `Input.Counter` later if demand emerges.
- **No mask / format prop** — currency masking is handled by the sibling `CurrencyInput`. Phone / date / card masking belongs in dedicated components or userland `react-hook-form` resolvers.
- **No `size` prop** — 48 px minimum touch target is universal and non-negotiable for accessibility. A single well-tuned size beats offering `sm` at 36 px.
- **No adornment beyond `leftIcon` / `rightIcon`** — no `prefix` / `suffix` string slots. Consumers wrap plain text in `<Text>` and pass it as `leftIcon` / `rightIcon` if they need labels inside the wrapper.
- **No built-in Formik / RHF integration** — the controlled prop shape (`value` / `onChangeText` / `error`) is already RHF-compatible via `Controller`; no reason to add adapters.

## How to ship

Executed on branch `feat/duna-migration-batch-1`:

1. Token schema wiring (13 files across `tokens/` + `provider/` + `utils/` + barrels)
2. Component files (7 files) in the order: `input-types.ts` → `input.styled.ts` → `input.tsx` → `input.spec.tsx` (+ regenerate snapshots) → `input.stories.tsx` → `README.md` → `index.ts`
3. Barrels updated: `components/index.ts` + `src/index.ts`
4. Example app: new screen + route registration + catalog row
5. Flip status in this doc: `planned` → `shipped on <YYYY-MM-DD> in ui-kraken v0.8.0`
6. Flip Batch 1 plan doc status: ⏳ → ✅ on Input's row
7. Verify: `pnpm typecheck && pnpm -r lint && pnpm test && pnpm --filter ui-kraken build`
8. Atomic commit with rich body — one commit for the whole component

## How to extend

Post-launch API growth paths that stay backward-compatible:

- **Uncontrolled mode** — add optional `defaultValue?: string`; when `value` is `undefined`, fall back to internal `useState(defaultValue ?? "")`.
- **`Input.Password`** — sugar for `<Input secureTextEntry rightIcon={<EyeToggle ... />} />` with built-in show/hide toggle. Requires an icon-library decision first.
- **`Input.Search`** — sugar for `<Input leftIcon={...} placeholder="Search..." />`.
- **`Textarea`** — separate component (multi-line, resizable). Shares `inputColors` token block or gets its own — decide when we scope it.
- **Character counter slot** — add `showCounter?: boolean` that renders a `{value.length} / {maxLength}` element in the helper row.
- **Adornment prefix / suffix strings** — extend if the icon slot proves insufficient for common patterns (e.g. `"@"` prefix for handle inputs).
