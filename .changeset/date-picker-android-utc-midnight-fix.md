---
"ui-kraken": patch
---

Fix DatePicker + DateRangePicker off-by-one bug on Android.

`@expo/ui/community/datetime-picker` on Android emits a Date whose `.getTime()` is UTC-midnight of the picked day (a Compose Material 3 quirk — `DatePickerState.selectedDateMillis` is defined that way, and `@expo/ui`'s Kotlin bridge at `DatePickerView.kt:343` forwards it raw, and its JS side calls `new Date(rawUtcMs)` without normalization). In negative-offset locales (all of the Americas), formatting that Date with `Intl.DateTimeFormat` in the device's ambient TZ renders as the PREVIOUS local day — so picking July 2 in the calendar shows "July 1" in the trigger.

The community `@react-native-community/datetimepicker` fixes this in Kotlin (`RNMaterialDatePicker.kt:227-238`); `@expo/ui` does not (unfiled upstream at time of writing).

We now normalize on the JS side in the Android body: reconstruct a Date whose local Y/M/D matches the picked Y/M/D. The transform is a new pure util at `packages/ui-kraken/src/utils/normalize-android-picked-date.ts` — reusable if we add another native date bridge later.

Per-mode behavior:

- **`date`**: local-midnight of the same Y/M/D that the user tapped.
- **`datetime`**: same Y/M/D + preserved UTC hours/minutes as local hours/minutes (Android currently falls back to date-only per `@expo/ui`'s own contract, so hours/minutes are typically 0 — forward-compat preservation).
- **`time`**: unchanged. Compose's `ExpoTimePicker` uses `Calendar.getInstance()` (system TZ) so its emitted Date is already a proper local instant.

iOS is unaffected — SwiftUI `DatePicker` returns a Date in the ambient TZ. DateRangePicker composes two DatePickers and inherits the fix for free.

+7 tests (6 normalizer unit tests covering date / datetime / time modes + leap-day + end-of-month + no-mutation + 1 end-to-end simulating the real UTC-midnight bridge output).
