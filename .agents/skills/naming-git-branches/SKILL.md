---
name: naming-git-branches
description: Name a git branch for work in this repo. Enforces the `<type>/<scope>-<short-verb-phrase>` shape so that a branch name alone tells a reviewer the intent and the affected area without opening the diff. Use ONLY when creating a new branch — do not use for existing branches (rename them only if the maintainer asks).
---

# Naming a git branch

Scope of this skill: choosing the name for a new git branch. Nothing else.

> **Before you start**, read [`AGENTS.md`](../../../AGENTS.md) — the Commits section covers Conventional Commit types which this skill reuses. The Push section reminds you that only the maintainer pushes; you commit and hand off the SHA + suggested push command.

---

## Why this exists

Branch names show up in three places a reviewer scans **before** they open the diff: the GitHub PR list, the CLI `git branch -a` output, and the release-notes changelog. A branch called `feat/text` forces the reviewer to open the PR to figure out whether it's the Text component, a bugfix for Text, or a doc update mentioning text. A branch called `feat/text-primitive-with-13-variants` answers the question before the click.

The maintainer of this repo cares about onboarding-quality git history — the same standard as commits and PR descriptions. A vague branch name breaks that standard.

---

## The rule

```
<type>/<scope>-<short-verb-phrase>
```

- **`<type>`** — one of the Conventional Commit types enforced by commitlint:
  `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`, `perf`, `build`, `revert`.
- **`<scope>`** — the component / package / area affected, in kebab-case. Match the commit scope you'll use inside the branch — `button`, `text`, `tokens`, `provider`, `example`, `ci`, `release`, `deps`, etc.
- **`<short-verb-phrase>`** — 2–5 kebab-case words that describe **what changes**, not what triggered the change. Prefer a verb or object. Skip filler words (`add`, `update`, `make`, `refactor` — those are already in `<type>`).

Total length target: **20–50 characters** including the type/slash. Longer is fine if it earns its keep; shorter than 20 is almost always too vague.

Every segment is **kebab-case**, lowercase, ASCII only. No underscores, no camelCase, no accents. No trailing slash, no issue numbers unless the maintainer asks (issue numbers belong in commit messages and PR bodies, not branches).

---

## Good vs bad — real examples from this repo

| Bad              | Better                            | Why                                                                                     |
| ---------------- | --------------------------------- | --------------------------------------------------------------------------------------- |
| `feat/text`      | `feat/text-primitive-13-variants` | "text" could be anything; the specific one is the primitive with 13 variants            |
| `fix/dark-mode`  | `fix/button-dark-mode-shadow`     | "dark-mode" doesn't say which component or what broke                                   |
| `chore/update`   | `chore/actions-node-bump`         | "update" describes nothing; the actual change is Node bump in the actions               |
| `feat/tokens`    | `refactor/tokens-per-component`   | "feat" hides that this reshapes an existing schema (breaking); "tokens" hides the shift |
| `docs/readme`    | `docs/text-component-readme`      | "readme" — which one? Which change?                                                     |
| `feat/new-stuff` | `feat/text-component`             | If short, at least identify the deliverable, not the intent                             |
| `alexis/text`    | `feat/text-primitive-13-variants` | Personal branches obscure what the branch is for; the maintainer maintains this repo    |

### Historically well-named branches in this repo (keep this pattern)

- `chore/actions-node-bump` — type + scope + specific change
- `chore/npm-oidc-publish` — type + scope + what shipped
- `feat/kraken-provider-and-button` — type + scope + deliverables

### Historically under-named (do not repeat)

- `feat/text` — too terse; should have been `feat/text-primitive-13-variants` or similar

---

## Checklist before you `git checkout -b`

1. Pick the type — is this a `feat` (new user-visible thing), `fix` (bug), `refactor` (no behavior change), `chore` (tooling / infra), or one of the others?
2. Name the scope — which component, package, or area does this touch? Match the future commit scope. If the change spans two, pick the primary one (Text component + provider changes → `feat/text-primitive-...`, not `feat/text-and-provider`).
3. Draft the short verb phrase — describe the change, not the trigger. "add" / "update" / "make" are usually filler; drop them.
4. Read it aloud. Would a reviewer scanning `gh pr list` understand what's inside without clicking?
5. Length check — is it 20–50 characters? Shorter than 20 → almost always too vague. Longer than 50 → trim adjectives.
6. Kebab-case check — all lowercase, dashes only, no underscores, no dots, no accents.

If the branch will bundle unrelated work (rare — prefer separate branches), name it after the primary deliverable and mention the secondary work in the PR body.

---

## Edge cases

- **Release / version-bump branches** — leave to changesets. It auto-names them `changeset-release/main`; don't rename.
- **Long-lived feature branches** — use the same shape but expect the name to age. If scope drifts, rebase onto a fresh branch with an updated name rather than accumulating on a stale one.
- **Personal exploration** — if you must (rare), prefix with `spike/` or `explore/` instead of a Conventional-Commit type, and never open a PR from it directly — cherry-pick the useful commits onto a properly named branch.
- **Reverts** — use `revert/<sha-or-scope>-<what>` (e.g. `revert/button-elevation-swap`), matching the `revert` commit type.
- **Rename requests** — never rename a branch someone else pushed without asking; branch names appear in `gh pr` URLs and third-party integrations (CI, changesets, GitHub notifications).

---

## Related conventions

- **Commit messages** — the branch name and the commit `type(scope):` line should agree. If the branch is `feat/text-primitive-13-variants`, the first commit typically is `feat(text): ...` or `feat(tokens): ...` (scope narrows per commit).
- **PR titles** — the PR title is a full sentence; the branch name is a slug. `feat/text-primitive-13-variants` → PR title `feat(text): ship the Text primitive with 13 HTML-familiar variants`.
- **PR body** — follow [`.github/PULL_REQUEST_TEMPLATE.md`](../../../.github/PULL_REQUEST_TEMPLATE.md). It expects Summary / Changes / Screenshots / Test plan sections plus the Standards checklist — do not replace the checklist; uncheck items with a note if they do not apply.
