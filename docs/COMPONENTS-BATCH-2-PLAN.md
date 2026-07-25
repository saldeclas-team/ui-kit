# Components — Batch 2 migration plan

**Status:** planned for ui-kraken v0.9.0. Continuation of the duna-app → ui-kraken migration; picks up the 8 components that Batch 1 deferred because each brings one or more heavier peer deps.

Branch: `feat/duna-migration-batch-2`.

Batch 1 (11 pure-UI primitives — Input, CurrencyInput, Surface, RefreshControl, Skeleton, Hint, StatCard, MultiSelect, SocialButton, Collapsible, ExternalLink) landed on `main` as `ui-kraken@0.8.0` (PRs #61 / #63). See [`COMPONENTS-BATCH-1-PLAN.md`](./COMPONENTS-BATCH-1-PLAN.md).

---

## Scope

Eight components across three phases. Every component ships with the same recipe as Batch 1: own color block on the token schema (13-step wiring), 100% test coverage, Storybook stories, README, live example page, atomic commit with rich body.

New for Batch 2: each component carries **at least one peer dependency** — the whole point of deferring these was so consumers who don't need them don't have to install them. Every peer is registered as `optional: true` in `packages/ui-kraken/peerDependenciesMeta`, and the component falls back gracefully (or gates behind a runtime check) when the peer isn't present.

### Phase A — Form controls (6 components)

| #   | Component         | 1-line                                                                     | Peer dep(s)                                                             | Plan doc                                                            | Status |
| --- | ----------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------- | :----: |
| 1   | Select            | Dropdown picker with pure-JS RN `Modal`. Generic in the value type.        | none (RN built-in `Modal`)                                              | [`docs/SELECT-PLAN.md`](./SELECT-PLAN.md)                           |   ✅   |
| 1a  | SelectNative      | Native single-choice picker via `@expo/ui` — SwiftUI Menu / Compose.       | `@expo/ui` (optional)                                                   | [`docs/SELECT-NATIVE-PLAN.md`](./SELECT-NATIVE-PLAN.md)             |   ✅   |
| 1b  | SelectBottomSheet | Single-choice picker with draggable bottom-sheet popup.                    | `@gorhom/bottom-sheet` + `react-native-gesture-handler` (both optional) | [`docs/SELECT-BOTTOM-SHEET-PLAN.md`](./SELECT-BOTTOM-SHEET-PLAN.md) |   ✅   |
| 2   | SegmentedControl  | Horizontal segmented picker — iOS-native affordance with Android fallback. | `@expo/ui` (or pure JS `Pressable` row)                                 | [`docs/SEGMENTED-CONTROL-PLAN.md`](./SEGMENTED-CONTROL-PLAN.md)     |   ⏳   |
| 3   | DatePicker        | Native date picker (iOS spinner / Android calendar). Controlled `Date`.    | `@react-native-community/datetimepicker`                                | [`docs/DATE-PICKER-PLAN.md`](./DATE-PICKER-PLAN.md)                 |   ⏳   |
| 4   | DateRangePicker   | Two-input range picker built on `DatePicker` (start + end).                | `@react-native-community/datetimepicker` (reused from #3)               | [`docs/DATE-RANGE-PICKER-PLAN.md`](./DATE-RANGE-PICKER-PLAN.md)     |   ⏳   |

### Phase B — Overlays & notifications (3 components)

| #   | Component        | 1-line                                                                             | Peer dep(s)                                                          | Plan doc                                                          | Status |
| --- | ---------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------- | :----: |
| 5   | Toast            | Transient notification stack. `Toast.show({...})` imperative API + provider mount. | `sonner-native`                                                      | [`docs/TOAST-PLAN.md`](./TOAST-PLAN.md)                           |   ⏳   |
| 6   | BottomSheet      | Draggable modal panel with snap points. Provider-based portal mount.               | `@gorhom/bottom-sheet` (+ `react-native-gesture-handler` transitive) | [`docs/BOTTOM-SHEET-PLAN.md`](./BOTTOM-SHEET-PLAN.md)             |   ⏳   |
| 7   | ImagePickerSheet | Bottom sheet that wraps `expo-image-picker` — camera / gallery / cancel actions.   | `expo-image-picker` + `@gorhom/bottom-sheet` (reused from #6)        | [`docs/IMAGE-PICKER-SHEET-PLAN.md`](./IMAGE-PICKER-SHEET-PLAN.md) |   ⏳   |

### Phase C — Layout (1 component)

| #   | Component       | 1-line                                                                                  | Peer dep(s)                      | Plan doc                                                      | Status |
| --- | --------------- | --------------------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------- | :----: |
| 8   | ScreenContainer | Safe-area-aware screen wrapper. Optional status-bar color + keyboard-avoiding behavior. | `react-native-safe-area-context` | [`docs/SCREEN-CONTAINER-PLAN.md`](./SCREEN-CONTAINER-PLAN.md) |   ⏳   |

---

## Peer-dependency strategy

Every peer dep added by Batch 2 is registered as optional. Consumers who don't use the corresponding component don't need to install it:

```jsonc
// packages/ui-kraken/package.json (target shape after Batch 2)
"peerDependencies": {
  "react": ">=18.2.0",
  "react-native": ">=0.74.0",
  "react-native-reanimated": ">=3.6.0",
  "react-native-web": ">=0.19.0",
  "tamagui": ">=1.100.0",
  "@expo/ui": "*",
  "@react-native-community/datetimepicker": "*",
  "sonner-native": "*",
  "@gorhom/bottom-sheet": "*",
  "expo-image-picker": "*",
  "expo-web-browser": "*",
  "react-native-safe-area-context": "*"
},
"peerDependenciesMeta": {
  "react-native-web": { "optional": true },
  "@expo/ui": { "optional": true },
  "@react-native-community/datetimepicker": { "optional": true },
  "sonner-native": { "optional": true },
  "@gorhom/bottom-sheet": { "optional": true },
  "expo-image-picker": { "optional": true },
  "expo-web-browser": { "optional": true },
  "react-native-safe-area-context": { "optional": true }
}
```

Each component uses the try / catch require pattern (same as `ExternalLink` from Batch 1) to detect availability at import time and either falls back to a JS-only implementation, gates the feature behind a runtime check, or throws a helpful error with install instructions.

## Provider surface additions

Two of the Batch 2 components need mounts on `UIKitProvider` to work — the imperative `Toast.show(...)` API needs a global stack render, and `BottomSheet` needs a portal host. Neither breaks the existing provider API; both are additive.

- **`Toast`** — the provider mounts a `<Toaster />` from `sonner-native` at the tree root. A new `<UIKitProvider toaster={{ position: "top", ... }}>` prop controls the mount config.
- **`BottomSheet`** — the provider mounts `<BottomSheetModalProvider>` at the tree root so `bottomSheetRef.current?.present()` works from anywhere.

Both mounts are conditional on the peer dep being installed (runtime check in the provider). Consumers who don't install `sonner-native` / `@gorhom/bottom-sheet` see no change to the provider — the mount just doesn't render.

## Wiring recipe (unchanged from Batch 1)

Every component follows the 13-step token schema recipe from Batch 1 (`[[duna-migration-batch-1-status]]` memory + the creating-component-tamagui SKILL § 11). New Batch 2 components add peer-dep detection on top:

1. Plan doc (`docs/{COMPONENT}-PLAN.md`).
2. Token schema wiring (types + defaults + flatten + provider + barrels).
3. Peer-dep probe (`try { require(...) } catch {}` in a helper file, same shape as ExternalLink's `open-url.ts`).
4. Component files: `{name}-types.ts` → `{name}.styled.ts` → `{name}.tsx` → `{name}.spec.tsx` → `{name}.stories.tsx` → `README.md` → `index.ts`.
5. Barrels: `components/index.ts` + `src/index.ts`.
6. Example: screen + `Stack.Screen` in `_layout.tsx` + row in components home. Verify with `grep` before commit.
7. Flip status here (⏳ → ✅).
8. **Changeset** (`.changeset/*.md` — required, see [[changeset-required-for-ui-kraken]]).
9. Atomic commit with rich body.

## Non-goals for Batch 2

- **No `Calendar` / `Agenda` / `MonthGrid`** — those are for a hypothetical `react-native-calendars`-based Batch 3. `DateRangePicker` uses two separate `DatePicker` popovers, not a calendar grid.
- **No `Menu` / `Popover` / `Dropdown`** — needs an anchor-positioning primitive we don't have yet. Deferred.
- **No `Modal` primitive** — RN's built-in `Modal` and `BottomSheet` cover the current use cases.
- **No `Tabs` / `TabView`** — needs `react-native-tab-view` or similar; deferred.
- **No `ProgressBar` / `Slider`** — pure UI, would fit Batch 1's philosophy but weren't in the duna-app source set. Add if duna-app grows a need.

## How to close out Batch 2

- Same pattern as Batch 1: land all 8 components as their own commits on `feat/duna-migration-batch-2`; ONE PR to `main` when all 8 land.
- Every commit includes its `.changeset/*.md` — no more forgetting like Batch 1 did (`ui-kraken@0.8.0` had to be rescued by a follow-up chore PR).
- PR handoff per [[pr-handoff-after-initiative]] — title + body summarizing the 8-component migration + the new peer-dep surface.
- Version bump: **minor** (`0.8.0` → `0.9.0`) — additive components, additive optional peers, zero breaking changes to existing exports.
