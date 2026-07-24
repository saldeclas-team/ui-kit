# Text — design record

**Status:** shipped in v0.3.0 on 2026-07-24 (see the [changeset](../.changeset/text-component-v0-3-0.md) and the [component README](../packages/ui-kraken/src/components/text/README.md)).

Living design doc for the `Text` primitive. Kept post-shipping so future contributors can understand the decisions behind the shape of the API, not just what it does today.

---

## Overview

Text primitive that covers every text surface in the app: hero titles, headings, body copy, captions, labels, overlines. Locked decisions from the 2026-07-25 conversation with the maintainer:

- **Naming**: `Text` (RN/Expo convention — every major RN design system uses `Text`). We considered `Typography` (MUI-style) but the maintainer preferred the RN convention.
- **Variant set**: HTML-familiar — 13 variants total (H1-H6, Subtitle1/2, Body1/2, Caption, Overline, Label). Rejected the Material 3 naming (`headlineLarge` / `titleMedium` / `labelSmall`) because HTML names are more legible to devs coming from the web.
- **Color set**: 14 slots (5 hierarchy + 5 semantic + 4 "on-\*").
- **Intensity**: preset semantic (`subtle` / `normal` / `strong`).
- **`color` prop**: accepts either a slot name from the 14 slots OR an arbitrary hex/rgb string for one-off custom colors. No separate `textColors` per-instance prop needed (Text has only one color surface).
- **Compound API**: `Text.H1`, `Text.Body1`, etc. — PascalCase (React JSX convention), same pattern as `Button.Primary`. Consumers can also use the prop form: `<Text variant="h1">`.

## API

### Props

`TextProps` only re-declares props that are OURS or that we override. Every RN Text prop (`onPress`, `selectable`, `numberOfLines`, `ellipsizeMode`, `textAlign`, `adjustsFontSizeToFit`, `allowFontScaling`, `accessibilityLabel`, `dataDetectorType`, `style`, `ref`, etc.) AND every Tamagui style prop (`padding`, `margin`, `backgroundColor`, `pressStyle`, `hoverStyle`, shorthand aliases like `px` / `py`, etc.) flows through the `...rest` spread — they arrive typed via `GetProps<typeof StyledText>` inference, so consumers get full autocomplete without us listing them.

```ts
export interface TextProps extends Omit<GetProps<typeof StyledText>, "children" | "color"> {
  children?: ReactNode;
  /** HTML-familiar type-scale variant. Drives fontSize + lineHeight + fontWeight. */
  variant?: TextVariant;
  /**
   * Text color. Either a slot name from KrakenTextColors (resolves to a theme
   * token) OR a raw color string (hex / rgb / rgba) applied as-is. Defaults
   * to `"primary"`.
   */
  color?: TextColor | (string & {});
  /**
   * Modulator on top of the resolved color. `subtle` lowers opacity to 0.65,
   * `strong` bumps fontWeight one step. `normal` (default) is a no-op.
   */
  intensity?: TextIntensity;
}
```

Notable props that "just work" without being in the interface (documented in the README as usage examples):

- **`onPress`** / `onLongPress` / `onPressIn` / `onPressOut` — make the text tappable (RN Text supports this natively).
- **`numberOfLines`** + **`ellipsizeMode`** — truncate long text with an ellipsis.
- **`textAlign`** — `"auto" | "left" | "right" | "center" | "justify"`. We use RN's native prop name; no alias.
- **`selectable`** / `selectionColor` — allow user text selection.
- **`adjustsFontSizeToFit`** + `minimumFontScale` — shrink text to fit a container.
- **`allowFontScaling`** + `maxFontSizeMultiplier` — respect / cap OS font-size preference.
- **`accessibilityLabel`** / `accessibilityRole` / `accessibilityHint` — a11y overrides.
- **`style`** — RN style array escape hatch.
- **`testID`** — comes from RN, we don't re-declare it.

### Variant scale (HTML-familiar, 13 variants)

| Compound name              | `variant` value | fontSize | lineHeight | fontWeight | Special                                            | Use case                             |
| -------------------------- | --------------- | -------: | ---------: | ---------: | -------------------------------------------------- | ------------------------------------ |
| `Text.H1`                  | `"h1"`          |       40 |         48 |        700 | —                                                  | Hero titles / screen top             |
| `Text.H2`                  | `"h2"`          |       32 |         40 |        700 | —                                                  | Section titles                       |
| `Text.H3`                  | `"h3"`          |       28 |         36 |        700 | —                                                  | Subsection titles                    |
| `Text.H4`                  | `"h4"`          |       24 |         32 |        600 | —                                                  | Card / dialog titles                 |
| `Text.H5`                  | `"h5"`          |       20 |         28 |        600 | —                                                  | Small titles                         |
| `Text.H6`                  | `"h6"`          |       18 |         24 |        600 | —                                                  | Smallest heading                     |
| `Text.Subtitle1`           | `"subtitle1"`   |       16 |         24 |        500 | —                                                  | Prominent subtitle / list item title |
| `Text.Subtitle2`           | `"subtitle2"`   |       14 |         20 |        500 | —                                                  | Compact subtitle                     |
| `Text.Body1`               | `"body1"`       |       16 |         24 |        400 | —                                                  | Prominent body / long-form copy      |
| `Text.Body2` **(default)** | `"body2"`       |       14 |         20 |        400 | —                                                  | Standard body copy                   |
| `Text.Caption`             | `"caption"`     |       12 |         16 |        400 | —                                                  | Metadata, timestamps, hints          |
| `Text.Overline`            | `"overline"`    |       10 |         16 |        500 | `textTransform: "uppercase"`, `letterSpacing: 0.5` | Section eyebrows, category badges    |
| `Text.Label`               | `"label"`       |       14 |         20 |        500 | —                                                  | Form labels, chip text               |

`fontFamily` inherits from `@tamagui/config/v4` for v0.3. Font-family customization at the token layer is deferred (comes with a `fonts` block on `KrakenTokens` later).

### Color set (14 slots)

**Hierarchy (5)** — content on standard surfaces:

- `primary` — main content (titles, body)
- `secondary` — supporting content (subtitles, meta)
- `tertiary` — de-emphasized (captions, hints)
- `disabled` — inactive text
- `inverse` — text on inverted background (dark text on light card in dark theme, etc.)

**Semantic (5)** — meaning-carrying:

- `interactive` — links, tappable text
- `success` — success messages
- `warning` — warnings
- `danger` — errors / destructive
- `info` — informational

**On-\* (4)** — text on solid brand surfaces (Button labels, colored Toast, etc.):

- `onPrimary` — text on brand primary background
- `onSecondary` — text on brand secondary background
- `onSuccess` — text on success surface
- `onDanger` — text on danger surface

### Intensity

```ts
export type TextIntensity = "subtle" | "normal" | "strong";
```

- `subtle` — resolved color rendered at `opacity: 0.65`.
- `normal` (default) — resolved color rendered at `opacity: 1`.
- `strong` — resolved color rendered at `opacity: 1` AND `fontWeight` bumped one step (400 → 600, 500 → 700). If the variant's base weight is already 700+, `strong` is a no-op on weight. The rule table lives in a single `STRONG_WEIGHT_FOR_VARIANT` lookup inside `text.tsx` so future changes touch one place.

### Alignment + line clamping

- `textAlign` passes through directly (RN native prop name; we don't alias it).
- `numberOfLines` passes through to RN Text (native ellipsis truncation).

### Compound namespace (ergonomic shortcuts)

Every variant gets a PascalCase pre-configured shortcut. Same pattern as `Button.Primary`:

```tsx
<Text.H1>Hero</Text.H1>
<Text.H4>Section</Text.H4>
<Text.Body1>Prose</Text.Body1>
<Text.Caption color="tertiary">Meta</Text.Caption>
```

Each shortcut is a `forwardRef` that passes `variant="…"` and forwards everything else. Consumer can still use `<Text variant="…">` — the shortcuts are sugar. The dual export uses `Object.assign(BaseText, { H1, H2, ... })` so both forms produce the same subtree.

**Naming collision with RN Text**: importing `Text` from `ui-kraken` shadows `Text` from `react-native` in the local scope, so the last import wins. Consumers who need both in the same file rename the native one:

```tsx
import { Text } from "ui-kraken";
import { Text as RNText } from "react-native"; // rare
```

## Token schema additions

Added a new `textColors` block to `KrakenTokens` — non-breaking (optional, defaults ship).

```ts
export interface KrakenTextColors {
  primary: string;
  secondary: string;
  tertiary: string;
  disabled: string;
  inverse: string;
  interactive: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  onPrimary: string;
  onSecondary: string;
  onSuccess: string;
  onDanger: string;
}

export interface KrakenTokens {
  buttonColors: KrakenButtonColors;
  textColors: KrakenTextColors; // new in v0.3
  radius: number;
  spacing: number;
}
```

### Default light

```ts
export const DEFAULT_LIGHT_TEXT_COLORS: KrakenTextColors = {
  primary: "#0B0B0F", // near-black
  secondary: "#5B6472", // gray-600
  tertiary: "#9CA3AF", // gray-400
  disabled: "#D1D5DB", // gray-300
  inverse: "#FFFFFF", // for dark surfaces in light mode
  interactive: "#2563EB", // Blue-600 (matches brand primary)
  success: "#059669", // Emerald-600
  warning: "#D97706", // Amber-600
  danger: "#DC2626", // Red-600
  info: "#0284C7", // Sky-600
  onPrimary: "#FFFFFF", // white on brand primary bg
  onSecondary: "#FFFFFF", // white on brand secondary bg
  onSuccess: "#FFFFFF", // white on success bg
  onDanger: "#FFFFFF", // white on danger bg
};
```

### Default dark

```ts
export const DEFAULT_DARK_TEXT_COLORS: KrakenTextColors = {
  primary: "#F5F5F7", // near-white
  secondary: "#9CA3AF", // gray-400
  tertiary: "#6B7280", // gray-500
  disabled: "#4B5563", // gray-600
  inverse: "#0B0B0F", // dark text on light surface in dark mode
  interactive: "#60A5FA", // Blue-400 (matches brand primary in dark)
  success: "#34D399", // Emerald-400
  warning: "#FBBF24", // Amber-400
  danger: "#F87171", // Red-400
  info: "#38BDF8", // Sky-400
  onPrimary: "#FFFFFF", // white on brand primary bg
  onSecondary: "#0B0B0F", // dark on light-secondary bg (Sky-400)
  onSuccess: "#0B0B0F", // dark on success bg
  onDanger: "#FFFFFF", // white on danger bg
};
```

Both default blocks are wired into `DEFAULT_KRAKEN_TOKENS` and `DEFAULT_DARK_KRAKEN_TOKENS`.

### Tamagui token flattening

`buildKrakenConfig` flattens `textColors` to `$krakenText{PascalCase}`:

```
$krakenTextPrimary
$krakenTextSecondary
$krakenTextTertiary
$krakenTextDisabled
$krakenTextInverse
$krakenTextInteractive
$krakenTextSuccess
$krakenTextWarning
$krakenTextDanger
$krakenTextInfo
$krakenTextOnPrimary
$krakenTextOnSecondary
$krakenTextOnSuccess
$krakenTextOnDanger
```

These join the existing `$krakenButton*` and `$krakenRadius*` / `$krakenSpacing*` tokens under both `light` and `dark` themes.

## File structure (per the ui-kraken component skill)

```
packages/ui-kraken/src/components/text/
├── text.tsx              # component logic + compound export
├── text.styled.ts        # StyledText with variants
├── text-types.ts         # TextProps, TextVariant, TextColor, TextIntensity
├── text.spec.tsx         # unit tests
├── text.stories.tsx      # Storybook on-device
├── README.md             # props table + usage
└── index.ts              # explicit named exports
```

Barrel updates:

- `packages/ui-kraken/src/components/index.ts` — re-export Text + types
- `packages/ui-kraken/src/index.ts` — public barrel

Tokens layer changes:

- `kraken-tokens-types.ts` — added `KrakenTextColors` + slot into `KrakenTokens`
- `kraken-tokens-derive.ts` — added `DEFAULT_LIGHT_TEXT_COLORS`, `DEFAULT_DARK_TEXT_COLORS`, added `textColors` to `DEFAULT_KRAKEN_TOKENS` + `DEFAULT_DARK_KRAKEN_TOKENS`, added `mergeTextColors` + `coarseToFineTokens` update to pass `textColors` through
- `kraken-tokens.ts` — extended `buildKrakenConfig` to flatten `textColors` and inject into `light` + `dark` themes
- `tokens/index.ts` — exported new symbols
- `kraken-tokens.spec.ts` — added tests for `mergeTextColors`, defaults presence, dark != light

Provider changes:

- `kraken-provider-types.ts` — extended `KrakenTokensInput` with `textColors?: Partial<KrakenTextColors>`
- `kraken-provider.tsx` — merged textColors overrides same way as buttonColors
- `kraken-provider.spec.tsx` — added a test that reads a text-color override through `useKraken()`

Example app changes:

- New route `apps/example/app/(pages)/components/text.tsx` — full showcase (every variant × color × intensity + custom hex example)
- `apps/example/app/_layout.tsx` — registered the `Stack.Screen`
- `apps/example/app/(pages)/index.tsx` — flipped Text row from "Planned" to "Ready" with route linked

## Testing (Jest + RTL v14 + jest-expo)

Mocks `./text.styled` and `../../provider/use-kraken` the same way Button does so the tests run without a live Tamagui/provider tree. 10 specs cover:

1. Renders `children` with default variant/color (body2 + primary).
2. Applies each variant to the styled prop (parametrized across all 13).
3. Applies each theme slot color when `color` matches a slot name.
4. Passes through a raw hex string when `color` doesn't match a slot.
5. Passes through a raw rgb string unchanged.
6. `intensity="subtle"` sets `opacity: 0.65`.
7. `intensity="strong"` bumps fontWeight on a light variant.
8. `intensity="strong"` is a no-op on an already-700 variant.
9. RN Text props flow through (onPress + numberOfLines + textAlign + accessibilityLabel).
10. All 13 compound shortcuts set the correct variant.

Provider spec added two tests: full textColors overrides land on `useKraken().tokens.textColors`, and a partial override keeps every unmodified slot on its default.

Tokens spec added two: `mergeTextColors` respects base + partial overrides, dark defaults are different from light defaults, and defaults expose every `KrakenTextColors` slot.

Total: 56 tests passing after ship (up from 44).

## Storybook stories

`text.stories.tsx` — one story per bucket for scannability:

- `Default` (body2, primary)
- `AllVariants` — vertical stack of the 13 variants, each labeled
- `HierarchyColors` — vertical stack of the 5 hierarchy slots × body1 variant
- `SemanticColors` — success / warning / danger / info / interactive block
- `OnColors` — the 4 `on-*` variants rendered inside colored surface blocks
- `Intensities` — `subtle` / `normal` / `strong` × primary color
- `CustomHex` — `<Text color="#FF6B00">Custom orange</Text>` + rgb + named
- `Alignment` — left / center / right / justify
- `Truncation` — `numberOfLines={2}` on a long paragraph
- `DarkTheme` — wrapped in `<Theme name="dark">` showing the full grid flip

## Example app screen

`apps/example/app/(pages)/components/text.tsx` — using `<Section>` wrapper from `apps/example/src/section.tsx`. Sections:

1. **Type scale** — every variant with its size / line-height / weight labeled beside it.
2. **Hierarchy colors** — primary / secondary / tertiary / disabled.
3. **Semantic colors** — interactive / success / warning / danger / info.
4. **On-\* colors** — each rendered inside a colored surface block.
5. **Intensity modulator** — 3 lines showing subtle / normal / strong.
6. **Custom color** — hex + rgb + named-color passthrough examples.
7. **Truncation** — long text with `numberOfLines={2}`.

Catalog home flips the Text row from `status: "planned"` → `status: "shipped"` and wires it to `/components/text`.

## Non-goals (explicitly deferred)

- **Font family customization** — v0.3 inherits `@tamagui/config/v4` fonts wholesale. Once we add `fonts` to `KrakenTokens` we'll let consumers swap font families per role (heading / body / mono).
- **Weight overrides beyond `intensity="strong"`** — no arbitrary `weight={700}` prop yet. If a specific variant needs a heavier weight, we bake it into the variant itself.
- **Responsive variants** — no per-media-query variant switching. Consumer wraps in Tamagui `useMedia()` if they need it.
- **Rich text / markdown parsing** — Text is a leaf, not a parser. Nesting `<Text>` inside `<Text>` for inline color changes is supported (RN `Text` nests natively).
- **Auto-contrast** — no automatic `on-*` selection based on background. Consumer picks explicitly (matches the "predictable > opinionated" rule set for Button).
- **`Display` variant (hero splash 57px+)** — H1 at 40px covers hero titles in v0.3. If a real consumer asks for larger splash sizes we add a `Display` variant later.

## How the work shipped

Executed in this order on branch `feat/text`:

1. Extended the token layer (types + defaults + merge helper + buildKrakenConfig flatten + tests).
2. Extended the provider (accept `textColors` in input + merge + tests).
3. Implemented the `Text` component (styled + types + tsx + compound + spec + stories + README).
4. Wired into public barrels (`components/index.ts`, `src/index.ts`).
5. Added the example screen + updated catalog home.
6. Verified: `pnpm typecheck && pnpm lint && pnpm test && pnpm build` — all green, 56 tests.
7. Added a changeset for the `0.3.0` minor bump.
8. Landed as 4 atomic commits:
   - `feat(tokens): add textColors block to KrakenTokens (14 slots)`
   - `feat(provider): accept textColors overrides in KrakenTokensInput`
   - `feat(text): ship the Text primitive (13 variants, 14 color slots, intensity, compound API)`
   - `docs(example): add Text demo screen and flip catalog row to shipped`

## How to extend

- **New variant** — add an entry to `variants.variant` in `text.styled.ts`, add the type to `TextVariant` in `text-types.ts`, add the compound shortcut in `text.tsx` (register in `Object.assign` map), add a row to the README table, and — if `intensity="strong"` should behave — add an entry to `STRONG_WEIGHT_FOR_VARIANT`.
- **New color slot** — add to `KrakenTextColors` in `kraken-tokens-types.ts`, add defaults to both `DEFAULT_LIGHT_TEXT_COLORS` and `DEFAULT_DARK_TEXT_COLORS` in `kraken-tokens-derive.ts`, verify it flattens correctly through `flattenTextColors` (no change needed if it's a plain string slot), and update the README color-slot section.
- **Font family** — when adding a `fonts` block to `KrakenTokens`, plumb it into `buildKrakenConfig` under `tokens.font` and reference from `text.styled.ts` variants as `fontFamily: "$krakenFont{Role}"`.
