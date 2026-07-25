# components-batch-1 — initiative plan

**Status:** in progress, targeted for ui-kraken v0.8.0.

Living design doc for the first bundled batch of components shipping in a single release. Kept post-shipping so future contributors can see which components were adopted together and which were deliberately deferred.

---

## Overview

Batch of general-purpose components shipping together in v0.8.0 to broaden the kit's coverage of common Expo / React Native surfaces (inputs, feedback, loading states, expandable sections, external links). Everything lands in a single PR — one commit per component, all on the same branch — bundled with a `v0.8.0` minor changeset.

**Batch 1 scope: 11 components split into 3 phases.**

**Locked decisions:**

- **No `Icon` component ships in this batch**. Every component that needs an icon accepts it via a `ReactNode` prop (same pattern as `Button.leftIcon`, `Alert.icon`). Consumer brings their own icon library.
- **Optional peers for external deps**. Heavier dependencies (`expo-web-browser`) are declared in `peerDependenciesMeta` with `optional: true` — same pattern as `react-native-web` from v0.5.0. Consumers only install the deps for the components they use.
- **Naming aligned with industry standards** (Chakra / Mantine / shadcn / Radix conventions). See the component table below.
- **Each component owns its color block** (`each-component-owns-color-space` rule). No reuse of other components' palettes. Full provider-level + per-instance overrides.
- **Every component follows the `creating-component-tamagui` skill checklist** — 7 files per component (`.tsx`, `.styled.ts`, `-types.ts`, `.spec.tsx`, `.stories.tsx`, `README.md`, `index.ts`), structural snapshots, Storybook stories including a dark-theme story, Platform support table.

## Phases + component list

Ordered by complexity so the easiest ship first — no external deps, no icon slots — building up momentum. Each row lands as a separate atomic commit with its own `docs/{COMPONENT}-PLAN.md` design record.

### Phase A — Pure UI, no external deps, no icon slot (5 components)

| #   | Component      | 1-line                                                                                     | Plan doc                                                    | Status |
| --- | -------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------- | :----: |
| 1   | Input          | Single-line text input with label, helper text, error state, keyboard types.               | [`docs/INPUT-PLAN.md`](./INPUT-PLAN.md)                     |   ✅   |
| 2   | CurrencyInput  | Numeric input formatted as currency (`$` prefix, thousands separator, controlled numeric). | [`docs/CURRENCY-INPUT-PLAN.md`](./CURRENCY-INPUT-PLAN.md)   |   ✅   |
| 3   | Surface        | Theme-bound background container with elevation levels (Material-inspired).                | [`docs/SURFACE-PLAN.md`](./SURFACE-PLAN.md)                 |   ✅   |
| 4   | RefreshControl | Themed pull-to-refresh for `ScrollView` / `FlatList` (color-scheme-aware).                 | [`docs/REFRESH-CONTROL-PLAN.md`](./REFRESH-CONTROL-PLAN.md) |   ✅   |
| 5   | Skeleton       | Animated pulse placeholder for loading states (rectangle, circle, or arbitrary shape).     | [`docs/SKELETON-PLAN.md`](./SKELETON-PLAN.md)               |   ✅   |

### Phase B — Pure UI, no external deps, icon slot via prop (4 components)

| #   | Component    | 1-line                                                                                | Plan doc                                                | Status |
| --- | ------------ | ------------------------------------------------------------------------------------- | ------------------------------------------------------- | :----: |
| 6   | Hint         | Inline hint / tip row with optional leading icon and semantic tone.                   | [`docs/HINT-PLAN.md`](./HINT-PLAN.md)                   |   ✅   |
| 7   | StatCard     | Metric card with title, value, and optional delta indicator (up / down / neutral).    | [`docs/STAT-CARD-PLAN.md`](./STAT-CARD-PLAN.md)         |   ✅   |
| 8   | MultiSelect  | Chip-based multi-choice selector with wrap layout, generic in the value type.         | [`docs/MULTI-SELECT-PLAN.md`](./MULTI-SELECT-PLAN.md)   |   ⏳   |
| 9   | SocialButton | Button for OAuth providers (Google / Apple / etc.) — provider icon received via prop. | [`docs/SOCIAL-BUTTON-PLAN.md`](./SOCIAL-BUTTON-PLAN.md) |   ⏳   |

### Phase C — Optional external deps (2 components)

| #   | Component    | 1-line                                                                      | New optional peer                                                     | Plan doc                                                | Status |
| --- | ------------ | --------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------- | :----: |
| 10  | Collapsible  | Animated expand-collapse section with header + body, chevron slot via prop. | none (`react-native-reanimated` already a peer)                       | [`docs/COLLAPSIBLE-PLAN.md`](./COLLAPSIBLE-PLAN.md)     |   ⏳   |
| 11  | ExternalLink | Text / element that opens a URL in the platform browser. Router-agnostic.   | `expo-web-browser` (optional; falls back to RN `Linking` when absent) | [`docs/EXTERNAL-LINK-PLAN.md`](./EXTERNAL-LINK-PLAN.md) |   ⏳   |

**Status legend:** ⏳ planned · 🟡 in progress · ✅ shipped

## Design principles (applied to every component)

Codified in existing memories + skills. Reproduced here for quick reference:

- **Each component owns its color space** (`each-component-owns-color-space` memory) — new `<X>Colors` interface in `tokens/tokens-types.ts`, defaults + merge helper in `tokens/defaults/<x>.ts`, `flatten<X>Colors` in `utils/flatten.ts`, wired into `buildConfig()` + provider merge.
- **No comparisons in plan docs** (`component-plans-no-comparisons` memory) — every `docs/{COMPONENT}-PLAN.md` is a forward-looking design record.
- **Icons via `ReactNode` prop** — no internal `Icon` component ships in this batch. Consumers pass their own via `icon?: ReactNode` / `leftIcon?: ReactNode` etc.
- **English everywhere** — identifiers, comments, prop names, README content.
- **Deterministic testIDs** — every component prop interface includes `testID?: string`; root defaults to the component name in kebab-case; sub-elements derive as `{testID}-<part>`.
- **Structural snapshots required** for every visual component.
- **Storybook story per variant + one override + one dark-theme story**.
- **Platform support table in every README** (iOS · Android · Web).
- **Example app screen** for each: `apps/example/app/(pages)/components/<name>.tsx` + `Stack.Screen` in `_layout.tsx` (`headerBackTitle: "Components"`) + row in the components home with `status: "shipped"`.

## Deps policy

Following the optional-peer pattern from v0.5.0 (`react-native-web`):

- **Hard peers** (already declared): `react`, `react-native`, `react-native-reanimated`, `tamagui`.
- **New optional peer** this batch adds:
  - `expo-web-browser` — used by `ExternalLink`. Consumer installs only if they use the component. Falls back to RN `Linking.openURL` gracefully at runtime when the module is not present.
- **Considered but rejected**:
  - `expo-symbols` — was considered for `Collapsible`'s chevron. Replaced by a `chevron?: ReactNode` slot the consumer fills (same "icons via prop" rule). Zero new dep.

## Not shipping in this batch

Documented so future contributors know these were considered and deferred, not overlooked:

- **`Icon`** — no internal icon component ships in this batch. Consumers pass icons via `ReactNode` props (same pattern as `Button.leftIcon`, `Alert.icon`). Ships as its own initiative later, once we have consensus on the icon-library approach (SVG glyphs internal vs. `expo-symbols` vs. `lucide-react-native` as optional peer).
- **`Select`, `SegmentedControl`, `DatePicker`, `DateRangePicker`, `Toast`, `BottomSheet`, `ImagePickerSheet`, `ScreenContainer`** — each brings one or more heavier peer deps (`@expo/ui`, `@gorhom/bottom-sheet`, `@react-native-community/datetimepicker`, `sonner-native`, `expo-image-picker`, `date-fns`, `react-native-safe-area-context`). Deferred to `docs/COMPONENTS-BATCH-2-PLAN.md` (future initiative) so the batch-1 PR stays reviewable and consumers aren't forced to pull deps they don't need for the batch-1 set.

## How to ship

Per component, executed in this order:

1. **Cut plan doc** — `docs/{COMPONENT}-PLAN.md`, same shape as `BUTTON-PLAN` / `TYPOGRAPHY-PLAN` / `ALERT-PLAN` / `RADIO-GROUP-PLAN`. Forward-looking design record.
2. **Token schema wiring** (steps in [`creating-component-tamagui` Section 11](../.agents/skills/creating-component-tamagui/SKILL.md)) — types + defaults + flatten + provider merge + barrels.
3. **Component files** — `.tsx`, `.styled.ts`, `-types.ts`, `.spec.tsx` (targeted asserts + `describe("snapshots")` block), `.stories.tsx` (8-ish stories including dark theme), `README.md` (props table + usage + Platform support), `index.ts` (explicit named exports).
4. **Barrels updated** — `components/index.ts` + public `src/index.ts`.
5. **Example app** — new screen + Stack.Screen registration + components-home row flipped to `status: "shipped"`.
6. **Verify green** — `pnpm typecheck && pnpm -r lint && pnpm test && pnpm --filter ui-kraken build`.
7. **Flip status** in this doc — ⏳ → ✅ on the component's row.
8. **Commit atomic** — rich body per `rich-commits-and-prs` memory. One commit per component.

**When all 11 land:**

- One changeset `v0.8.0` minor bump covering everything.
- Public API additions: 11 new components + 11 new `<X>Colors` blocks on `Tokens` + 11 new `<X>ColorsInput` types on `TokensInput` + 1 new optional peer (`expo-web-browser`).
- Non-breaking on existing components (v0.7.0 API unchanged).
- PR handoff via `drafting-pr-descriptions` skill.

## How to extend

Post-launch, the natural next steps:

- **Batch 2** — `docs/COMPONENTS-BATCH-2-PLAN.md` covering `Select`, `SegmentedControl`, `DatePicker`, `Toast`, `BottomSheet`, etc. Each of those brings one or more heavier peer deps, so they belong in their own scoped release.
- **Icon component** — separate initiative. Ships once the icon-library approach is decided.
