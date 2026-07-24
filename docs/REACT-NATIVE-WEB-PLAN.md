# React Native Web support — implementation plan

**Status:** shipped on 2026-07-24 (ui-kraken v0.5.0 minor — adds `react-native-web` as an optional peer, opening the library to web consumers and unlocking [Phase 3 (Chromatic)](./CHROMATIC-PLAN.md)). Phase 2 of 3 in the testing-quality initiative.

**Turned out simpler than estimated:** the Expo SDK 57 template that scaffolded `apps/example` already ships `react-native-web` and `react-dom` as dependencies AND already configures `web: { output: "static" }` in `app.json` AND already exposes a `pnpm --filter @ui-kraken/example web` script. So the real Phase 2 work was: add the optional peer to `ui-kraken/package.json`, add the AGENTS.md `platforms.supported` rule, add Platform support tables to component READMEs, reverse the PLAN §1 "no web" decision, and manually verify Button + Text on web. No new dependencies to install, no new scripts, no new app config.

Forward-looking design record. Reverses a locked decision in [`docs/PLAN.md`](./PLAN.md) §1 ("Target platforms: iOS + Android (Expo) — No web / react-native-web support in v1"). That decision was made when the roadmap didn't include visual regression testing; Phase 3 requires a web target to run Chromatic. Adding web unlocks Chromatic AND opens `ui-kraken` as a cross-platform library — a real user-facing capability, not just a testing dependency.

---

## Overview

Add `react-native-web` as an optional peer target for `ui-kraken`. Two motivations, ranked:

1. **Enables Phase 3 (Chromatic visual regression)** — Chromatic renders Storybook stories in a headless Chromium and pixel-diffs them across PRs. It cannot render RN native components; it needs `react-native-web` to compile them to DOM. This is the immediate driver.
2. **Ships a real feature** — consumers who build Expo apps with `expo-router` on web (a common pattern for landing pages that share code with the mobile app) can now use ui-kraken components. Not a niche use case.

**What this is NOT:**

- Not a full "ui-kraken for the web" rewrite. Components render on web via `react-native-web`'s translation layer, not via a hand-rolled web renderer.
- Not a commitment to feature parity forever. Some future components (e.g. sheets with iOS-specific gestures) may explicitly opt out of web with a runtime `Platform.OS !== "web"` gate — documented per-component.

## What changes at the package level

### Peer dependency

`react-native-web` becomes an **optional** peer (like Reanimated already is):

```json
// packages/ui-kraken/package.json
"peerDependencies": {
  "react": ">=18.2.0",
  "react-native": ">=0.74.0",
  "react-native-reanimated": ">=3.6.0",
  "react-native-web": ">=0.19.0",   // NEW
  "tamagui": ">=1.100.0"
},
"peerDependenciesMeta": {
  "react-native-reanimated": { "optional": false },
  "react-native-web": { "optional": true }   // NEW
}
```

The `exports` map already declares `"react-native"` as one of the resolution conditions. We add `"import"` / `"require"` conditions to point at the web-compatible build too. In practice `react-native-web` uses the same bundle as `react-native` (both consume the RN JS output) so no separate build target is needed — just ensure `sideEffects: false` remains honest.

### Verification per component

Every shipped component gets validated on web BEFORE this PR merges:

- **Button** — should just work. Tamagui `styled(TamaguiButton)` and RN `Pressable` both map to `<button>` / `<div>` on web via `react-native-web`. Verify pressStyle animates, disabled state is `aria-disabled`, testID becomes `data-testid`.
- **Text** — should just work. Tamagui `styled(TamaguiText)` maps to `<span>` on web. Verify variant fontSize/lineHeight/weight all land, dark theme flips colors, `numberOfLines` uses `-webkit-line-clamp`.

If either fails, we document the failure in the component README as a known limitation and gate the failing prop with `if (Platform.OS !== "web")`. But given Tamagui's native web support, this is unlikely.

### AGENTS.md convention updates

- **`platforms.supported`** — new rule: every component MUST render without crashing on `web` in addition to `ios`/`android`. Any platform-specific opt-out gets a runtime `Platform.OS` gate + a note in the component README under a "## Platform support" section. This gets validated via Storybook Web (Phase 3) but the rule lands here so contributors know the bar before Phase 3 exists.

## What changes at the example-app level

`apps/example` gets a **new web target** for its Expo Router setup — separate from the mobile target so we can iterate on web without breaking on-device.

### Expo config

```jsonc
// apps/example/app.json
{
  "expo": {
    "platforms": ["ios", "android", "web"], // add "web"
    "web": {
      "bundler": "metro",
      "output": "single",
    },
  },
}
```

### New dev script

```json
// apps/example/package.json
"scripts": {
  "web": "expo start --web"
}
```

Runs at `http://localhost:8081`. First-time cost: `expo` will install `react-native-web` + `react-dom` on demand.

### Metro config

Metro is already the Expo Router bundler; adding web means telling Metro to also process `.web.tsx` files if we ever need them. Not needed initially — every component is authored with cross-platform primitives. Documented in the PR body as a follow-up if a specific web-only shim becomes necessary.

## What changes in CI

No new job in this phase. Web builds happen locally during dev and get validated in Phase 3 (Chromatic will use `expo export --platform web` to produce the bundle it uploads).

## `docs/PLAN.md` decisions to reverse

**§1 Locked decisions:**

- Row "Target platforms" — currently `iOS + Android (Expo)` with note `No web / react-native-web support in v1`. Update to `iOS + Android + Web (via react-native-web)`. The rationale changes to: web target is required for Phase 3 (Chromatic visual regression) AND is a genuine capability for consumers.

**§2 Open decisions:**

- 2.6 "Deferred to later versions" — remove the `react-native-web support` bullet if it exists, or mark as landed with a link to this plan.

## Verification

Manual smoke test before opening the PR (documented in PR body):

- `pnpm --filter @ui-kraken/example web` — the example app boots at `http://localhost:8081`
- Navigate to `/components/button` — every tone renders, click works, dark theme toggles correctly
- Navigate to `/components/text` — every variant renders, every color slot resolves, custom hex passes through
- Test `numberOfLines={2}` truncation on Text — should ellipsize on web too
- Chrome DevTools → mobile-viewport simulation → verify layout doesn't regress
- Lighthouse audit on the catalog page → note the initial performance score in the PR body

Automated:

- `pnpm typecheck` — every path resolves under both `react-native` and `react-native-web` conditions
- `pnpm test` — no snapshot regressions (structural snapshots serialize the same RN tree regardless of platform target)
- `pnpm build` — dist unchanged shape (the peer is optional, we don't bundle it)

## File changes

```
packages/ui-kraken/package.json          # add react-native-web peer + optional flag
apps/example/package.json                # add "web" script + react-native-web + react-dom deps
apps/example/app.json                    # platforms: add "web", web.bundler: metro
apps/example/webpack.config.js           # NEW if any web-only shim needed (probably skip)
AGENTS.md                                # new rule: platforms.supported (web + ios + android)
docs/PLAN.md                             # §1 reverse "no web support"; §2.6 mark landed
docs/REACT-NATIVE-WEB-PLAN.md            # this file — flips to "shipped"
packages/ui-kraken/README.md             # add "Platform support: iOS · Android · Web" line
packages/ui-kraken/src/components/button/README.md   # add "Platform support" section
packages/ui-kraken/src/components/text/README.md     # same
```

## Non-goals (this phase)

- **Chromatic setup** — Phase 3. This phase makes it possible; the next phase actually turns it on.
- **Storybook web build** — Phase 3. Storybook React Native (on-device) stays as-is here; a separate Storybook Web target lands with Chromatic.
- **New CI job for web builds** — Phase 3. The Codecov CI is enough for now; a web-build check comes with Chromatic.
- **`react-native` → `react-native-web` `moduleFieldReplacement` in Metro** — the Tamagui bundler + Expo's Metro config already handle this. If we ever hit a case where they don't, add the Metro alias then.
- **Rewriting any component for web** — components are authored via Tamagui + RN primitives that already work on web. If verification shows one that doesn't, fix it here; do NOT preemptively refactor.

## How to ship

Branch: `feat/react-native-web-support` (per [`naming-git-branches`](../.agents/skills/naming-git-branches/SKILL.md), 32 chars).

1. Update peer deps in `packages/ui-kraken/package.json`.
2. Install `react-native-web` + `react-dom` in `apps/example`.
3. Update `apps/example/app.json` platforms.
4. Boot `pnpm --filter @ui-kraken/example web`, verify every component screen manually.
5. Update AGENTS.md + component READMEs with the new platform support convention.
6. Update `docs/PLAN.md` §1 + §2.6.
7. Verify: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`.
8. Changeset: **minor** bump — adding an optional peer is technically non-breaking BUT the new supported platform is a user-facing addition worth flagging in the changelog.
9. Handoff PR title + body per [`drafting-pr-descriptions`](../.agents/skills/drafting-pr-descriptions/SKILL.md).

## Dependencies

- **Depends on:** nothing hard, but easier to review if [Phase 1](./CODECOV-AND-SNAPSHOTS-PLAN.md) has merged so the new coverage numbers show up on this PR as the first meaningful signal.
- **Blocks:** [Phase 3 (Chromatic)](./CHROMATIC-PLAN.md) — Chromatic cannot run without a working web build of the Storybook.

## Estimated effort

3–5 hours end-to-end. Bulk of the time is verifying components on web and troubleshooting any Tamagui / RN Web edge cases.
