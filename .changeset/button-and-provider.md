---
"ui-kraken": minor
---

Add `KrakenProvider`, per-component `KrakenTokens` schema, and the `Button` component with five tones — plus dark-mode support and a live catalog demo.

**Provider layer**

- `KrakenProvider` mounts `TamaguiProvider` + `PortalProvider` and accepts a per-component token schema via context.
- `useKraken()` returns both the resolved tokens for the active theme and the raw Tamagui config as an escape hatch.
- `defaultTheme` accepts `"light" | "dark" | "system"`; the `"system"` mode follows RN's `useColorScheme()`.
- Optional `dark` prop lets consumers customize dark-mode tokens independently. When omitted, ships `DEFAULT_DARK_KRAKEN_TOKENS` (Blue-500 palette tuned for dark surfaces).

**Tokens layer (per-component design)**

- `KrakenTokens.buttonColors` block, one variant per key (`primary | secondary | outline | ghost | destructive`), each with slots `{ background?, label, border? }`. No flat `primaryColor` / `textPrimaryColor` — tokens are grouped by component role, not by an abstract "primary" concept.
- Ships `DEFAULT_KRAKEN_TOKENS` (light) and `DEFAULT_DARK_KRAKEN_TOKENS` (dark) with sensible Blue-600 / Blue-500 defaults.
- Utilities: `buildKrakenConfig`, `coarseToFineTokens`, `mergeButtonColors`, `mergeButtonVariantColors`, `tint`.
- All library-owned Tamagui tokens land under `$krakenButton{Variant}{Background|Label|Border}` and `$krakenRadius{Sm|Md|Lg|Pill}` / `$krakenSpacing{Xs|Sm|Md|Lg|Xl}` — zero collision with `@tamagui/config/v4` defaults.

**Button**

- Compound API: `Button.Primary`, `Button.Secondary`, `Button.Outline`, `Button.Ghost`, `Button.Destructive`. Top-level `Button` aliases `Button.Primary`.
- Sizes: `sm` / `md` / `lg`. States: `disabled` / `loading` (both apply `opacity: 0.45`).
- New `radius` prop: `number | "none" | "sm" | "md" | "lg" | "pill"` — numeric is raw px, preset maps to the theme scale, `"pill"` is fully rounded.
- Slots: `leftIcon` / `rightIcon` (`ReactNode`).
- Per-instance color override via `buttonColors?: Partial<{ background?, label, border? }>` — variant implicit from the compound subcomponent.
- Full accessibility: `accessibilityRole="button"`, `accessibilityState`, minimum 48 × 48 px touch target (grows to 56 for `lg`, shrinks to 36 for `sm`), `pressStyle: { scale: 0.98, opacity: 0.9 }`.

**Example app catalog**

- `apps/example/app/(pages)/index.tsx` is now a catalog home listing every component (with "Ready" / "Planned" badges).
- `apps/example/app/(pages)/components/button.tsx` hosts the full Button demo — every variant, every size, states, radius presets, per-instance overrides.
- New `<Screen>` wrapper forces `#000` background in dark mode / `#FFF` in light so text stays readable.
- New `<ThemeToggle>` in the header lets you flip between light / dark / system live.
