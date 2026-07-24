# AGENTS.md — ui-kraken repo conventions

Rules for any human or AI collaborator working in this repo. **Read this before touching code.** Every skill in `.agents/skills/` assumes these rules and only adds domain-specific guidance on top — so if a skill contradicts this file, this file wins.

Read [`docs/PLAN.md`](./docs/PLAN.md) for the project roadmap and open decisions.

Task-specific skills (each has single responsibility — do not mix them):

- [`.agents/skills/creating-component-tamagui/SKILL.md`](./.agents/skills/creating-component-tamagui/SKILL.md) — building a visual/interactive component under `packages/ui-kraken/src/components/`.
- [`.agents/skills/creating-provider-tamagui/SKILL.md`](./.agents/skills/creating-provider-tamagui/SKILL.md) — building a React context provider under `packages/ui-kraken/src/provider/`.
- [`.agents/skills/naming-git-branches/SKILL.md`](./.agents/skills/naming-git-branches/SKILL.md) — naming a new git branch so its intent is legible from `gh pr list` alone.
- [`.agents/skills/drafting-pr-descriptions/SKILL.md`](./.agents/skills/drafting-pr-descriptions/SKILL.md) — at the end of an initiative, produce a ready-to-paste PR title and body matching the template, without the user having to ask.

---

## Repository layout

```
ui-kit/
├── packages/ui-kraken/     # The library published to npm as `ui-kraken`
│   └── src/
│       ├── tokens/         # Tokens schema + translator + defaults
│       ├── provider/       # KrakenProvider + useUIKit
│       ├── components/     # Every UI component (button/, card/, ...)
│       └── index.ts        # Public barrel (explicit named exports)
├── apps/example/           # Expo app for showcase + on-device Storybook
└── docs/PLAN.md            # Roadmap, locked decisions, open debates
```

## Non-negotiable rules

### Language

- **Everything ships in English.** Identifiers, prop names, type names, file names, folder names, code comments, README content, commit messages, PR descriptions, changesets, JSDoc. Do NOT mix Spanish or other languages into shipped code or public docs.
- The ONLY places where non-English text is acceptable: user-facing localized strings inside `apps/example/` demo screens (if we ever add them), and conversational messages in issues / PR discussions.
- This applies to placeholder / example content too: `<Button>Save</Button>`, not `<Button>Guardar</Button>`.

### Exports

- **NEVER `export default`.** Named exports only. The one exception is `apps/example/app/**/*.tsx` (Expo Router requires default exports on route components). ESLint enforces this.
- **NEVER `export *` in a barrel.** List every symbol explicitly so the API surface is precise and dead code stays detectable.
- Every folder with multiple exposable files has an `index.ts` that re-exports each public symbol by name.

### Naming

| Kind                                       | Case                                          | Example                                      |
| ------------------------------------------ | --------------------------------------------- | -------------------------------------------- |
| Files                                      | kebab-case                                    | `kraken-provider.tsx`, `use-kraken.ts`       |
| Folders                                    | kebab-case                                    | `components/button/`, `provider/`            |
| React components                           | PascalCase                                    | `Button`, `KrakenProvider`                   |
| Functions / hooks (hooks start with `use`) | camelCase                                     | `buildConfig`, `useUIKit`                    |
| Global constants                           | SCREAMING_SNAKE_CASE                          | `DEFAULT_TOKENS`                             |
| Types / interfaces                         | PascalCase                                    | `ButtonProps`, `Tokens`                      |
| Prop interfaces                            | `<ComponentName>Props`                        | `ButtonProps`                                |
| Grouped color prop                         | camelCase prop, PascalCase type               | prop `buttonColors: ButtonColors`            |
| Enums / union types                        | PascalCase for the type, camelCase for values | `type ButtonTone = "primary" \| "secondary"` |

Descriptive naming rules:

- **Boolean props read like statements** — `disabled`, `loading`, `isLoading`, `hasError` (not `disable`, `load`).
- **Callback props start with `on`** — `onPress`, `onLayout`, `onValueChange`.
- **Local handlers start with `handle`** — `const handlePress = () => ...`, wired as `onPress={handlePress}`.
- **Avoid abbreviations** unless universal (`props`, `id`, `url`, `api`, `hex`). Prefer `background` over `bg`, `configuration` over `cfg`, `error` over `err`.
- **Component filename matches the exported component in kebab-case** — `Button` exports from `button.tsx`, `KrakenProvider` from `kraken-provider.tsx`.

Filename suffixes that carry meaning:

- `*.styled.ts` — Tamagui styled primitives only
- `*-types.ts` — TypeScript type declarations only
- `*-context.tsx` — React context definitions
- `*.spec.ts(x)` — unit tests, co-located
- `*.stories.tsx` — Storybook stories

### Types

- `interface` for props / context values / extensible objects.
- `type` for unions, tuples, function signatures, aliases.
- Prop interfaces are named `<ComponentName>Props`.
- **`import type`** for type-only imports.
- **NEVER `any`.** Use `unknown` + narrowing or generics.

### Styling (library code only)

- Only Tamagui `styled()`. `StyleSheet.create()` from React Native is banned repo-wide (ESLint).
- Only theme tokens for colors, spacing, radius, typography. No hex literals in `*.styled.ts`.
- Tokens defined in `packages/ui-kraken/src/tokens/` are prefixed `$kraken*` (e.g. `$krakenPrimary9`, `$uiSpacingMd`) so they never collide with `@tamagui/config/v4` defaults.
- Interactive elements: minimum touch target 48 × 48 px.
- Press feedback on button-like elements: `pressStyle={{ scale: 0.98, opacity: 0.9 }}`.

### Platform support

- **Every component must render on iOS + Android + Web.** `react-native-web` is an optional peer (landed 2026-07-24); consumers who want web opt in by installing it. Tamagui + RN primitives translate to DOM automatically — components typically "just work" without web-specific code.
- Any component that MUST opt out of a platform gates the feature at runtime with `Platform.OS !== "web"` (or the applicable check) and documents the limitation under a `## Platform support` section in that component's `README.md`. Don't preemptively write `.web.tsx` files — reach for platform shims only after verification proves you need one.
- Verification happens on-device during Phase 3 (Chromatic snapshots each story on a headless Chromium via `react-native-web`). Until Phase 3 lands, contributors verify manually with `pnpm --filter @ui-kraken/example web`.

### Color-override model (project convention)

**Tokens are per-component, NOT global.** There is no `primaryColor: string` at the theme root. Instead the provider (`KrakenProvider`) receives one block per component role:

```tsx
<KrakenProvider
  tokens={{
    buttonColors: {
      primary: { background: "#2563EB", label: "#FFFFFF" },
      secondary: { background: "#0EA5E9", label: "#FFFFFF" },
      outline: { border: "#2563EB", label: "#2563EB" },
      ghost: { label: "#2563EB" },
      destructive: { background: "#DC2626", label: "#FFFFFF" },
    },
    radius: 12,
    spacing: 8,
  }}
  dark={{ buttonColors: { primary: { background: "#3B82F6", label: "#FFFFFF" } } }}
  defaultTheme="system"
>
  <App />
</KrakenProvider>
```

Every component gets its own block (`buttonColors`, future `textColors`, `cardColors`, etc.), keyed by the component's variants. The slots inside each variant match the visible surfaces of that component — for Button that's `{ background?, label, border? }`; other components will define their own slot set.

**At the component instance**, the same block name is used to override — but scoped to the variant already selected:

```tsx
<Button.Primary buttonColors={{ background: "#FF6B00" }}>
  Override just the background — label falls back to the theme.
</Button.Primary>
```

Every field is optional. Missing slots inherit from the theme. Fallback order at render: per-instance override → provider-level `buttonColors[variant]` → shipped default (`DEFAULT_TOKENS`).

**Design rules for new components:**

- Ship the block under a name that matches the component role in plural + `Colors`: `buttonColors`, `cardColors`, `inputColors`.
- Each variant / hierarchy level is a key: `{ primary: {...}, secondary: {...} }` for variant-based components; `{ primary: string, secondary: string, tertiary: string }` for hierarchy-based components (like text and card layers).
- Do NOT add "state" slots per variant unless the state needs a distinct color (e.g. loading with a visible spinner tint). `disabled` / `loading` are handled uniformly by `opacity: 0.45` — no separate slot.
- Every color slot is a plain hex string in v0.2. Parser for `rgb()` / named colors comes later.

### Testing

- Co-locate `*.spec.ts(x)` next to every file with logic.
- `@testing-library/react-native` v14 (sync destructuring queries from `render`).
- Mock `@tamagui/core` and the component's own `*.styled.ts` when testing behavior.
- Every interactive element carries `testID`; assertions prefer `getByTestId`.
- **Snapshots required for every visual component.** Ship a `describe("snapshots")` block in the spec that iterates every variant × relevant axis (tone / size / state / color / intensity — whatever the component exposes), calling `expect(screen.toJSON()).toMatchSnapshot()` per case. See `button.spec.tsx` / `text.spec.tsx` for the pattern. Intentional snapshot changes: `pnpm --filter ui-kraken test -u`, review the `.snap` diff, commit both code and snapshot together.
- **Coverage gate is enforced by Codecov.** Every PR gets `codecov/patch` (new code must hit 80%) as a required check; `codecov/project` is configured in `codecov.yml` but does not post reliably in this repo (see [`docs/CODECOV-AND-SNAPSHOTS-PLAN.md`](./docs/CODECOV-AND-SNAPSHOTS-PLAN.md) "Known issue" section — do NOT try to promote it to required). Upload wired in `.github/workflows/ci.yml` via `codecov/codecov-action@v5`. Local threshold in `packages/ui-kraken/jest.config.cjs` catches the same regressions before push.
- **Visual regression is enforced by Chromatic** (`.github/workflows/chromatic.yml`). Every PR gets a `UI Tests` status check — Chromatic renders every Storybook story in headless Chromium, diffs pixels against the baseline on `main`, and posts a status. Intentional visual changes: open the PR, wait for Chromatic run, click through to the Chromatic UI, review each diff, accept — that acceptance becomes the new baseline when the PR merges. Storybook stories are therefore REQUIRED for visual components (they ARE the visual regression matrix). See [`docs/CHROMATIC-PLAN.md`](./docs/CHROMATIC-PLAN.md).

### `testID` propagation

- Every component prop interface includes `testID?: string`.
- Root uses `testID ?? "<component-name>"` (kebab-case default).
- Subelements derive: `` `${testID}-label` ``, `` `${testID}-left-icon` ``, `` `${testID}-loader` ``.

### Documentation

- README.md per component (props table + at least 3 usage examples), all in English.
- Comments explain WHY (non-obvious constraint, workaround, subtle invariant). Never explain WHAT — the code already does that.
- Component / prop `description` in JSDoc — one sentence, present tense, describes the visible behavior. e.g. `/** Replaces the left icon with a loader and blocks presses. */`.
- Package.json `description` — one full sentence, English, describes what the package does and what it ships. This is what shows up on npm's search results and package page.

### npm publishing hygiene

- `packages/ui-kraken/package.json` is the public face of the library. Every field matters for npm search, security, and consumer DX. Do not merge changes that:
  - lower the `description` quality or truncate keywords,
  - remove `sideEffects: false` (breaks tree-shaking),
  - remove `types` from `exports` (breaks TypeScript autocomplete for consumers),
  - broaden the `files` include list (accidentally publishes tests, stories, or internal notes),
  - add `postinstall` / `preinstall` scripts (npm warns loudly and it's a supply-chain smell).
- Every publish is provenance-signed once OIDC lands (deferred — see docs/PLAN.md §4).

### Do NOT

- `console.log` in library code. Use `console.warn` / `console.error` for diagnostics that must surface.
- `require()` for source code (import instead). Allowed only for static assets — but ui-kraken currently ships none.
- `StyleSheet.create()` (banned by ESLint).
- Ad-hoc `useState`-based form validation. When form components arrive, use `react-hook-form` + `zod` as peer dependencies.

### Performance

- `useMemo` on object literals passed into context providers.
- `useCallback` on functions passed to memoized children or into effect deps.
- Only add `React.memo` after profiling shows a real re-render problem.

### Branches

- Format: `<type>/<scope>-<short-verb-phrase>` (all kebab-case, lowercase, ASCII).
- `<type>` matches the Conventional Commit types below.
- `<scope>` matches the future commit scope (`button`, `text`, `tokens`, `provider`, `example`, `ci`, `release`, `deps`, …).
- `<short-verb-phrase>` describes the change, not the trigger. Aim for 20–50 chars total.
- A reviewer scanning `gh pr list` should understand the intent without clicking. See the [`naming-git-branches`](./.agents/skills/naming-git-branches/SKILL.md) skill for the full rulebook, good/bad examples, and edge cases (releases, reverts, exploration).

### Commits

- Conventional Commits (enforced by commitlint on the `commit-msg` hook).
- `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`, `perf`, `build`, `revert`.
- Every change to `packages/ui-kraken/**` requires a changeset (`pnpm changeset`).

### Push

- Only the user pushes. Automated tooling never runs `git push` — commit locally and report the SHA + suggested push command instead.
- **`main` is protected — never push to it directly.** All changes to `main`, without exceptions (feature / fix / doc / chore / one-liner), land via a pull request. GitHub branch protection on `main` blocks direct pushes and force-pushes and enforces the rule for admins too. If a local branch's upstream is set to `origin/main` (from a rename or a `git checkout main && checkout -b`), unset it (`git branch --unset-upstream`) before pushing — otherwise the push tries to fast-forward main and gets rejected.
- Before every push, verify with `git branch -vv` that the current branch tracks its OWN remote (or has no upstream yet), not `origin/main`.

### PR descriptions

- Every PR follows [`.github/PULL_REQUEST_TEMPLATE.md`](./.github/PULL_REQUEST_TEMPLATE.md). Fill Summary / Changes / Screenshots (or drop with a note) / Test plan, and complete the Standards checklist — uncheck items with a one-line justification instead of deleting rows.
- **AI collaborators**: when an initiative is done and committed, return the PR title + body **in the same message as the "done" report**, without waiting for the user to ask. See the [`drafting-pr-descriptions`](./.agents/skills/drafting-pr-descriptions/SKILL.md) skill for the trigger rules and the exact format.

---

## Quick reference — where different things live

| I need to…                                                              | Read this skill                                                                      | Files land in                                                                          |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Build a visual/interactive component (Button, Card, Input)              | [`creating-component-tamagui`](./.agents/skills/creating-component-tamagui/SKILL.md) | `packages/ui-kraken/src/components/<name>/`                                            |
| Build a React context / provider (KrakenProvider, future ToastProvider) | [`creating-provider-tamagui`](./.agents/skills/creating-provider-tamagui/SKILL.md)   | `packages/ui-kraken/src/provider/` (or `providers/<name>/` once we have more than one) |
| Name a new git branch                                                   | [`naming-git-branches`](./.agents/skills/naming-git-branches/SKILL.md)               | n/a (git only)                                                                         |
| Draft the PR title and body after committing                            | [`drafting-pr-descriptions`](./.agents/skills/drafting-pr-descriptions/SKILL.md)     | n/a (chat handoff)                                                                     |
| Build a token schema / theme value                                      | (skill TBD)                                                                          | `packages/ui-kraken/src/tokens/`                                                       |
| Build a standalone hook                                                 | (skill TBD)                                                                          | co-located with its consumer, or `packages/ui-kraken/src/hooks/` for shared ones       |

Every skill enforces this same file layout for its domain:

```
<domain-folder>/<name>/
├── <name>.tsx (or .ts)  # main logic
├── <name>.styled.ts     # ONLY if visual — Tamagui styled primitives
├── <name>-types.ts      # types only
├── <name>.spec.ts(x)    # tests
├── <name>.stories.tsx   # ONLY if visual — Storybook
├── README.md            # public docs
└── index.ts             # explicit named exports (never `export *`)
```
