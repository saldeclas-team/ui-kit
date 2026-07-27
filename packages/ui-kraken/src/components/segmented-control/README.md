# SegmentedControl

Horizontal segmented picker — native `UISegmentedControl` on iOS (via `@expo/ui`), Material 3 `SegmentedButton` on Android (pure-JS + Reanimated). Best for 2-5 short options where showing them all inline is the point (filter tabs, sort direction, view mode). For longer option lists, reach for [`Select`](../select/README.md). For 2-5 always-visible options with more text room per option, use [`RadioGroup`](../radio-group/README.md).

## Peer dependency — `@expo/ui` (iOS only)

Only iOS uses `@expo/ui/community/segmented-control`. Android renders a pure-JS Material 3 implementation with `react-native-reanimated` (already a required peer of ui-kraken) — no additional native peer needed.

**iOS with `@expo/ui` installed**: renders the native `UISegmentedControl`.

**iOS without `@expo/ui`**: renders a "install `@expo/ui`" hint colored with `errorText`. No crash.

**Android**: works out of the box, no peer needed. See the "Why pure-JS on Android?" note below.

## Import

```tsx
import { SegmentedControl } from "ui-kraken";
```

## Props

| Prop                     | Type                              | Default               | Description                                                                                                                                |
| ------------------------ | --------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`                | `SegmentedControlOption<Value>[]` | —                     | Segments rendered in the control, in array order. Required.                                                                                |
| `value`                  | `Value`                           | —                     | Currently-selected value. Always one segment is selected. Required (controlled).                                                           |
| `onChange`               | `(value: Value) => void`          | —                     | Fires with the picked value when the user taps a segment. Required.                                                                        |
| `label`                  | `string`                          | —                     | Optional bold heading above the control.                                                                                                   |
| `helperText`             | `string`                          | —                     | Muted helper copy below the control. Overridden by `errorText`.                                                                            |
| `errorText`              | `string`                          | —                     | Error copy below the control. Overrides `helperText`.                                                                                      |
| `disabled`               | `boolean`                         | `false`               | Disable the whole control — taps are swallowed.                                                                                            |
| `androidRadius`          | `SegmentedControlRadius`          | `"pill"`              | **[Android only]** Container border radius. Applied by the pure-JS body; **ignored on iOS** (native pill fixed).                           |
| `segmentedControlColors` | `Partial<SegmentedControlColors>` | —                     | Per-instance color override. 3 shared slots + 6 Android-only slots (chrome).                                                               |
| `testID`                 | `string`                          | `"segmented-control"` | Root testID. Sub-elements derive `-label`, `-control`, `-control-segment-{idx}` (Android), `-helper-text`, `-error-text`, `-missing-peer`. |

Every Tamagui `YStackProps` flows through the spread — `padding`, `margin`, `width`, `pressStyle`, shorthand aliases, every accessibility prop, etc.

## Generic in the value type

```ts
type ViewMode = "list" | "grid" | "map";
const [view, setView] = useState<ViewMode>("list");

<SegmentedControl<ViewMode>
  options={[
    { value: "list", label: "List" },
    { value: "grid", label: "Grid" },
    { value: "map", label: "Map" },
  ]}
  value={view}
  onChange={setView}
/>;
```

Same generic slot as `Select` / `RadioGroup` / `MultiSelect` — swap between the four pickers by changing the component tag and adjusting the `value` semantics.

## Behavior

- Tapping a segment fires `onChange(option.value)` synchronously.
- When `value` doesn't match any option's value, `selectedIndex` falls back to `0` (first segment). Segmented controls always have exactly one selected segment.
- `disabled=true` → taps are swallowed on both platforms.
- `appearance` mirrors `useUIKit().activeTheme` (`"light" | "dark"`), NOT `useColorScheme()`. Consumers who mount `<UIKitProvider defaultTheme="light">` in a dark-mode device still get the light-appearance segmented control.
- Android: selected segment animates in with a 200ms slide (Reanimated `withTiming`, `Easing.inOut(Easing.ease)` — matches M3 "medium-1" motion spec).
- iOS with peer missing → renders the install hint; no interaction possible.

## Why pure-JS on Android?

The initial cut used `@expo/ui/community/segmented-control` on Android too, but the Compose bridge exposes a hit-testing interop bug: taps on the first 1-2 SegmentedControls of a scrollable Expo Router page pass THROUGH the Compose `Host` and land on adjacent stack screens' RN elements, causing random navigation to unrelated routes. Wrapping the Host in `<View collapsable={false}>` + touch-responder claims did NOT block it.

Following the [`native-bridges-platform-split` rule](../../../../.agents/skills/creating-component-tamagui/SKILL.md#35-native-bridges-must-be-platform-split-mandatory), we swapped the buggy bridge for a pure-JS Material 3 implementation on Android. The visual is faithful (rounded pill, sliding selection, ripple, Material role colors) and taps stay contained to the control. iOS's native `UISegmentedControl` doesn't have the interop bug, so it kept the bridge.

## Why no `tintColor`

We deliberately do NOT expose a `tintColor` prop. On iOS the underlying SwiftUI `UISegmentedControl` ignores it anyway. On Android the pure-JS body already lets you retint every slot (`selectedBackground` / `selectedLabel` / `unselectedLabel` / `ripple` etc.) via `segmentedControlColors` — a single global tint would be redundant and less flexible.

## Color model

`segmentedControlColors` — 9 slots. Shared slots work on every platform; Android chrome slots are used only by the pure-JS Android body (iOS renders `UISegmentedControl` which owns its own chrome).

### Shared (3)

| Slot         | Paints                                                           |
| ------------ | ---------------------------------------------------------------- |
| `label`      | Bold heading above the control.                                  |
| `helperText` | Muted helper text below the control (no error).                  |
| `errorText`  | Error text below the control. Also colors the missing-peer hint. |

### Android chrome (6) — `[Android only]`

| Slot                  | Paints                                     |
| --------------------- | ------------------------------------------ |
| `containerBackground` | Background of the outer pill container.    |
| `containerBorder`     | Border color of the outer pill.            |
| `selectedBackground`  | Fill color of the sliding selection pill.  |
| `selectedLabel`       | Text color for the selected segment.       |
| `unselectedLabel`     | Text color for unselected segments.        |
| `ripple`              | `android_ripple` color for press feedback. |

iOS ignores the Android-only slots — SwiftUI's `UISegmentedControl` doesn't expose per-part color overrides.

### Default palettes

**Light**: Material 3 `secondary` role colors — `containerBackground` `#FEF7FF`, `containerBorder` `#79747E`, `selectedBackground` `#E8DEF8`, `selectedLabel` `#1D192B`, `unselectedLabel` `#1C1B1F`, `ripple` `#D0BCFF33` + label/helperText/errorText matching Input.

**Dark**: Material 3 dark scheme — `containerBackground` `#1D1B20`, `containerBorder` `#938F99`, `selectedBackground` `#4A4458`, `selectedLabel` `#E8DEF8`, `unselectedLabel` `#E6E1E5`, `ripple` `#38313F`.

## Usage

Basic:

```tsx
const [view, setView] = useState<"list" | "grid">("list");

<SegmentedControl
  options={[
    { value: "list", label: "List" },
    { value: "grid", label: "Grid" },
  ]}
  value={view}
  onChange={setView}
/>;
```

Filter tabs (2 options) with label:

```tsx
<SegmentedControl
  options={[
    { value: "active", label: "Active" },
    { value: "archived", label: "Archived" },
  ]}
  value={tab}
  onChange={setTab}
  label="Filter"
/>
```

Square variant on Android (iOS keeps native pill):

```tsx
<SegmentedControl options={VIEW_MODES} value={view} onChange={setView} androidRadius="none" />
```

Brand-tinted Android chrome:

```tsx
<SegmentedControl
  options={VIEW_MODES}
  value={view}
  onChange={setView}
  segmentedControlColors={{
    containerBorder: "#7C3AED",
    selectedBackground: "#EDE9FE",
    selectedLabel: "#5B21B6",
    unselectedLabel: "#4C1D95",
    ripple: "#8B5CF633",
  }}
/>
```

Error state (chrome forces frame legibility on both platforms):

```tsx
<SegmentedControl
  options={VIEW_MODES}
  value={view}
  onChange={setView}
  label="View mode"
  errorText="Selection failed to save."
/>
```

## Accessibility

- Container: `accessibilityRole="tablist"`, `accessibilityLabel={label}` when set.
- Each Android segment: `accessibilityRole="tab"`, `accessibilityState={{ selected, disabled }}`, `accessibilityLabel={option.label}`.
- iOS native `UISegmentedControl` uses SwiftUI's built-in picker semantics.

## Sub-element testIDs

- root: `"segmented-control"` (overridable via `testID`)
- label (when `label` set): `"{root}-label"`
- container: `"{root}-control"`
- each Android segment: `"{root}-control-segment-{idx}"` (0-indexed)
- helper text (when set + no error): `"{root}-helper-text"`
- error text (when set): `"{root}-error-text"`
- missing-peer hint (when iOS peer NOT available): `"{root}-missing-peer"`

## Notes

- **Controlled only** — no `defaultValue` / uncontrolled mode.
- **No `disabledOptions`** — per-segment disable isn't supported by either backend. Filter your `options` array up-front instead.
- **No custom segment renderer** — options are `{ value, label }` string-only.
- **No icons in segments** — labels only. Add support in a follow-up if a consumer needs it (`@expo/ui`'s iOS SegmentedControl accepts icons; pure-JS Android could too).
- **No vertical variant** — SegmentedControl is horizontal by definition.
- **`androidRadius` is Android-only** — iOS's `UISegmentedControl` owns its own rounded pill shape and doesn't expose a radius prop. The `android` prefix signals the scope at the API level.

## Platform support

| Platform               | Status                             | Notes                                                                                                                                    |
| ---------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| iOS                    | ✅ (requires `@expo/ui`)           | `UISegmentedControl` — native pill affordance with system tint.                                                                          |
| Android                | ✅ (no peer required)              | Material 3 `SegmentedButton` look implemented in pure JS with Reanimated. Sliding selection, ripple, M3 role colors — all overridable.   |
| Web                    | ⚠️ (via `@expo/ui`'s web fallback) | Falls back to `@expo/ui`'s Host+Picker web element. Not as visually integrated as the native platforms.                                  |
| Missing peer dep (iOS) | ✅ safe fallback                   | Renders "Install `@expo/ui`" hint colored with the `errorText` slot. The app does NOT crash. Android continues to work without the peer. |
