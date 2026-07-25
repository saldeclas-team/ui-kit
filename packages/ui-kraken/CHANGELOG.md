# ui-kraken

## 0.6.0

### Minor Changes

- 3feb341: feat(alert): ship the `Alert` primitive — the third public component

  Contextual feedback surface for informational, success, warning, and destructive states. Common uses: form errors, empty-state hints, success confirmations, deprecation notices, inline callouts.

  **4 semantic variants:** `info` / `success` / `warning` / `danger` — vocabulary matches `TextColors` so one semantic slot has one name across the kit.

  **Compound API:** `Alert.Info`, `Alert.Success`, `Alert.Warning`, `Alert.Danger` — PascalCase shortcuts, same pattern as `Button.Primary` and `Text.H1`. The plain `<Alert>` still works with the `variant` prop and defaults to `"info"`.

  **Content model:** optional `title` + `children` (any ReactNode — plain string or nested `<Text>` for rich content like inline links) + optional `icon` slot (consumer brings their own icon system; no dep on an icon library).

  **Colors:** reuses the existing `textColors` block on `UIKitProvider` — no new token schema. Each variant maps to a `textColors` slot (info → `textColors.info`, danger → `textColors.danger`, etc.). Background is computed at runtime as the variant color at ~15% opacity.

  **Per-instance override:** `alertColors?: Partial<{ background?, border?, text, icon }>` — scoped to the resolved variant. Missing slots fall through to the palette. Enables brand-color alerts without extending the provider palette.

  **Radius:** `radius?: number | "none" | "sm" | "md" | "lg" | "pill"` — same shape as `Button.radius`. Default `"md"`.

  **Accessibility:** every variant sets `accessibilityRole="alert"`. `accessibilityLiveRegion` is `"assertive"` for `danger` (interrupts) and `"polite"` for the other three.

  **Every Tamagui style prop flows through** the `...rest` spread — none are re-declared on `AlertProps`. `padding`, `margin`, `pressStyle`, shorthand aliases (`px`, `py`, `bg`, etc.) all just work with types inferred from `GetProps<typeof StyledAlert>`.

  Test coverage: **22 spec tests + 19 structural snapshots**. Total repo: 163 tests / 85 snapshots (up from 122 / 66).

  See [`docs/ALERT-PLAN.md`](../docs/ALERT-PLAN.md) for the full design record.

## 0.5.0

### Minor Changes

- beb4d8f: feat(platforms): add `react-native-web` as an optional peer to enable Web target

  `ui-kraken` now supports Web in addition to iOS + Android. `react-native-web` is declared as an **optional** peer dependency — install it if you want to consume the library in an Expo Web (or any RN-Web) app; skip it if you only ship native. Consumers who already have `react-native-web` in their tree (e.g. Expo Router's default web setup) get web support with no additional installs.

  **What works on Web out of the box:**

  - **`Button`** — renders as `<button>` / `<div>` DOM elements. `pressStyle` animates via CSS transitions. `disabled` maps to `aria-disabled`. `testID` becomes `data-testid`. `elevation` uses CSS `box-shadow`. The dark-mode elevation border swap (translucent white to replace invisible black shadow) works identically to native.
  - **`Text`** — renders as `<span>` DOM element. `numberOfLines` maps to CSS `-webkit-line-clamp`. `onPress` becomes a click handler. `textAlign` and every variant's `fontSize` / `lineHeight` / `fontWeight` land as inline styles.

  Both components verified via `expo export --platform web` on the example app — every screen (catalog home, Button demo, Text demo) bundles and renders correctly.

  **Non-goals for this release:**

  - No `.web.tsx` platform shims — components are authored with cross-platform primitives that Tamagui + `react-native-web` translate automatically.
  - No new CI job for web builds yet — that lands with Phase 3 (Chromatic). Manual verification via `pnpm --filter @ui-kraken/example web` covers this phase.
  - No commitment to feature parity forever. Future components that must opt out of web will gate the incompatible feature with `Platform.OS !== "web"` and document the limitation in the component's `README.md` under `## Platform support`.

  **Consumer migration:**

  No changes required for existing native-only consumers. Web consumers install:

  ```bash
  pnpm add react-native-web react-dom    # (or the equivalent npm/yarn)
  ```

  then use `ui-kraken` as before — the library's runtime is unchanged.

  Reverses the `docs/PLAN.md` §1 locked decision "No web / react-native-web support in v1". Immediate motivation: unlocks Phase 3 (Chromatic visual regression testing), which requires a headless-Chromium-renderable target. Secondary motivation: real consumer capability for Expo Router web apps.

  See [`docs/REACT-NATIVE-WEB-PLAN.md`](../docs/REACT-NATIVE-WEB-PLAN.md) for the full design record.

## 0.4.0

### Minor Changes

- f7c7842: refactor(api): drop the legacy prefix from the public API (BREAKING)

  The library-prefix on every type / hook / constant was noise. The package name (`ui-kraken`) already namespaces the imports, so repeating it inside the identifiers was redundant. Types now read like they came from any modern React library.

  **Kept (brand identity):**

  - Package name `ui-kraken`.
  - Component: `UIKitProvider` — follows the standard pattern (`<ChakraProvider>`, `<TamaguiProvider>`, `<QueryClientProvider>`). (Post-v0.7.0 name — see the v0.7.0 entry for the second-stage provider rename.)

  **Renamed identifiers:**

  - Hook: `useUIKit`.
  - Types: `Tokens`, `ButtonColors`, `ButtonVariantColors`, `TextColors`, `TokensInput`, `ButtonColorsInput`, `TextColorsInput`, `ThemeMode`, `ProviderProps`, `ContextValue`, `ResolvedTokens`, `Config`.
  - Constants: `DEFAULT_TOKENS`, `DEFAULT_DARK_TOKENS`.
  - Function: `buildConfig`.
  - Disambiguation: the component-level per-instance override input (was previously colliding with the provider-level input) is now `ButtonVariantColorsInput` — matches what it actually is (input for one variant's slots, not the whole palette). Provider-level `ButtonColorsInput` (= `Partial<ButtonColors>`) is the outer one.

  **Renamed Tamagui theme tokens:**

  The short `$ui` prefix now covers every library token — a prefix is still needed to avoid clobbering Tamagui built-ins (`$radius`, `$space`, `$size`).

  - `$uiButtonPrimaryBackground` and every other button slot.
  - `$uiTextPrimary` and every other text slot.
  - `$uiRadiusMd` (and Sm / Lg / Pill).
  - `$uiSpacingMd` (and Xs / Sm / Lg / Xl).
  - `$uiSizeMd` (and Xs / Sm / Lg / Xl).

  **Renamed files:**

  - `packages/ui-kraken/src/tokens/tokens.ts` (plus `-types.ts`, `-derive.ts`, `.spec.ts`).
  - `packages/ui-kraken/src/provider/provider.tsx` (plus `-types.ts`, `-context.tsx`, `.spec.tsx`).
  - `packages/ui-kraken/src/provider/use-ui-kit.ts` (and `.spec.tsx`).

  **Renamed Tamagui `styled()` `name:` fields** (internal, but visible via component displayName):

  - `"UIKitButton"`, `"UIKitButtonLabel"`, `"UIKitText"`.

  **Migration path:** find-and-replace on consumer code. Every rename is 1:1, no behavioural change. The maintainer confirmed nobody had installed v0.3.0 externally, so no live consumers to migrate.

  Tests: 56 passing (unchanged from v0.3.0), lint clean, build clean.

## 0.3.0

### Minor Changes

- 927e21a: feat(text): ship the `Text` primitive — the second component after `Button`

  Adds a full-featured typographic primitive on top of Tamagui:

  - **13 HTML-familiar variants** — `h1`–`h6`, `subtitle1`/`subtitle2`, `body1`/`body2`, `caption`, `overline`, `label`. Sized on a Material-3-inspired scale (H1 40/48/700 → Label 14/20/500) with `overline` also getting `textTransform: uppercase` + `letterSpacing: 0.5`.
  - **Compound API** — `Text.H1`, `Text.Body1`, `Text.Caption`, … same pattern as `Button.Primary`. The plain `<Text>` still works and defaults to `variant="body2"`.
  - **14 color slots** grouped in three buckets: 5 hierarchy (`primary`, `secondary`, `tertiary`, `disabled`, `inverse`), 5 semantic (`interactive`, `success`, `warning`, `danger`, `info`), 4 on-\* (`onPrimary`, `onSecondary`, `onSuccess`, `onDanger`).
  - **`color` prop accepts either** a slot name (resolves to a theme token via `useUIKit()`) **or a raw string** (`#RRGGBB`, `rgb(...)`, named color) — the `(string & {})` trick preserves slot autocomplete without rejecting arbitrary strings.
  - **Intensity modulator** — `subtle` (opacity 0.65), `normal` (default), `strong` (fontWeight bumped one step; already-700 variants stay unchanged).
  - **Every RN Text prop and every Tamagui style prop flows through** the `...rest` spread — `onPress`, `numberOfLines`, `textAlign`, `selectable`, `adjustsFontSizeToFit`, `accessibilityLabel`, `style`, `padding`, `pressStyle`, shorthand aliases, etc.

  Provider gains `textColors?: Partial<TextColors>` alongside `buttonColors` — same per-component-block token schema. Ships `DEFAULT_LIGHT_TEXT_COLORS` and `DEFAULT_DARK_TEXT_COLORS` so consumers get a working palette out of the box.

  Test coverage: 10 new specs on the component (variant fan-out, slot resolution, raw-hex/rgb passthrough, intensity subtle/strong, RN prop flow-through, compound-shortcut round-trip) plus 4 new specs on the token/provider layer (56 total, up from 44).

## 0.2.0

### Minor Changes

- d2fd1b8: Add `UIKitProvider`, per-component `Tokens` schema, and the `Button` component with five tones, `radius`, and theme-aware `elevation` — plus dark-mode support and a live catalog demo.

  **Provider layer**

  - `UIKitProvider` wraps Tamagui's `TamaguiProvider` (which already includes a `PortalProvider` root host — we do not double-mount one).
  - Accepts a per-component token schema via context.
  - `useUIKit()` returns both the resolved tokens for the active theme AND the raw Tamagui config as an escape hatch.
  - `defaultTheme` accepts `"light" | "dark" | "system"`; the `"system"` mode follows RN's `useColorScheme()`.
  - Optional `dark` prop lets consumers customize dark-mode tokens independently. When omitted, ships `DEFAULT_DARK_TOKENS` (Blue-500 palette tuned for dark surfaces).

  **Tokens layer (per-component design)**

  - `Tokens.buttonColors` block, one variant per key (`primary | secondary | outline | ghost | destructive`), each with slots `{ background?, label, border? }`. No flat `primaryColor` / `textPrimaryColor` — tokens are grouped by component role, not by an abstract "primary" concept.
  - Ships `DEFAULT_TOKENS` (light) and `DEFAULT_DARK_TOKENS` (dark) with sensible Blue-600 / Blue-500 defaults.
  - Utilities: `buildConfig`, `coarseToFineTokens`, `mergeButtonColors`, `mergeButtonVariantColors`, `tint`.
  - All library-owned Tamagui tokens land under `$uiButton{Variant}{Background|Label|Border}` and `$uiRadius{Sm|Md|Lg|Pill}` / `$uiSpacing{Xs|Sm|Md|Lg|Xl}` — zero collision with `@tamagui/config/v4` defaults.

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
  component (probably `Button`) together with the `UIKitProvider` and the
  token schema decisions tracked in `docs/PLAN.md`.
