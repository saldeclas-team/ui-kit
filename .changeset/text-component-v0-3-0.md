---
"ui-kraken": minor
---

feat(text): ship the `Text` primitive — the second component after `Button`

Adds a full-featured typographic primitive on top of Tamagui:

- **13 HTML-familiar variants** — `h1`–`h6`, `subtitle1`/`subtitle2`, `body1`/`body2`, `caption`, `overline`, `label`. Sized on a Material-3-inspired scale (H1 40/48/700 → Label 14/20/500) with `overline` also getting `textTransform: uppercase` + `letterSpacing: 0.5`.
- **Compound API** — `Text.H1`, `Text.Body1`, `Text.Caption`, … same pattern as `Button.Primary`. The plain `<Text>` still works and defaults to `variant="body2"`.
- **14 color slots** grouped in three buckets: 5 hierarchy (`primary`, `secondary`, `tertiary`, `disabled`, `inverse`), 5 semantic (`interactive`, `success`, `warning`, `danger`, `info`), 4 on-\* (`onPrimary`, `onSecondary`, `onSuccess`, `onDanger`).
- **`color` prop accepts either** a slot name (resolves to a theme token via `useKraken()`) **or a raw string** (`#RRGGBB`, `rgb(...)`, named color) — the `(string & {})` trick preserves slot autocomplete without rejecting arbitrary strings.
- **Intensity modulator** — `subtle` (opacity 0.65), `normal` (default), `strong` (fontWeight bumped one step; already-700 variants stay unchanged).
- **Every RN Text prop and every Tamagui style prop flows through** the `...rest` spread — `onPress`, `numberOfLines`, `textAlign`, `selectable`, `adjustsFontSizeToFit`, `accessibilityLabel`, `style`, `padding`, `pressStyle`, shorthand aliases, etc.

Provider gains `textColors?: Partial<KrakenTextColors>` alongside `buttonColors` — same per-component-block token schema. Ships `DEFAULT_LIGHT_TEXT_COLORS` and `DEFAULT_DARK_TEXT_COLORS` so consumers get a working palette out of the box.

Test coverage: 10 new specs on the component (variant fan-out, slot resolution, raw-hex/rgb passthrough, intensity subtle/strong, RN prop flow-through, compound-shortcut round-trip) plus 4 new specs on the token/provider layer (56 total, up from 44).
