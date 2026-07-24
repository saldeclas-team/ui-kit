# Contributing to ui-kraken

Thanks for taking the time to contribute! This document walks you through the local setup and the release flow.

## Prerequisites

- **Node.js 22** — the repo pins the version via [`.nvmrc`](./.nvmrc). Run `nvm use`.
- **pnpm 11+** — activate it via `corepack enable pnpm`. No global install needed.
- **Xcode** and/or **Android Studio** — to run the example app on a simulator or emulator.

## First-time setup

```bash
git clone https://github.com/saldeclas-team/ui-kit.git
cd ui-kit
corepack enable pnpm
pnpm install
```

`pnpm install` also runs `husky` to wire up the git hooks (pre-commit lint-staged + conventional-commit lint on the commit message).

## Repository layout

```
ui-kit/
├── packages/
│   └── ui-kraken/       # The library published to npm
├── apps/
│   └── example/         # Expo app + Storybook on-device
└── docs/PLAN.md         # Roadmap and open decisions
```

## Day-to-day commands

| Command                           | What it does                                                     |
| --------------------------------- | ---------------------------------------------------------------- |
| `pnpm --filter example start`     | Run the example Expo app normally                                |
| `pnpm --filter example storybook` | Run the example app in Storybook mode (`STORYBOOK_ENABLED=true`) |
| `pnpm --filter ui-kraken test`    | Run the library unit tests                                       |
| `pnpm --filter ui-kraken build`   | Build the library with tsup                                      |
| `pnpm lint`                       | Run ESLint across the whole monorepo                             |
| `pnpm typecheck`                  | Run `tsc --noEmit` across every workspace                        |
| `pnpm format`                     | Format everything with Prettier                                  |
| `pnpm changeset`                  | Add a changeset describing your change                           |

## Making a change to ui-kraken

1. Create a branch: `git checkout -b feat/my-component`.
2. Add the component under `packages/ui-kraken/src/`. Ship a `*.test.tsx` next to it (unit tests are required).
3. Add a `*.stories.tsx` next to the component so it renders in Storybook.
4. Verify locally:
   ```bash
   pnpm --filter ui-kraken test
   pnpm --filter example storybook
   ```
5. Run `pnpm changeset`, pick `patch` / `minor` / `major`, and describe the change in the summary. Commit the generated markdown file.
6. Open a PR against `main`. Fill in the PR template.

## Commit style

We enforce [Conventional Commits](https://www.conventionalcommits.org/) via commitlint. The commit-msg hook will reject anything else. Examples:

```
feat(button): add ghost variant
fix(button): correct disabled color in dark theme
docs: document TamaguiProvider setup
```

## Release flow

Releases are fully automated by [Changesets](https://github.com/changesets/changesets):

1. Every PR that touches `packages/ui-kraken` includes a changeset.
2. When a PR merges to `main`, the `Release` workflow opens or updates a `chore(release): version packages` PR that bumps versions and updates the changelog.
3. Merging that PR publishes to npm and tags the release.

Never bump versions or run `npm publish` by hand.

## Questions?

Open a thread in [Discussions](https://github.com/saldeclas-team/ui-kit/discussions).
