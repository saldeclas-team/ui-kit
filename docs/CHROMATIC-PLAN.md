# Chromatic visual regression testing — implementation plan

**Status:** shipped on 2026-07-24 (ui-kraken v0.5.x patch — CI + config only, no user-facing API change). Phase 3 of 3 (final) in the testing-quality initiative. Completes the trio: Codecov (Phase 1) + `react-native-web` support (Phase 2) + Chromatic visual regression (this phase).

**Implementation notes vs. the plan:**

- The plan estimated 2–3 h; actual work was ~2 h, mostly split between (a) getting `@storybook/react-native-web-vite` to bundle ui-kraken correctly and (b) diagnosing a two-instance React Context bug that surfaced only in the Chromatic browser render (not in the local `storybook build`).
- **The Context bug** (documented below because it will trip up the next contributor): stories inside `packages/ui-kraken/src/**/*.stories.tsx` import components via relative paths, so their `useUIKit()` reaches the source's `UIKitContext`. Meanwhile `.storybook/preview.tsx` was importing `UIKitProvider` via the package name `"ui-kraken"`, which Vite resolved through the exports map to a DIFFERENT module — hence a second `UIKitContext` instance, hence "useUIKit must be called inside <UIKitProvider>" even though the decorator was wrapping the story. Fixed by adding a `viteFinal.resolve.alias` for `"ui-kraken"` → `packages/ui-kraken/src/index.ts` in `.storybook/main.ts`. One package = one module = one Context.
- Framework `@storybook/react-native-web-vite` (Storybook 10 compatible, uses Vite ≥ 5 under the hood, translates RN → RN-Web automatically).

Forward-looking design record. Adds true visual regression testing — every PR gets pixel-diffed against `main` for every Storybook story, and reviewers see a visual review page before approving.

---

## Overview

Chromatic captures a screenshot of every Storybook story in a headless Chromium browser, diffs it against the baseline stored from `main`, and posts a "Chromatic" status check on every PR with a link to the visual review UI. When any story changes visually — a color drift from a Tamagui version bump, an accidental margin change, a font-weight regression — the reviewer sees the exact pixels that changed side-by-side and either accepts (new baseline) or rejects (regression, PR must fix).

This closes the gap left by structural snapshots (Phase 1). Structural snapshots detect prop / style / structural diffs but are blind to actual rendered output. Chromatic sees the rendered pixels.

**Why Chromatic over alternatives:**

- **vs. `react-native-owl`** — RN Owl takes real screenshots on iOS/Android simulators; higher fidelity to production but requires macOS runners on CI (expensive, ~$0.08/min on GitHub-hosted vs $0.008 for Linux), adds 5–10 min per PR, and the simulator boot itself is flaky.
- **vs. `Percy`** — comparable feature set, less popular in the React community, worse Storybook integration.
- **vs. `Playwright` snapshots** — you'd write and maintain the test scaffolding yourself. Chromatic is Storybook-native: every story becomes a test automatically.

Chromatic is free for OSS projects (up to 5000 snapshots/month at time of writing), which comfortably covers this repo's expected story count.

## What ships

### Storybook Web target

Storybook React Native (currently the only Storybook we have, running on-device) does not build to a static web bundle — that's a fundamental limitation of the `@storybook/react-native` addon. For Chromatic we need a **parallel** Storybook Web config that reuses the same stories:

```
apps/example/.rnstorybook/       # existing — on-device (unchanged)
apps/example/.storybook/         # NEW — Storybook Web config
  ├── main.ts                    # points at ../src/**/*.stories.tsx (same stories)
  ├── preview.tsx                # mounts UIKitProvider + Tamagui web config
  └── manager.ts                 # (optional) UI theme
apps/example/storybook-static/   # gitignored — output of `storybook build`
```

Same stories, two runners. On-device Storybook keeps working for maintainer testing on physical devices; Storybook Web feeds Chromatic.

### Storybook Web dev / build scripts

```json
// apps/example/package.json
"scripts": {
  "storybook:web": "storybook dev -p 6006 -c .storybook",
  "storybook:web:build": "storybook build -c .storybook -o storybook-static"
}
```

### Chromatic GitHub Action

New workflow file `.github/workflows/chromatic.yml`:

```yaml
name: Chromatic

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  chromatic:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
        with:
          fetch-depth: 0 # required by Chromatic for TurboSnap baselines

      - name: Enable pnpm via corepack
        run: |
          corepack enable
          corepack prepare pnpm@11.17.0 --activate

      - uses: actions/setup-node@v7
        with:
          node-version-file: ".nvmrc"
          cache: "pnpm"

      - run: pnpm install --frozen-lockfile

      - name: Publish to Chromatic
        uses: chromaui/action@v1
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          workingDir: apps/example
          buildScriptName: storybook:web:build
          onlyChanged: true # TurboSnap — only re-snapshot stories touched by the diff
          exitOnceUploaded: true # non-blocking status; PR gate happens via UI review
```

`fetch-depth: 0` is required for Chromatic's TurboSnap dependency-tracing.

`onlyChanged: true` means Chromatic uses Webpack/Vite dep graph to detect which stories are affected by a PR's file changes and only re-snapshots those. Big performance win once the story count grows.

### Branch protection

After the first Chromatic run posts a status check, add **`UI Tests`** to the required status checks on `main`. Chromatic reports two checks per PR:

- `UI Tests` — snapshots ran successfully (this becomes required).
- `UI Review` — someone approved the changes in the Chromatic UI (this stays optional at first; can be promoted to required once the team has a review habit).

### README badges

Add to `packages/ui-kraken/README.md` (right next to the Codecov badge from Phase 1):

```md
[![Chromatic](https://img.shields.io/badge/Chromatic-visual%20tests-orange?logo=storybook)](https://www.chromatic.com/library?appId=<APP_ID>)
```

### Prerequisites (maintainer, out-of-repo)

Before this PR can be merged and Chromatic can gate anything:

1. Log into [chromatic.com](https://www.chromatic.com/) with GitHub, create a project for `saldeclas-team/ui-kit`.
2. Copy the project token from Chromatic → Manage → Configure.
3. Add it as a GitHub Actions secret: `CHROMATIC_PROJECT_TOKEN`.
4. On the first PR after this ships, the initial baseline gets established from `main`; every subsequent PR is diffed against it.
5. After the first successful run, add `UI Tests` to the required status checks on `main`.

## What we DON'T do

- **Enable Chromatic for the on-device Storybook** — impossible; it doesn't build to a static web bundle. On-device Storybook stays as maintainer-facing dev tool only.
- **Snapshot every prop combination** — Chromatic snapshots existing stories as they are. Story count is the snapshot budget; if a component's matrix isn't covered, add stories for it (that's a Storybook improvement, not a Chromatic one).
- **Automate the "accept changes" step** — reviewer must open Chromatic UI, look at diffs, click accept. This is intentional and is what makes it a review gate. No autoclick.
- **Cross-browser snapshots** — Chromatic supports Chrome + Firefox + Safari + Edge on paid plans. Stick with Chromium-only until we hit a real cross-browser bug.
- **Mobile viewport snapshots** — Chromatic supports viewport variants on paid plans. Skip for now; `react-native-web` output at desktop viewport is representative enough for regression detection.

## AGENTS.md convention updates

- **`test.visual-regression`** — new rule: every visual component's stories are the source of truth for the Chromatic matrix. When adding a component variant (a tone, a size, an intensity), add the story too. `pnpm changeset` on a component change without a corresponding story addition is a review-blocking omission.
- Update the [`creating-component-tamagui`](../.agents/skills/creating-component-tamagui/SKILL.md) skill: promote "Storybook stories" from "nice to have" to "required, backed by Chromatic".

## File changes

```
apps/example/.storybook/main.ts               # NEW — Storybook Web config
apps/example/.storybook/preview.tsx           # NEW — UIKitProvider wrapper for web
apps/example/package.json                     # + 2 scripts (storybook:web, storybook:web:build)
apps/example/.gitignore                       # + storybook-static/
.github/workflows/chromatic.yml               # NEW
packages/ui-kraken/README.md                  # + Chromatic badge next to Codecov
AGENTS.md                                     # new rule: test.visual-regression
.agents/skills/creating-component-tamagui/SKILL.md   # Stories section promoted to required
docs/PLAN.md                                  # §7 Infrastructure — Phase 3 flipped to shipped
docs/CHROMATIC-PLAN.md                        # this file — flipped to shipped
```

## Verification

Before opening the PR:

1. `pnpm --filter @ui-kraken/example storybook:web` — Storybook Web dev server boots at `http://localhost:6006`, every story renders identically to the on-device version.
2. `pnpm --filter @ui-kraken/example storybook:web:build` — produces `apps/example/storybook-static/` with an index.html that renders all stories offline.
3. Open the built HTML directly (`file://.../storybook-static/index.html`) — sanity check.
4. Run Chromatic locally: `CHROMATIC_PROJECT_TOKEN=<token> pnpm dlx chromatic --project-token=$CHROMATIC_PROJECT_TOKEN --working-dir=apps/example --build-script-name=storybook:web:build` — expect the baseline to be established on `main` and PR to run without errors.

## How to ship

Branch: `test/chromatic-visual-regression` (per [`naming-git-branches`](../.agents/skills/naming-git-branches/SKILL.md), 31 chars).

1. Add `apps/example/.storybook/` config.
2. Add scripts to `apps/example/package.json`.
3. Add `storybook-static/` to `apps/example/.gitignore`.
4. Test `pnpm storybook:web` + `storybook:web:build` locally.
5. Add `.github/workflows/chromatic.yml`.
6. Update AGENTS.md + component skill.
7. Update `packages/ui-kraken/README.md` with badge.
8. Update `docs/PLAN.md` §7 and flip this file's Status to "shipped".
9. No changeset — CI + testing infra, not user-facing.
10. Handoff PR title + body per [`drafting-pr-descriptions`](../.agents/skills/drafting-pr-descriptions/SKILL.md).

**Post-merge maintainer tasks** (documented in the PR body):

- Register the repo on chromatic.com, add `CHROMATIC_PROJECT_TOKEN` secret.
- After the first PR runs Chromatic and establishes baselines, add `UI Tests` as a required status check on `main`.

## Dependencies

- **Depends on:** [Phase 2 (react-native-web)](./REACT-NATIVE-WEB-PLAN.md) — Chromatic literally cannot run without a working Storybook web build, which requires RN Web.
- **Blocks:** nothing. Terminal phase of this initiative. Future testing infra (accessibility audits, cross-browser snapshots, e2e) becomes possible on top of the Storybook Web foundation this establishes.

## Estimated effort

2–3 hours end-to-end. Storybook Web config is the bulk of the work; the Chromatic action itself is a copy-paste from their docs.

## Long-term costs

- **Chromatic free tier:** 5000 snapshots/month, which is (stories × PRs × viewports) — comfortable for a solo maintainer working on a small component library. If we grow past that, paid tier starts at $149/month.
- **CI time:** with `onlyChanged: true` TurboSnap, most PRs only re-snapshot 1–2 stories → ~1 minute of chromatic action overhead per PR.
- **Reviewer time:** every UI-changing PR requires ~2 min to accept snapshots in the Chromatic UI. If reviewer never accepts, the PR sits blocked — actual cost of quality.
