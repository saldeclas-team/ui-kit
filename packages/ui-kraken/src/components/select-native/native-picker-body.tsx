/**
 * Default `NativePickerBody` — used by bundlers / runtimes that
 * don't have a platform-specific override (e.g. some node unit-
 * test runners). Re-exports the web implementation because it's
 * the one that doesn't rely on native `MenuView`.
 *
 * Metro picks the platform variant (`.ios.tsx` / `.android.tsx` /
 * `.web.tsx`) automatically at bundle time; this fallback only
 * runs when no platform match exists.
 */
export { NativePickerBody } from "./native-picker-body.web";
