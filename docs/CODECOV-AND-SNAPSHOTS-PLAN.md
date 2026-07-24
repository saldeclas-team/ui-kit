# Codecov + structural snapshots — implementation plan

**Status:** planned. Ships as **Phase 1 of 3** in the testing-quality initiative (Phase 2 = react-native-web, Phase 3 = Chromatic visual regression). Independent of Phase 2 and 3 — can ship on its own.

Forward-looking design record. Follows the same shape as [`BUTTON-PLAN.md`](./BUTTON-PLAN.md) and [`TYPOGRAPHY-PLAN.md`](./TYPOGRAPHY-PLAN.md); status flips to "shipped in vX.Y.Z" when the branch merges.

---

## Overview

Two testing-quality gains that ship together as one PR because both are cheap infra additions with no code-behavior change and no consumer-visible surface:

1. **Codecov integration** — surface coverage in every PR and block merges when the number drops.
2. **Structural snapshot tests** — catch regressions in the rendered component tree (props, styles, structure) even when unit tests don't assert against a specific value.

**What this is NOT:**

- Not pixel-diff visual regression testing. That's Phase 3 (Chromatic) and requires Phase 2 (`react-native-web`) first. Structural snapshots detect changes in the serialized RN tree — they see prop diffs and inline style diffs but not visual output.
- Not new user-facing features. `packages/ui-kraken` API surface is unchanged; tests are excluded from the npm publish via the `files` field.

## Motivation

- Coverage today: Jest computes it, `jest.config.cjs` sets thresholds (branches 70, functions/lines/statements 90), and CI runs `pnpm --filter ui-kraken test:ci` which passes if the thresholds hold. But nothing bubbles the coverage number to the PR — reviewers can't see it, nobody notices when it drifts down until CI eventually fails.
- Snapshot tests today: none. Existing specs assert against specific props (`expect(el.props.color).toBe("#0B0B0F")`) which is precise but doesn't catch structural regressions — e.g. an accidental extra wrapper `<View>` inside `Button` would slip through every current test.
- Both are standard hygiene for a professional OSS library. Codecov badge in the README is also a discoverability signal (npmjs.com and reactnative.directory both read it).

## Deliverable A — Codecov

### CI wiring

Extend `.github/workflows/ci.yml`, `quality` job, immediately after the `Test` step:

```yaml
- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v5
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    files: ./packages/ui-kraken/coverage/lcov.info
    flags: ui-kraken
    fail_ci_if_error: true
```

- `token` — required for private repos and gives reliable uploads on public. Set as a GitHub Actions secret named `CODECOV_TOKEN` (get it from codecov.io after registering the repo).
- `files` — Jest already emits `packages/ui-kraken/coverage/lcov.info` when run with `--coverage` (which `test:ci` does).
- `flags: ui-kraken` — namespaces this coverage report. When `apps/example` gets its own tests later (Phase 2+), it lands under a different flag without polluting the library's number.
- `fail_ci_if_error: true` — a failed upload should fail the CI. Coverage silently missing is worse than a red build.

### Repo-root `codecov.yml`

```yaml
coverage:
  status:
    project:
      default:
        target: auto # current coverage is the baseline
        threshold: 0.5% # allow a tiny dip to avoid flakes
        base: auto
        if_ci_failed: error
    patch:
      default:
        target: 80% # every PR's NEW code must hit 80%+
        if_ci_failed: error

comment:
  layout: "reach, diff, flags, files"
  behavior: default
  require_changes: true # only comment when coverage actually changed

ignore:
  - "**/*.stories.tsx"
  - "**/*.spec.tsx"
  - "**/*.spec.ts"
  - "**/*-types.ts"
  - "**/*.styled.ts" # styled definitions are covered transitively
  - "**/index.ts" # re-export barrels
  - "apps/example/**"
  - "dist/**"
  - "coverage/**"
```

**Two required checks** get added to the branch protection on `main`:

- `codecov/project` — total coverage cannot drop more than 0.5%.
- `codecov/patch` — new lines added by the PR must hit 80% covered.

### README badge

Add to the top of `packages/ui-kraken/README.md`:

```md
[![codecov](https://codecov.io/gh/saldeclas-team/ui-kit/branch/main/graph/badge.svg?flag=ui-kraken)](https://codecov.io/gh/saldeclas-team/ui-kit)
```

Same badge to the repo root `README.md`.

### Prerequisites (maintainer, out-of-repo)

Before this PR can be merged and Codecov can actually gate anything:

1. Log into [codecov.io](https://about.codecov.io/) with GitHub, authorize `saldeclas-team/ui-kit`.
2. Copy the Repository Upload Token from Codecov → Settings → General.
3. Add it as a GitHub Actions secret: repo Settings → Secrets and variables → Actions → New repository secret → `CODECOV_TOKEN`.
4. **After** the first CI run posts a coverage report, come back to branch protection settings → `main` → edit rule → add `codecov/project` and `codecov/patch` to Required status checks.

## Deliverable B — Structural snapshot tests

### Approach

Jest snapshots via `render(...).toJSON()`. Serializes the RN tree to JSON — every element, every prop, every style. Diff on any change. Cheap to write, cheap to run, first-class support in `@testing-library/react-native`.

### What we snapshot

**Button** — one `describe("snapshots")` block in `button.spec.tsx`, appended after the existing assertions:

- Every tone × md size (5 snapshots).
- Every size × primary tone (3 snapshots — sm / md / lg).
- Every state that visibly changes the output: `disabled`, `loading`, `leftIcon + rightIcon`, `icon-only` (no children) — 4 snapshots.
- Every radius preset on md/primary: `none`, `sm`, `md`, `lg`, `pill`, `radius={24}` — 6 snapshots.
- Every elevation level on md/primary in **both themes**: none / sm / md / lg × light / dark = 8 snapshots (elevation swap is dark-mode-specific — the shipped `useElevationStyle` swaps shadows for a translucent border in dark).
- Per-instance `buttonColors` override: one representative snapshot.

Total: ~27 Button snapshots.

**Text** — one `describe("snapshots")` block in `text.spec.tsx`:

- Every variant × primary color × md (13 snapshots).
- Every hierarchy color slot × body2 variant (5 snapshots).
- Every semantic color slot × body2 (5 snapshots).
- Every on-\* color slot × body2 (4 snapshots).
- Each intensity × body1 × primary (3 snapshots — subtle / normal / strong).
- Custom color inputs: hex, rgb, named (3 snapshots).
- Truncation (`numberOfLines={2}`) + textAlign variants (5 snapshots).

Total: ~38 Text snapshots.

**Grand total: ~65 snapshots** committed to `__snapshots__/` directories next to each spec file.

### Update patterns

- **Intentional change to a component** → run `pnpm test -u` locally, review the .snap file diff carefully (this is now part of the review checklist), commit both the code and the snapshot update in the same PR.
- **Accidental change** → CI fails on the snapshot diff, the PR gets a clear error pointing at the exact snapshot that changed. Fix or update.

### Snapshot serializer

`@testing-library/react-native` v14 ships a serializer that produces readable JSON output. No extra config needed. The snapshots look like:

```
<Text
  color="#0B0B0F"
  fontSize={40}
  fontWeight="700"
  lineHeight={48}
  variant="h1"
>
  Hero
</Text>
```

Reviewers reading the diff can eyeball what changed.

## AGENTS.md convention updates

Add two rules:

- **`test.snapshots-required`** — every visual component MUST ship a `describe("snapshots")` block in its `*.spec.tsx` covering the same axes as its Storybook stories. First rule of thumb: if it deserves a story, it deserves a snapshot.
- **`test.coverage-gate`** — every PR is blocked on `codecov/project` and `codecov/patch` checks. Contributors treat coverage drop as they'd treat a failing test: fix or justify.

Also update the [`creating-component-tamagui`](../.agents/skills/creating-component-tamagui/SKILL.md) skill: add "Section 6.5 — Snapshot tests" describing the pattern (one describe block, iterate every variant × relevant axis, one `render().toJSON()` per case).

## File changes

```
.github/workflows/ci.yml                                   # add Codecov step
codecov.yml                                                # NEW — thresholds + ignores
README.md (repo root)                                      # add badge
packages/ui-kraken/README.md                               # add badge
packages/ui-kraken/src/components/button/button.spec.tsx   # + describe("snapshots") block
packages/ui-kraken/src/components/button/__snapshots__/    # NEW — generated by jest
packages/ui-kraken/src/components/text/text.spec.tsx       # + describe("snapshots") block
packages/ui-kraken/src/components/text/__snapshots__/      # NEW — generated by jest
AGENTS.md                                                  # + 2 rules (snapshots-required, coverage-gate)
.agents/skills/creating-component-tamagui/SKILL.md         # + snapshot test section
docs/PLAN.md                                               # link Phase 1 plan under a new §7 Infrastructure initiatives
```

## Non-goals (this phase)

- **Pixel-diff visual regression** — deferred to Phase 3 (Chromatic). Structural snapshots do not catch styling regressions that don't change props (e.g. an updated Tamagui version changing font antialiasing).
- **Coverage of `apps/example`** — the example app has no tests today and this PR doesn't add any. When it grows, uses its own Codecov flag.
- **Snapshot on stories directly** — `storyshots-jest` is deprecated in Storybook 8+. If the story matrix and the snapshot matrix drift, the fix is to update the spec, not to auto-generate.

## How to ship

Order of operations on the `test/coverage-and-snapshot-tests` branch (name per [`naming-git-branches`](../.agents/skills/naming-git-branches/SKILL.md)):

1. Write the Button snapshot block; run `pnpm --filter ui-kraken test` and commit both `button.spec.tsx` + `__snapshots__/button.spec.tsx.snap`.
2. Same for Text.
3. Add `codecov.yml` at repo root.
4. Add Codecov step to `ci.yml`.
5. Update `AGENTS.md` and the component skill.
6. Update `packages/ui-kraken/README.md` + repo `README.md` with the badge.
7. Update `docs/PLAN.md` §7.
8. Verify: `pnpm typecheck && pnpm lint && pnpm test && pnpm --filter ui-kraken build`. Snapshot count should be ~65 new; test count should jump from 56 to ~121.
9. No changeset needed — tests + CI are not user-facing (`.spec.tsx` files are excluded from the npm tarball via `files` field). Confirmed with `npm pack --dry-run` in a follow-up.
10. Handoff PR title + body per [`drafting-pr-descriptions`](../.agents/skills/drafting-pr-descriptions/SKILL.md).

**Post-merge maintainer tasks** (documented in the PR body):

- Register the repo on codecov.io and add `CODECOV_TOKEN` secret.
- After the first CI run posts coverage, add `codecov/project` and `codecov/patch` as required status checks on `main`.

## Dependencies

- **Depends on:** nothing. Ships independently.
- **Blocks:** nothing. Phase 2 and 3 are unrelated deliverables.

## Estimated effort

2–3 hours end-to-end (writing ~65 snapshots + Codecov wiring + docs). Most time is in reviewing initial snapshot output for correctness before committing.
