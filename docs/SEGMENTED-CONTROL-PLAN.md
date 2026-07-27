# SegmentedControl — design record

**Status:** shipped on 2026-07-25 as part of [`COMPONENTS-BATCH-2-PLAN.md`](./COMPONENTS-BATCH-2-PLAN.md) Phase A. iOS uses native `UISegmentedControl` via `@expo/ui`; Android uses a pure-JS Material 3 implementation with `react-native-reanimated` (see the "Compose interop bug" history section below).

Living design doc for the `SegmentedControl` primitive.

---

## Overview

Horizontal segmented picker — 2 to 5 short labels, one always selected. iOS renders as `UISegmentedControl` (rounded pill), Android as Material 3 `SegmentedButton` (connected row). Native controls own their visual chrome; ui-kraken only owns the surrounding label + helper / error text.

Contrast with siblings:

- [`RadioGroup`](./RADIO-GROUP-PLAN.md) — same "1 of N, always one selected" model but rendered as always-visible rows / cards, best for wordy options.
- [`Select`](./SELECT-PLAN.md) family — same "1 of N" but for LONGER option lists that need a popup / sheet / menu.
- **SegmentedControl** is the compact, always-visible variant: best for 2-5 short options where showing them all inline is the point (filter tabs, sort direction, view mode).

**Locked decisions:**

- **Peer dep is `@expo/ui` (optional)** — same as SelectNative. Import path is `@expo/ui/community/segmented-control` (subpath); probe file detects it independently. When missing the frame renders an "install `@expo/ui`" hint colored with `errorText`; the app does NOT crash.
- **Platform split from v0 (mandatory)** — per [[native-bridges-platform-split]] and the creating-component-tamagui SKILL § 3.5. Files: `segmented-control.tsx` (shell) + `segmented-control-body.{ios,android,web,tsx}` (bridge render). Even though iOS and Android share the same `@expo/ui` component, the split scaffolding is required from day one so future platform tweaks don't cross-regress.
- **Controlled only** — consumer holds `value: T`, updates via `onChange`. No `defaultValue`. Mirrors Select / RadioGroup / MultiSelect.
- **Generic in value type** — `<SegmentedControl<Value extends string = string>>`. Same generic slot as the other pickers so consumers can swap between them by changing the tag.
- **Options shape** identical to Select / RadioGroup / MultiSelect: `Array<{ value: Value; label: string }>`.
- **NO `tintColor` prop passed to `@expo/ui`** — duna-app's own SegmentedControl learned the hard way: on Android the `tintColor` maps ONLY to `activeContainerColor` without adjusting the text color, so a dark tint (like the app's `$primary`) leaves the text in Material 3's `onSecondaryContainer` (light gray) → illegible. On iOS the prop isn't read at all. Each platform's native theming (UISegmentedControl on iOS, Material 3 on Android) is what the user expects; overriding tint hurts more than it helps.
- **`appearance` bound to ui-kraken's `activeTheme`** — passes `'light' | 'dark'` based on `useUIKit().activeTheme`, not `useColorScheme()`. Consumers who mount `<UIKitProvider defaultTheme="light">` in a dark-mode device still get the light-appearance segmented control (consistent with how every other ui-kraken component reads theme).
- **Own color block**: `segmentedControlColors` with 3 slots — `label` (heading text), `helperText`, `errorText`. Minimal because the native control paints its own segmented container / tint / text / selected state. Missing-peer hint reuses `errorText`.
- **No `disabledOptions`** — native SegmentedControl doesn't accept per-segment disable. Whole-control `disabled` prop only. Consumers who need per-option gating should filter their `options` array up-front.
- **No frame chrome opt-in** (unlike SelectNative) — the native control already has a visible background + rounded corners; wrapping it in another border would be redundant. If a consumer needs a framed look they can `<View style={{ borderWidth: 1, padding: 8 }}>` outside the component.
- **Extends `YStack`** — vertical column (label + control + helper / error). Every Tamagui `YStackProps` flows through the spread.
- **A11y**: native SegmentedControl carries its own tab / tab-list roles. Our shell only sets `accessibilityLabel` on the container from the `label` prop for consumers who miss the visible label (e.g. screen reader users navigating without focus context).

## API

```ts
export interface SegmentedControlOption<Value extends string = string> {
  value: Value;
  label: string;
}

export type SegmentedControlColorsInput = Partial<SegmentedControlColors>;

export interface SegmentedControlProps<Value extends string = string> extends Omit<
  GetProps<typeof StyledSegmentedControl>,
  "children" | "onChange"
> {
  options: SegmentedControlOption<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  label?: string;
  helperText?: string;
  errorText?: string;
  disabled?: boolean;
  segmentedControlColors?: SegmentedControlColorsInput;
  testID?: string;
}
```

Note: `value` is `Value` (not `Value | null`) — segmented controls always have one selected segment. Consumers pick a sensible default on mount (typically the first option).

### Behavior

- Tapping a segment fires `onChange(option.value)` synchronously.
- When `value` doesn't match any option's value, `selectedIndex` falls back to `0` (first segment). Same fallback as duna-app's reference — matches user expectation that "something is always selected".
- `disabled=true` → native `enabled={false}` prop; taps are swallowed.
- Missing peer dep → frame renders "install `@expo/ui`" hint; no interaction possible.

### Sub-element testIDs

- root: `"segmented-control"` (overridable via `testID`)
- label (when `label` set): `"{root}-label"`
- native control: `"{root}-control"`
- helper text (when set + no error): `"{root}-helper-text"`
- error text (when set): `"{root}-error-text"`
- missing-peer hint (when peer NOT available): `"{root}-missing-peer"`

## Token schema

Own `segmentedControlColors` block on `Tokens`. 3 slots:

```ts
export interface SegmentedControlColors {
  /** Bold label text color (rendered above the control). */
  label: string;
  /** Muted helper text color rendered below the control when no error. */
  helperText: string;
  /** Error text color rendered below the control when `errorText` is set. Also colors the missing-peer hint. */
  errorText: string;
}
```

### Default light palette

- `label`: `#111827` (near-black, matches Input / Select / others)
- `helperText`: `#6B7280` (muted gray)
- `errorText`: `#DC2626` (red)

### Default dark palette

- `label`: `#F9FAFB`
- `helperText`: `#9CA3AF`
- `errorText`: `#F87171`

### Flatten to Tamagui tokens

`flattenSegmentedControlColors()` produces `$uiSegmentedControl{PascalCase}` for every slot.

### Merge helper

`mergeSegmentedControlColors(base, override?)` — slot-based, same signature as other flat merges.

## File structure

```
packages/ui-kraken/src/components/segmented-control/
├── segmented-control.tsx                     # shared shell (palette, label, helper, error, peer-missing fallback)
├── segmented-control-body.tsx                # default fallback (re-exports .web)
├── segmented-control-body.ios.tsx            # native SegmentedControl via @expo/ui
├── segmented-control-body.android.tsx        # native SegmentedControl via @expo/ui
├── segmented-control-body.web.tsx            # @expo/ui web fallback (renders a plain button row)
├── segmented-control-body-types.ts           # shell → body props contract
├── segmented-control-types.ts                # SegmentedControlOption + SegmentedControlProps
├── segmented-control.styled.ts               # StyledSegmentedControl (YStack) + Label + HelperText + ErrorText + MissingPeer
├── segmented-control.spec.tsx                # shell contract + mocked body
├── segmented-control.stories.tsx             # Storybook
├── README.md
└── index.ts
```

The peer-dep probe (`getExpoUISegmentedControl`) is added to the existing `expo-ui-probe.ts` on the SelectNative folder — no, actually per repo convention each component owns its probe file. Let me add `expo-ui-segmented-probe.ts` in this folder, or extend the shared probe. **Decision**: extend the shared `expo-ui-probe.ts` (in `select-native/`) is coupling components. Instead, create a NEW probe file in this folder: `expo-ui-segmented-probe.ts` that handles only the segmented-control subpath. Same probe pattern (try/catch require), scoped per component. This keeps native imports co-located with their component.

Actually re-reading — a shared `packages/ui-kraken/src/utils/expo-ui.ts` file that exposes ALL `@expo/ui` sub-modules (Host, Picker, MenuView, SegmentedControl, DatePicker) as separate getters would be cleaner as Batch 2 grows. **Deferred**: for now, keep the probe local (`expo-ui-probe.ts` in this folder) matching the SelectNative pattern; refactor to a shared probe module in a follow-up if 3+ components end up duplicating the pattern.

## Testing

**Coverage target: 100%** on `segmented-control.tsx` (shell).

Behavioral coverage (~18 tests):

- Renders label when `label` is passed / omits when missing / omits when empty string.
- Default testID is `"segmented-control"` when none passed.
- Renders native control when peer dep is available.
- Renders missing-peer hint (and no control) when `@expo/ui` isn't available.
- Passes `options.map(o => o.label)` to native `values` prop.
- Passes correct `selectedIndex` for a matched value.
- Falls back to `selectedIndex: 0` when value doesn't match any option.
- `onChange` maps native `event.nativeEvent.selectedSegmentIndex` → option's `value`.
- Numeric string values still round-trip correctly.
- `disabled=true` → native `enabled: false`.
- `appearance` mirrors `activeTheme` (light / dark).
- `helperText` renders when set + no error.
- `errorText` overrides `helperText`.
- Empty strings for both → nothing renders.
- Per-instance `segmentedControlColors` override wins on each slot.
- Provider palette propagation via `useUIKit()`.
- Dark palette resolves when `activeTheme='dark'`.
- YStack pass-through (padding / margin / width) flows through.

Structural snapshots (~3):

- Default light + peer available + 3 options
- Missing peer fallback
- Dark palette + selected

## Storybook (~8 stories)

- `Default` — 3 options, first selected
- `TwoOptions` — filter tabs (`Active` / `Archived`)
- `FiveOptions` — max useful width
- `WithLabel`
- `WithHelperText`
- `WithErrorText`
- `Disabled`
- `DarkTheme`

## Example app screen

`apps/example/app/(pages)/components/segmented-control.tsx` — 6-7 sections:

1. **Basic** — 3 options, useState + caption showing current value.
2. **Two options** — filter tabs (`All` / `Unread`).
3. **Five options** — sort direction (`A→Z`, `Z→A`, `New`, `Old`, `Popular`) with caption.
4. **With label + helper text**.
5. **Error state**.
6. **Disabled**.
7. **Per-instance palette override** — helper / error tinted (not native tint, per the "no tint" decision).

Plus route registration + row on the components home.

## Non-goals

- **No `tintColor` prop** — see locked decisions. Consumers who need a colored segmented control will have to wait for a future variant or use a custom implementation.
- **No `disabledOptions`** — native control doesn't support per-segment disable.
- **No custom segment renderer** — options are always `{ value, label }`.
- **No wheel / vertical variant** — SegmentedControl is horizontal by definition.
- **No icons in segments** — labels only. `@expo/ui`'s SegmentedControl accepts icons via a different prop shape; if a consumer needs icons we add a `icons` prop in a follow-up.

## How to ship

Executed on branch `feat/duna-migration-batch-2`:

1. Plan doc (this file).
2. `getExpoUISegmentedControl` probe file.
3. Token schema wiring (types + defaults + flatten + provider + barrels).
4. Component files: `segmented-control-types.ts` → `-body-types.ts` → `-body.{ios,android,web,tsx}` → `.styled.ts` → `.tsx` (shell) → `.spec.tsx` + snapshots → `.stories.tsx` → `README.md` → `index.ts`.
5. Barrels: `components/index.ts` + `src/index.ts`.
6. Example: screen + `Stack.Screen` + components-home row. Verify per [[verify-example-wiring-per-component]].
7. Flip status here + on `COMPONENTS-BATCH-2-PLAN.md` (⏳ → ✅).
8. Add `.changeset/*.md` per [[changeset-required-for-ui-kraken]].
9. Verify green: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`.
10. Atomic commit with rich body.

## History — Compose interop bug drove Android to pure JS

The initial cut used `@expo/ui/community/segmented-control` on both platforms. On Android, the Compose `SegmentedButton` bridge exposed a hit-testing interop bug: taps on the first 1-2 SegmentedControls of a scrollable Expo Router page passed THROUGH the Compose `Host` and landed on RN elements of adjacent stack screens (a `<Link>` on the components home kept alive in memory), causing random navigation to unrelated routes when the user tapped a segment. Fully reproducible; wrapping the Host in `<View collapsable={false}>` + `onStartShouldSetResponder={() => true}` did NOT block the propagation.

The platform-split rule ([[native-bridges-platform-split]]) is exactly what let us swap the buggy Compose bridge for a pure-JS Material 3 implementation on Android without touching iOS. `segmented-control-body.android.tsx` now renders:

- Rounded pill container (radius from `androidRadius` prop, default `"pill"` = 9999)
- Animated sliding selection pill via `react-native-reanimated` `withTiming` (200ms, `Easing.inOut(Easing.ease)` — matches M3 "medium-1" motion spec)
- Material 3 role colors baked into the default palette (`containerBackground`, `containerBorder`, `selectedBackground`, `selectedLabel`, `unselectedLabel`, `ripple` — all overridable via `segmentedControlColors`)
- `android_ripple` for the M3 press feedback

iOS keeps the native `UISegmentedControl` via `@expo/ui` in `.ios.tsx` — SwiftUI doesn't have the interop bug.

## Palette evolution

Shipped palette is 9 slots (not the 3 originally planned):

- **Shared (3)** — surrounding text, all platforms: `label`, `helperText`, `errorText`.
- **Android chrome (6)** — used by the pure-JS body: `containerBackground`, `containerBorder`, `selectedBackground`, `selectedLabel`, `unselectedLabel`, `ripple`. iOS ignores these slots because SwiftUI owns its own chrome — documented as `[Android only]` on each slot's JSDoc.

The `androidRadius` prop is prefixed to signal the platform scope at the API level. Accepts the shared `RadiusValue` union (`"none" | "sm" | "md" | "lg" | "pill" | number`).

## How to extend

- **Add `icons` prop** for icon-only or icon+label segments (`@expo/ui`'s iOS SegmentedControl supports it; pure-JS Android could too via a Text-Icon slot).
- **Add `variant="filled" | "outlined"`** if a design token variant emerges beyond `androidRadius`.
- **Consolidate the `resolveRadiusNumeric` usage** — Skeleton already has its own local numeric resolver; when we refactor Skeleton to use the shared helper we can drop the duplicate.
- **Extract a shared `expo-ui-probe.ts`** in `utils/` if 3+ components duplicate the try/catch require pattern (SelectNative + SegmentedControl are already 2).
