# SelectBottomSheet — design record

**Status:** shipped on 2026-07-25 as part of [`COMPONENTS-BATCH-2-PLAN.md`](./COMPONENTS-BATCH-2-PLAN.md) Phase A. Sibling of [`Select`](./SELECT-PLAN.md) (pure JS Modal) and [`SelectNative`](./SELECT-NATIVE-PLAN.md) (via `@expo/ui`).

---

## Overview

Single-choice picker with a draggable bottom-sheet popup. Same controlled prop shape as `Select`, but the popup slides up from the bottom, can be dismissed by dragging down or tapping the backdrop, and supports configurable snap points.

Best for: filter selection on tablet layouts, form pickers where a modal would feel too heavy, action pickers on long-scroll screens where the trigger might be near the bottom edge and a centered modal would feel disconnected.

**Locked decisions:**

- **Peer deps are `@gorhom/bottom-sheet` + `react-native-gesture-handler` (both optional)**. When either is missing, the trigger renders an "install X, Y" hint listing only the packages that are actually missing. App does NOT crash; trigger is marked `disabled` for a11y.
- **Requires `BottomSheetModalProvider` from the consumer** at the app root. Documented in the README; not auto-mounted from `UIKitProvider` in v1 to avoid taking on the peer dep transitively.
- **Own color block**: `selectBottomSheetColors` — 15 slots. Mirrors `selectColors` (16 slots) minus the modal-chrome triplet, replaced by a sheet-chrome triplet: `sheetBackground` (panel), `sheetHandle` (drag bar), `optionSelectedBackground` (row highlight). Kept as a separate block per the "each component owns its color space" rule.
- **Snap points default to `["50%"]`** — enough for ~6-8 options without scroll. Consumers can pass any snap-point array supported by `@gorhom/bottom-sheet`.
- **Drag-down to close is always on** — matches the affordance every native bottom sheet uses. No prop to disable it in v1.
- **`disabledOptions` supported** — same shape as `Select`.
- **`sheetTitle?: string`** — optional bold title at the top of the sheet, above the option list. Present when set, omitted otherwise.
- **Value type is `string`** — same as `Select`. Numeric values require `SelectNative`.
- **Extends `YStack`** — same column layout as Select / MultiSelect / RadioGroup.
- **A11y**: trigger `accessibilityRole="combobox"` with expanded/disabled state; options `accessibilityRole="menuitem"` with selected/disabled state.

## API

```ts
export interface SelectBottomSheetOption<Value extends string = string> {
  value: Value;
  label: string;
}

export type SelectBottomSheetColorsInput = Partial<SelectBottomSheetColors>;
export type SelectBottomSheetSnapPoint = string | number;

export interface SelectBottomSheetProps<Value extends string = string> extends Omit<
  GetProps<typeof StyledSelectBottomSheet>,
  "children" | "onChange"
> {
  options: SelectBottomSheetOption<Value>[];
  value: Value | null;
  onChange: (value: Value) => void;
  label?: string;
  helperText?: string;
  errorText?: string;
  placeholder?: string; // default: "Select…"
  sheetTitle?: string;
  disabled?: boolean;
  disabledOptions?: Value[];
  snapPoints?: SelectBottomSheetSnapPoint[]; // default: ["50%"]
  radius?: SelectBottomSheetRadius;
  selectBottomSheetColors?: SelectBottomSheetColorsInput;
  testID?: string;
}
```

### Sub-element testIDs

- root: `"select-bottom-sheet"` (overridable)
- label: `"{root}-label"` (when `label` set)
- trigger: `"{root}-trigger"`
- trigger text (when peers available): `"{root}-trigger-text"`
- helper text: `"{root}-helper-text"` (when set + no error)
- error text: `"{root}-error-text"` (when set)
- sheet modal (when peers available): `"{root}-sheet"`
- sheet title: `"{root}-sheet-title"` (when `sheetTitle` set)
- each option: `"{root}-option-{value}"`
- each option's label: `"{root}-option-{value}-label"`
- missing-peer hint: `"{root}-missing-peer"` (when peers NOT available)

## Token schema

`selectBottomSheetColors` on `Tokens`. 15 slots:

```ts
export interface SelectBottomSheetColors {
  // Trigger chrome (9)
  background: string;
  backgroundDisabled: string;
  border: string;
  borderFocused: string; // painted while the sheet is open
  borderError: string;
  text: string;
  textDisabled: string;
  placeholder: string;
  chevron: string;
  // Surrounding labels (3)
  label: string;
  helperText: string;
  errorText: string;
  // Sheet chrome (3)
  sheetBackground: string;
  sheetHandle: string;
  optionSelectedBackground: string;
}
```

## File structure

```
packages/ui-kraken/src/components/select-bottom-sheet/
├── select-bottom-sheet.tsx           # component logic + peer-dep gate + sheet render
├── select-bottom-sheet.styled.ts     # StyledSelectBottomSheet + trigger / label / helper / error / title / option / chevron / missingPeer
├── select-bottom-sheet-types.ts      # SelectBottomSheetOption / Props / Radius / SnapPoint
├── gorhom-probe.ts                   # try/catch require('@gorhom/bottom-sheet' + 'react-native-gesture-handler')
├── gorhom-probe.spec.ts              # isolated-module tests
├── select-bottom-sheet.spec.tsx      # unit tests (~42 tests, 97% coverage)
├── select-bottom-sheet.stories.tsx   # Storybook
├── README.md
└── index.ts
```

## Testing

42 behavioral tests + 4 snapshots. Highlights:

- All the label / helperText / errorText mount toggles.
- Trigger border swap (default / focused / error).
- Trigger + sheet paint from the palette (all key slots).
- Picking an option fires onChange + closes sheet.
- disabledOptions gate individual rows (both a11y + press-handler).
- Peer-available branch renders `-trigger-text` + `-sheet`; peer-missing branch renders `-missing-peer` hint + disabled trigger.
- Provider palette propagation + per-instance override.
- Dark palette via activeTheme='dark'.
- Radius parametrized.
- YStack pass-through.

## Storybook

11 stories: Default, Preselected, WithLabel, WithHelperText, WithErrorText, WithSheetTitle, CustomSnapPoint, Disabled, CustomColors, DarkTheme, plus a compact snap-point variant.

## Example app screen

`apps/example/app/(pages)/components/select-bottom-sheet.tsx` — 10 sections covering every prop combination. The example app's `_layout.tsx` mounts `GestureHandlerRootView` + `BottomSheetModalProvider` at the root so the sheet actually presents on device.

## Non-goals

- **No dynamic sizing** (`enableDynamicSizing`) in v1 — snap points are the only way to control height. Add later if the picker's height needs to fit-to-content.
- **No searchable option list** — same stance as `Select`.
- **No keyboard-behavior prop** — the picker doesn't take input focus, so keyboard-avoidance is a non-issue for the common case.
- **No auto-mounting of `BottomSheetModalProvider`** — consumers mount it themselves. Auto-mounting would force ui-kraken to depend transitively on `@gorhom/bottom-sheet` in `UIKitProvider`, which defeats the "optional peer" goal.

## Peer-dep pitfalls

- **Duplicate `react-native-gesture-handler`** breaks gorhom silently on device. If both `packages/*/node_modules/react-native-gesture-handler` and the root's hoisted copy exist, the trigger will react to taps but the sheet won't appear. Keep `react-native-gesture-handler` OUT of the library's `devDependencies` — the peer-dep probe uses `jest.doMock` in tests instead of the real package.

## How to ship

Executed on branch `feat/duna-migration-batch-2`:

1. Token schema wiring.
2. Peer-dep probe + component files + spec + stories + README.
3. Example screen + Stack.Screen + components-home row.
4. `BottomSheetModalProvider` + `GestureHandlerRootView` mounted at the example app root.
5. Flip status here + on the Batch 2 plan doc.
6. Add `.changeset/*.md`.
7. Verify green (819 total tests, coverage thresholds met).
8. Atomic commit with rich body.

## How to extend

- **Add `enableDynamicSizing?: boolean`** for fit-to-content sheets.
- **Add `keyboardBehavior?`** prop for pickers embedded near text inputs.
- **Add `bottomInset?: number`** to lift the sheet above tab bars / floating buttons.
- **Add `variant="fullscreen"`** — a snap-point preset that opens to `["95%"]` for very long lists.
