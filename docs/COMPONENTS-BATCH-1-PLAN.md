# duna-migration-batch-1 — initiative plan

**Status:** in progress, targeted for ui-kraken v0.8.0.

Living design doc for the first batch of components migrated from the maintainer's other Expo app (duna-app) into ui-kraken. Kept post-shipping so future contributors can see which components were adopted, when, why, and which were deliberately deferred.

---

## Overview

duna-app is the first real consumer of ui-kraken. It has ~30 in-house UI components that predate the library. This initiative pulls the reusable ones — general-purpose, non-domain-specific, self-contained — into ui-kraken so duna-app can drop its `src/ui-kit/` and import from `ui-kraken` instead.

**Batch 1 scope: 11 components split into 3 phases.** Everything ships in a single PR (one commit per component, all on `feat/duna-migration-batch-1`), bundled with a `v0.8.0` minor changeset.

**Locked decisions:**

- **No `Icon` component ships in this batch**. Every component that needs an icon accepts it via a `ReactNode` prop (same pattern as `Button.leftIcon`, `Alert.icon`). Consumer brings their own icon library.
- **Optional peers for external deps**. Heavier dependencies (`expo-symbols`, `expo-web-browser`) are declared in `peerDependenciesMeta` with `optional: true` — same pattern as `react-native-web` from v0.5.0. Consumers only install the deps for the components they use.
- **Renames aligned with industry standards** (Chakra / Mantine / shadcn / Radix conventions) — see the rename table below. Not preserving duna's internal naming.
- **Each component owns its color block** (`each-component-owns-color-space` rule). No reuse of other components' palettes. Full provider-level + per-instance overrides.
- **Every component follows the `creating-component-tamagui` skill checklist** — 7 files per component (`.tsx`, `.styled.ts`, `-types.ts`, `.spec.tsx`, `.stories.tsx`, `README.md`, `index.ts`), structural snapshots, Storybook stories including a dark-theme story, Platform support table.

## Rename table (duna → ui-kraken)

Not preserving `TextField` / `HintRow` / `ThemedView` naming — industry conventions win.

| Duna name         | ui-kraken name       | Rationale                                                                                                                  |
| ----------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `text-field`      | **`Input`**          | Universal (Chakra, Mantine, shadcn all use it). Also matches RN's own `TextInput`. `TextField` reads Material-specific.    |
| `money-input`     | **`CurrencyInput`**  | "Currency" is precise (supports any denomination). "Money" is casual. `react-currency-input-field` in web space uses this. |
| `multi-select`    | **`MultiSelect`**    | Universal.                                                                                                                 |
| `social-button`   | **`SocialButton`**   | Accurate. Provider icons (Google / Apple) come in via prop.                                                                |
| `stat-card`       | **`StatCard`**       | Descriptive. Delta indicator (up/down arrow) comes in via prop.                                                            |
| `hint-row`        | **`Hint`**           | Clean noun, no need for `-row` differentiator that came from duna's internal namespacing.                                  |
| `themed-view`     | **`Surface`**        | Material-Design term for a theme-bound background with elevation levels. Richer than "themed view".                        |
| `refresh-control` | **`RefreshControl`** | Matches RN's `RefreshControl` naming exactly.                                                                              |
| `skeleton`        | **`Skeleton`**       | Universal.                                                                                                                 |
| `collapsible`     | **`Collapsible`**    | Standard (Radix, shadcn). Header chevron comes in via prop (or drops entirely; decided during implementation).             |
| `external-link`   | **`ExternalLink`**   | Self-documenting. Redesigned WITHOUT `expo-router` — only `expo-web-browser` (or falls back to RN `Linking.openURL`).      |

## Phases + component list

Ordered by complexity so the easiest ship first — no external deps, no icon slots — building up momentum. Each row lands as a separate atomic commit with its own `docs/{COMPONENT}-PLAN.md` design record.

### Phase A — Pure UI, no external deps, no icon slot (5 components)

| #   | Component      | Plan doc                                                    | Status |
| --- | -------------- | ----------------------------------------------------------- | :----: |
| 1   | Input          | [`docs/INPUT-PLAN.md`](./INPUT-PLAN.md)                     |   ⏳   |
| 2   | CurrencyInput  | [`docs/CURRENCY-INPUT-PLAN.md`](./CURRENCY-INPUT-PLAN.md)   |   ⏳   |
| 3   | Surface        | [`docs/SURFACE-PLAN.md`](./SURFACE-PLAN.md)                 |   ⏳   |
| 4   | RefreshControl | [`docs/REFRESH-CONTROL-PLAN.md`](./REFRESH-CONTROL-PLAN.md) |   ⏳   |
| 5   | Skeleton       | [`docs/SKELETON-PLAN.md`](./SKELETON-PLAN.md)               |   ⏳   |

### Phase B — Pure UI, no external deps, has icon slot via prop (4 components)

| #   | Component    | Plan doc                                                | Status |
| --- | ------------ | ------------------------------------------------------- | :----: |
| 6   | Hint         | [`docs/HINT-PLAN.md`](./HINT-PLAN.md)                   |   ⏳   |
| 7   | StatCard     | [`docs/STAT-CARD-PLAN.md`](./STAT-CARD-PLAN.md)         |   ⏳   |
| 8   | MultiSelect  | [`docs/MULTI-SELECT-PLAN.md`](./MULTI-SELECT-PLAN.md)   |   ⏳   |
| 9   | SocialButton | [`docs/SOCIAL-BUTTON-PLAN.md`](./SOCIAL-BUTTON-PLAN.md) |   ⏳   |

### Phase C — Optional external deps (2 components)

| #   | Component    | Plan doc                                                | New optional peer                                                     | Status |
| --- | ------------ | ------------------------------------------------------- | --------------------------------------------------------------------- | :----: |
| 10  | Collapsible  | [`docs/COLLAPSIBLE-PLAN.md`](./COLLAPSIBLE-PLAN.md)     | none (Reanimated already peer)                                        |   ⏳   |
| 11  | ExternalLink | [`docs/EXTERNAL-LINK-PLAN.md`](./EXTERNAL-LINK-PLAN.md) | `expo-web-browser` (optional; falls back to RN `Linking` when absent) |   ⏳   |

**Status legend:** ⏳ planned · 🟡 in progress · ✅ shipped

## Design principles (applied to every component)

Codified in existing memories + skills. Reproduced here for quick reference:

- **Each component owns its color space** ([`each-component-owns-color-space`](../.claude/…)) — new `<X>Colors` interface in `tokens/tokens-types.ts`, defaults + merge helper in `tokens/defaults/<x>.ts`, `flatten<X>Colors` in `utils/flatten.ts`, wired into `buildConfig()` + provider merge.
- **No comparisons in plan docs** ([`component-plans-no-comparisons`](../.claude/…)) — every `docs/{COMPONENT}-PLAN.md` is a forward-looking design record. No inventory/keep/change tables comparing the duna source.
- **Icons via `ReactNode` prop** — no internal `Icon` component ships in this batch. Consumers pass their own via `icon?: ReactNode` / `leftIcon?: ReactNode` etc.
- **English everywhere** — identifiers, comments, prop names, README content. Test strings can use "Sí / No" as example data but nothing that ships in the package surface.
- **Deterministic testIDs** — every component prop interface includes `testID?: string`; root defaults to the component name in kebab-case; sub-elements derive as `{testID}-<part>`.
- **Structural snapshots required** for every visual component.
- **Storybook story per variant + one override + one dark-theme story**.
- **Platform support table in every README** (iOS · Android · Web).
- **Example app screen** for each: `apps/example/app/(pages)/components/<name>.tsx` + `Stack.Screen` in `_layout.tsx` (`headerBackTitle: "Components"`) + row in the components home with `status: "shipped"`.

## Deps policy

Following the `react-native-web` optional-peer pattern from v0.5.0:

- **Hard peers** (already declared): `react`, `react-native`, `react-native-reanimated`, `tamagui`.
- **New optional peers** this batch adds:
  - `expo-web-browser` — used by `ExternalLink`. Consumer installs only if they use the component. Falls back to RN `Linking.openURL` gracefully at runtime when the module is not present.
- **NOT adding as peers** (v1 design decisions):
  - `expo-symbols` — was considered for `Collapsible`'s chevron. Replaced by a `chevron?: ReactNode` slot the consumer fills (same "icons via prop" rule). Zero new dep.
  - `date-fns`, `sonner-native`, `@gorhom/bottom-sheet`, `@expo/ui`, `expo-image-picker`, `@react-native-community/datetimepicker`, `lucide-react-native` — all Tier 3 components deferred to a future batch (not this initiative).

## Not migrating (deliberate)

Documented so future contributors know these were considered and skipped, not overlooked:

| duna-app source                                                                                                                      | Reason                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `alert`, `button`, `radio-group`, `typography`                                                                                       | ui-kraken already ships them (v0.6.0 / v0.2.0 / v0.7.0 / v0.3.0 respectively).                             |
| `animated-icon`                                                                                                                      | duna's splash overlay + logo entrance. App-specific chrome, not a reusable primitive.                      |
| `coming-soon`                                                                                                                        | Placeholder screen for gated features in duna's phased rollout. App-specific state.                        |
| `day-row`                                                                                                                            | Finance-specific row (income / expense breakdown with hardcoded Spanish labels). Not generic.              |
| `plan-feature-row`                                                                                                                   | Subscription / paywall row. Tied to duna's plan concept.                                                   |
| `web-badge`                                                                                                                          | duna Expo-version branding on the web target. App-specific.                                                |
| `feedback-state`                                                                                                                     | Folder exists but no main component file found by the survey. Skipping until source is clarified.          |
| `icon`                                                                                                                               | Deliberate — no internal `Icon` component ships in this batch. Consumers pass icons via `ReactNode` props. |
| `bottom-sheet`, `date-picker`, `date-range-picker`, `image-picker-sheet`, `screen-container`, `segmented-control`, `select`, `toast` | Tier 3 (heavier deps). Deferred to `duna-migration-batch-2` in a future initiative.                        |

## How to ship

Per component, executed in this order:

1. **Cut plan doc** — `docs/{COMPONENT}-PLAN.md`, same shape as `BUTTON-PLAN` / `TYPOGRAPHY-PLAN` / `ALERT-PLAN` / `RADIO-GROUP-PLAN`. Forward-looking design record, no comparisons with duna source.
2. **Token schema wiring** (steps in [`creating-component-tamagui` Section 11](../.agents/skills/creating-component-tamagui/SKILL.md)) — types + defaults + flatten + provider merge + barrels.
3. **Component files** — `.tsx`, `.styled.ts`, `-types.ts`, `.spec.tsx` (targeted asserts + `describe("snapshots")` block), `.stories.tsx` (8-ish stories including dark theme), `README.md` (props table + usage + Platform support), `index.ts` (explicit named exports).
4. **Barrels updated** — `components/index.ts` + public `src/index.ts`.
5. **Example app** — new screen + Stack.Screen registration + catalog row flipped to `status: "shipped"`.
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

- **Batch 2** (Tier 3 components) — `docs/DUNA-MIGRATION-BATCH-2-PLAN.md` covering `Select`, `SegmentedControl`, `DatePicker`, `Toast`, `BottomSheet`, etc. Each of those brings 1+ heavier peer dep.
- **Icon component** — separate initiative. Ships once we have consensus on the icon-library approach (SVG glyphs internal vs. `expo-symbols` vs. `lucide-react-native` as optional peer).
- **Consumer migration** — duna-app updates to `import { ... } from "ui-kraken"` and drops `src/ui-kit/`. Not part of this repo's PR; happens on duna-app's side once v0.8.0 is on npm.
