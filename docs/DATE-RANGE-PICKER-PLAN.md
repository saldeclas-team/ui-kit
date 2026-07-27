# DateRangePicker — plan (Batch 2 Phase A #4)

Wraps two `<DatePicker>` triggers as a controlled start/end range with auto-clamping (end always ≥ start) and per-mode formatting. No new peer — reuses `@expo/ui/community/datetime-picker` via the shared DatePicker probe.

## Backend

Composes two internal `<DatePicker>` instances — one for `startDate`, one for `endDate`. All native picker work delegates to DatePicker (which already handles the platform split, staged iOS modal, Android dialog, missing-peer fallback). DateRangePicker itself has NO platform-specific code — no `.ios.tsx` / `.android.tsx` / `.web.tsx` split needed because the wrapped DatePicker owns the bridge.

## Layout

Default vertical stack (Start above End). Prop `orientation: "vertical" | "horizontal"` (default `"vertical"`) — horizontal renders both triggers side-by-side in an XStack with `flex: 1` each, useful for tablet or wide surfaces.

Between the two triggers, a small gap plus an optional separator character (`"→"` for horizontal, no separator vertical) — configurable via the palette's `separator` slot.

## Modes

Ships `mode: "date" | "datetime"` from v1. No `"time"` — a "time range" (say 09:00-17:00) is a rare use case in real apps and not what "date range" implies to consumers. If a real need surfaces, we can revisit.

Both internal DatePickers get the same `mode`. Trigger formatting mirrors DatePicker's (Intl.DateTimeFormat via `dateStyle` / `timeStyle` / `locale`, or `formatValue` escape hatch — applies to both pickers).

## API

```ts
export type DateRangePickerRadius = RadiusValue;
export type DateRangePickerColorsInput = Partial<DateRangePickerColors>;
export type DateRangePickerMode = "date" | "datetime";
export type DateRangePickerOrientation = "vertical" | "horizontal";

export interface DateRangePickerProps extends Omit<
  GetProps<typeof StyledDateRangePicker>,
  "children" | "onChange" | "onPress" | "disabled"
> {
  /** Range start, or `null` when unset. Controlled. */
  startDate: Date | null;
  /** Range end, or `null` when unset. Controlled. */
  endDate: Date | null;
  /**
   * Fires when either bound changes. Called with the FULL new range —
   * this signature (vs two separate onStart / onEnd callbacks) makes
   * the auto-clamp behavior legible: when picking a new start that
   * violates the current end, the callback fires once with
   * `(newStart, null)`, not twice.
   */
  onChange: (startDate: Date | null, endDate: Date | null) => void;
  /** Picker mode for both bounds. Default `"date"`. */
  mode?: DateRangePickerMode;
  /** Layout direction. Default `"vertical"`. */
  orientation?: DateRangePickerOrientation;
  /** Optional bold heading above BOTH triggers (single, spans the group). */
  label?: string;
  /** Muted helper copy below the range. Overridden by `errorText`. */
  helperText?: string;
  /** Error copy below the range. Overrides `helperText`. Also paints both trigger borders red. */
  errorText?: string;
  /** Label above the start trigger. Default `"Start"`. */
  startLabel?: string;
  /** Label above the end trigger. Default `"End"`. */
  endLabel?: string;
  /** Placeholder for the start trigger when `startDate=null`. Default varies per mode. */
  startPlaceholder?: string;
  /** Placeholder for the end trigger when `endDate=null`. Default varies per mode. */
  endPlaceholder?: string;
  /** Disable both triggers — no picker opens. */
  disabled?: boolean;
  /** Earliest selectable start value. */
  minimumDate?: Date;
  /** Latest selectable end value. */
  maximumDate?: Date;
  /**
   * BCP-47 locale for both triggers' `Intl.DateTimeFormat` output.
   * When omitted, the runtime uses the system default locale.
   */
  locale?: string;
  /** Preset shorthand for the trigger's date format (both bounds). Default: `"medium"`. */
  dateStyle?: DateTimeStyle;
  /** Preset shorthand for the trigger's time format (both bounds, datetime mode). Default: `"short"`. */
  timeStyle?: DateTimeStyle;
  /**
   * Full escape hatch — receives the current `Date` and returns the
   * exact trigger text to render. Applies to BOTH bounds.
   */
  formatValue?: (date: Date) => string;
  /** Use 24-hour clock. Android-only per `@expo/ui`. */
  is24Hour?: boolean;
  /** Border radius applied to both triggers. Default `"md"`. */
  radius?: DateRangePickerRadius;
  /**
   * Per-instance color overrides. 14 slots (same 13 as DatePicker
   * plus one for the horizontal-layout separator glyph).
   */
  dateRangePickerColors?: DateRangePickerColorsInput;
  /**
   * Root testID. Sub-elements derive:
   * `-label`, `-start-trigger`, `-end-trigger`, `-helper-text`,
   * `-error-text`. Internal DatePickers pass through their standard
   * suffixes prefixed with `-start` / `-end`.
   */
  testID?: string;
}
```

## Auto-clamp behavior

- When `startDate` changes and current `endDate` < new `startDate`, call `onChange(newStart, null)` — clear the end. Rationale: end is now invalid, and forcing `endDate = startDate` would surprise the consumer more than clearing.
- When `endDate` changes, no start clamp needed — end can be later than start freely.
- End picker's `minimumDate` is `startDate ?? minimumDate` (native picker enforces the constraint too, so user can't pick invalid values in the first place).
- Start picker's `maximumDate` stays as the top-level `maximumDate` (allowing start to be picked freely up to the range's max; end constraint is separate).

## Color palette — 14 slots (each component owns its color space)

Per the "each component owns its color space" rule, DateRangePicker declares its own `DateRangePickerColors` block. Duplicates the 13 DatePicker slots (trigger chrome + surrounding labels + accent) and adds one slot for the horizontal-layout separator glyph.

```ts
export interface DateRangePickerColors {
  // Trigger chrome (9) — applied identically to start + end
  background: string;
  backgroundDisabled: string;
  border: string;
  borderFocused: string;
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
  // Range-specific (1)
  separator: string;
}
```

Default light/dark mirror DatePicker's palette. Separator defaults to a mid-gray (`#9CA3AF` light / `#6B7280` dark).

## Wiring plan (13 steps — matches DatePicker)

1. `docs/DATE-RANGE-PICKER-PLAN.md` — this doc.
2. `tokens/tokens-types.ts` — add `DateRangePickerColors` interface + slot in `Tokens`.
3. `tokens/defaults/date-range-picker.ts` — `DEFAULT_LIGHT_DATE_RANGE_PICKER_COLORS` + dark + `mergeDateRangePickerColors`.
4. `tokens/defaults/index.ts` — wire defaults into `DEFAULT_TOKENS` / `DEFAULT_DARK_TOKENS`, re-export.
5. `tokens/tokens-derive.ts` — pass through `dateRangePickerColors`.
6. `tokens/tokens.ts` — flatten into Tamagui theme + config.
7. `utils/flatten.ts` — `flattenDateRangePickerColors`.
8. `provider/provider-types.ts` — `DateRangePickerColorsInput` + TokensInput slot.
9. `provider/provider.tsx` — merge in both light + dark reducers.
10. `components/date-range-picker/` — new folder with:
    - `date-range-picker-types.ts`
    - `date-range-picker-styled.ts`
    - `date-range-picker.tsx` (shell — composes two `<DatePicker>`, no platform split)
    - `date-range-picker.spec.tsx`
    - `date-range-picker.stories.tsx`
    - `README.md`
    - `index.ts`
11. `components/index.ts` — re-export.
12. `src/index.ts` — top-level re-export.
13. Example app: `_layout.tsx` route + row on components home + `date-range-picker.tsx` screen.

Plus a changeset (`.changeset/date-range-picker-shipped.md`, minor bump).

## Testing plan

Aim for the same coverage as DatePicker (25 shell tests):

- Renders both triggers with correct default testIDs.
- `startLabel` / `endLabel` render, overridable, empty-string hides.
- Per-mode placeholder copy (date + datetime).
- `startDate` change → onChange fires with `(newStart, existingEnd)` when end ≥ newStart.
- `startDate` change → onChange fires with `(newStart, null)` when end < newStart (clamp).
- `endDate` change → onChange fires with `(startDate, newEnd)`.
- End picker's `minimumDate` = `startDate` (when set) else the top-level `minimumDate`.
- Start picker's `maximumDate` = top-level `maximumDate`.
- Custom locale / dateStyle / timeStyle / formatValue apply to BOTH triggers.
- `errorText` overrides `helperText` and paints BOTH trigger borders red.
- `disabled` propagates to both.
- `orientation="horizontal"` renders XStack (assert layout container).
- `orientation="vertical"` renders YStack.
- Per-instance `dateRangePickerColors` overrides win.
- Dark palette when `activeTheme="dark"`.
- Snapshots: default empty, both dates set, error state, horizontal layout, missing peer (indirect — the wrapped DatePickers render their own fallback).

## Non-goals for v1

- **No `time` mode** — pending real use case.
- **No calendar surface** — a full "two-months-side-by-side calendar" UI (like MUI DateRange) is out of scope for a native-first library; use two native pickers.
- **No preset ranges** ("Last 7 days", "This month" buttons) — consumers can wire their own buttons above the component.
- **No single-picker-two-dates flow** — some libraries let you tap a calendar day once for start, again for end. `@expo/ui`'s native pickers don't offer this affordance, and building a custom one duplicates the calendar surface we explicitly ruled out.
- **No orientation="auto" via useWindowDimensions** — consumers can wire that themselves in one line if they want responsiveness; not the component's job.
