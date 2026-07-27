import { normalizeAndroidPickedDate } from "./normalize-android-picked-date";

/**
 * See `normalize-android-picked-date.ts` for the full context on
 * why this normalizer exists. Short version: `@expo/ui`'s Android
 * date picker emits Compose Material 3's `selectedDateMillis`,
 * which is UTC-midnight of the picked day. Without normalization,
 * formatting the returned Date with the device timezone (via
 * `Intl.DateTimeFormat`) shows the previous day for consumers
 * west of UTC.
 */
describe("normalizeAndroidPickedDate", () => {
  it("date mode: reconstructs UTC Y/M/D as LOCAL Y/M/D at midnight", () => {
    // 2027-07-02 00:00 UTC — what @expo/ui hands us for a July 2 pick.
    const utcMidnight = new Date(Date.UTC(2027, 6, 2, 0, 0, 0, 0));
    const normalized = normalizeAndroidPickedDate(utcMidnight, "date");
    expect(normalized.getFullYear()).toBe(2027);
    expect(normalized.getMonth()).toBe(6);
    expect(normalized.getDate()).toBe(2);
    expect(normalized.getHours()).toBe(0);
    expect(normalized.getMinutes()).toBe(0);
    expect(normalized.getSeconds()).toBe(0);
    expect(normalized.getMilliseconds()).toBe(0);
  });

  it("date mode: preserves the day at the end of a month (no accidental .getTime() arithmetic wrap)", () => {
    const utc = new Date(Date.UTC(2027, 5, 30, 0, 0, 0, 0)); // 2027-06-30 UTC midnight
    const normalized = normalizeAndroidPickedDate(utc, "date");
    expect(normalized.getFullYear()).toBe(2027);
    expect(normalized.getMonth()).toBe(5);
    expect(normalized.getDate()).toBe(30);
  });

  it("date mode: leap-day edge case (Feb 29) survives normalization", () => {
    const utc = new Date(Date.UTC(2028, 1, 29, 0, 0, 0, 0)); // 2028-02-29 UTC midnight
    const normalized = normalizeAndroidPickedDate(utc, "date");
    expect(normalized.getFullYear()).toBe(2028);
    expect(normalized.getMonth()).toBe(1);
    expect(normalized.getDate()).toBe(29);
  });

  it("datetime mode: preserves UTC hours / minutes as local hours / minutes", () => {
    // Compose's date-picker fallback in `datetime` on Android
    // still reports UTC-midnight for the day but consumers may
    // pass an input value with a non-zero time — forward-compat
    // check for when @expo/ui adds a true datetime picker.
    const utc = new Date(Date.UTC(2027, 6, 2, 14, 30, 0, 0));
    const normalized = normalizeAndroidPickedDate(utc, "datetime");
    expect(normalized.getFullYear()).toBe(2027);
    expect(normalized.getMonth()).toBe(6);
    expect(normalized.getDate()).toBe(2);
    expect(normalized.getHours()).toBe(14);
    expect(normalized.getMinutes()).toBe(30);
  });

  it("time mode: returns the picked Date UNCHANGED (Compose TimePicker uses local TZ)", () => {
    // Compose's ExpoTimePicker uses Calendar.getInstance() (system
    // TZ) on the Kotlin side, so its emitted Date is already a
    // proper local instant. Any normalization here would introduce
    // a bug on Android for time pickers.
    const picked = new Date(2027, 6, 2, 15, 45, 0, 0);
    const normalized = normalizeAndroidPickedDate(picked, "time");
    expect(normalized).toBe(picked);
  });

  it("date mode: does NOT mutate the input Date", () => {
    const utc = new Date(Date.UTC(2027, 6, 2, 0, 0, 0, 0));
    const originalTime = utc.getTime();
    normalizeAndroidPickedDate(utc, "date");
    expect(utc.getTime()).toBe(originalTime);
  });
});
