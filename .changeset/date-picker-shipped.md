---
"ui-kraken": minor
---

Add `DatePicker` — native date / time / datetime picker with a Tamagui-styled trigger. Third delivery of Batch 2 Phase A.

- **iOS**: opens an inline picker inside a modal sheet with a Done button (staged selection — the picker's incremental scrolls don't fire `onChange` on every tick; only Done commits).
- **Android**: opens the OS's Material 3 dialog directly via `presentation="dialog"` (native OK/Cancel handled by the OS).
- **Web**: renders the browser's built-in `<input type="date" | "time" | "datetime-local">` via `showPicker()` (Chromium/Edge/Firefox) with a `.focus()` fallback on Safari — no JS calendar library.

### API

- Controlled: `value: Date | null` (null → placeholder) + `onChange: (date: Date) => void`.
- **`mode: "date" | "time" | "datetime"`** shipped from v1. Trigger formatting adjusts per mode; default placeholder shifts (`"Select date…"` / `"Select time…"` / `"Select date & time…"`).
- Trigger formatting via `Intl.DateTimeFormat` — `dateStyle` (date mode), `timeStyle` (time mode), both (datetime). `locale?: string` + `formatValue?: (date) => string` escape hatch.
- `is24Hour?: boolean` — Android-only per `@expo/ui`'s API. iOS follows the device locale's 12h/24h convention.
- `label` / `helperText` / `errorText` / `disabled` / `minimumDate` / `maximumDate` — same shape as Input / Select.
- `radius?: RadiusValue` — trigger corner shape (default `"md"`).
- Standard testID surface: `-trigger`, `-trigger-text`, `-picker`, `-modal` (iOS), `-modal-overlay` (iOS), `-done` (iOS), `-helper-text`, `-error-text`, `-missing-peer`.

### Peer

`@expo/ui` (already an optional peer of `SelectNative` and `SegmentedControl`) — no new peer required. Missing peer → renders "Install `@expo/ui`" hint colored with `errorText`; the app does NOT crash.

### Platform split from v0

Follows the [`native-bridges-platform-split` rule](./.agents/skills/creating-component-tamagui/SKILL.md#35-native-bridges-must-be-platform-split-mandatory) — every platform's native call lives in its own file (`date-picker-body.{ios,android,web,tsx}`) so iOS-only tweaks (modal chrome, Done button, staged value pattern) can't regress the Android dialog and vice versa.

### Palette — 13 slots

Per the "each component owns its color space" rule, DatePicker declares its own `DatePickerColors` block:

- **Trigger chrome (9)**: `background`, `backgroundDisabled`, `border`, `borderFocused` (reserved), `borderError`, `text`, `textDisabled`, `placeholder`, `chevron`.
- **Surrounding labels (3)**: `label`, `helperText`, `errorText`.
- **Native picker tint (1)**: `accent` — passed to `@expo/ui` as `accentColor` to tint the highlighted date on both platforms.

Default light palette mirrors `<Input>` so a DatePicker in the same form column reads flush. Accent defaults to iOS system blue (`#007AFF` / `#0A84FF`).

### Testing

+25 tests (23 shell + 2 probe). Full-shell coverage; snapshots for empty / preselected / error / missing-peer states.

### Example app

New `/components/date-picker` route with 10 sections: basic (date-of-birth with max=today), preselected + custom locale, time mode + `is24Hour`, datetime mode, range constraint (next 30 days), `formatValue` escape hatch, label + helper text, error state, fully disabled, brand-tinted palette.
