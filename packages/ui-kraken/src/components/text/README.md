# Text

Standalone text primitive. 13 HTML-familiar variants, 14 semantic color slots, optional intensity modulator, dark mode aware.

## Import

```tsx
import { Text } from "ui-kraken";
```

**Naming collision with RN Text**: `import { Text } from "ui-kraken"` shadows `import { Text } from "react-native"` in the file it's declared in. If you need both:

```tsx
import { Text } from "ui-kraken";
import { Text as RNText } from "react-native"; // rare
```

## Props

| Prop        | Type                               | Default     | Description                                                                                                             |
| ----------- | ---------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| `children`  | `ReactNode`                        | —           | Text content. Can nest other `<Text>` for inline color changes (RN native).                                             |
| `variant`   | `TextVariant`                      | `"body2"`   | Type-scale variant. See table below.                                                                                    |
| `color`     | `TextColor \| string`              | `"primary"` | Slot name from `TextColors` OR a raw color string (`#RRGGBB`, `rgb(...)`, named color). Slot resolves via `useUIKit()`. |
| `intensity` | `"subtle" \| "normal" \| "strong"` | `"normal"`  | `subtle` sets opacity 0.65; `strong` bumps fontWeight one step (400→600, 500→700; already 700+ stays).                  |

Every RN Text prop and every Tamagui style prop flows through the `...rest` spread — see "Notable props that just work" below.

## Variant scale

| Compound                   | `variant`     | fontSize | lineHeight | fontWeight | Special                           |
| -------------------------- | ------------- | -------: | ---------: | ---------: | --------------------------------- |
| `Text.H1`                  | `"h1"`        |       40 |         48 |        700 | —                                 |
| `Text.H2`                  | `"h2"`        |       32 |         40 |        700 | —                                 |
| `Text.H3`                  | `"h3"`        |       28 |         36 |        700 | —                                 |
| `Text.H4`                  | `"h4"`        |       24 |         32 |        600 | —                                 |
| `Text.H5`                  | `"h5"`        |       20 |         28 |        600 | —                                 |
| `Text.H6`                  | `"h6"`        |       18 |         24 |        600 | —                                 |
| `Text.Subtitle1`           | `"subtitle1"` |       16 |         24 |        500 | —                                 |
| `Text.Subtitle2`           | `"subtitle2"` |       14 |         20 |        500 | —                                 |
| `Text.Body1`               | `"body1"`     |       16 |         24 |        400 | —                                 |
| `Text.Body2` **(default)** | `"body2"`     |       14 |         20 |        400 | —                                 |
| `Text.Caption`             | `"caption"`   |       12 |         16 |        400 | —                                 |
| `Text.Overline`            | `"overline"`  |       10 |         16 |        500 | `uppercase`, `letterSpacing: 0.5` |
| `Text.Label`               | `"label"`     |       14 |         20 |        500 | —                                 |

## Color slots

Configured at the provider level via `<KrakenProvider tokens={{ textColors: {...} }}>`. Grouped in three buckets:

**Hierarchy (5)** — content on standard surfaces:

- `primary` — main content (default)
- `secondary` — supporting content
- `tertiary` — de-emphasized (captions, hints)
- `disabled` — inactive
- `inverse` — text on inverted background

**Semantic (5)** — meaning-carrying:

- `interactive` — links, tappable text
- `success` — success messages
- `warning` — warnings
- `danger` — errors, destructive
- `info` — informational

**On-\* (4)** — text on solid brand surfaces (Button labels, colored Toast, etc.):

- `onPrimary` — text on brand primary background
- `onSecondary` — text on brand secondary background
- `onSuccess` — text on success surface
- `onDanger` — text on danger surface

## Usage

Basic:

```tsx
<Text>Body copy — defaults to body2 + primary.</Text>

<Text.H1>Hero title</Text.H1>
<Text.H4 color="tertiary">Subtitle</Text.H4>

<Text variant="body1" color="interactive">
  Also works with the prop form.
</Text>
```

Semantic + intensity:

```tsx
<Text.Body2 color="danger" intensity="subtle">
  Muted error message
</Text.Body2>

<Text.H3 intensity="strong">Extra-bold heading</Text.H3>
```

Custom color (any hex, rgb, rgba, or named color — passes through as-is):

```tsx
<Text.Body1 color="#FF6B00">Custom brand orange</Text.Body1>
<Text.Body1 color="rgb(139, 92, 246)">rgb value</Text.Body1>
<Text.Body1 color="hotpink">named color</Text.Body1>
```

Text on colored surfaces:

```tsx
<View style={{ backgroundColor: "#2563EB", padding: 12 }}>
  <Text.Body1 color="onPrimary">Label on brand primary bg</Text.Body1>
</View>
```

## Notable props that just work

None of these are re-declared on `TextProps` because they come from the RN Text / Tamagui type inference:

- **`onPress`** / `onLongPress` / `onPressIn` / `onPressOut` — make the text tappable.
- **`numberOfLines`** + **`ellipsizeMode`** — truncate with ellipsis.
- **`textAlign`** — `"auto" \| "left" \| "right" \| "center" \| "justify"`.
- **`selectable`** / `selectionColor` — allow user text selection.
- **`adjustsFontSizeToFit`** + `minimumFontScale` — shrink to fit.
- **`allowFontScaling`** + `maxFontSizeMultiplier` — respect / cap OS font-size preference.
- **`accessibilityLabel`** / `accessibilityRole` / `accessibilityHint` — a11y.
- **`dataDetectorType`** (iOS) — auto-detect URLs / phones / etc.
- **`style`** — RN style array escape hatch.
- **`ref`** — forwarded to the underlying RN Text.
- **`testID`** — flows through; set it on interactive text.
- Every Tamagui style prop: `padding`, `margin`, `backgroundColor`, `borderRadius`, `pressStyle`, `hoverStyle`, and shorthand aliases (`px`, `py`, `mx`, `my`, `bg`, `br`, ...).

Example combining everything:

```tsx
<Text.Body1
  color="interactive"
  onPress={openLink}
  selectable
  numberOfLines={2}
  textAlign="center"
  accessibilityLabel="Read the full article"
  paddingHorizontal="$4"
>
  Read the full article
</Text.Body1>
```

## Notes

- The `color` prop's union `TextColor | string` uses the `(string & {})` trick under the hood, so autocomplete surfaces the 14 slot names but a raw hex still typechecks.
- `intensity="strong"` bumps weight relative to the variant's base — `body*` (400) → 600, `subtitle*` / `label` (500) → 700, `h1..h3` (already 700) → no change.
- Nesting `<Text>` inside `<Text>` for inline color changes is supported (RN native behavior).
- No auto-contrast for `on-*` slots — you pick explicitly (same rule as Button).
