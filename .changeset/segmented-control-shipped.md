---
"ui-kraken": minor
---

Add `SegmentedControl` — horizontal segmented picker for 2-5 short options. Second delivery of Batch 2 Phase A.

- **iOS**: native `UISegmentedControl` via `@expo/ui/community/segmented-control` (optional peer).
- **Android**: Material 3 look implemented in pure JS with `react-native-reanimated` — no additional peer required. Sliding selection pill, ripple, Material 3 role colors, all overridable per-instance.
- **Web**: `@expo/ui` Host+Picker fallback.

### Platform-split rationale

The initial cut used `@expo/ui/community/segmented-control` on Android too, but the Compose bridge exposes a hit-testing interop bug: taps on the first 1-2 SegmentedControls of a scrollable Expo Router page pass THROUGH the Compose `Host` and land on adjacent stack screens' RN elements, causing random navigation to unrelated routes. `<View collapsable={false}>` + touch-responder claims did NOT block it.

The `native-bridges-platform-split` rule (SKILL § 3.5, added last commit) let us swap the buggy bridge for a pure-JS Material 3 implementation on Android without touching iOS. iOS's SwiftUI `UISegmentedControl` doesn't have the interop bug, so it kept the bridge.

### API

- Generic in the value type (`SegmentedControl<Value extends string = string>`) — same slot as Select / RadioGroup / MultiSelect.
- Controlled only: `value: Value`, `onChange: (value: Value) => void`.
- `label` / `helperText` / `errorText` / `disabled` — same surrounding-text pattern as Input / Select.
- `androidRadius?: RadiusValue` — default `"pill"` matching M3. Prefixed `android` because iOS's native control owns its own shape. Consumers who want a square variant pass `"none"`; medium `"md"`; numeric px value; etc.
- No `tintColor` prop — iOS ignores it and on Android the `segmentedControlColors` palette gives finer control anyway.

### Palette — 9 slots

Split into shared vs. Android-only chrome per the "each component owns its color space" rule:

- **Shared (3)** — `label`, `helperText`, `errorText`. Themable on every platform.
- **Android chrome (6)** — `containerBackground`, `containerBorder`, `selectedBackground`, `selectedLabel`, `unselectedLabel`, `ripple`. Used by the pure-JS Android body; ignored on iOS (SwiftUI paints its own chrome). Each slot documented as `[Android only]` in its JSDoc.

Default light + dark palettes ship Material 3 role colors so consumers who don't override still get the M3 look on Android.

### Testing

+34 tests (24 shell + 8 Android body + 2 probe). Coverage:
- `segmented-control.tsx` (shell): 100%
- `segmented-control-body.ios.tsx`: 100%
- `segmented-control-body.android.tsx`: 100% lines / 100% functions
- `expo-ui-segmented-probe.ts`: 100%

`.web.tsx` and `.tsx` fallback intentionally uncovered (jest-expo resolves `.ios` by default, matching the pattern used by SelectNative).

### Shared helper: `resolveRadiusNumeric`

Added to `utils/radius.ts` — numeric-only variant of `resolveRadius` for components rendering `borderRadius` on plain RN `<Animated.View>` (which doesn't understand Tamagui theme tokens). Extracted from the SegmentedControl shell so it can replace Skeleton's local resolver in a follow-up.

### Example app

New `/components/segmented-control` route with 10 sections: basic (3 options), two options / filter tabs, five options / sort direction, with label + helper text, error state, fully disabled, per-instance palette override, `androidRadius="none"` (square), `androidRadius="md"` (soft rounded), Android brand-tinted chrome.
