---
"ui-kraken": minor
---

Add `DateRangePicker` — controlled start/end date range picker. Fourth delivery of Batch 2 Phase A, closing the Select + SegmentedControl + DatePicker set.

Composes two `<DatePicker>` triggers as a pure wrapper — no platform-split at this level because the wrapped DatePickers own the `@expo/ui` bridge, staged iOS modal, Android dialog, and missing-peer fallback. DateRangePicker adds range semantics on top: auto-clamping, shared formatting, single-callback onChange.

### API

- Controlled: `startDate` / `endDate: Date | null` + `onChange: (start, end) => void`. Single callback fires with the full new range so consumers have one state update site — no separate onStart / onEnd branches.
- `mode: "date" | "datetime"` shipped from v1. `"time"` intentionally excluded — a "time range" is rare and not what "date range" implies to consumers. Add in a follow-up if a real use case surfaces.
- `orientation: "vertical" | "horizontal"` (default `"vertical"`). Vertical stacks Start above End (best on mobile). Horizontal places triggers side-by-side with `flex: 1` each and a `→` separator glyph (best on tablet).
- `startLabel` / `endLabel` (`"Start"` / `"End"` defaults, overridable — e.g. `"Check-in"` / `"Check-out"`).
- `startPlaceholder` / `endPlaceholder` — per-trigger placeholder, or fall back to DatePicker's mode-aware defaults.
- Standard `label` / `helperText` / `errorText` / `disabled` / `minimumDate` / `maximumDate` / `locale` / `dateStyle` / `timeStyle` / `formatValue` / `is24Hour` / `radius` — all forwarded uniformly to both triggers.

### Auto-clamp

When `startDate` moves past `endDate`, `onChange` fires ONCE with `(newStart, null)` — the end clears rather than jumping to match the new start (which would surprise the user more). The end picker's `minimumDate` is `startDate ?? minimumDate` so the native picker won't offer invalid values in the first place. Belt AND suspenders.

### `errorText` UX

When set, `errorText` overrides `helperText` AND paints BOTH trigger borders red via a per-instance palette override passed down to the wrapped DatePickers. The children never render their own error copy — one shared error line lives on the range container so the invalid state reads as a single field.

### Palette — 14 slots (each component owns its color space)

Per the "each component owns its color space" rule, DateRangePicker declares its own `DateRangePickerColors` block. Duplicates the 13 DatePicker slots (trigger chrome + surrounding labels + accent) applied identically to both bounds, plus one range-specific slot:

- `separator` — glyph color for the horizontal-layout separator (`→`). No effect in vertical orientation.

Default light + dark palettes mirror `DatePickerColors` for the trigger chrome so a range picker sitting next to a single-date picker in the same form reads flush.

### Peer

No new peer required — reuses `@expo/ui` (via the shared DatePicker probe). Consumers who already installed for DatePicker / SelectNative / SegmentedControl get DateRangePicker "for free."

### Testing (+29 tests, 943 total)

Shell coverage:
- Both triggers render + testID prefixing (`{root}-start` / `{root}-end`).
- Default labels (`"Start"` / `"End"`) + custom overrides + empty-string hides.
- Custom placeholders forward.
- Picking a start: fires `(newStart, existingEnd)` when end ≥ newStart.
- Picking a start LATER than end: fires `(newStart, null)` — clamp.
- Picking a start with no existing end: no clamp.
- Picking an end: fires `(startDate, newEnd)`.
- End picker's `minimumDate` = `startDate` (when set), else the top-level `minimumDate`.
- Start picker's `maximumDate` mirrors top-level `maximumDate`.
- `mode` / `locale` / `dateStyle` / `timeStyle` / `is24Hour` / `formatValue` forward to both.
- `errorText` overrides helper AND paints both trigger borders red.
- Helper renders when no error. Both empty → nothing renders.
- `disabled` propagates to both.
- Vertical (default) has no separator.
- Horizontal renders separator + `flex: 1` on both pickers.
- Per-instance `dateRangePickerColors` override wins.
- Dark palette on `activeTheme="dark"`.
- Extra `YStackProps` spread through.
- Snapshots for default empty vertical + preselected horizontal + error vertical.

### Example app

New `/components/date-range-picker` route with 10 sections: basic vacation, preselected + custom locale, horizontal orientation, datetime mode (reservation), custom labels (hotel check-in/out), range constraint (next 90 days), label + helper text, error state, fully disabled, brand-tinted palette (horizontal).
