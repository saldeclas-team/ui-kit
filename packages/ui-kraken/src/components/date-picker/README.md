# DatePicker

Native date / time / datetime picker with a Tamagui-styled trigger. Wraps [`@expo/ui/community/datetime-picker`](https://docs.expo.dev/versions/latest/sdk/ui/drop-in-replacements/datetimepicker/) — iOS opens an inline picker in a modal with a Done button; Android opens the OS's Material 3 dialog directly. Handles the three common modes (`date` / `time` / `datetime`) from v1.

Reach for `DatePicker` any time you need a date-of-birth field, a due date, a meeting time, or a reservation date + time. For a range (start + end), pair two `<DatePicker>`s (a dedicated `<DateRangePicker>` is landing in the next release).

## Peer dependency — `@expo/ui`

Optional. Same peer as `SelectNative` and `SegmentedControl` — one install unlocks all three components. Install with:

```bash
pnpm add @expo/ui
```

**iOS with `@expo/ui`**: opens an inline picker inside a modal sheet with a Done button.

**Android with `@expo/ui`**: opens the OS's Material 3 dialog (native OK/Cancel).

**Missing peer (either platform)**: renders a "Install `@expo/ui`" hint colored with the `errorText` slot. The app does NOT crash.

**Web**: uses the browser's built-in `<input type="date" | "time" | "datetime-local">` picker via `showPicker()` (Chromium/Edge/Firefox) with a `.focus()` fallback on Safari. No JS calendar library — see the "no web calendar UI" note below.

## Import

```tsx
import { DatePicker } from "ui-kraken";
```

## Props

| Prop               | Type                                      | Default         | Description                                                                                                                                                                               |
| ------------------ | ----------------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`            | `Date \| null`                            | —               | Currently-selected value, `null` when unset. Required (controlled).                                                                                                                       |
| `onChange`         | `(date: Date) => void`                    | —               | Fires with the picked value. Never receives `null`. Required.                                                                                                                             |
| `mode`             | `"date" \| "time" \| "datetime"`          | `"date"`        | Native picker kind. Trigger formatting adjusts to match.                                                                                                                                  |
| `label`            | `string`                                  | —               | Optional bold heading above the trigger.                                                                                                                                                  |
| `helperText`       | `string`                                  | —               | Muted helper copy below the trigger. Overridden by `errorText`.                                                                                                                           |
| `errorText`        | `string`                                  | —               | Error copy below the trigger. Overrides `helperText`.                                                                                                                                     |
| `placeholderLabel` | `string`                                  | per-mode        | Text shown inside the trigger when `value` is `null`. Defaults: `"Select date…"` / `"Select time…"` / `"Select date & time…"`.                                                            |
| `disabled`         | `boolean`                                 | `false`         | Disable the trigger — native picker won't open.                                                                                                                                           |
| `minimumDate`      | `Date`                                    | —               | Earliest selectable value (passed through to `@expo/ui`).                                                                                                                                 |
| `maximumDate`      | `Date`                                    | —               | Latest selectable value.                                                                                                                                                                  |
| `locale`           | `string`                                  | system default  | BCP-47 locale for the trigger's `Intl.DateTimeFormat` output.                                                                                                                             |
| `dateStyle`        | `"short" \| "medium" \| "long" \| "full"` | `"medium"`      | Preset shorthand for the trigger's date format (used in `date` and `datetime` modes).                                                                                                     |
| `timeStyle`        | `"short" \| "medium" \| "long" \| "full"` | `"short"`       | Preset shorthand for the trigger's time format (used in `time` and `datetime` modes).                                                                                                     |
| `formatValue`      | `(date: Date) => string`                  | —               | Full escape hatch — bypasses `dateStyle` / `timeStyle` / `locale`.                                                                                                                        |
| `is24Hour`         | `boolean`                                 | system          | Use 24-hour clock in `time` / `datetime` modes. **[Android only]** per `@expo/ui`'s API; iOS follows locale.                                                                              |
| `radius`           | `DatePickerRadius`                        | `"md"`          | Trigger border radius (numeric px or token key).                                                                                                                                          |
| `datePickerColors` | `Partial<DatePickerColors>`               | —               | Per-instance color override. 13 slots.                                                                                                                                                    |
| `testID`           | `string`                                  | `"date-picker"` | Root testID. Sub-elements derive `-label`, `-trigger`, `-trigger-text`, `-helper-text`, `-error-text`, `-modal` (iOS), `-modal-overlay` (iOS), `-picker`, `-done` (iOS), `-missing-peer`. |

Every Tamagui `YStackProps` flows through the spread — `padding`, `margin`, `width`, `pressStyle`, shorthand aliases, every accessibility prop, etc.

## Behavior

- Tapping the trigger opens the native picker (unless `disabled`).
- **iOS**: modal sheet slides up with an inline picker + a Done button. Tapping the backdrop discards the pending selection; Done commits it. This "staged" pattern prevents the incremental spinner scrolls from firing `onChange` on every tick.
- **Android**: the OS's Material 3 dialog opens directly. Tapping OK fires `onChange` with the selection; Cancel dismisses without changing anything. No modal wrapper — Android's picker is a system dialog managed by the OS.
- **Web**: `showPicker()` opens the browser's built-in picker; `.focus()` fallback on Safari. `onChange` fires with the parsed `Date` when the input value changes.
- Trigger text updates immediately when `value` changes — formatted with `Intl.DateTimeFormat` (mode-appropriate) unless `formatValue` is set.
- `mode="time"` formats with `timeStyle` only; `mode="datetime"` formats with both `dateStyle` + `timeStyle`.
- `errorText` set → red border + red footer text (regardless of `helperText`).
- `disabled=true` → grayed background + text, taps swallowed on both platforms.

## Color model

`datePickerColors` — 13 slots. All slots work on every platform.

### Trigger chrome (9)

| Slot                 | Paints                                                                     |
| -------------------- | -------------------------------------------------------------------------- |
| `background`         | Trigger fill when enabled.                                                 |
| `backgroundDisabled` | Trigger fill when `disabled=true`.                                         |
| `border`             | Trigger border color (regular state).                                      |
| `borderFocused`      | Trigger border color while the picker is open. _[reserved for future use]_ |
| `borderError`        | Trigger border color when `errorText` is set.                              |
| `text`               | Trigger label color when a value is selected.                              |
| `textDisabled`       | Trigger label color when `disabled=true`.                                  |
| `placeholder`        | Trigger label color when `value=null` (empty state).                       |
| `chevron`            | Trailing chevron glyph color.                                              |

### Surrounding labels (3)

| Slot         | Paints                                                           |
| ------------ | ---------------------------------------------------------------- |
| `label`      | Bold heading above the trigger.                                  |
| `helperText` | Muted helper text below the trigger (when no error).             |
| `errorText`  | Error text below the trigger. Also colors the missing-peer hint. |

### Native picker tint (1)

| Slot     | Paints                                                                     |
| -------- | -------------------------------------------------------------------------- |
| `accent` | Passed to `@expo/ui` as `accentColor` to tint the highlighted date / time. |

### Default palettes

**Light**: trigger mirrors `<Input>` (`#FFFFFF` bg / `#D1D5DB` border / `#111827` text / `#9CA3AF` placeholder) so a DatePicker sitting next to inputs in the same form reads flush. Accent = iOS system blue `#007AFF`.

**Dark**: trigger inverts to gray-800 (`#111827` bg / `#374151` border / `#F9FAFB` text). Accent = Apple dark-mode system blue `#0A84FF`.

The iOS modal chrome (backdrop, sheet background, Done button) uses reasonable hardcoded defaults for v1 — the Done button tints with `accent`, sheet background follows `appearance`. Add slots in a follow-up if theming demand emerges.

## Usage

Basic date-of-birth field:

```tsx
const [dob, setDob] = useState<Date | null>(null);

<DatePicker
  label="Date of birth"
  value={dob}
  onChange={setDob}
  maximumDate={new Date()}
  helperText="MM/DD/YYYY"
/>;
```

Time picker (24-hour on Android):

```tsx
<DatePicker
  label="Meeting time"
  mode="time"
  value={time}
  onChange={setTime}
  is24Hour
  timeStyle="short"
/>
```

Combined date + time (reservation):

```tsx
<DatePicker
  label="Reservation"
  mode="datetime"
  value={when}
  onChange={setWhen}
  minimumDate={new Date()}
  locale="en-US"
  dateStyle="medium"
  timeStyle="short"
/>
```

Range constraint (next 30 days):

```tsx
<DatePicker
  label="Departure"
  value={date}
  onChange={setDate}
  minimumDate={new Date()}
  maximumDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
/>
```

Custom trigger text (escape hatch):

```tsx
<DatePicker
  label="ISO output"
  value={date}
  onChange={setDate}
  formatValue={(d) => d.toISOString().slice(0, 10)}
/>
```

Brand-tinted palette:

```tsx
<DatePicker
  label="Themed date"
  value={date}
  onChange={setDate}
  datePickerColors={{
    border: "#7C3AED",
    text: "#4C1D95",
    chevron: "#7C3AED",
    accent: "#7C3AED",
  }}
/>
```

## Known upstream bug — Android UTC-midnight (mitigated internally)

`@expo/ui/community/datetime-picker` on Android emits a `Date` whose `.getTime()` is UTC-midnight of the picked day (Compose Material 3 contract). Without normalization, in any negative-offset locale (all of the Americas), formatting the returned Date via `Intl.DateTimeFormat` in the device timezone would render as the **previous local day** — e.g. picking July 2 would show "Jul 1" in the trigger.

**Consumers don't need to do anything** — DatePicker's Android body normalizes the returned Date via `normalizeAndroidPickedDate()` before firing `onChange`, so `onChange` always receives a Date whose local calendar day matches what the user tapped. iOS, `mode="time"`, and web are unaffected (bug is Android-specific to `date` / `datetime` modes).

We are **in the process of reporting this upstream** to `expo/expo` — the draft is at [`docs/upstream-issues/expo-ui-android-utc-midnight.md`](../../../../docs/upstream-issues/expo-ui-android-utc-midnight.md) and filing is deferred until ui-kraken v1 ships (Expo's issue template requires a minimal reproducible repo — we'll build one alongside the release announcement). When the upstream fix lands, we'll remove our JS-side workaround.

If you're consuming `@expo/ui/community/datetime-picker` directly (bypassing DatePicker), the same normalization lives at `packages/ui-kraken/src/utils/normalize-android-picked-date.ts` — copy the ~10-line function into your codebase or import from ui-kraken.

## Accessibility

- Root `<YStack>`: `accessibilityLabel={label}` when set.
- Trigger: `accessibilityRole="button"`, `accessibilityState={{ disabled }}`.
- Native picker owns its own a11y (VoiceOver spins on iOS wheels, TalkBack on Android dialogs).

## Sub-element testIDs

- root: `"date-picker"` (overridable via `testID`)
- label (when `label` set): `"{root}-label"`
- trigger: `"{root}-trigger"`
- trigger text: `"{root}-trigger-text"`
- iOS modal: `"{root}-modal"`, `"{root}-modal-overlay"`
- native picker: `"{root}-picker"`
- iOS Done button: `"{root}-done"`
- helper text: `"{root}-helper-text"`
- error text: `"{root}-error-text"`
- missing-peer hint: `"{root}-missing-peer"`

## Notes

- **Controlled only** — no `defaultValue` / uncontrolled mode. Pair with `useState`.
- **`is24Hour` is Android-only** per `@expo/ui`'s API. iOS follows the device locale's 12h/24h convention.
- **No web calendar UI** — the web body renders the browser's built-in native picker. Web use in this library is a compat / preview target; production web needs its own design system.
- **iOS Done button copy is fixed** ("Done") for v1 — expose `doneLabel` in a follow-up if consumers need localization.
- **No range mode** — for a start + end date pair, compose two `<DatePicker>`s. `<DateRangePicker>` ships next.
- **`borderFocused` is defined but not yet consumed** — placeholder for a future "picker is open" state animation.

## Platform support

| Platform         | Status                   | Notes                                                                                                         |
| ---------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------- |
| iOS              | ✅ (requires `@expo/ui`) | Inline picker in a modal sheet with Done button. Full mode support.                                           |
| Android          | ✅ (requires `@expo/ui`) | Native Material 3 dialog (OS-managed). Full mode support.                                                     |
| Web              | ✅ (no peer required)    | Browser's built-in `<input type="date" \| "time" \| "datetime-local">`. `showPicker()` + `.focus()` fallback. |
| Missing peer dep | ✅ safe fallback         | Renders "Install `@expo/ui`" hint colored with `errorText`. The app does NOT crash.                           |
