# DatePicker — design record

**Status:** planned for ui-kraken v0.9.0 as part of [`COMPONENTS-BATCH-2-PLAN.md`](./COMPONENTS-BATCH-2-PLAN.md) Phase A.

Living design doc for the `DatePicker` primitive.

---

## Overview

Date-input field. Renders as a Tamagui-styled trigger (formatted date + chevron); tapping opens the platform-native date picker (`UIDatePicker` on iOS inside a bottom-sheet Modal, `DatePickerDialog` on Android via `@expo/ui`'s built-in `presentation="dialog"` mode).

Contrast with:

- **[`DateRangePicker`](./DATE-RANGE-PICKER-PLAN.md)** — pair of two `DatePicker`s (start + end) sharing constraints.
- **`Input`** — free-text input. Use `DatePicker` when the value is semantically a date; use `Input` with keyboard `numeric` if you want the user to type it.

**Locked decisions:**

- **Backend is `@expo/ui/community/datetime-picker`** — the drop-in replacement Expo ships for `@react-native-community/datetimepicker`. Uses the same `@expo/ui` peer we already require for SelectNative + SegmentedControl → **zero new peer deps** for consumers who already installed `@expo/ui`. Also enables the same graceful peer-missing fallback pattern.
- **Custom trigger, native picker** — we render the trigger ourselves (Tamagui `Text` + chevron) so RN layout is deterministic. The native `DateTimePicker` only mounts when the user opens the picker: on iOS inside our own `<Modal>` bottom-sheet with a "Done" button; on Android via the picker's built-in `presentation="dialog"` which shows Google's system date-picker dialog.
- **Platform split from v0** — per [[native-bridges-platform-split]]. Files: `date-picker.tsx` (shell) + `date-picker-body.{ios,android,web,tsx}` (native mount). iOS-only tweaks (`display: 'inline'` layout, Modal chrome) can't regress Android's dialog flow and vice versa.
- **Controlled only** — consumer holds `value: Date | null`, updates via `onChange(date: Date)`. `null` = empty state (renders `placeholderLabel` in the trigger, e.g. `"Select date…"`); once the user picks, the value is never null again unless the consumer resets it. Mirrors Select's `value: Value | null` shape.
- **Three modes from v1**: `date` / `time` / `datetime`. Each formats the trigger text differently (via `Intl.DateTimeFormat` — `dateStyle` for date, `timeStyle` for time, both for datetime). Default placeholder copy shifts per mode (`"Select date…"` / `"Select time…"` / `"Select date & time…"`).
- **Trigger formatting via `Intl.DateTimeFormat`** — consumer passes `locale?: string` + `dateStyle?: "short" | "medium" | "long" | "full"` + `timeStyle?: "short" | "medium" | "long" | "full"` (defaults: `"medium"` for date, `"short"` for time). Or, escape hatch: `formatValue?: (date: Date) => string` for total control.
- **`is24Hour?` prop** (time / datetime modes) — Android-only per `@expo/ui`'s API. iOS follows the system locale's 12h/24h convention.
- **Own color block**: `datePickerColors` — 13 slots grouped as:
  - **Trigger chrome (9)**: background, backgroundDisabled, border, borderFocused (opened), borderError, text (selected date), textDisabled, placeholder (empty), chevron.
  - **Surrounding labels (3)**: label, helperText, errorText.
  - **Native picker (1)**: accent — passed to @expo/ui as `accentColor` to tint the highlighted date on both platforms.
  - iOS modal chrome (background/overlay/Done label) uses reasonable hardcoded defaults for v1; if consumers want to theme it, add slots in a follow-up.
- **Chrome is always on** — unlike SelectNative's opt-in chrome, DatePicker's trigger is our own Tamagui `Text` rendering a formatted date. A borderless date-text-with-chevron reads as bare / undesigned in a form column. Consumers who want borderless can override the palette to transparent.
- **`radius` prop** using shared `RadiusValue`. Default `"md"` — matches Input / Select's trigger radius.
- **A11y**: trigger `accessibilityRole="button"` (not `"combobox"` — the user isn't picking from a list, they're opening a date input), `accessibilityLabel={label ?? placeholderLabel}`, `accessibilityValue={{ text: formattedDate }}` when a value is set.
- **Extends `YStack`** — vertical column (label + trigger + helper / error).

## API

```ts
export type DatePickerRadius = RadiusValue;
export type DatePickerColorsInput = Partial<DatePickerColors>;
export type DatePickerMode = "date" | "time" | "datetime";
export type DateTimeStyle = "short" | "medium" | "long" | "full";

export interface DatePickerProps extends Omit<
  GetProps<typeof StyledDatePicker>,
  "children" | "onChange"
> {
  /** Currently-selected value, or `null` when unset. Controlled. */
  value: Date | null;
  /** Fires with the picked value. Never receives null. */
  onChange: (date: Date) => void;
  /** Picker mode. Default `"date"`. */
  mode?: DatePickerMode;
  /** Optional bold heading above the trigger. */
  label?: string;
  /** Muted helper copy below the trigger. Overridden by `errorText`. */
  helperText?: string;
  /** Error copy below the trigger. Overrides `helperText`. */
  errorText?: string;
  /**
   * Text shown inside the trigger when `value` is `null`. Defaults vary by mode:
   * `"Select date…"` / `"Select time…"` / `"Select date & time…"`.
   */
  placeholderLabel?: string;
  /** Disable the trigger — native picker won't open. */
  disabled?: boolean;
  /** Earliest selectable value. Native picker constrains selection. */
  minimumDate?: Date;
  /** Latest selectable value. */
  maximumDate?: Date;
  /** BCP-47 locale for the trigger's `Intl.DateTimeFormat` output. Default: system locale. */
  locale?: string;
  /** Preset shorthand for the trigger's date format (used in date / datetime modes). Default: `"medium"`. */
  dateStyle?: DateTimeStyle;
  /** Preset shorthand for the trigger's time format (used in time / datetime modes). Default: `"short"`. */
  timeStyle?: DateTimeStyle;
  /** Full escape hatch — bypasses `dateStyle` / `timeStyle` / `locale`. */
  formatValue?: (date: Date) => string;
  /** Use 24-hour clock (time / datetime modes). Android only; iOS follows locale. */
  is24Hour?: boolean;
  /** Trigger border radius. Default `"md"`. */
  radius?: DatePickerRadius;
  /** Per-instance color override. */
  datePickerColors?: DatePickerColorsInput;
  /**
   * Root testID. Sub-elements derive:
   * `-label`, `-trigger`, `-trigger-text`, `-helper-text`, `-error-text`,
   * `-modal` (iOS), `-modal-overlay` (iOS), `-picker`, `-done` (iOS),
   * `-missing-peer`.
   */
  testID?: string;
}
```

### Sub-element testIDs

- root: `"date-picker"` (overridable)
- label: `"{root}-label"` (when `label` set)
- trigger: `"{root}-trigger"`
- trigger text: `"{root}-trigger-text"`
- helper text: `"{root}-helper-text"` (when set + no error)
- error text: `"{root}-error-text"` (when set)
- iOS modal: `"{root}-modal"` (when open)
- iOS modal overlay: `"{root}-modal-overlay"`
- iOS "Done" button: `"{root}-done"`
- native picker: `"{root}-picker"`
- missing-peer hint: `"{root}-missing-peer"` (when peer NOT available)

### Behavior

- **Closed state**: trigger shows the formatted date (via `formatDate` / `Intl.DateTimeFormat`) or `placeholderLabel` when `value` is `null`.
- **Tap trigger**:
  - **iOS**: opens a bottom-sheet `<Modal>` with `<DateTimePicker display="inline">` inside + a "Done" button. Tap Done or backdrop → close.
  - **Android**: mounts `<DateTimePicker presentation="dialog">` which immediately shows Google's system date-picker dialog. User taps Cancel → we unmount. User taps OK → `onChange(date)` fires + we unmount.
- **`disabled=true`** → trigger reduced opacity, tap swallowed.
- **`errorText`** → trigger border swaps to `borderError`.
- **Peer missing** → trigger renders "Install `@expo/ui`" hint colored with `errorText`; taps ignored.

## Token schema

`datePickerColors` on `Tokens`. 13 slots — same shape as `selectColors` minus the modal-only slots (iOS modal chrome uses hardcoded defaults for v1) plus an `accent` slot for the native picker tint.

```ts
export interface DatePickerColors {
  // Trigger chrome (9)
  background: string;
  backgroundDisabled: string;
  border: string;
  borderFocused: string; // painted while the picker is open
  borderError: string;
  text: string;
  textDisabled: string;
  placeholder: string;
  chevron: string;
  // Surrounding labels (3)
  label: string;
  helperText: string;
  errorText: string;
  // Native picker tint (1)
  accent: string;
}
```

### Default light palette

Trigger mirrors `InputColors` for form-field parity — a DatePicker next to an Input in the same column reads as native. Accent uses iOS system blue (`#007AFF`) so the native picker highlight looks familiar.

### Default dark palette

Trigger inverts to gray-800; accent uses lifted iOS blue (`#0A84FF`) matching Apple's dark-mode variant.

## File structure

```
packages/ui-kraken/src/components/date-picker/
├── date-picker.tsx                     # shared shell — palette, formatting, trigger, iOS modal, peer-missing
├── date-picker-body.tsx                # default fallback (re-exports .web)
├── date-picker-body.ios.tsx            # iOS: <Modal> + <DateTimePicker display="inline"> + Done
├── date-picker-body.android.tsx        # Android: <DateTimePicker presentation="dialog">
├── date-picker-body.web.tsx            # Web: @expo/ui's web fallback (native HTML <input type="date">)
├── date-picker-body-types.ts           # shell → body props contract
├── date-picker-types.ts                # DatePickerProps + DatePickerRadius + DatePickerColorsInput
├── date-picker.styled.ts               # StyledDatePicker + Label + Trigger + TriggerText + Chevron + HelperText + ErrorText + ModalOverlay + ModalSheet + DoneButton + MissingPeer
├── expo-ui-datetime-probe.ts           # try/catch require('@expo/ui/community/datetime-picker')
├── expo-ui-datetime-probe.spec.ts      # isolated-module tests for the probe
├── date-picker.spec.tsx                # shell contract + mocked body (100% target)
├── date-picker-body.android.spec.tsx   # Android imperative-dialog flow
├── date-picker.stories.tsx             # Storybook (~8 stories)
├── README.md
└── index.ts
```

Same pattern as SegmentedControl — probe scoped per component, bodies per platform, shell owns palette + chrome.

## Testing

**Coverage target: 100%** on `date-picker.tsx` (shell) + `expo-ui-datetime-probe.ts`.

Behavioral coverage (~25 tests):

- Trigger shows `placeholderLabel` when `value` is null / formatted date when set.
- Custom `placeholderLabel` overrides default `"Select date…"`.
- `formatDate` prop bypasses `dateStyle` / `locale`.
- `dateStyle` presets render via `Intl.DateTimeFormat` with the given `locale`.
- Default `locale` uses system.
- Label / helperText / errorText mount toggles + empty-string handling.
- Tap trigger → body's `onOpen` fires (mocked); iOS renders `-modal`, Android auto-opens dialog.
- `onChange` maps native `onValueChange(event, date)` → consumer's `onChange(date)`.
- `disabled` swallows the trigger tap + reduced opacity.
- `errorText` swaps border to `borderError`.
- `minimumDate` / `maximumDate` flow through to the native picker.
- Per-instance `datePickerColors` overrides win.
- Provider palette propagation via `useUIKit()`.
- Dark palette when `activeTheme='dark'`.
- Peer-missing hint + trigger disabled.
- `radius` parametrized (none / sm / md / lg / pill / number).
- YStack pass-through props.
- `accessibilityRole="button"` + `accessibilityLabel` + `accessibilityValue` on trigger.

Structural snapshots (~4):

- Default light + no value (placeholder)
- Default light + value selected
- Error state + value
- Dark palette + value

## Storybook (~8 stories)

- `Default` — placeholder visible, no value
- `WithValue` — today's date pre-selected
- `WithLabel`
- `WithHelperText`
- `WithErrorText`
- `Disabled`
- `MinMaxBounds` — 30 days back / 30 days forward
- `CustomLocale` — `"es-ES"` + `dateStyle="long"`
- `CustomFormat` — `formatDate` returns ISO
- `DarkTheme`

## Example app screen

`apps/example/app/(pages)/components/date-picker.tsx` — 8-9 sections:

1. Basic — no value, placeholder visible
2. With value — today pre-selected
3. With label + helper text
4. Error state
5. Min/max bounds — restricted to next 7 days
6. Custom locale — es-ES + `dateStyle="long"`
7. Custom formatter — ISO 8601
8. Per-instance brand accent
9. Fully disabled

Plus route registration + row on the components home.

## Non-goals for v1

- **`mode: 'time' | 'datetime'`** — deferred. Date-only covers duna-app's current needs; time picker needs separate palette + formatting work.
- **Range selection** — that's `DateRangePicker` (next component).
- **Multiple-date selection** — not on the roadmap.
- **Custom calendar UI** — the whole point of using `@expo/ui` is the native picker; if consumers want a custom calendar they reach for `react-native-calendars` themselves.
- **iOS modal chrome slots** — hardcoded reasonable defaults for v1. Add slots if theming demand emerges.

## How to ship

Executed on branch `feat/duna-migration-batch-2`:

1. Plan doc (this file).
2. `expo-ui-datetime-probe.ts` probe file + spec.
3. Token schema wiring (types + defaults + flatten + provider + barrels).
4. Component files per split file structure above.
5. Barrels + example screen + `Stack.Screen` + components-home row.
6. Verify per [[verify-example-wiring-per-component]].
7. Flip status here + on `COMPONENTS-BATCH-2-PLAN.md`.
8. Add `.changeset/*.md`.
9. Verify green: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`.
10. Atomic commit with rich body.

## How to extend

- **Add `mode: 'time' | 'datetime'`** with per-mode formatting + palette slots for the time portion.
- **Add iOS modal chrome slots** if consumers ask for full theming (`modalBackground`, `modalOverlay`, `doneLabel`).
- **Add clear-value action** — a small `×` icon on the trigger that resets `value` to `null` via `onChange(null)`. Would require broadening the `onChange` signature.
- **Consolidate `expo-ui-datetime-probe.ts` with the other probes** — SelectNative, SegmentedControl, and DatePicker now each own a probe file. When we hit 3, that's the trigger to extract a shared `utils/expo-ui-probe.ts` with per-submodule getters.
