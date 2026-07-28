# Card — design record

**Status:** planned for ui-kraken v0.10.0. First component after the Batch 2 close-out; sits between Batch 2 (native-bridge components) and a future Batch 3 (calendar / other higher-level composites).

Living design doc for the `Card` primitive. Kept post-shipping so future contributors can understand the decisions behind the shape of the API, not just what it does today.

---

## Overview

Rounded, padded, semantically-elevated container for grouping related content. Sits one layer above `Surface`: `Surface` provides the themed background color; `Card` adds the visual affordance (padding, radius, gap) plus a small compound API for the two most common card layouts (header + body, or header + body + footer actions).

**Locked decisions:**

- **Composition over Surface, not duplication.** Card renders `<Surface level="raised">` internally and layers its own layout tokens on top. Surface owns the color slot (`surfaceColors.raised`); Card owns padding / radius / gap. No `cardColors` block on the token schema — Card has no color surface of its own, so the [each-component-owns-color-space rule](../CLAUDE.md) doesn't apply. Adding one later is trivial if we introduce a border or divider that Card owns.
- **`level` prop forwards to Surface.** Defaults to `"raised"` (the card-like affordance) but consumers can pick `"base"` for a flatter card that reads flush with the screen background, or `"overlay"` when the card sits on top of a modal.
- **Compound API with 3 slots — Card + Card.Header + Card.Body + Card.Footer.** Header is a horizontal row (title + optional trailing action); Body is a vertical stack for main content; Footer is a horizontal row aligned to `flex-end` for action buttons. Slots are optional — a Card can be used simply as `<Card>{content}</Card>` without any slots, and Card's own gap handles vertical spacing between direct children.
- **Padding / gap / radius are tokens with numeric defaults**, exposed as Tamagui pass-through props so consumers can override per-instance (`<Card padding={24} gap={16}>`). No token schema block — padding scales already live on Tamagui's spacing tokens; Card just picks sensible defaults.
- **No pressable variant.** Card is purely visual. Consumers who need tap-to-open behavior wrap Card in a `<Pressable>` or use Button chrome. Keeps the API tight and avoids a hover/pressed color branch we don't need yet.
- **Extends `YStack`.** Every Tamagui `YStackProps` flows through the `...rest` spread on the outer Card element (`padding`, `margin`, `borderRadius`, `gap`, `flex`, `pressStyle`, etc.). Slots extend their respective stack primitives (`XStack` for Header/Footer, `YStack` for Body) so consumers can override alignment / gap per-slot too.

## API

### Props

`CardProps` re-declares only what is OURS. Every Tamagui `YStackProps` flows through the `...rest` spread.

```ts
export type CardLevel = SurfaceLevel; // "base" | "raised" | "overlay" | "sunken"

export interface CardProps extends Omit<YStackProps, "backgroundColor"> {
  /**
   * Semantic elevation level forwarded to the internal `<Surface>`.
   * Drives which slot on `surfaceColors` is used for the background.
   * Default: `"raised"`.
   */
  level?: CardLevel;
  /** Root testID (default: `"card"`). */
  testID?: string;
}

export interface CardHeaderProps extends XStackProps {
  testID?: string; // default `"{parent}-header"` via composition
}

export interface CardBodyProps extends YStackProps {
  testID?: string; // default `"{parent}-body"` via composition
}

export interface CardFooterProps extends XStackProps {
  testID?: string; // default `"{parent}-footer"` via composition
}
```

### Defaults

| Element       | Layout   | Defaults                                                                                  |
| ------------- | -------- | ----------------------------------------------------------------------------------------- |
| `Card`        | `YStack` | `padding={16}`, `borderRadius={12}`, `gap={12}`, `level="raised"`                         |
| `Card.Header` | `XStack` | `justifyContent="space-between"`, `alignItems="center"` — title on the left, action right |
| `Card.Body`   | `YStack` | `gap={8}` — inner content spacing                                                         |
| `Card.Footer` | `XStack` | `justifyContent="flex-end"`, `gap={8}` — action buttons on the right                      |

Slots deliberately have `padding=0` — Card's own padding covers the outer inset, and Card's gap separates the slots vertically. Consumers can override any of these via prop pass-through.

### Compound access

```tsx
import { Card } from "ui-kraken";

<Card>
  <Card.Header>
    <Text>Header title</Text>
    <Button size="sm">Action</Button>
  </Card.Header>
  <Card.Body>
    <Text>Body copy.</Text>
  </Card.Body>
  <Card.Footer>
    <Button variant="ghost">Cancel</Button>
    <Button>Confirm</Button>
  </Card.Footer>
</Card>;
```

### Simple usage

Slots are optional. Card + gap handles simple layouts:

```tsx
<Card>
  <Text variant="h4">Notification</Text>
  <Text>You have 3 unread messages.</Text>
</Card>
```

### Sub-element testIDs

- Root: `"card"` (overridable via `testID`).
- Header: `"{root}-header"` (overridable via prop).
- Body: `"{root}-body"` (overridable via prop).
- Footer: `"{root}-footer"` (overridable via prop).

### A11y

Card is a visual grouping primitive with no default accessibility semantics. When a Card represents a distinct landmark or article, opt in via the Tamagui pass-through:

```tsx
<Card accessibilityRole="summary">…</Card>
```

## Token schema

Card has **no color tokens of its own** — it delegates background color to Surface via the forwarded `level` prop. Padding / radius / gap are hardcoded defaults consumable via Tamagui pass-through props (`<Card padding={24}>` overrides at the callsite).

If we introduce a per-slot border / divider color in a future revision, we'll add a `cardColors` block at that point per the [each-component-owns-color-space rule](../CLAUDE.md) — the schema wiring would follow the standard 13-step recipe. Today: nothing to wire.

## File structure

```
packages/ui-kraken/src/components/card/
  ├─ card-types.ts              # CardProps + CardHeaderProps + CardBodyProps + CardFooterProps + CardLevel re-export
  ├─ card.styled.ts             # StyledCard + StyledCardHeader + StyledCardBody + StyledCardFooter
  ├─ card.tsx                   # Compound Card with static Header/Body/Footer
  ├─ card.spec.tsx              # Coverage tests + snapshots
  ├─ card.stories.tsx           # Storybook stories
  ├─ README.md                  # Consumer-facing docs
  ├─ __snapshots__/             # Auto-generated
  └─ index.ts                   # Barrel
```

No new files in `tokens/` or `provider/` — Card has no palette.

## Testing

### Behavioral coverage (~15 tests)

- Renders with default root testID (`"card"`).
- Custom `testID` overrides the root and defaults sub-slot testIDs.
- Renders children inline when no slots are used (simple mode).
- Compound: renders Header + Body + Footer with default testIDs.
- Compound: sub-slot custom testIDs override defaults.
- `level` forwards to internal Surface — assert background color matches `surfaceColors.{level}` for each of `"base"`, `"raised"`, `"overlay"`, `"sunken"`.
- Default level is `"raised"`.
- Pass-through props: `padding`, `borderRadius`, `gap` override defaults on Card.
- Pass-through props: `justifyContent`, `gap` override defaults on Header / Body / Footer.
- Header renders as `XStack` (test via layout prop pass-through).
- Body renders as `YStack`.
- Footer renders as `XStack`.
- A11y pass-through: `accessibilityRole` reaches the outer element.
- Ref forwarding on `Card`.

### Structural snapshots (~4)

- Default Card with children.
- Compound Card (Header + Body + Footer).
- Card with custom level + palette override on the provider.
- Dark theme via `<Theme name="dark">`.

## Storybook (~6 stories)

- `Default` — plain card with `<Text>` inside.
- `WithSlots` — compound Header + Body + Footer.
- `LevelBase` / `LevelOverlay` — showing the flatter and darker variants.
- `CustomPadding` — showing per-instance override.
- `DarkTheme` — dark background palette applied via `<Theme name="dark">`.

## Example app screen

`apps/example/app/(pages)/components/card.tsx` — 5 sections:

1. Simple card with a headline + paragraph.
2. Compound card (Header + Body + Footer) — mimics a settings row with a title, description, and Save / Cancel buttons.
3. Level showcase — 4 cards side-by-side with `level="base|raised|overlay|sunken"` so consumers can see the elevation difference against the screen background.
4. Card grid — a `Row` of 2 cards to show `flex: 1` composition.
5. Themed card — custom background via `<Surface surfaceColors={{...}}>` provider override to show that Card inherits provider color changes.

## Non-goals

- **No `Card.Media` slot for images.** Consumers embed `<Image>` directly inside Card or Card.Body; not enough distinct behavior to warrant a slot.
- **No shadow / elevation shadow.** ui-kraken follows the Material 3 "tint over shadow" direction (same rationale as Surface); consumers who need a shadow wrap Card in a shadow container.
- **No pressable variant.** See "Locked decisions" — wrap in `<Pressable>` if needed.
- **No `dense` / `compact` size prop.** Padding is a Tamagui pass-through; consumers who want a tighter card pass `padding={8}` at the callsite. If we start seeing every consumer pick the same tighter padding we'll revisit.
- **No divider between slots.** Slot separation comes from Card's `gap`; visible dividers are a future addition once we ship a `Divider` primitive (v0.3 roadmap).
