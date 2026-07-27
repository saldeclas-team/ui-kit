/**
 * Normalize the Date returned by `@expo/ui/community/datetime-picker`
 * on Android into a Date whose LOCAL calendar day (and, for
 * `datetime`, local hour / minute) matches what the user actually
 * picked in the native dialog.
 *
 * ## Why this exists
 *
 * Compose Material 3's `DatePickerState.selectedDateMillis` is
 * defined as UTC-midnight of the picked day. `@expo/ui`'s Android
 * bridge (`packages/expo-ui/android/src/main/java/expo/modules/ui/
 * DatePickerView.kt`) forwards that raw Long, and its JS side calls
 * `new Date(rawUtcMs)` without any timezone transform — so
 * consumers in negative-offset locales (all of the Americas)
 * receive a Date whose LOCAL calendar day is ONE DAY EARLIER than
 * what the user picked. The picker's own internal headline stays
 * correct because Compose renders it in UTC, matching its own
 * state — but the trigger label (formatted via
 * `Intl.DateTimeFormat` in the device's ambient TZ) reads
 * "yesterday."
 *
 * The community `@react-native-community/datetimepicker` fixes
 * this in Kotlin (`RNMaterialDatePicker.kt:227-238`); `@expo/ui`
 * does not (unfiled upstream at time of writing). We mirror the
 * community lib's approach on the JS side: reconstruct a Date
 * whose local Y/M/D matches the picked Y/M/D.
 *
 * ## Per-mode behavior
 *
 * - **`date`**: incoming `.getTime()` is UTC-midnight of the picked
 *   day. Rebuild as local-midnight of the same Y/M/D.
 * - **`datetime`**: `@expo/ui` on Android falls back to date-only
 *   (see `node_modules/@expo/ui/src/community/datetime-picker/
 *   DateTimePicker.android.tsx`), so hours / minutes are typically
 *   0 — but we still carry over the UTC hours / minutes for
 *   forward compatibility if that ever changes.
 * - **`time`**: Compose's `ExpoTimePicker` uses
 *   `Calendar.getInstance()` (system TZ) on the Kotlin side, so its
 *   emitted Date is already a proper local instant. Return
 *   unchanged — any normalization here would introduce a bug on
 *   Android for time pickers.
 *
 * ## Why on the JS side and not in the Kotlin bridge
 *
 * We don't own `@expo/ui`. Patching the bundled JS at
 * `handleValueChange` is the least-invasive fix; when the maintainers
 * eventually normalize inside `DatePickerView.kt` we can delete this
 * function and the wire-through in one edit.
 *
 * Pure — no side effects, no `Date.now()` / TZ lookup at call time.
 * Safe to memoize or call in a `useCallback` dependency array.
 */
export function normalizeAndroidPickedDate(picked: Date, mode: "date" | "time" | "datetime"): Date {
  if (mode === "time") return picked;
  const year = picked.getUTCFullYear();
  const month = picked.getUTCMonth();
  const day = picked.getUTCDate();
  if (mode === "datetime") {
    return new Date(year, month, day, picked.getUTCHours(), picked.getUTCMinutes(), 0, 0);
  }
  return new Date(year, month, day, 0, 0, 0, 0);
}
