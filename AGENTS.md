# AGENTS.md — ui-kraken repo conventions

Rules for any human or AI collaborator working in this repo. **Read this before touching code.** Every skill in `.agents/skills/` assumes these rules and only adds domain-specific guidance on top — so if a skill contradicts this file, this file wins.

Read [`docs/PLAN.md`](./docs/PLAN.md) for the project roadmap and open decisions.

Task-specific skills (each has single responsibility — do not mix them):

- [`.agents/skills/creating-component-tamagui/SKILL.md`](./.agents/skills/creating-component-tamagui/SKILL.md) — building a visual/interactive component under `packages/ui-kraken/src/components/`.
- [`.agents/skills/creating-provider-tamagui/SKILL.md`](./.agents/skills/creating-provider-tamagui/SKILL.md) — building a React context provider under `packages/ui-kraken/src/provider/`.

---

## Repository layout

```
ui-kit/
├── packages/ui-kraken/     # The library published to npm as `ui-kraken`
│   └── src/
│       ├── tokens/         # KrakenTokens schema + translator + defaults
│       ├── provider/       # KrakenProvider + useKraken
│       ├── components/     # Every UI component (button/, card/, ...)
│       └── index.ts        # Public barrel (explicit named exports)
├── apps/example/           # Expo app for showcase + on-device Storybook
└── docs/PLAN.md            # Roadmap, locked decisions, open debates
```

## Non-negotiable rules

### Exports

- **NEVER `export default`.** Named exports only. The one exception is `apps/example/app/**/*.tsx` (Expo Router requires default exports on route components). ESLint enforces this.
- **NEVER `export *` in a barrel.** List every symbol explicitly so the API surface is precise and dead code stays detectable.
- Every folder with multiple exposable files has an `index.ts` that re-exports each public symbol by name.

### Naming

| Kind               | Case                 | Example                                |
| ------------------ | -------------------- | -------------------------------------- |
| Files              | kebab-case           | `kraken-provider.tsx`, `use-kraken.ts` |
| React components   | PascalCase           | `Button`, `KrakenProvider`             |
| Functions / hooks  | camelCase            | `buildKrakenConfig`, `useKraken`       |
| Global constants   | SCREAMING_SNAKE_CASE | `DEFAULT_KRAKEN_TOKENS`                |
| Types / interfaces | PascalCase           | `ButtonProps`, `KrakenTokens`          |

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
- Tokens defined in `packages/ui-kraken/src/tokens/` are prefixed `$kraken*` (e.g. `$krakenPrimary9`, `$krakenSpacingMd`) so they never collide with `@tamagui/config/v4` defaults.
- Interactive elements: minimum touch target 48 × 48 px.
- Press feedback on button-like elements: `pressStyle={{ scale: 0.98, opacity: 0.9 }}`.

### Color-override props (project convention)

Every component with color surfaces exposes overrides as **grouped object props**, one per semantic role. **No flat props** like `primaryColor` / `textPrimaryColor`.

```tsx
<Button.Primary
  buttonColors={{ primary: "#2563EB", secondary: "#1E40AF", disabled: "#93C5FD" }}
  textColors={{ primary: "#FFFFFF", secondary: "#E0E7FF", disabled: "#DBEAFE" }}
  iconColors={{ primary: "#FFFFFF" }}
>
  Save
</Button.Primary>
```

Each grouped prop is typed as its own interface in the component's `-types.ts`. Fallback order at render time: per-instance override → provider-derived Tamagui token.

### Testing

- Co-locate `*.spec.ts(x)` next to every file with logic.
- `@testing-library/react-native` v14 (sync destructuring queries from `render`).
- Mock `@tamagui/core` and the component's own `*.styled.ts` when testing behavior.
- Every interactive element carries `testID`; assertions prefer `getByTestId`.

### `testID` propagation

- Every component prop interface includes `testID?: string`.
- Root uses `testID ?? "<component-name>"` (kebab-case default).
- Subelements derive: `` `${testID}-label` ``, `` `${testID}-left-icon` ``, `` `${testID}-loader` ``.

### Documentation

- README.md per component (props table + at least 3 usage examples).
- Comments explain WHY (non-obvious constraint, workaround, subtle invariant). Never explain WHAT — the code already does that.

### Do NOT

- `console.log` in library code. Use `console.warn` / `console.error` for diagnostics that must surface.
- `require()` for source code (import instead). Allowed only for static assets — but ui-kraken currently ships none.
- `StyleSheet.create()` (banned by ESLint).
- Ad-hoc `useState`-based form validation. When form components arrive, use `react-hook-form` + `zod` as peer dependencies.

### Performance

- `useMemo` on object literals passed into context providers.
- `useCallback` on functions passed to memoized children or into effect deps.
- Only add `React.memo` after profiling shows a real re-render problem.

### Commits

- Conventional Commits (enforced by commitlint on the `commit-msg` hook).
- `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`, `perf`, `build`, `revert`.
- Every change to `packages/ui-kraken/**` requires a changeset (`pnpm changeset`).

### Push

- Only the user pushes. Automated tooling never runs `git push` — commit locally and report the SHA + suggested push command instead.

---

## Quick reference — where different things live

| I need to build…                                                  | Read this skill                                                                      | Files land in                                                                          |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| A visual/interactive component (Button, Card, Input)              | [`creating-component-tamagui`](./.agents/skills/creating-component-tamagui/SKILL.md) | `packages/ui-kraken/src/components/<name>/`                                            |
| A React context / provider (KrakenProvider, future ToastProvider) | [`creating-provider-tamagui`](./.agents/skills/creating-provider-tamagui/SKILL.md)   | `packages/ui-kraken/src/provider/` (or `providers/<name>/` once we have more than one) |
| A token schema / theme value                                      | (skill TBD)                                                                          | `packages/ui-kraken/src/tokens/`                                                       |
| A standalone hook                                                 | (skill TBD)                                                                          | co-located with its consumer, or `packages/ui-kraken/src/hooks/` for shared ones       |

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
