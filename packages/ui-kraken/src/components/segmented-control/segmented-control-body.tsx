/**
 * Default `SegmentedControlBody` — used by bundlers that don't
 * have a platform-specific override. Re-exports the web
 * implementation because it's the peer-less-safe path (@expo/ui's
 * web fallback renders even without native modules).
 *
 * Metro picks `.ios.tsx` / `.android.tsx` / `.web.tsx` at bundle
 * time; this file only runs when no platform match exists.
 */
export { SegmentedControlBody } from "./segmented-control-body.web";
