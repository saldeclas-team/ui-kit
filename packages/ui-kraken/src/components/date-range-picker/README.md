# DateRangePicker

Controlled start/end date range picker. Composes two [`<DatePicker>`](../date-picker/README.md) triggers with auto-clamping (end always ≥ start) and shared formatting / palette / disabled state. Ships both `date` and `datetime` modes from v1.

Reach for `DateRangePicker` for vacation windows, contract terms, reservation date-and-time, custom report windows, or anywhere the "start + end" pair is a single conceptual field. For a single date, use [`DatePicker`](../date-picker/README.md) directly.

## Peer dependency — `@expo/ui`

Same peer as `DatePicker` / `SelectNative` / `SegmentedControl`. No new install needed if any of those work. Missing peer → both internal DatePickers render the "Install `@expo/ui`" hint fallback per trigger; the app does NOT crash.

## Import

```tsx
import { DateRangePicker } from "ui-kraken";
```

## Props

| Prop                    | Type                                                       | Default               | Description                                                                                                                                                                                           |
| ----------------------- | ---------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `startDate`             | `Date \| null`                                             | —                     | Range start. Required (controlled).                                                                                                                                                                   |
| `endDate`               | `Date \| null`                                             | —                     | Range end. Required (controlled).                                                                                                                                                                     |
| `onChange`              | `(startDate: Date \| null, endDate: Date \| null) => void` | —                     | Fires when either bound changes. Called with the FULL new range — see "Auto-clamp" below.                                                                                                             |
| `mode`                  | `"date" \| "datetime"`                                     | `"date"`              | Picker mode applied to both bounds. `"time"` intentionally excluded — a "time range" is a rare use case; add in a follow-up if needed.                                                                |
| `orientation`           | `"vertical" \| "horizontal"`                               | `"vertical"`          | Stack layout. Vertical = Start above End (best on mobile). Horizontal = side-by-side with `flex: 1` triggers + separator glyph (best on tablet).                                                      |
| `label`                 | `string`                                                   | —                     | Optional bold heading above BOTH triggers.                                                                                                                                                            |
| `helperText`            | `string`                                                   | —                     | Muted helper copy below the range. Overridden by `errorText`.                                                                                                                                         |
| `errorText`             | `string`                                                   | —                     | Error copy. Overrides `helperText` and paints BOTH trigger borders red.                                                                                                                               |
| `startLabel`            | `string`                                                   | `"Start"`             | Label above the start trigger.                                                                                                                                                                        |
| `endLabel`              | `string`                                                   | `"End"`               | Label above the end trigger.                                                                                                                                                                          |
| `startPlaceholder`      | `string`                                                   | mode default          | Placeholder in the start trigger when `startDate=null`. Falls back to DatePicker's mode-aware default.                                                                                                |
| `endPlaceholder`        | `string`                                                   | mode default          | Placeholder in the end trigger when `endDate=null`.                                                                                                                                                   |
| `disabled`              | `boolean`                                                  | `false`               | Disable both triggers.                                                                                                                                                                                |
| `minimumDate`           | `Date`                                                     | —                     | Earliest selectable start (applied to both pickers' native constraint).                                                                                                                               |
| `maximumDate`           | `Date`                                                     | —                     | Latest selectable end (applied to both pickers).                                                                                                                                                      |
| `locale`                | `string`                                                   | system default        | BCP-47 locale for both triggers' `Intl.DateTimeFormat` output.                                                                                                                                        |
| `dateStyle`             | `"short" \| "medium" \| "long" \| "full"`                  | `"medium"`            | Trigger date format preset for both bounds.                                                                                                                                                           |
| `timeStyle`             | `"short" \| "medium" \| "long" \| "full"`                  | `"short"`             | Trigger time format preset for both bounds (datetime mode).                                                                                                                                           |
| `formatValue`           | `(date: Date) => string`                                   | —                     | Full escape hatch — applies to both triggers.                                                                                                                                                         |
| `is24Hour`              | `boolean`                                                  | system                | Use 24-hour clock. **[Android only]** per `@expo/ui`.                                                                                                                                                 |
| `radius`                | `DateRangePickerRadius`                                    | `"md"`                | Border radius applied to both triggers.                                                                                                                                                               |
| `dateRangePickerColors` | `Partial<DateRangePickerColors>`                           | —                     | Per-instance color override. 14 slots.                                                                                                                                                                |
| `testID`                | `string`                                                   | `"date-range-picker"` | Root testID. Sub-elements: `-label`, `-helper-text`, `-error-text`, `-separator` (horizontal only). Internal DatePickers use `-start` / `-end` prefixes → `-start-trigger`, `-end-trigger-text`, etc. |

Every Tamagui `YStackProps` flows through the spread.

## Auto-clamp behavior

When `startDate` changes such that the current `endDate` becomes invalid (end < new start), `onChange` fires ONCE with `(newStart, null)` — the end clears rather than jumping to match the new start (which would surprise the user more). The end picker's `minimumDate` is `startDate ?? minimumDate` so the native picker won't offer invalid values in the first place.

Consumers see a single, atomic state update per pick.

```tsx
const [start, setStart] = useState<Date | null>(new Date(2027, 5, 12));
const [end, setEnd] = useState<Date | null>(new Date(2027, 5, 20));

<DateRangePicker
  startDate={start}
  endDate={end}
  onChange={(s, e) => {
    setStart(s);
    setEnd(e); // → null when the new start invalidates the current end
  }}
/>;
```

## Color model

`dateRangePickerColors` — 14 slots.

### Trigger chrome + labels + accent (13, applied identically to start + end)

Same shape and semantics as `DatePickerColors`:

- `background`, `backgroundDisabled`, `border`, `borderFocused`, `borderError`, `text`, `textDisabled`, `placeholder`, `chevron`
- `label`, `helperText`, `errorText`
- `accent` — passed to `@expo/ui` as `accentColor` to tint the highlighted date on both platforms

### Range-specific (1)

| Slot        | Paints                                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------------------ |
| `separator` | Glyph color for the between-triggers separator (`→`) in horizontal orientation. No effect in vertical. |

Per the "each component owns its color space" rule, this palette duplicates 13 slots from `DatePickerColors` intentionally — DateRangePicker can evolve independently (e.g. adding the `separator` slot didn't touch DatePicker).

### Default palettes

**Light**: mirrors `DEFAULT_LIGHT_DATE_PICKER_COLORS` for the trigger chrome so a DateRangePicker next to a DatePicker in the same form reads flush. Separator = gray-400 (`#9CA3AF`).

**Dark**: mirrors `DEFAULT_DARK_DATE_PICKER_COLORS`. Separator = gray-500 (`#6B7280`).

## Usage

Basic vacation dates:

```tsx
const [start, setStart] = useState<Date | null>(null);
const [end, setEnd] = useState<Date | null>(null);

<DateRangePicker
  label="Vacation"
  startDate={start}
  endDate={end}
  onChange={(s, e) => {
    setStart(s);
    setEnd(e);
  }}
  minimumDate={new Date()}
/>;
```

Horizontal layout with custom labels:

```tsx
<DateRangePicker
  label="Hotel stay"
  orientation="horizontal"
  startLabel="Check-in"
  endLabel="Check-out"
  startDate={checkin}
  endDate={checkout}
  onChange={(s, e) => {
    setCheckin(s);
    setCheckout(e);
  }}
/>
```

Datetime mode (reservation):

```tsx
<DateRangePicker
  label="Reservation"
  mode="datetime"
  startDate={arrival}
  endDate={departure}
  onChange={(s, e) => {
    setArrival(s);
    setDeparture(e);
  }}
  locale="en-US"
  dateStyle="medium"
  timeStyle="short"
/>
```

Range constraint (next 90 days):

```tsx
<DateRangePicker
  label="Departure window"
  startDate={start}
  endDate={end}
  onChange={(s, e) => {
    setStart(s);
    setEnd(e);
  }}
  minimumDate={new Date()}
  maximumDate={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)}
  helperText="Next 90 days"
/>
```

Brand-tinted palette:

```tsx
<DateRangePicker
  label="Themed range"
  startDate={start}
  endDate={end}
  onChange={(s, e) => {
    setStart(s);
    setEnd(e);
  }}
  dateRangePickerColors={{
    border: "#7C3AED",
    text: "#4C1D95",
    chevron: "#7C3AED",
    accent: "#7C3AED",
    separator: "#7C3AED",
  }}
/>
```

## Known upstream bug — Android UTC-midnight (mitigated internally)

Inherited from [`<DatePicker>`](../date-picker/README.md#known-upstream-bug--android-utc-midnight-mitigated-internally): `@expo/ui/community/datetime-picker` on Android emits a Date whose local calendar day is one day before what the user picked (a Compose Material 3 UTC-midnight contract that upstream doesn't normalize). Consumers don't need to do anything — the wrapped DatePickers normalize before firing `onChange`, so both `startDate` and `endDate` reach your `onChange` with the correct local day.

We are in the process of reporting this upstream to `expo/expo` — see [`docs/upstream-issues/expo-ui-android-utc-midnight.md`](../../../../docs/upstream-issues/expo-ui-android-utc-midnight.md) for the draft (deferred until ui-kraken v1). The DatePicker README section has the full explanation.

## Accessibility

- Root `<YStack>`: `accessibilityLabel={label}` when set.
- Each internal DatePicker inherits DatePicker's a11y wiring (trigger `accessibilityRole="button"`, native picker owns its own a11y).

## Sub-element testIDs

- root: `"date-range-picker"` (overridable via `testID`)
- label (when `label` set): `"{root}-label"`
- helper text: `"{root}-helper-text"`
- error text: `"{root}-error-text"`
- separator (horizontal only): `"{root}-separator"`
- start DatePicker root: `"{root}-start"` → its own suffixes become `"{root}-start-trigger"`, `"{root}-start-trigger-text"`, `"{root}-start-picker"`, etc.
- end DatePicker root: `"{root}-end"` → same suffix pattern

## Notes

- **Controlled only** — no `defaultStartDate` / `defaultEndDate`. Pair with `useState`.
- **No `"time"` mode** — pending real use case.
- **No calendar surface** — a "two-months-side-by-side" calendar (MUI DateRange style) is out of scope for a native-first library. Use two native pickers.
- **No preset ranges** ("Last 7 days") — consumers can wire their own buttons above the component.
- **No orientation="auto"** — one-line for consumers to add with `useWindowDimensions` if desired; not the component's job.
- **`is24Hour` is Android-only** per `@expo/ui`.
- **The `separator` slot is only rendered in horizontal orientation** — the vertical layout has no visible separator (the vertical gap does the job).

## Platform support

Delegates 100% to `<DatePicker>` — see [DatePicker's platform support table](../date-picker/README.md#platform-support). Summary: iOS ✅ (peer required), Android ✅ (peer required), Web ✅ (browser `<input>`, no peer), missing peer ✅ (fallback hint, no crash).
