# SelectNative — design record

**Status:** shipped on 2026-07-25 as part of [`COMPONENTS-BATCH-2-PLAN.md`](./COMPONENTS-BATCH-2-PLAN.md) Phase A. Sibling of [`Select`](./SELECT-PLAN.md) (pure JS) and [`SelectBottomSheet`](./SELECT-BOTTOM-SHEET-PLAN.md).

Living design doc for the `SelectNative` primitive — kept post-shipping so future contributors can understand the decisions behind the shape of the API.

---

## Overview

Single-choice picker rendered with the fully-native `@expo/ui` `Picker`. SwiftUI `Menu` on iOS + Jetpack Compose `DropdownMenu` on Android — trigger button and popup are both painted by the platform, not by us. Consumers get platform-native affordance (haptics, animations, dark-mode chrome) at the cost of a peer dependency.

**Why a separate component from `Select`?**

- Different runtime: `Select` uses RN's `Modal`; `SelectNative` uses `@expo/ui`'s `Host`+`Picker` bridge.
- Different theming surface: `Select` fully themable (16 slots); `SelectNative` themes only the wrapper frame (7 slots) because the native picker owns its interior.
- Different peer-dep story: `Select` has zero peers; `SelectNative` requires `@expo/ui` (optional peer).
- Different UX: `Select` is a centered modal card; `SelectNative` is a native menu popover.

Sharing an API through a `variant` prop was rejected because the 3 variants have genuinely different props (`SelectBottomSheet` needs `snapPoints`, `SelectNative` needs `placeholderLabel` for its Android quirk, `Select` needs `modalTitle` for its card). Three components with the same core prop shape reads clearer than one component with 3 branches.

**Locked decisions:**

- **Peer dep is `@expo/ui` (optional)**. When missing, the frame renders an "install `@expo/ui`" hint colored with the `errorText` slot; the app does NOT crash. Same graceful-degradation pattern as `ExternalLink` from Batch 1.
- **Borderless by default; chrome opt-in per platform.** `showBorderIOS` and `showBorderAndroid` both default to `false` so SwiftUI `Menu` / Compose `DropdownMenu` render at their intrinsic native size (transparent, no border, no padding). Consumers who want the input-shaped wrapper opt in per platform — independent flags so Cupertino-clean on iOS + Material-framed on Android is a one-flag choice. Chrome is forced on regardless when `errorText` is set (invalid state needs framing) or when the peer dep is missing (fallback hint needs a box). `minHeight: 44` is kept even in borderless mode so the picker gets an iOS-standard touch target and the surrounding label / helper text stay at the same vertical rhythm as the framed variant.
- **`appearance="menu"` fixed** — always the compact menu appearance. Wheel variant is for date pickers.
- **Placeholder injection for Android** — when `value` is null (or doesn't match any option), synthesize a placeholder `Picker.Item` with empty-string value at position 0. Without this, the Android Compose Picker silently drops taps because it can't match `selectedValue` to any `Picker.Item`.
- **Value type is `string | number`** — matches `@expo/ui`'s `PickerItemValue`. `Select` restricts to `string` only because its own list rendering doesn't need numeric key support.
- **Own color block**: `selectNativeColors` — 7 slots (label, background, backgroundDisabled, border, borderError, helperText, errorText). Deliberately smaller than `selectColors` (16 slots) because native picker owns its interior chrome.
- **No `disabledOptions`** — `@expo/ui`'s `Picker.Item` doesn't accept a per-item disabled prop. If you need per-option disabling, use `Select` or `SelectBottomSheet`.
- **No `sheetTitle` / `modalTitle`** — native menu doesn't have a titleable header.
- **No `radius` on the picker itself** — only the wrapper frame. Native picker owns its own corner radius.
- **Extends `YStack`** — same column layout as Select / MultiSelect / RadioGroup.
- **A11y**: label rendered as `Text` above the frame; native picker announces itself via the platform's own semantics (SwiftUI Menu on iOS, Compose DropdownMenu on Android); helper/error rendered as `Text` after the frame.

## API

```ts
export type SelectNativeValue = string | number;

export interface SelectNativeOption<Value extends SelectNativeValue = string> {
  value: Value;
  label: string;
}

export type SelectNativeColorsInput = Partial<SelectNativeColors>;

export interface SelectNativeProps<Value extends SelectNativeValue = string> extends Omit<
  GetProps<typeof StyledSelectNative>,
  "children" | "onChange"
> {
  options: SelectNativeOption<Value>[];
  value: Value | null;
  onChange: (value: Value) => void;
  label?: string;
  helperText?: string;
  errorText?: string;
  placeholderLabel?: string; // default: "Select…"
  disabled?: boolean;
  radius?: SelectNativeRadius;
  selectNativeColors?: SelectNativeColorsInput;
  testID?: string;
}
```

### Sub-element testIDs

- root: `"select-native"` (overridable)
- label: `"{root}-label"` (when `label` set)
- frame: `"{root}-frame"`
- native picker (when peers available): `"{root}-picker"`
- missing-peer hint (when peers NOT available): `"{root}-missing-peer"`
- helper text: `"{root}-helper-text"` (when set + no error)
- error text: `"{root}-error-text"` (when set)

## Token schema

`selectNativeColors` on `Tokens`. 7 slots:

```ts
export interface SelectNativeColors {
  label: string;
  background: string;
  backgroundDisabled: string;
  border: string;
  borderError: string;
  helperText: string;
  errorText: string;
}
```

## File structure

```
packages/ui-kraken/src/components/select-native/
├── select-native.tsx           # component logic + peer-dep gate
├── select-native.styled.ts     # StyledSelectNative + Frame + Label + Helper + Error + MissingPeer
├── select-native-types.ts      # SelectNativeOption, SelectNativeValue, SelectNativeProps
├── expo-ui-probe.ts            # try/catch require('@expo/ui')
├── expo-ui-probe.spec.ts       # isolated-module tests for the probe
├── select-native.spec.tsx      # unit tests (100% coverage)
├── select-native.stories.tsx   # Storybook
├── README.md
└── index.ts
```

## Testing

**Coverage target: 100%** on `select-native.tsx` + `expo-ui-probe.ts` (via `jest.isolateModules`).

35 behavioral tests + 4 snapshots. Highlights:

- Label / helperText / errorText mount toggles.
- Placeholder injection (when value=null, an empty-string Picker.Item is prepended).
- Numeric values via the Value generic (SelectNative<number>).
- Frame background / border swap by disabled / error state.
- Per-instance override wins over the provider palette.
- Peer-available branch renders `-picker`; peer-missing branch renders `-missing-peer` hint.
- Radius parametrized (none / sm / md / lg / pill / number).
- YStack pass-through props.

## Storybook

10 stories: Default, Preselected, WithLabel, WithHelperText, WithErrorText, Disabled, CustomPlaceholderLabel, BrandTintedFrame, PillRadius, DarkTheme.

## Example app screen

`apps/example/app/(pages)/components/select-native.tsx` — 9 sections covering every prop combination including numeric-value variant.

## Non-goals

- **No `disabledOptions`** — @expo/ui doesn't support it.
- **No `sheetTitle` / `modalTitle`** — no native affordance.
- **No `variant="wheel"`** — that's what DatePicker will use.
- **No web-specific fallback** — @expo/ui's own web fallback (a plain `<select>`) is what runs there.

## Known issues

**iOS, borderless mode only**: a `<SelectNative>` rendered off-screen inside a scrollable container renders slightly "raised" (extra invisible whitespace below the trigger) once scrolled into view. The picker is fully functional; only the vertical rhythm of the containing section is affected. Reproducible in duna-app with the same `@expo/ui@57.0.7` — root cause is upstream in the SwiftUI Menu + Host measurement path, not in ui-kraken. Workaround: consumers who need pixel-perfect vertical rhythm on long iOS pages opt into `showBorderIOS` (framed mode absorbs the SwiftUI padding via `minHeight: 48` + centering). Documented in the component README under **Known issues**. Full documentation of the debugging trail lives there.

## How to extend

- **Add wheel appearance** as a `variant="wheel"` prop if a date-style use case emerges.
- **Add `renderItem` slot** if @expo/ui ever exposes one.
- **Open the upstream `@expo/ui` issue** for the borderless-off-screen measurement bug; once fixed there, our workaround note in the README can be removed.
