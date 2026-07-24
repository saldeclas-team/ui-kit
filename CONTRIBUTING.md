# Contributing to ui-kraken

Thanks for taking the time to contribute. This guide covers everything a human contributor needs to open a PR: local setup, day-to-day commands, the git workflow, how to add a component, how testing works, and the release flow. Skim once, come back as needed.

If you're an AI collaborator, read [`AGENTS.md`](./AGENTS.md) first — it carries the machine-facing convention set that this guide summarizes for humans.

---

## 1. Getting started

**Prerequisites:**

- **Node.js 22** — the repo pins the version via [`.nvmrc`](./.nvmrc). Run `nvm use`.
- **pnpm 11+** — activate it via `corepack enable pnpm`. No global install needed.
- **Xcode** and/or **Android Studio** — only if you want to run on iOS / Android simulators. Web works without either.

**Clone + install:**

```bash
git clone https://github.com/saldeclas-team/ui-kit.git
cd ui-kit
corepack enable pnpm
pnpm install
```

`pnpm install` also runs `husky` to wire up the git hooks (pre-commit `lint-staged` + conventional-commit lint on the commit message).

**Repository layout:**

```
ui-kit/
├── packages/ui-kraken/       # The library published to npm
├── apps/example/             # Expo app + Storybook (on-device + web)
├── docs/                     # PLAN.md, per-component design records, phase plans
└── .agents/skills/           # Machine-facing skill docs (also useful reference for humans)
```

---

## 2. Local development

Every command runs from the repo root unless noted. `pnpm --filter <name>` scopes to one workspace.

| Command                                          | What it does                                                                                          |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `pnpm --filter @ui-kraken/example start`         | Start the example Expo app for iOS / Android (opens Metro; use the QR / simulator commands it prints) |
| `pnpm --filter @ui-kraken/example ios`           | Launch directly on the iOS simulator (Xcode required)                                                 |
| `pnpm --filter @ui-kraken/example android`       | Launch directly on the Android emulator (Android Studio required)                                     |
| `pnpm --filter @ui-kraken/example web`           | Serve the example app in your browser via `react-native-web` (no simulator needed)                    |
| `pnpm --filter @ui-kraken/example storybook`     | Run **Storybook on-device** inside the example app (`STORYBOOK_ENABLED=true`)                         |
| `pnpm --filter @ui-kraken/example storybook:ios` | Same, launched on iOS simulator                                                                       |
| `pnpm --filter @ui-kraken/example storybook:web` | Run **Storybook Web** at `http://localhost:6006` (same stories as on-device, in the browser)          |
| `pnpm --filter ui-kraken test`                   | Run the library unit tests (Jest + `@testing-library/react-native`)                                   |
| `pnpm --filter ui-kraken test:watch`             | Same, watching for changes                                                                            |
| `pnpm --filter ui-kraken test -- -u`             | Update snapshots after an intentional visual change (see [Testing](#5-testing))                       |
| `pnpm --filter ui-kraken build`                  | Build the library with tsup (ESM + CJS + `.d.ts`)                                                     |
| `pnpm typecheck`                                 | `tsc --noEmit` across every workspace                                                                 |
| `pnpm -r lint`                                   | ESLint across every workspace                                                                         |
| `pnpm format`                                    | Format everything with Prettier                                                                       |
| `pnpm changeset`                                 | Add a changeset describing your change (see [Release flow](#6-release-flow))                          |

---

## 3. Workflow

**Every branch is cut from a freshly-pulled `main`.** Never branch off another feature branch (see [`naming-git-branches` skill](./.agents/skills/naming-git-branches/SKILL.md) for the full rationale). Concrete order:

```bash
git status                                     # tree clean (or stash)
git checkout main
git pull --ff-only
git checkout -b <type>/<scope>-<verb-phrase>  # kebab-case, 20-50 chars
```

**Branch name shape:** `<type>/<scope>-<short-verb-phrase>`, where `<type>` is a Conventional Commit type (`feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`, `perf`, `build`, `revert`). Examples that landed cleanly: `chore/actions-node-bump`, `feat/react-native-web-support`, `docs/skill-branch-auto-delete`. See the skill for good-vs-bad examples.

**Commit messages** must follow [Conventional Commits](https://www.conventionalcommits.org/) — enforced by commitlint on `commit-msg`. The commit's `type(scope):` should agree with the branch's `type/scope`:

```
feat(button): add ghost variant
fix(text): correct disabled color in dark theme
docs(agents): forbid direct pushes to main
```

**PRs go through the [`.github/PULL_REQUEST_TEMPLATE.md`](./.github/PULL_REQUEST_TEMPLATE.md).** Fill Summary / Changes / Screenshots (or drop with a note if docs-only) / Test plan / Standards checklist. Uncheck rows with a one-line justification instead of deleting them.

**Every PR must pass these required status checks before merge:**

- `Lint · Typecheck · Test · Build` (GitHub Actions) — CI
- `codecov/patch` (Codecov) — new code must hit 80% coverage
- `UI Tests` (Chromatic) — pixel-diff of every Storybook story against the baseline on `main`

Plus the PR needs to be up-to-date with `main` (click **Update branch** on the PR if `main` moved since you branched).

**After merge:**

- The remote branch is **auto-deleted** by GitHub (`Settings → Pull Requests → Automatically delete head branches` is on).
- Clean up your local branch: `git checkout main && git pull --ff-only && git branch -d <branch-name>`.
- Don't recreate the merged branch to add "one more commit" — cut a fresh branch off main with a new name.

---

## 4. Adding a new component

The full recipe lives in [`.agents/skills/creating-component-tamagui/SKILL.md`](./.agents/skills/creating-component-tamagui/SKILL.md) — a step-by-step guide with the exact file layout, styled patterns, testID conventions, snapshot rules, and Storybook shape. Follow it; don't improvise.

**Every visual component ships 7 files** under `packages/ui-kraken/src/components/<name>/`:

```
<name>.tsx           # component logic + compound export
<name>.styled.ts     # Tamagui styled() primitives only
<name>-types.ts      # Props + role-based color interfaces
<name>.spec.tsx      # unit tests + describe("snapshots") block
<name>.stories.tsx   # Storybook (feeds Chromatic too)
README.md            # props table + at least 3 usage examples
index.ts             # explicit named exports (no `export *`)
```

**References:** [`Button`](./packages/ui-kraken/src/components/button/) and [`Text`](./packages/ui-kraken/src/components/text/) are the canonical shape. Each has a design record in [`docs/`](./docs/) documenting rationale (`BUTTON-PLAN.md`, `TYPOGRAPHY-PLAN.md`).

---

## 5. Testing

**Unit tests** — Jest + `@testing-library/react-native` v14. Every file with logic gets a co-located `*.spec.tsx`. Mock `@tamagui/core` and the component's own `*.styled.ts` when testing behavior. Prefer `getByTestId` — components propagate `testID` to subelements.

**Snapshot tests** — every visual component ships a `describe("snapshots")` block covering every variant × relevant axis (tone × size × state × color × intensity — whatever the component exposes). Uses `expect(screen.toJSON()).toMatchSnapshot()`. See `button.spec.tsx` / `text.spec.tsx` for the canonical pattern.

**Intentional snapshot changes:** run `pnpm --filter ui-kraken test -- -u`, review the `.snap` diff carefully, commit both the code and the snapshot update in the same PR.

**Accidental snapshot changes:** CI fails on the diff. Either fix the code or, if the change is desired, treat as intentional above.

**Visual regression** — Chromatic renders every Storybook story in headless Chromium on every PR and pixel-diffs against `main`. When Chromatic detects a diff, click through the check to the Chromatic UI, review each story side-by-side, and either **Accept** (new baseline lands on merge) or **Deny** (regression — fix the code). The `UI Tests` GitHub status won't turn green until diffs are accepted OR there are no diffs.

**Coverage** — `pnpm --filter ui-kraken test:ci` runs with `--coverage` and enforces jest thresholds (branches 70, functions/lines/statements 90) locally. Codecov additionally enforces `codecov/patch` at 80% on every PR. Local threshold catches regressions before push; Codecov catches them at PR time.

---

## 6. Release flow

Releases are fully automated by [Changesets](https://github.com/changesets/changesets):

1. Every PR that touches `packages/ui-kraken` includes a changeset (`pnpm changeset`, pick `patch` / `minor` / `major`, describe the user-facing change). Empty changeset (`pnpm changeset --empty`) is fine for test/CI/docs-only PRs.
2. When a PR merges to `main`, the `Release` workflow opens or updates a `chore(release): version packages` PR that bumps `ui-kraken`'s version and updates `packages/ui-kraken/CHANGELOG.md`.
3. Merging that PR triggers a second workflow run that publishes to npm via **OIDC Trusted Publishing** with `--provenance` (no `NPM_TOKEN`, cryptographic signing baked in).

**Never bump versions or run `npm publish` by hand.** If the release PR looks wrong, comment on it — don't edit the version manually.

---

## 7. Where to ask

- **Open-ended questions, ideas, design discussion** — [GitHub Discussions](https://github.com/saldeclas-team/ui-kit/discussions).
- **Bug reports** — [New Issue → Bug report](https://github.com/saldeclas-team/ui-kit/issues/new?template=bug_report.yml). Fill the form fields (repro, ui-kraken version, Expo SDK, platform).
- **Feature requests** — [New Issue → Feature request](https://github.com/saldeclas-team/ui-kit/issues/new?template=feature_request.yml).
- **Security vulnerabilities** — do NOT open a public issue. Report privately via [GitHub Security Advisories](https://github.com/saldeclas-team/ui-kit/security/advisories/new) (see [`SECURITY.md`](./SECURITY.md) when it lands).

Preview the components live at the [Storybook build](https://main--6a63d07d1946f494a4c93ad3.chromatic.com/) before opening an issue — some questions ("does Text support X?") answer themselves there.
