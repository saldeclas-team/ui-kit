---
"ui-kraken": minor
---

Batch 1 of the duna-app → ui-kraken migration — 11 new primitives.

**New components:**

- `Input` — text input with label, helper/error, and optional icon slots.
- `CurrencyInput` — locale-aware numeric input formatted as currency.
- `Surface` — theme-bound container with 4 elevation levels (base / raised / overlay / sunken).
- `RefreshControl` — themed pull-to-refresh with one palette wired to both iOS and Android props.
- `Skeleton` — animated pulse placeholder for loading states (`pulse` / `static`).
- `Hint` — inline contextual tip with 5 tones × ghost/soft emphasis + compound shortcuts.
- `StatCard` — dashboard metric card with title, value, and optional trend arrow + auto glyph.
- `MultiSelect` — chip-based multi-choice picker (wrap layout, generic value type).
- `SocialButton` — OAuth-provider button (Google / Apple / Facebook / GitHub / Microsoft / generic).
- `Collapsible` — animated expand/collapse section with accordion-friendly controlled state.
- `ExternalLink` — router-agnostic link that opens URLs via `expo-web-browser` (optional) with `Linking.openURL` fallback.

**New token blocks** (each with light + dark palettes, per-instance override input types, merge helpers, and Tamagui flatten helpers): `inputColors`, `currencyInputColors`, `surfaceColors`, `refreshControlColors`, `skeletonColors`, `hintColors`, `statCardColors`, `multiSelectColors`, `socialButtonColors`, `collapsibleColors`, `externalLinkColors`.

**Repo-wide rules added:**

- `Animated` / `Easing` from `react-native` banned in library code — use `react-native-reanimated`. `AGENTS.md § Animation` + creating-component-tamagui SKILL § 3.4.
- Shared `resolveRadius` helper in `utils/radius.ts` — every component-with-radius primitive uses the same `RadiusValue` union. SKILL § 3.1.
- Shared `resolvePalette` helper in `utils/resolve-palette.ts` — flat-slot palettes across 8 primitives. SKILL § 3.2.
- Shared `IconTintOverride` component in `components/icon-tint-override/` (internal only). SKILL § 3.3.

**Optional peer dep added:** `expo-web-browser` (for `ExternalLink`'s in-app browser backend; falls back to `Linking.openURL` when absent).
