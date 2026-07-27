# ui-kraken — Project plan

Living document. Update it as decisions land or shift.

---

## 1. Locked decisions

| Area                 | Decision                                               | Notes                                                                                                                                                                                                                                                                                                            |
| -------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| npm package name     | `ui-kraken`                                            | Available on npm as of 2026-07-23. Unscoped.                                                                                                                                                                                                                                                                     |
| Target platforms     | iOS + Android + Web (Expo)                             | Web via `react-native-web` optional peer, landed 2026-07-24 as Phase 2 of the testing-quality initiative to unlock Chromatic. See [`REACT-NATIVE-WEB-PLAN.md`](./REACT-NATIVE-WEB-PLAN.md). Reversed the v1 "no web support" decision — motivations ranked: (1) unlocks Chromatic, (2) real consumer capability. |
| Repo layout          | pnpm workspaces monorepo                               | `packages/ui-kraken` (the lib) + `apps/example` (Expo showcase + Storybook host).                                                                                                                                                                                                                                |
| Package manager      | pnpm 11 via corepack                                   | `.npmrc` sets `node-linker=hoisted` because Metro cannot resolve pnpm's default isolated layout.                                                                                                                                                                                                                 |
| Language             | TypeScript, `strict: true`                             | `noUncheckedIndexedAccess` also on. Base config lives in `tsconfig.base.json`.                                                                                                                                                                                                                                   |
| Styling engine       | [Tamagui](https://tamagui.dev/) v2                     | Provides the token schema, the `<Provider>`, variants, and animation glue.                                                                                                                                                                                                                                       |
| Animations           | `react-native-reanimated` v4 as `peerDependency`       | Reanimated 4 requires the new architecture — Expo SDK 57 has it on by default.                                                                                                                                                                                                                                   |
| Component paradigm   | Fully-styled with variants                             | e.g. `<Button variant="primary">`. Full customization via a central provider + per-instance props. Exact schema is decided when we design the first component (Button).                                                                                                                                          |
| Storybook            | On-device via `@storybook/react-native` v10            | Toggled through the `STORYBOOK_ENABLED` env var (`withStorybook` wrapper in `apps/example/metro.config.js`). Zero Storybook code in the production bundle when the flag is unset.                                                                                                                                |
| Docs                 | README + on-device Storybook                           | No standalone Docusaurus site in v1.                                                                                                                                                                                                                                                                             |
| Testing              | Jest + `@testing-library/react-native`                 | Preset: `jest-expo`. Coverage threshold 80% enforced in `packages/ui-kraken/jest.config.js`.                                                                                                                                                                                                                     |
| Linter / formatter   | ESLint 9 (flat config) + Prettier 3                    | Single config at repo root, picked up by every workspace.                                                                                                                                                                                                                                                        |
| Commit convention    | Conventional Commits                                   | Enforced by commitlint (husky `commit-msg` hook).                                                                                                                                                                                                                                                                |
| Pre-commit           | husky + lint-staged                                    | Runs ESLint --fix and Prettier on staged files only.                                                                                                                                                                                                                                                             |
| Versioning / release | [Changesets](https://github.com/changesets/changesets) | `apps/example` is in the `ignore` list; only `packages/ui-kraken` publishes.                                                                                                                                                                                                                                     |
| CI                   | GitHub Actions                                         | `ci.yml` (lint · typecheck · test · build) on every PR; `release.yml` on `main` opens the version PR or publishes to npm.                                                                                                                                                                                        |
| License              | MIT                                                    | © saldeclas-team.                                                                                                                                                                                                                                                                                                |

---

## 2. Open decisions

These are called out explicitly so we can debate them when the moment arrives. Do NOT decide them until the linked trigger happens.

### ~~2.1 `UIKitProvider` wrapper vs. exposing `TamaguiProvider` directly~~ — **RESOLVED**

**Decision:** ship a thin `UIKitProvider` wrapper (Approach C from the design workflow).

The provider mounts `TamaguiProvider` + `PortalProvider` + a small `UIKitContext`. It accepts the coarse token schema natively and derives the full Tamagui config via `buildConfig()` inside `useMemo`. It also exposes `useUIKit()` which returns `{ tokens, tamaguiConfig }` — the raw Tamagui config is intentionally reachable so power users hitting the abstraction ceiling can drop down without ejecting the library.

Why C won (23/25) over A (20/25, no wrapper) and B (18/25, opinionated full wrapper): C satisfies the coarse-token DX with per-instance overrides that flow semantically, keeps the surface small for fast iteration, and preserves a real escape hatch to Tamagui. A forced a breaking migration the moment we ship Sheet/Toast; B hid Tamagui from power users.

### ~~2.2 Token schema shape~~ — **RESOLVED (revised 2026-07-24)**

**Decision:** tokens are **per-component**, not global. The concept of a single `primaryColor: string` was abandoned — different components have different color surfaces and should be tuned independently.

```ts
export interface ButtonVariantColors {
  background?: string; // filled by primary / secondary / destructive
  label: string;
  border?: string; // filled by outline
}

export interface ButtonColors {
  primary: ButtonVariantColors;
  secondary: ButtonVariantColors;
  outline: ButtonVariantColors;
  ghost: ButtonVariantColors;
  destructive: ButtonVariantColors;
}

export interface Tokens {
  buttonColors: ButtonColors;
  // Future minors add textColors, cardColors, inputColors — same pattern.
  radius: number;
  spacing: number;
}
```

`coarseToFineTokens(tokens: Tokens): ResolvedTokens` is exported as a pure function. Tamagui tokens land as `$uiButtonPrimaryBackground`, `$uiButtonPrimaryLabel`, `$uiButtonOutlineBorder`, etc. — flat naming, one token per slot.

Per-instance overrides on the component reuse the same shape but scoped to the variant already selected (see AGENTS.md).

Defaults ship for both themes: `DEFAULT_TOKENS` (light) and `DEFAULT_DARK_TOKENS` (dark). Consumers who don't override anything get a working Blue-600 palette out of the box.

### ~~2.3 First component~~ — **RESOLVED (revised 2026-07-24)**

**Decision:** `Button` ships in v0.2.0 with **five** tones.

- Compound API: `Button.Primary`, `Button.Secondary`, `Button.Outline`, `Button.Ghost`, `Button.Destructive`. `outline` has a border, `ghost` is text-only (no background, no border).
- Default export `Button` maps to `Button.Primary` so `<Button>Save</Button>` works for the 80% case.
- Sizes: `sm`, `md`, `lg`. States: `disabled`, `loading` — both apply `opacity: 0.45`; no separate color slot.
- Radius: prop `radius?: number | "none" | "sm" | "md" | "lg" | "pill"` — number is raw px, preset name maps to the theme scale (`$uiRadius{Sm|Md|Lg}`), `"pill"` is 9999.
- Slots: `leftIcon`, `rightIcon` (both `ReactNode`).
- Per-instance color override: `buttonColors?: Partial<{ background?, label, border? }>` — variant is implicit (`Button.Primary` already picked the variant).
- `testID` propagates to `label`, `left-icon`, `right-icon`, `loader` subelements.

### 2.4 Icon library — still open

**Trigger:** first component that needs an actual icon (not just a slot).

Current stance: components accept `ReactNode` slots (`leftIcon`, `rightIcon`) — consumer brings their own icon system. Not adding a dependency in v0.x.

### ~~2.5 Portal host / overlay stack~~ — **RESOLVED** (implicitly by §2.1)

`UIKitProvider` mounts `PortalProvider` from Tamagui out of the box, so future `Sheet` / `Dialog` land non-breakingly. (Toast was originally planned here but dropped — see [`COMPONENTS-BATCH-2-PLAN.md`](./COMPONENTS-BATCH-2-PLAN.md) for the rationale.)

### 2.6 Deferred to later versions

Decided during the v0.2.0 design; documented so we don't relitigate:

- ~~**Dark mode:** v0.2.x will add an optional `dark?: Partial<Tokens>` prop on `UIKitProvider`.~~ **Landed in v0.2.0.** `UIKitProvider` accepts `dark?: TokensInput` and `defaultTheme: "light" | "dark" | "system"`. Ships `DEFAULT_DARK_TOKENS`.
- **Text component + font-family token:** ships with the `Text` component in v0.2.x. v0.2.0 inherits `@tamagui/config/v4`'s default fonts.
- **`rgb()` / named color inputs:** v0.2.0 accepts hex only (documented in JSDoc). Parser dep deferred until a real consumer asks.
- **`setTokens` runtime hook:** not shipping. Remount `UIKitProvider` with new props to change theme.
- **`tamaguiConfig` full-escape-hatch prop:** not shipping. `useUIKit()` covers 90% of escape-hatch use cases already.
- **Auto-contrast helper:** `pickContrastText()` is NOT auto-applied. Exposed as a utility for consumers who want to opt in.

### 2.7 Form validation library (future)

**Trigger:** first form component (`Input`, `Select`, `Checkbox`, ...).

Locked convention (AGENTS.md): consumers use `react-hook-form` + `zod`. ui-kraken form components will expose controlled/uncontrolled patterns compatible with RHF. Not adding a hard peer dep until the shape settles.

---

## 3. Known technical risks

| #   | Risk                                                                                                         | Why it matters                                                                                                                                                                                                                                                                                                                                                         | Mitigation                                                                                                                                                                                                                                                                   |
| --- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | Expo SDK 57 + RN 0.86 + Reanimated 4 are bleeding-edge (Q3 2025)                                             | Some libraries in the Tamagui/RN ecosystem may not have caught up. Metro / new arch issues possible.                                                                                                                                                                                                                                                                   | Pin exact versions in `apps/example`. If we hit blockers we can downgrade to SDK 56 without changing the lib API.                                                                                                                                                            |
| R2  | Tamagui compiler not enabled in `apps/example`                                                               | Runtime style resolution is slower on first render. Fine for a showcase; not fine if we ever publish a real app from here.                                                                                                                                                                                                                                             | Add `@tamagui/babel-plugin` when we start caring about production perf.                                                                                                                                                                                                      |
| R3  | Storybook on-device v10 has strict peer requirements                                                         | Metro cannot resolve `@storybook/react` unless it is a **direct** devDep of the app (transitive resolution through pnpm's hoisted layout is not enough). The peers also pin `react-native-reanimated` and `react-native-safe-area-context` to **exact** versions, not ranges. If Expo bumps either one in a template, Storybook will refuse to boot.                   | `apps/example/package.json` declares `storybook`, `@storybook/react` and `@gorhom/bottom-sheet` explicitly, and pins reanimated / safe-area-context to the exact versions Storybook expects. On any Storybook RN bump, re-check its `peerDependencies` and mirror them here. |
| R3b | `@storybook/react-native` ships TWO `withStorybook` wrappers with the same export name at different subpaths | `@storybook/react-native/withStorybook` (legacy) auto-swaps `expo-router/entry` for `.rnstorybook/index.tsx` at the Metro resolver level, which prevents `registerRootComponent` from ever running — the app crashes with `"main" has not been registered`. `@storybook/react-native/metro/withStorybook` (newer) only tweaks the resolver and leaves the entry alone. | Always import from the `/metro/` subpath: `require("@storybook/react-native/metro/withStorybook")`. Handle the app-vs-storybook toggle inside Expo Router (`Stack.Protected` + `unstable_settings.initialRouteName`).                                                        |
| R4  | pnpm hoisted linker required for Metro                                                                       | Without it, Metro cannot resolve subpackages that libraries re-export (Tamagui has ~110 `@tamagui/*` subpackages, Storybook re-exports `@storybook/react/entry-preview-argtypes`, etc.). We give up some of pnpm's isolation guarantees.                                                                                                                               | Set `nodeLinker: hoisted` in `pnpm-workspace.yaml`. **In pnpm 11 this setting moved out of `.npmrc`** — the old `node-linker=hoisted` line is silently ignored, so anyone bumping pnpm must migrate.                                                                         |
| R5  | Tamagui 2.x uses React 19; some 3rd-party RN libs still expect React 18                                      | Peer-dep warnings, potential subtle hook mismatches.                                                                                                                                                                                                                                                                                                                   | `strict-peer-dependencies=false` in `.npmrc`, watch install output.                                                                                                                                                                                                          |

---

## 4. Roadmap

### v0.1 — first component

- Decide 2.1 (UIKitProvider vs direct) and 2.2 (token schema).
- Ship `Button` with `variant`, `size`, `disabled`, `loading` and per-instance color overrides.
- Story + unit tests + a11y (accessibilityRole, hitSlop, `accessibilityState`).
- Update README with the "hello Button" example.
- First npm publish (`0.1.0`).

### v0.2 — the essentials

Order TBD; probably:

- ~~`Text` / typography scale~~ — **Shipped in v0.3.0** (2026-07-24). 13 HTML-familiar variants (`h1`–`h6`, `subtitle1/2`, `body1/2`, `caption`, `overline`, `label`), 14 semantic color slots grouped hierarchy/semantic/on-\*, `intensity="subtle|normal|strong"`, `color` accepts slot name OR raw hex/rgb, RN Text + Tamagui style props flow through, compound API (`Text.H1`, …).
- `Input` (single-line + multi-line)
- `Card`
- `Stack` / `Row` / `Column` (thin wrappers over Tamagui `XStack` / `YStack` with ui-kraken tokens)
- `Icon` slot conventions (see 2.4)

### v0.3 — layout & feedback

- `Avatar`
- `Badge`
- `Divider`
- `Spinner`
- ~~`Toast` (needs 2.5)~~ — dropped from scope; use `sonner-native` directly (see [`COMPONENTS-BATCH-2-PLAN.md`](./COMPONENTS-BATCH-2-PLAN.md))

### v0.4 — overlays

- `Sheet`
- `Modal` / `Dialog`
- `Menu` / `DropdownMenu`

### Path to v1.0

- Every component from v0.1 → v0.4 stable, documented, covered ≥ 80% by tests.
- Auto-generated token scale from coarse schema (2.2 option a).
- Storybook set of "recipes" (login screen, list screen, form screen) showing composition.

### Nice-to-have later

- `react-native-web` support (unlocks Storybook web / Chromatic visual regression).
- Optional `@tamagui/babel-plugin` production build config.
- `expo-app-icon` / theming presets.
- List on [reactnative.directory](https://reactnative.directory/).

### Deferred: migrate release workflow to Trusted Publishing (OIDC)

**Deadline:** before January 2027. **Recommended window:** October–November 2026.

npm is deprecating bypass-2FA tokens for automated publishing (see the [announcement](https://github.blog/changelog/2026-07-08-npm-install-time-security-and-gat-bypass2fa-deprecation/)):

- Early August 2026 — such tokens lose account-management capabilities.
- January 2027 — such tokens can no longer publish at all.

Our current setup uses `NPM_TOKEN` (Granular Access Token, "read and write / all packages", bypasses 2FA) stored as a repo secret. It works today and will keep working until the January cutoff, but we should migrate.

Migration plan (~30 minutes when the time comes):

1. On [npmjs.com](https://www.npmjs.com/package/ui-kraken/access), configure `ui-kraken` for **Trusted Publishing** pointing at:
   - Repository: `saldeclas-team/ui-kit`
   - Workflow: `.github/workflows/release.yml`
   - Environment: (none)
2. In `release.yml`:
   - Remove the `NPM_TOKEN` env var from the changesets/action step.
   - Add `--provenance` to the publish command (`pnpm publish --provenance` or wire it via changesets config).
   - The `id-token: write` permission is already declared, no change there.
3. Delete the `NPM_TOKEN` secret from the repo settings.

Bonus: provenance shows up as a verified badge on the npm package page ("Published from …repo…/…commit…") — free credibility signal.

---

## 5. How to keep this doc alive

- Any PR that changes a locked decision (§1) must update it here in the same PR.
- Any PR that resolves an open decision (§2) moves it up to §1 and links back to the PR.
- Every completed roadmap item (§4) becomes a link to its release notes on the [changelog](../packages/ui-kraken/CHANGELOG.md).

## 6. Per-component design records

Every shipped component gets a design record in `docs/` capturing **what we built, how, and why** — including rejected alternatives, so a new contributor can understand the reasoning without archaeology.

- [`BUTTON-PLAN.md`](./BUTTON-PLAN.md) — Button (v0.2.0) — 5 tones, per-instance color overrides, elevation with dark-mode border swap, compound API.
- [`TYPOGRAPHY-PLAN.md`](./TYPOGRAPHY-PLAN.md) — Text (v0.3.0) — 13 HTML-familiar variants, 14 semantic color slots, intensity modulator, `color` accepts slot name or raw hex/rgb.

**Convention when shipping a new component:** create `docs/{COMPONENT}-PLAN.md` in the same branch as the implementation, following the same shape (Overview → API → Token schema → File structure → Testing → Storybook → Example → Non-goals → How it shipped → How to extend). The component-level README stays focused on **usage**; the PLAN doc stays focused on **rationale and decisions**.

## 7. Infrastructure initiatives

Multi-phase workstreams that affect testing, CI, or build tooling — not any single component. Same forward-looking-then-retrospective format as §6 (status flips from "planned" to "shipped in vX.Y.Z" as each phase merges).

Completed initiative — **Testing quality** (3 phases, all shipped 2026-07-24):

- [`CODECOV-AND-SNAPSHOTS-PLAN.md`](./CODECOV-AND-SNAPSHOTS-PLAN.md) — **Phase 1 shipped**. Codecov integration + 66 structural snapshot tests covering Button and Text. Known issue: `codecov/project` doesn't post (see plan's "Known issue" section); only `codecov/patch` is required-check gated.
- [`REACT-NATIVE-WEB-PLAN.md`](./REACT-NATIVE-WEB-PLAN.md) — **Phase 2 shipped in ui-kraken v0.5.0**. `react-native-web` as optional peer, `apps/example` gained web target. Reversed §1 "no web support in v1".
- [`CHROMATIC-PLAN.md`](./CHROMATIC-PLAN.md) — **Phase 3 shipped**. Chromatic visual regression testing over Storybook Web (via `@storybook/react-native-web-vite`). Every PR gets pixel-diffed for every story.

**Convention when shipping a new infrastructure initiative:** create `docs/{INITIATIVE}-PLAN.md` in the branch that ships (or in a dedicated docs-only branch when the initiative spans multiple PRs). If it's multi-phase, one plan per phase, cross-linked with "blocks" / "depends on" so the read order is obvious. Same lifecycle as component plans (planned → shipped, in place).
