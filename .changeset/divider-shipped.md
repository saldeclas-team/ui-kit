---
"ui-kraken": minor
---

Add `Divider` — thin line for visual separation between rows, sections, or slots. Horizontal by default; vertical variant for inline separators (e.g. between two icons in a row). Small layout primitive that unblocks future slot-divider variants in Card, MultiSelect, and any list component that wants visible separators between rows.

## API

- `<Divider>` extends `YStack`; every Tamagui layout prop flows through the spread. Own props: `orientation` (`"horizontal" | "vertical"`, default `"horizontal"`), `thickness` (px, default `1`), `inset` (px on both ends, default `0`), `dividerColors` (per-instance palette override), `testID` (default `"divider"`).
- `alignSelf: "stretch"` on the cross-axis so the line fills its parent without a manual `width: '100%'`.
- Horizontal → `height=thickness`, `marginHorizontal=inset`. Vertical → `width=thickness`, `marginVertical=inset`.
- `accessibilityRole="none"` by default — a divider is decorative and screen readers skip it. Consumers who use a divider to separate landmark sections override to `"separator"` at the callsite.

## Token schema — own color block

`dividerColors` — 1 slot: `line` (the line's background color). Light default `#E5E7EB` (gray-200), dark default `#374151` (gray-700). Matches Input / Card border tones so a Divider between two Cards reads as native chrome.

Follows the each-component-owns-color-space rule — Divider has its own block on the token schema. Per-instance override via `dividerColors={{ line: "..." }}`; provider-wide override via the standard `<UIKitProvider overrides={{ light: { dividerColors: ... } }}>` pattern.

## Non-goals (documented)

- **No `label` / `text` prop for labeled dividers** — a labeled divider is a distinct primitive.
- **No `variant` prop (`"solid" | "dashed" | "dotted"`)** — RN doesn't render dashed / dotted borders reliably across platforms.
- **No gradient dividers** — ships when we introduce a `LinearGradient` primitive.
- **No auto-orientation-detection based on parent (row vs column)** — explicit prop, always.

## Testing

31 tests + 4 snapshots on `divider.tsx` + 4 tests on `defaults/divider.ts` — 100% coverage across statements, branches, functions, lines. Two exported helpers (`orientationSizeProps` / `orientationInsetProps`) are pure and tested directly for every branch.

## Example app

New `/components/divider` route with 5 sections: horizontal default, vertical inline (row of icons), inset (iOS grouped-list look), thick (`thickness={4}`), custom color via per-instance `dividerColors` override.
