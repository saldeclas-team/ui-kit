---
"ui-kraken": minor
---

Add `Card` — rounded, padded, semantically-elevated container that layers on top of `<Surface>`. Compound API (`Card + Card.Header + Card.Body + Card.Footer`) covers the two common layouts; simple `<Card>{content}</Card>` also works without slots. First component post-Batch 2 close-out; sits between the native-bridge batch and a future higher-level composites batch.

## API

- `<Card>` extends `YStack`; every Tamagui layout prop flows through the spread. Own props: `level` (`"base" | "raised" | "overlay" | "sunken"`, default `"raised"`), `surfaceColors` (per-instance palette override), `testID`.
- Compound: `Card.Header` (XStack, `justifyContent="space-between"` for "title + action"), `Card.Body` (YStack, `gap=8`), `Card.Footer` (XStack, `justifyContent="flex-end"`, `gap=8` for buttons). Each slot has its own testID default (`"card-header"` / `"card-body"` / `"card-footer"`) and passes every Tamagui layout prop through.
- Defaults: `padding=16`, `borderRadius=12`, `gap=12` on the root. Slots have `padding=0` so they don't stack with the parent's padding.
- Simple use: `<Card>{content}</Card>` — Card's gap handles stacking of direct children.
- Compound use: `<Card><Card.Header/><Card.Body/><Card.Footer/></Card>` — Card's gap separates the three slots.

## Composition — no new tokens

Card has **no color tokens of its own**. It reads the same `surfaceColors` palette Surface reads and applies the resolved `level` slot as its background color. Consumers who override `surfaceColors` globally (via the provider) or per-instance see both `<Surface>` and `<Card>` change together, by design. If we introduce a Card-owned border / divider color in a future revision, we'll add a `cardColors` block at that point per the each-component-owns-color-space rule; today there's nothing to wire.

Card does NOT wrap `<Surface>` internally — that would add a wrapper element with no behavioral benefit. Palette resolution is a two-line `useUIKit()` + `resolvePalette()` inline in the component.

## Non-goals (documented)

- **No shadow / elevation shadow** — same "tint over shadow" direction as Surface.
- **No pressable variant** — consumers wrap in `<Pressable>` or use Button chrome.
- **No `Card.Media` slot for images** — consumers embed `<Image>` directly.
- **No divider between slots** — slot separation via Card's `gap`; visible dividers land with the `Divider` primitive on the v0.3 roadmap.
- **No `dense` / `compact` size prop** — padding is a Tamagui pass-through.

## Testing

28 tests, 6 snapshots — 100% coverage on `card.tsx`. Behavioral coverage: simple + compound rendering, sub-slot testID defaults + overrides, level → surfaceColors slot resolution across all 4 levels (light + dark palettes), per-instance + provider-wide palette overrides, Tamagui pass-through props on both the root and each slot, a11y prop pass-through, ref forwarding.

## Example app

New `/components/card` route with 5 sections: simple card, compound (Header + Body + Footer), level showcase (all 4 levels side-by-side), 2-column card grid (`flex: 1`), themed card via per-instance `surfaceColors` override.
