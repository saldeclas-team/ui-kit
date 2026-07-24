# ui-kraken

## 0.2.0

### Minor Changes

- d2fd1b8: Add `KrakenProvider`, per-component `KrakenTokens` schema, and the `Button` component with five tones, `radius`, and theme-aware `elevation` — plus dark-mode support and a live catalog demo.

  **Provider layer**

  - `KrakenProvider` wraps Tamagui's `TamaguiProvider` (which already includes a `PortalProvider` root host — we do not double-mount one).
  - Accepts a per-component token schema via context.
  - `useKraken()` returns both the resolved tokens for the active theme AND the raw Tamagui config as an escape hatch.
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
  - `radius` prop: `number | "none" | "sm" | "md" | "lg" | "pill"` — numeric is raw px, preset maps to the theme scale, `"pill"` is fully rounded.
  - `elevation` prop: `"none" | "sm" | "md" | "lg"` — theme-aware. In light mode it casts iOS `shadow*` + Android `elevation` with tuned opacity/radius. In dark mode it cancels every shadow prop (black shadows are invisible on dark surfaces) and instead renders a translucent-white border whose opacity scales with the level (pattern lifted from Linear / Notion / Vercel). `outline` and `ghost` skip the dark-swap because they already own their border, and any explicit `buttonColors.border` override wins.
  - Slots: `leftIcon` / `rightIcon` (accept any `ReactNode` — plug in your own SVG / vector icon library).
  - Per-instance color override via `buttonColors?: Partial<{ background?, label, border? }>` — variant implicit from the compound subcomponent.
  - Full accessibility: `accessibilityRole="button"`, `accessibilityState`, minimum 48 × 48 px touch target (grows to 56 for `lg`, shrinks to 36 for `sm`), `pressStyle: { scale: 0.98, opacity: 0.9 }`.

  **Example app catalog**

  - `apps/example/app/(pages)/index.tsx` is now a catalog home listing every component (with "Ready" / "Planned" badges).
  - `apps/example/app/(pages)/components/button.tsx` hosts the full Button demo — every variant, every size, states, radius presets, elevation levels, per-instance overrides.
  - New `<Screen>` wrapper forces `#000` background in dark mode / `#FFF` in light so text stays readable.
  - New `<ThemeToggle>` in the header lets you flip between light / dark / system live.
  - Storybook on-device wires up `AsyncStorage` so it remembers the last opened story between reloads.

## 0.1.0

### Minor Changes

- 4d600b7: Initial publish of the ui-kraken scaffold (0.1.0).

  No components ship in this release yet — this cuts the first version of the
  build/publish pipeline so that subsequent versions can focus on adding
  components without setup churn. The next release will add the first real
  component (probably `Button`) together with the `KrakenProvider` and the
  token schema decisions tracked in `docs/PLAN.md`.
