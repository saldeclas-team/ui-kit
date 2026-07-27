# Card

Rounded, padded, semantically-elevated container for grouping related content. Sits one layer above [`Surface`](../surface/README.md) — Surface provides the themed background color, Card adds padding + radius + gap plus a small compound API for the two most common card layouts.

## Import

```tsx
import { Card } from "ui-kraken";
```

## Props

### `<Card>`

| Prop            | Type                                          | Default    | Description                                                                                                                     |
| --------------- | --------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `level`         | `"base" \| "raised" \| "overlay" \| "sunken"` | `"raised"` | Semantic elevation level forwarded to the internal palette. Same slots as [`Surface`](../surface).                              |
| `surfaceColors` | `Partial<SurfaceColors>`                      | —          | Per-instance color override. Missing slots fall through to the provider palette. Only the resolved-level slot is actually read. |
| `testID`        | `string`                                      | `"card"`   | Root testID.                                                                                                                    |

Every Tamagui `YStackProps` also flows through the `...rest` spread — `padding`, `borderRadius`, `gap`, `margin`, `flex`, `pressStyle`, shorthand aliases (`px`, `py`, `br`), etc. `backgroundColor` is intentionally omitted — override via `surfaceColors` instead.

### `<Card.Header>` / `<Card.Body>` / `<Card.Footer>`

Each slot accepts every prop of its underlying stack (`XStackProps` for Header + Footer, `YStackProps` for Body), plus a `testID` override (defaults: `"card-header"` / `"card-body"` / `"card-footer"`).

## Defaults

| Element       | Layout   | Defaults                                                                                  |
| ------------- | -------- | ----------------------------------------------------------------------------------------- |
| `Card`        | `YStack` | `padding=16`, `borderRadius=12`, `gap=12`, `level="raised"`                               |
| `Card.Header` | `XStack` | `justifyContent="space-between"`, `alignItems="center"` — title on the left, action right |
| `Card.Body`   | `YStack` | `gap=8` — inner content spacing                                                           |
| `Card.Footer` | `XStack` | `justifyContent="flex-end"`, `gap=8` — action buttons on the right                        |

Slots deliberately have `padding=0` — Card's own padding covers the outer inset, and Card's gap separates the slots vertically. Consumers override any of these via prop pass-through.

## Usage

### Simple — no slots

Card + gap handles simple layouts without any compound structure:

```tsx
import { Card, Text } from "ui-kraken";

<Card>
  <Text variant="h4">Notification</Text>
  <Text>You have 3 unread messages.</Text>
</Card>;
```

### Compound — Header + Body + Footer

```tsx
import { Card, Button, Text } from "ui-kraken";

<Card>
  <Card.Header>
    <Text variant="h5">Publish post</Text>
    <Button size="sm" variant="ghost">
      Draft
    </Button>
  </Card.Header>
  <Card.Body>
    <Text>Your post will be visible to your followers as soon as you publish.</Text>
  </Card.Body>
  <Card.Footer>
    <Button tone="ghost">Cancel</Button>
    <Button>Publish</Button>
  </Card.Footer>
</Card>;
```

Slots are optional — you can use any combination. Header-only, Header + Body, Body + Footer, etc.

### Level overrides

```tsx
// Flat card (reads flush with the screen background)
<Card level="base">…</Card>

// Card sitting on top of a modal
<Card level="overlay">…</Card>

// Inset section
<Card level="sunken">…</Card>
```

### Custom padding / radius / gap

Every layout token is a Tamagui pass-through:

```tsx
<Card padding={24} borderRadius={20} gap={16}>
  …
</Card>
```

### Custom background — per-instance

```tsx
<Card surfaceColors={{ raised: "#FFF7ED" }}>
  <Text>Brand-tinted card.</Text>
</Card>
```

Only the resolved-level slot is read at render time, but the type accepts the full palette so provider-level and per-instance overrides use the same shape.

### Custom background — provider-wide

```tsx
<UIKitProvider
  overrides={{
    light: {
      surfaceColors: { raised: "#FFF7ED" },
    },
  }}
>
  {/* every Card level="raised" now reads #FFF7ED */}
</UIKitProvider>
```

## Sub-element testIDs

- Root: `"card"` (overridable via `testID`).
- Header: `"card-header"` (overridable via prop).
- Body: `"card-body"` (overridable via prop).
- Footer: `"card-footer"` (overridable via prop).

## Accessibility

Card is a visual grouping primitive with no default accessibility semantics. When a Card represents a distinct landmark or article, opt in via the Tamagui pass-through:

```tsx
<Card accessibilityRole="summary">…</Card>
```

## Notes

- **No shadow / elevation shadow.** ui-kraken follows the Material 3 "tint over shadow" direction (same rationale as Surface). Consumers who need a shadow wrap Card in a shadow container.
- **No pressable variant.** Wrap Card in a `<Pressable>` or use Button chrome if you need tap-to-open behavior.
- **No divider between slots.** Slot separation comes from Card's `gap`; visible dividers land with the `Divider` primitive on the v0.3 roadmap.
- **Composition over Surface, not duplication.** Card reads the same `surfaceColors` palette Surface reads — a Card `level="raised"` and a `<Surface level="raised">` render the same background. If you override the palette globally on the provider, both change together.

## Platform support

| Platform | Status |
| -------- | ------ |
| iOS      | ✅     |
| Android  | ✅     |
| Web      | ✅     |
