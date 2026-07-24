---
"ui-kraken": minor
---

refactor(api): drop the `Kraken` prefix from the public API — every export except `KrakenProvider` (BREAKING)

The `Kraken` prefix on every type / hook / constant was noise. The package name (`ui-kraken`) already namespaces the imports, so `KrakenTokens` inside `import type { KrakenTokens } from "ui-kraken"` was just repeating the namespace. Types now read like they came from any modern React library.

**Kept (brand identity):**

- Package name `ui-kraken`.
- Component: `KrakenProvider` — follows the standard pattern (`<ChakraProvider>`, `<TamaguiProvider>`, `<QueryClientProvider>`).

**Renamed identifiers:**

- Hook: `useKraken` → `useUIKit`.
- Types: `KrakenTokens` → `Tokens`, `KrakenButtonColors` → `ButtonColors`, `KrakenButtonVariantColors` → `ButtonVariantColors`, `KrakenTextColors` → `TextColors`, `KrakenTokensInput` → `TokensInput`, `KrakenButtonColorsInput` → `ButtonColorsInput`, `KrakenTextColorsInput` → `TextColorsInput`, `KrakenThemeMode` → `ThemeMode`, `KrakenProviderProps` → `ProviderProps`, `KrakenContextValue` → `ContextValue`, `ResolvedKrakenTokens` → `ResolvedTokens`, `KrakenConfig` → `Config`.
- Constants: `DEFAULT_KRAKEN_TOKENS` → `DEFAULT_TOKENS`, `DEFAULT_DARK_KRAKEN_TOKENS` → `DEFAULT_DARK_TOKENS`.
- Function: `buildKrakenConfig` → `buildConfig`.
- Disambiguation collision: the component-level `ButtonColorsInput` (per-instance override on `<Button>`, was `Partial<KrakenButtonVariantColors>`) collided with the provider-level `KrakenButtonColorsInput` after both lost their prefix. Renamed the component one to **`ButtonVariantColorsInput`** — matches what it actually is (input for one variant's slots, not the whole palette). Provider-level `ButtonColorsInput` (= `Partial<ButtonColors>`) is unchanged.

**Renamed Tamagui theme tokens:**

The short `$ui` prefix replaces `$kraken` — a prefix is still needed to avoid clobbering Tamagui built-ins (`$radius`, `$space`, `$size`).

- `$krakenButtonPrimaryBackground` → `$uiButtonPrimaryBackground` (and every other button slot).
- `$krakenTextPrimary` → `$uiTextPrimary` (and every other text slot).
- `$krakenRadiusMd` → `$uiRadiusMd` (and Sm / Lg / Pill).
- `$krakenSpacingMd` → `$uiSpacingMd` (and Xs / Sm / Lg / Xl).
- `$krakenSizeMd` → `$uiSizeMd` (and Xs / Sm / Lg / Xl).

**Renamed files:**

- `packages/ui-kraken/src/tokens/kraken-tokens.ts` → `tokens.ts` (also `-types.ts`, `-derive.ts`, `.spec.ts`).
- `packages/ui-kraken/src/provider/kraken-provider.tsx` → `provider.tsx` (also `-types.ts`, `-context.tsx`, `.spec.tsx`).
- `packages/ui-kraken/src/provider/use-kraken.ts` → `use-ui-kit.ts` (and `.spec.tsx`).

**Renamed Tamagui `styled()` `name:` fields** (internal, but visible via component displayName):

- `"KrakenButton"` → `"UIKitButton"`, `"KrakenButtonLabel"` → `"UIKitButtonLabel"`, `"KrakenText"` → `"UIKitText"`.

**Migration path:** find-and-replace the identifiers above in consumer code. Every rename is 1:1, no behavioural change. The maintainer confirmed nobody has installed v0.3.0 externally, so no live consumers to migrate.

Tests: 56 passing (unchanged from v0.3.0), lint clean, build clean.
