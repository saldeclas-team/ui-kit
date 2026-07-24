<!--
  Read AGENTS.md (repo root) and, if this PR touches a component or provider,
  the matching skill in .agents/skills/. Every checkbox below maps to a rule
  those docs enforce.
-->

## Summary

<!-- What does this PR do and why? Link the related issue with `Closes #N` if any. Write in English. -->

## Changes

<!-- Bulleted list of user-visible changes. Keep it high-signal — anything obvious from the diff can be skipped. -->

## Screenshots / recordings

<!-- Required for any visual change. Include light and dark screenshots side by side. Remove this section otherwise. -->

## Test plan

<!-- How did you verify this works? "Ran `pnpm test`" is not enough — describe what you exercised in Storybook or the example app. -->

---

## Standards checklist

Everything below reflects the non-negotiable rules in [`AGENTS.md`](../AGENTS.md). Uncheck what does not apply and add a note explaining why.

### Scope & language

- [ ] Every identifier, comment, doc string, filename, and commit message is in **English**.
- [ ] Changeset added (`pnpm changeset`) if this touches `packages/ui-kraken/**`.
- [ ] Commit messages follow **Conventional Commits** (`feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`, `perf`, `build`, `revert`).

### Exports

- [ ] **No `export default`** in library / provider / hook files. (Only `apps/example/app/**` route files, `**/.rnstorybook/**`, `*.config.ts`, and `*.stories.tsx` are allowed defaults.)
- [ ] **No `export *`** in barrels — every symbol is enumerated explicitly.
- [ ] Every new folder with multiple exposable files has an `index.ts` re-exporting each public symbol.

### Naming

- [ ] Files and folders use **kebab-case** (`kraken-provider.tsx`, `components/button/`).
- [ ] React components use **PascalCase**; functions and hooks use **camelCase** (hooks start with `use`); global constants use **SCREAMING_SNAKE_CASE**.
- [ ] Prop interface named `<ComponentName>Props`.
- [ ] Callback props start with `on`, local handlers start with `handle`.
- [ ] No abbreviations except universal ones (`props`, `id`, `url`, `api`, `hex`).

### Types

- [ ] Uses `interface` for props / context values / extensible objects.
- [ ] Uses `type` only for unions, tuples, function signatures, aliases.
- [ ] Type-only imports use `import type` (enforced by ESLint).
- [ ] **No `any`** — used `unknown` + narrowing or generics.

### Styling (library code only)

- [ ] All component styles come from Tamagui `styled()` in a `*.styled.ts` file.
- [ ] **No `StyleSheet.create()`** in the library (blocked by ESLint).
- [ ] All colors / spacing / radius reference `$kraken*` theme tokens — no hex literals in `*.styled.ts`.
- [ ] Interactive elements meet 48 × 48 px minimum touch target.
- [ ] Button-like elements include `pressStyle={{ scale: 0.98, opacity: 0.9 }}`.

### Color-override props

- [ ] Any new component exposes color overrides as **grouped role props** (`buttonColors`, `textColors`, `iconColors`, …).
- [ ] Each grouped-color prop has its own interface in `*-types.ts`.
- [ ] Fallback order documented / implemented: per-instance override → provider-derived Tamagui token.

### `testID` propagation

- [ ] Component prop interface includes `testID?: string`.
- [ ] Root element uses `testID ?? "<component-name>"`.
- [ ] Every subelement of interest derives its testID (`` `${testID}-label` ``, `` `${testID}-loader` ``, …).

### Testing

- [ ] `*.spec.ts(x)` file co-located next to every file with logic.
- [ ] `@testing-library/react-native` v14 pattern: `await render(...)` + `screen.getByTestId(...)`.
- [ ] External deps (`@tamagui/core`, styled files, expo modules) mocked when the test does not need the real thing.
- [ ] Tests cover every variant, every interactive state, and at least one override case.

### Storybook (components only)

- [ ] `*.stories.tsx` next to the component, one story per variant × size.
- [ ] At least one story with per-instance color overrides.
- [ ] One dark-theme story via `<Theme name="dark">`.

### Documentation

- [ ] `README.md` per new component with props table + at least 3 usage examples, all in English.
- [ ] JSDoc on every public prop explains **what the user sees**, not what the code does.
- [ ] Comments in code explain **WHY** (non-obvious constraint, workaround, invariant). Never explain WHAT.

### Do NOT

- [ ] No `console.log` in library code (`console.warn` / `console.error` OK).
- [ ] No `require()` for source code (imports only). Static assets are OK.
- [ ] No ad-hoc `useState` form validation — RHF + zod when form components arrive.
- [ ] No new global state / singletons without a documented reason.

### Performance

- [ ] `useMemo` on object literals passed into context providers.
- [ ] `useCallback` on callbacks passed to memoized children or effect deps.
- [ ] No `React.memo` added without a profiling justification.

### npm publishing hygiene (only if `packages/ui-kraken/package.json` changed)

- [ ] `description` is a full English sentence describing what the package ships.
- [ ] `keywords` still cover discoverability terms (react-native, expo, tamagui, ui-kit, …).
- [ ] `sideEffects: false` is preserved.
- [ ] `exports` map still declares `types`, `react-native`, `import`, `require` conditions.
- [ ] `files` list does not accidentally include tests / stories / internal notes.
- [ ] No new `postinstall` / `preinstall` scripts.

### CI

- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` all pass locally.
- [ ] CI green on this PR before merging.
