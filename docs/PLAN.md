# ui-kraken — Project plan

Living document. Update it as decisions land or shift.

---

## 1. Locked decisions

| Area                 | Decision                                               | Notes                                                                                                                                                                             |
| -------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| npm package name     | `ui-kraken`                                            | Available on npm as of 2026-07-23. Unscoped.                                                                                                                                      |
| Target platforms     | iOS + Android (Expo)                                   | No web / `react-native-web` support in v1. Web can be added later without breaking the API if we stay disciplined about avoiding platform-only APIs in shared code.               |
| Repo layout          | pnpm workspaces monorepo                               | `packages/ui-kraken` (the lib) + `apps/example` (Expo showcase + Storybook host).                                                                                                 |
| Package manager      | pnpm 11 via corepack                                   | `.npmrc` sets `node-linker=hoisted` because Metro cannot resolve pnpm's default isolated layout.                                                                                  |
| Language             | TypeScript, `strict: true`                             | `noUncheckedIndexedAccess` also on. Base config lives in `tsconfig.base.json`.                                                                                                    |
| Styling engine       | [Tamagui](https://tamagui.dev/) v2                     | Provides the token schema, the `<Provider>`, variants, and animation glue.                                                                                                        |
| Animations           | `react-native-reanimated` v4 as `peerDependency`       | Reanimated 4 requires the new architecture — Expo SDK 57 has it on by default.                                                                                                    |
| Component paradigm   | Fully-styled with variants                             | e.g. `<Button variant="primary">`. Full customization via a central provider + per-instance props. Exact schema is decided when we design the first component (Button).           |
| Storybook            | On-device via `@storybook/react-native` v10            | Toggled through the `STORYBOOK_ENABLED` env var (`withStorybook` wrapper in `apps/example/metro.config.js`). Zero Storybook code in the production bundle when the flag is unset. |
| Docs                 | README + on-device Storybook                           | No standalone Docusaurus site in v1.                                                                                                                                              |
| Testing              | Jest + `@testing-library/react-native`                 | Preset: `jest-expo`. Coverage threshold 80% enforced in `packages/ui-kraken/jest.config.js`.                                                                                      |
| Linter / formatter   | ESLint 9 (flat config) + Prettier 3                    | Single config at repo root, picked up by every workspace.                                                                                                                         |
| Commit convention    | Conventional Commits                                   | Enforced by commitlint (husky `commit-msg` hook).                                                                                                                                 |
| Pre-commit           | husky + lint-staged                                    | Runs ESLint --fix and Prettier on staged files only.                                                                                                                              |
| Versioning / release | [Changesets](https://github.com/changesets/changesets) | `apps/example` is in the `ignore` list; only `packages/ui-kraken` publishes.                                                                                                      |
| CI                   | GitHub Actions                                         | `ci.yml` (lint · typecheck · test · build) on every PR; `release.yml` on `main` opens the version PR or publishes to npm.                                                         |
| License              | MIT                                                    | © saldeclas-team.                                                                                                                                                                 |

---

## 2. Open decisions

These are called out explicitly so we can debate them when the moment arrives. Do NOT decide them until the linked trigger happens.

### 2.1 `KrakenProvider` wrapper vs. exposing `TamaguiProvider` directly

**Trigger:** designing the first component (Button).

- **Option A — expose `TamaguiProvider` directly.** Consumers do

  ```tsx
  import { TamaguiProvider } from "tamagui";
  import { krakenConfig } from "ui-kraken";
  <TamaguiProvider config={krakenConfig}>...</TamaguiProvider>;
  ```

  Simple, fewer moving parts, no extra API surface to maintain.

- **Option B — expose our own `KrakenProvider`.** Consumers do
  ```tsx
  import { KrakenProvider } from "ui-kraken";
  <KrakenProvider theme="dark" tokens={{...}}>...</KrakenProvider>
  ```
  Internally wraps `TamaguiProvider`. Lets us add ui-kraken-only concerns (portal host, toast provider, feature flags) without a breaking change later, and gives us a place to accept a simplified token schema that the user described (`primaryColor`, `textPrimaryColor`, etc.) and translate it into Tamagui's more granular tokens.

**Recommendation to revisit later:** B. The extra layer is cheap and the "give me a small set of knobs" DX the user asked for maps very naturally to a wrapper.

### 2.2 Token schema shape

**Trigger:** designing the first component (Button).

The user wants a **coarse set of knobs** exposed at the provider level (e.g. `primaryColor`, `secondaryColor`, `textPrimaryColor`, `textSecondaryColor`, `radius`, `spacing`) that all components consume automatically, plus **per-instance overrides** on each component. Tamagui's native tokens are much more granular (12-step color scales, spacing scales, etc.). We need to decide the mapping — either

- (a) accept the coarse schema and auto-generate the 12-step scales (e.g. via `polished`, `chroma-js`, or Tamagui's `createTheme` helper), or
- (b) accept the coarse schema and only wire it to the props that Button actually reads, and iterate as we add components.

Recommendation: (b) for v0.x, (a) for v1.

### 2.3 First component

**Trigger:** next planning conversation.

Almost certainly `Button` (variants: `primary`, `secondary`, `ghost`, `destructive`; sizes: `sm`, `md`, `lg`; states: `disabled`, `loading`; per-instance color overrides). Decide together with 2.1 and 2.2 — they should ship in the same PR.

### 2.4 Icon library

**Trigger:** first component that needs an icon slot (probably Button with `leftIcon` / `rightIcon`).

- Option A — accept `ReactNode` in icon slots and let the consumer bring their own icons. Zero dependency, most flexible.
- Option B — depend on `lucide-react-native` and re-export a curated subset. Nicer DX but adds a peer dep.

Recommendation: A. Cheaper to start with.

### 2.5 Portal host / overlay stack

**Trigger:** first overlay-style component (Sheet, Dialog, Toast).

Tamagui ships `PortalProvider`. We will need to add it inside whichever provider we ship (see 2.1).

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

- Decide 2.1 (KrakenProvider vs direct) and 2.2 (token schema).
- Ship `Button` with `variant`, `size`, `disabled`, `loading` and per-instance color overrides.
- Story + unit tests + a11y (accessibilityRole, hitSlop, `accessibilityState`).
- Update README with the "hello Button" example.
- First npm publish (`0.1.0`).

### v0.2 — the essentials

Order TBD; probably:

- `Text` / typography scale
- `Input` (single-line + multi-line)
- `Card`
- `Stack` / `Row` / `Column` (thin wrappers over Tamagui `XStack` / `YStack` with ui-kraken tokens)
- `Icon` slot conventions (see 2.4)

### v0.3 — layout & feedback

- `Avatar`
- `Badge`
- `Divider`
- `Spinner`
- `Toast` (needs 2.5)

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

---

## 5. How to keep this doc alive

- Any PR that changes a locked decision (§1) must update it here in the same PR.
- Any PR that resolves an open decision (§2) moves it up to §1 and links back to the PR.
- Every completed roadmap item (§4) becomes a link to its release notes on the [changelog](../packages/ui-kraken/CHANGELOG.md).
