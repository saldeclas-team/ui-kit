---
"ui-kraken": minor
---

feat(radio-group, alert, provider): ship RadioGroup, refactor Alert to own its color block, rename provider — v0.7.0 (BREAKING)

**RadioGroup** (new component, the 4th public one)

Group of mutually-exclusive selectable options (single-choice picker). Controlled, generic in the value type, vertical or horizontal layout, provider-level + per-instance color overrides.

- **API**: `<RadioGroup<T>` with `value: T | null`, `onChange: (v: T) => void`, `options: Array<{value, label}>`, optional `label`, `disabled`, `orientation: "vertical" | "horizontal"` (vertical default), `radius` (same shape as `ButtonRadius`), `radioGroupColors?: Partial<RadioGroupColors>`, `testID`.
- **Own color block**: `radioGroupColors` on `Tokens` — 7 slots (`selectedBorder`, `unselectedBorder`, `dot`, `label`, `groupLabel`, optional `selectedBackground` and `unselectedBackground`). Provider-level override at `<UIKitProvider tokens={{ radioGroupColors: {...} }}>`; per-instance override via the `radioGroupColors?` prop. Ships `DEFAULT_LIGHT_RADIO_GROUP_COLORS` / `DEFAULT_DARK_RADIO_GROUP_COLORS`.
- **Accessibility**: container `accessibilityRole="radiogroup"` + `accessibilityLabel`; every option row `accessibilityRole="radio"` + `accessibilityState={{selected, disabled}}`; 48 × 48 px minimum touch target; no-op on tapping the already-selected option.
- **Non-goals**: no standalone `<Radio>`, no uncontrolled mode, no per-option disabling, no rich option content, no error state (all deferred; see `docs/RADIO-GROUP-PLAN.md`).
- 33 spec tests + 11 structural snapshots + 8 Storybook stories + full example screen.

**Alert refactor — now owns its color block on the token schema (BREAKING for type imports)**

Alert v0.6.0 derived its palette from `textColors` at runtime — tech debt against the `each-component-owns-color-space` rule. v0.7.0 adds `alertColors` to the token schema:

- New provider block `alertColors: AlertColors` on `Tokens` — one 4-slot palette (`background`, `text`, `icon`, optional `border`) per variant (`info`, `success`, `warning`, `danger`).
- New light + dark defaults tuned for WCAG AA contrast on both surfaces.
- New provider input type `AlertColorsInput` — partial-of-partials, same shape as `ButtonColorsInput`.
- `alert.tsx` refactored: reads `useUIKit().tokens.alertColors[variant]` instead of deriving from `textColors`. `withAlpha` helper deleted (backgrounds now come pre-tinted from defaults).

**Type renames (breaking)**:

  * `AlertColors` — used to be the per-variant slot shape (`{background, text, icon, border?}`); now is the aggregate `{info, success, warning, danger}` (matches `ButtonColors` shape). If you imported the old `AlertColors`, use `AlertVariantColors` instead.
  * `AlertColorsInput` — used to be per-instance override (`Partial<{...slots}>`); now is provider-level input (`Partial<Record<variant, Partial<slots>>>`, matches `ButtonColorsInput`).
  * **New**: `AlertVariantColors` (per-variant slots) + `AlertVariantColorsInput` (per-instance override).

**Prop `alertColors={{...}}` on `<Alert>` unchanged** — runtime shape `{background?, text?, icon?, border?}` is identical, only the type name changed.

**Provider rename: `KrakenProvider` → `UIKitProvider` (BREAKING)**

`KrakenProvider` was v0.4.0's "kept for brand identity" component. Renamed for full consistency with `useUIKit` + `UIKitContext`. No deprecated alias — clean cutover.

**Consumer migration**:

```diff
- import { KrakenProvider } from "ui-kraken";
+ import { UIKitProvider } from "ui-kraken";

- <KrakenProvider defaultTheme="dark">
+ <UIKitProvider defaultTheme="dark">
    <App />
- </KrakenProvider>
+ </UIKitProvider>
```

Same props (`tokens`, `dark`, `defaultTheme`, `children`), same runtime behavior. `useUIKit`, `useColorScheme` integration, `ThemeMode`, `Tokens`, and every other export unchanged.

**Internal architecture: tokens/ folder restructure + new utils/ folder**

Not user-facing but improves how contributors add components. See `docs/BUTTON-PLAN.md`, `docs/TYPOGRAPHY-PLAN.md`, and the updated `.agents/skills/creating-component-tamagui/SKILL.md` for the new patterns.

- **`packages/ui-kraken/src/tokens/defaults/`** — one file per component (`button.ts`, `text.ts`, `alert.ts`, `radio-group.ts`) holding that component's `DEFAULT_LIGHT_*` + `DEFAULT_DARK_*` palettes + `merge*` helpers. `defaults/index.ts` aggregates into `DEFAULT_TOKENS` + `DEFAULT_DARK_TOKENS`. Adding a component = 1 new file + 1 line in the aggregator.
- **`packages/ui-kraken/src/utils/`** — cross-cutting helpers:
  - `utils/color.ts` — pure color math (`tint`, `hexToHsl`, `hslToHex`, `parseHex`, `rgbToHex`, `clamp`).
  - `utils/flatten.ts` — `flatten*Colors` helpers that turn nested palettes into flat `$ui*` Tamagui tokens.
- `tokens/tokens-derive.ts` slimmed to just `coarseToFineTokens` (was 110 lines, now 29). `tokens/tokens.ts` slimmed to `buildConfig` + `Config` + re-exports (was 155 lines, now 103).

**Kraken → UIKit full sweep (also breaking, no more surface than the provider rename)**

Every non-package-name reference to `Kraken` swept: `KrakenProvider`, stale `KrakenTextColors` / `<KrakenProvider>` in comments, `$kraken*` mentions in SKILL.md examples (actual tokens have been `$ui*` since v0.4.0), obsolete file-name examples in AGENTS.md + PR template + `naming-git-branches` skill. Only `ui-kraken` the npm package name remains.

**Verification**

- `pnpm typecheck`, `pnpm -r lint`, `pnpm test`, `pnpm --filter ui-kraken build` — all green.
- **201 tests** (was 163 pre-refactor, +38), **96 snapshots** (was 66, +30).
- `dist/index.d.ts` grew from 36.87 KB → 47.15 KB (+28%, from the new component + token blocks + type renames).

**Docs updated**

- `docs/ALERT-PLAN.md` — status flipped to "shipped in v0.7.0 with the alertColors refactor".
- `docs/RADIO-GROUP-PLAN.md` — status flipped to shipped.
- `docs/BUTTON-PLAN.md`, `docs/TYPOGRAPHY-PLAN.md`, `docs/PLAN.md`, `docs/CHROMATIC-PLAN.md` — Kraken sweep.
- `AGENTS.md`, `.agents/skills/creating-component-tamagui/SKILL.md`, `.agents/skills/creating-provider-tamagui/SKILL.md`, `.agents/skills/naming-git-branches/SKILL.md`, `.github/PULL_REQUEST_TEMPLATE.md` — updated for `UIKitProvider` + new token-wiring recipe + `$ui*` prefix.
- Every component `README.md` — swapped `KrakenProvider` → `UIKitProvider`. Alert README rewritten to document `alertColors` provider block.
