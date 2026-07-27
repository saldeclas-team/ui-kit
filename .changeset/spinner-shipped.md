---
"ui-kraken": minor
---

Add `Spinner` — themed activity indicator wrapping RN's built-in `ActivityIndicator` with palette-resolved color + size presets that read naturally at the callsite. Small building-block primitive for loading states inside Cards, Buttons, list rows, and empty-state screens.

## API

- `<Spinner>` wraps `ActivityIndicator`; every RN prop except `color` + `size` flows through the spread. Own props: `size` (`"sm" | "md" | "lg" | number | "small" | "large"`, default `"md"`), `spinnerColors` (per-instance palette override), `testID` (default `"spinner"`).
- Sizes: `"sm"` → 20px, `"md"` → 32px, `"lg"` → 48px. Raw numeric sizes pass through; RN's `"small"` / `"large"` also supported for consumers who prefer the native defaults.
- Defaults: `animating=true`, `accessibilityRole="progressbar"`, `accessibilityLabel="Loading"`, `accessibilityState.busy` reflects `animating`.
- Consumer overrides win on every default (`animating={false}`, custom a11y label, etc.).

## Token schema — own color block

`spinnerColors` — 1 slot: `color` (the spinner's animated ring / dots). Light `#6B7280` (gray-500), dark `#9CA3AF` (gray-400) — muted secondary tones that read as "in-progress" without competing with content.

Follows the each-component-owns-color-space rule. Full 13-step wiring: types + defaults + flatten (`$uiSpinnerColor`) + provider merge + barrels.

## Non-goals (documented)

- No "dots" / "bars" / other visual variants — the native ActivityIndicator is the standard.
- No `label` prop for "Loading..." text — consumers compose the row themselves.
- No determinate progress-bar variant — distinct primitive.
- No auto-color-from-parent-Button-tone — Buttons that show loading state pass `spinnerColors` explicitly if they need to match their own tint.

## Testing

35 component tests + 3 snapshots on `spinner.tsx` + 4 defaults-spec tests. 100% coverage across statements / branches / functions / lines on `spinner.tsx` + `defaults/spinner.ts`. One exported pure helper (`resolveSpinnerSize`) tested branch-by-branch.

## Example app

New `/components/spinner` route with 4 sections: size showcase (sm / md / lg + `size={64}`), loading-row composition (spinner + text), inside a Card (loading placeholder), custom color + static state (`animating={false}`).
