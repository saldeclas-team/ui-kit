---
name: drafting-pr-descriptions
description: After finishing an initiative and landing the last commit, produce a ready-to-paste PR title and PR body matching `.github/PULL_REQUEST_TEMPLATE.md`. Fires WITHOUT the user having to ask — the goal is that when the user says "listo" / "hecho" / "vamos con lo siguiente", the PR draft is already in the last message. Use ONLY at the end of an initiative, not after every intermediate commit.
---

# Drafting the PR title and body after committing

Scope of this skill: at the end of an initiative — after the last commit lands and before the user opens the PR — return a ready-to-paste PR title and PR body. Nothing else.

> **Before you start**, read [`AGENTS.md`](../../../AGENTS.md) (PR descriptions section), [`.github/PULL_REQUEST_TEMPLATE.md`](../../../.github/PULL_REQUEST_TEMPLATE.md), and the [`naming-git-branches`](../naming-git-branches/SKILL.md) skill. This one assumes those and only adds the handoff-at-end-of-initiative behavior.

---

## Why this exists

The maintainer opens PRs from GitHub Desktop. Every time I finish an initiative and commit, they have to ask "dame el título" / "dame la descripción del PR". That's a wasted round-trip: I have every piece of context I need to draft both the moment the last commit lands.

The rule this skill encodes: **when an initiative is done and committed, the PR title and body appear in the same message as the "done" report — without the user asking.**

---

## When it fires

Fire the handoff when ALL of these are true:

1. **All planned work is committed** on the current branch (no uncommitted changes, no pending tasks / TODOs the user has agreed to).
2. **The initiative is complete** — signalled by any of:
   - The user's last message closed the loop ("listo", "hecho", "perfecto", "vamos con lo siguiente").
   - You just committed the last commit of a plan the user approved.
   - The user explicitly asked for the PR title / body.
3. **The branch is a PR-bound branch** — not `main`, not a `changeset-release/*` branch (those are auto-managed).

Do NOT fire after every intermediate commit. Multi-commit initiatives should get one handoff, at the end, covering everything on the branch.

If uncertain whether the initiative is done, err toward firing — the user can ignore the draft. Silently withholding the draft costs another round-trip.

---

## What to return

Two blocks, in this order, in the same message that reports the last commit landed:

### 1. PR title

One line, in a `` ` `` fenced code block or a bold line the user can copy in one click. Rules:

- **Conventional Commit shape**: `<type>(<scope>): <sentence>`.
  - `<type>` = matches the branch type and the primary commit type.
  - `<scope>` = the primary area (`text`, `button`, `agents`, `ci`, …). If the branch spans several, pick the primary one — the body covers the rest.
- **Sentence**: imperative mood, present tense, no trailing period, ≤ 70 characters total (title cap on GitHub).
- Should read as a complete PR one-liner: a reviewer skimming `gh pr list` understands what shipped without opening.

Example:

> `feat(text): ship Text primitive with 13 variants and 14 color slots`

### 2. PR body

Match [`.github/PULL_REQUEST_TEMPLATE.md`](../../../.github/PULL_REQUEST_TEMPLATE.md) exactly. Fill Summary / Changes / Screenshots / Test plan and complete the Standards checklist. Uncheck items with a one-line justification (`_n/a — docs-only, no packages/ui-kraken/** change._`) rather than deleting rows — the template exists so unfilled sections are visible.

Concretely, the body must have:

- `## Summary` — 2–4 sentences. Say what shipped and why (motivation, not the mechanics). Link `Closes #N` if there's an issue.
- `## Changes` — a bulleted list of user-visible changes. Group by area if there are more than ~5 bullets. Skip anything obvious from the diff (formatting, minor renames).
- `## Screenshots / recordings` — for any visual change, include placeholders the user will fill (`<!-- upload light + dark screenshots -->`). For non-visual changes, write `_Docs-only change — no visual output._` or similar and keep the section (do not delete).
- `## Test plan` — describe what you exercised, not just "ran the test suite". Include what to check on-device / in Storybook / in the example app so the reviewer can reproduce.
- `## Standards checklist` — the full block from the template, checked and unchecked to match reality. Every unchecked row gets an inline note (`_n/a — no code changed._` / `_deferred to follow-up: #N._`).

Wrap the whole body in a fenced markdown code block (` ```markdown … ``` `) so the user can select-copy in one click without the outer chat markdown interfering.

---

## Format the handoff message

The end-of-initiative message shape:

````
<one-line report that the last commit landed, plus SHA and branch name>

**PR title**
`<title>`

**PR body**
```markdown
## Summary
…
````

```

Optional lead-in: a short "cuando pushees, acá va el PR" so the user knows exactly what to do next. Skip it if the previous message already said "your turn to push."

---

## Checklist before returning the handoff

1. `git status` says the tree is clean.
2. `git log main..HEAD --oneline` shows exactly the commits you expect on the branch.
3. Title is ≤ 70 chars, has a Conventional Commit `type(scope):` prefix, and describes the WHOLE branch, not just the last commit.
4. Body has all 5 template sections (Summary, Changes, Screenshots, Test plan, Standards checklist).
5. Every checklist row is either checked or has a one-line justification — none deleted.
6. Body is wrapped in a fenced `markdown` code block for easy copy.

---

## Edge cases

- **Long-lived branch with many commits** — the PR body should summarize the WHOLE branch scope, not restate every commit. If commits diverge in theme, group the Changes bullets by area.
- **Rebase / force-push planned** — say so in the handoff. `_Note: about to rebase to squash the two prettier-only commits before pushing._`
- **Draft PR** — if the initiative isn't ship-ready (waiting for design review, follow-up work), still hand off the title/body but add a `_Open as a Draft PR: [reason]._` line above the title.
- **Blocked / partial work** — do NOT fire this skill. The initiative is not done. Report the blocker instead.
- **Docs-only or workflow-only PR** — Screenshots section reads `_Docs-only change — no visual output._`. Standards checklist has most rows unchecked with `_n/a — no code / no exports / no styling …_` justifications. Do not skip the section.
- **Multi-package changes** — pick the primary scope for the title; enumerate the others in the Summary. Example: `feat(text): …` even if the token/provider changes are separate commits.

---

## Related skills

- [`naming-git-branches`](../naming-git-branches/SKILL.md) — the branch name and the PR title should agree in type and scope. Draft the branch name first (before the work), draft the PR title last (after the work).
- [`creating-component-tamagui`](../creating-component-tamagui/SKILL.md) / [`creating-provider-tamagui`](../creating-provider-tamagui/SKILL.md) — those skills say "run the full checklist and open the PR." This skill covers what "open the PR" produces before the user clicks the button.
```
