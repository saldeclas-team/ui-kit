# Upstream issue draft — @expo/ui Android UTC-midnight

**Status: PAUSED (as of 2026-07-26).**

We have the diagnosis + a shipped fix on our side ([commit
`0fbcb75`](https://github.com/saldeclas-team/ui-kit/commit/0fbcb75)).
Filing upstream is deferred until the library ships v1 — the Expo
issue template REQUIRES a minimal reproducible example (public repo
URL), and rather than push a throwaway repo now, we'll build one
alongside the release announcement so both artifacts land together.

**When to unpause:**

- Once ui-kraken v1 is out (Batch 2 Phase B + C complete).
- Or if a consumer / another repo hits the same bug and we want to
  point them at an upstream tracker.

**How to unpause:**

1. `npx create-expo-app@latest expo-ui-datetime-utc-repro --template blank`
2. Add the ~20 lines of picker + labels from the "Steps to reproduce"
   section below.
3. `gh repo create --public expo-ui-datetime-utc-repro --source . --push`
4. Open https://github.com/expo/expo/issues/new/choose → "SDK Bug Report".
5. Paste each section below into the field with the matching name.

Once the issue is filed, add a `Filed: #<number>` line at the top and
delete the "PAUSED" block.

**Target**: https://github.com/expo/expo/issues/new/choose → "SDK Bug Report"

Each section below is labeled with the EXACT form-field name so you
can copy → paste → next field without hunting.

---

## FIELD: Summary (title, top of form)

```
[@expo/ui][community/datetime-picker][Android] Emitted Date is UTC-midnight — off-by-one when formatted in device timezone
```

---

## FIELD: Minimal reproducible example (URL, required)

**⚠️ DECISION NEEDED — we don't have one yet.** Options:

- **(a) Snack**: https://snack.expo.dev — fastest, hosted. Caveat: `@expo/ui` may not render in Snack Web preview (it's a native module) — but Snack's iOS / Android device preview should work.
- **(b) Fresh minimal repo**: `npx create-expo-app@latest expo-ui-datetime-utc-repro --template blank`, add ~15 lines of picker + Text, push to a new public GitHub repo, paste URL.
- **(c) Point at our repo**: not recommended — maintainers close non-minimal repros.

Recommended: **(b)**. Takes 5 minutes.

---

## FIELD: Steps to reproduce (large text area)

Paste this whole block:

````markdown
## Environment

Reproduced on:

- `@expo/ui`: `57.0.7`
- `expo`: `~57.0.8`
- `react-native`: `0.86.0`
- Device: Android 14 (API 34)
- Device timezone: `America/Bogota` (UTC−5). Should reproduce on any negative-offset device.

## Bug

`@expo/ui/community/datetime-picker` on Android emits a `Date` whose `.getTime()` is UTC-midnight of the picked day. In any negative-offset locale, formatting the returned Date via `Intl.DateTimeFormat` in the device's ambient timezone renders as the **previous local day** — classic off-by-one.

The picker's own internal headline stays correct (Compose renders it in UTC, matching its own state), so nothing looks wrong inside the dialog. But every consumer that reads `date.getDate()` or formats the value with locale defaults sees "yesterday."

## Steps

Minimal component from the repro repo:

```tsx
import { DateTimePicker } from "@expo/ui/community/datetime-picker";
import { useState } from "react";
import { Text, View } from "react-native";

export default function Repro() {
  const [date, setDate] = useState<Date>(new Date());
  return (
    <View>
      <Text>
        Formatted: {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date)}
      </Text>
      <Text>ISO: {date.toISOString()}</Text>
      <Text>getDate(): {date.getDate()}</Text>
      <DateTimePicker
        value={date}
        mode="date"
        presentation="dialog"
        onValueChange={(_e, d) => setDate(d)}
      />
    </View>
  );
}
```

1. Open the app on an Android device in a UTC−5 timezone.
2. Tap the picker. Select **July 2, 2027**. Tap OK.
3. **Expected**: `Formatted: Jul 2, 2027` and `getDate(): 2`.
4. **Actual**: `Formatted: Jul 1, 2027` and `getDate(): 1`. ISO reads `2027-07-02T00:00:00.000Z` — UTC-midnight.
5. Re-open the picker. Its own selection is still July 2 (correct).

## Root cause

Compose Material 3's `DatePickerState.selectedDateMillis` is defined by Google as UTC-midnight of the picked day. The Kotlin bridge forwards it raw:

`packages/expo-ui/android/src/main/java/expo/modules/ui/DatePickerView.kt:343`

```kotlin
TextButton(onClick = { onDateSelected(DatePickerResult(date = state.selectedDateMillis)) }, colors = buttonColors) {
```

`packages/expo-ui/android/src/main/java/expo/modules/ui/DatePickerView.kt:453-454` (the inline / `LaunchedEffect` path):

```kotlin
LaunchedEffect(state.selectedDateMillis) {
  onDateSelected(DatePickerResult(date = state.selectedDateMillis))
}
```

The JS side wraps it in `new Date(...)` with zero transform:

`packages/expo-ui/src/jetpack-compose/DatePicker/index.tsx:193-194`

```ts
onDateSelected: ({ nativeEvent: { date } }) => {
  props.onDateSelected?.(new Date(date));
},
```

And the drop-in `community/datetime-picker` wrapper forwards it untouched:

`packages/expo-ui/src/community/datetime-picker/DateTimePicker.android.tsx:72-78`

```ts
const onDateSelected = (date: Date) => {
  if (onValueChange) {
    onValueChange(buildChangeEvent(date), date);
  } else {
    onChange?.(buildEvent(date), date);
  }
};
```

`Utils.kt` in the same package defines `toUtcDayMillis()` for `selectableDates` bounds — but it's not applied in the inverse direction (UTC → local) when emitting the picked value.

## How the community lib handles this

`@react-native-community/datetimepicker` — which `@expo/ui/community/datetime-picker` explicitly bills as a drop-in replacement for — normalizes on the Kotlin side:

`@react-native-community/datetimepicker@8.4.5` — `android/src/main/java/com/reactcommunity/rndatetimepicker/RNMaterialDatePicker.kt:227-238`

```kotlin
// Material DatePicker returns timestamp in UTC at midnight for the selected date.
// Extract year, month, day from UTC, then set them in the target timezone
val utcCalendar = Calendar.getInstance(java.util.TimeZone.getTimeZone("UTC"))
utcCalendar.timeInMillis = selection

newCalendar[Calendar.YEAR] = utcCalendar[Calendar.YEAR]
newCalendar[Calendar.MONTH] = utcCalendar[Calendar.MONTH]
newCalendar[Calendar.DAY_OF_MONTH] = utcCalendar[Calendar.DAY_OF_MONTH]
newCalendar[Calendar.HOUR_OF_DAY] = initialDate.hour()
newCalendar[Calendar.MINUTE] = initialDate.minute()
newCalendar[Calendar.SECOND] = 0
newCalendar[Calendar.MILLISECOND] = 0
```

Landed in v7.5.0 per [react-native-datetimepicker/datetimepicker#61](https://github.com/react-native-datetimepicker/datetimepicker/issues/61). Maintainer `vonovak` in [#988](https://github.com/react-native-datetimepicker/datetimepicker/issues/988) confirms this is the correct handling.

## Proposed fix

**Kotlin side (matches the community lib).** In `DatePickerView.kt`, transform the UTC-midnight `Long` into a local-day `Long` before emitting:

```kotlin
fun Long.utcMidnightToLocalDay(): Long {
  val utcCalendar = Calendar.getInstance(java.util.TimeZone.getTimeZone("UTC"))
  utcCalendar.timeInMillis = this
  val localCalendar = Calendar.getInstance()
  localCalendar.set(Calendar.YEAR, utcCalendar[Calendar.YEAR])
  localCalendar.set(Calendar.MONTH, utcCalendar[Calendar.MONTH])
  localCalendar.set(Calendar.DAY_OF_MONTH, utcCalendar[Calendar.DAY_OF_MONTH])
  localCalendar.set(Calendar.HOUR_OF_DAY, 0)
  localCalendar.set(Calendar.MINUTE, 0)
  localCalendar.set(Calendar.SECOND, 0)
  localCalendar.set(Calendar.MILLISECOND, 0)
  return localCalendar.timeInMillis
}
```

Then at lines 343 and 454:

```kotlin
onDateSelected(DatePickerResult(date = state.selectedDateMillis.utcMidnightToLocalDay()))
```

`ExpoTimePickerDialogContent` (line 397) is already correct — it uses `Calendar.getInstance()` (system TZ), so `cal.time.time` is a proper local instant. No change needed for time mode.

Alternate: same transform on the JS side in `src/jetpack-compose/DatePicker/index.tsx:194`. Less clean because it duplicates the transform in every consumer of the jetpack-compose picker.

## Scope

- **Affects**: `mode="date"` and `mode="datetime"` on Android (the latter falls back to date-only per `DateTimePicker.android.tsx:17-18`, so it inherits the same bug).
- **Not affected**: `mode="time"` (`ExpoTimePickerDialogContent` uses `Calendar.getInstance()` in system TZ).
- **Not affected**: iOS. SwiftUI's `DatePicker` returns a `Date` in the ambient timezone.

## Workaround for other consumers hitting this

JS-side normalization at the callsite while upstream cooks:

```ts
function normalizeAndroidPickedDate(picked: Date, mode: "date" | "time" | "datetime"): Date {
  if (mode === "time") return picked;
  const year = picked.getUTCFullYear();
  const month = picked.getUTCMonth();
  const day = picked.getUTCDate();
  if (mode === "datetime") {
    return new Date(year, month, day, picked.getUTCHours(), picked.getUTCMinutes(), 0, 0);
  }
  return new Date(year, month, day, 0, 0, 0, 0);
}
```

Usage:

```ts
onValueChange={(_e, d) => {
  const normalized = Platform.OS === "android" ? normalizeAndroidPickedDate(d, mode) : d;
  onChange(normalized);
}}
```

Avoid the naive `date.getTime() + date.getTimezoneOffset() * 60_000` alternative — it's DST-fragile (breaks around transition days).

## Reference implementation

A shipped fix using this JS-side approach in an internal component library — including unit tests for `date` / `datetime` / `time` modes and leap-day / end-of-month edge cases:

[saldeclas-team/ui-kit@0fbcb75](https://github.com/saldeclas-team/ui-kit/commit/0fbcb75)

## Related searches (nothing filed yet upstream)

- `repo:expo/expo datetime-picker android timezone` → 0 hits
- `repo:expo/expo expo-ui DatePicker UTC` → 0 hits
- `repo:expo/expo selectedDateMillis` → 0 hits
- Closest existing issues (all unrelated to timezone, same file):
  [#47204](https://github.com/expo/expo/issues/47204) (year range header),
  [#47773](https://github.com/expo/expo/issues/47773) (unstyled elements),
  [#48029](https://github.com/expo/expo/issues/48029) (row spacing).
````

---

## FIELD: Environment (asks for `npx expo-env-info` output)

Run this in your terminal, paste the raw output:

```bash
npx expo-env-info
```

If it fails or you don't want to run it, paste this manual version:

```
expo-env-info 1.3.x
  System:
    OS: macOS (host)
    Node: <your node version — `node -v`>
  npmPackages:
    @expo/ui: ~57.0.7
    expo: ~57.0.8
    react: 19.x
    react-native: 0.86.0
```

---

## Notes for future me

- Filed: (fill in issue number after submitting)
- Filed by: (your github handle)
- Filed date: (fill in)
- If maintainers close as "not filed here — belongs on `expo/expo-ui` repo," refile there.
