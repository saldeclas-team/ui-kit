# Surface

Theme-bound background container with 4 semantic elevation levels (`base` / `raised` / `overlay` / `sunken`). Provider-level + per-instance color overrides. Extends `YStack` — every Tamagui prop flows through.

## Import

```tsx
import { Surface } from "ui-kraken";
```

## Props

| Prop            | Type                                          | Default     | Description                                                                                      |
| --------------- | --------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------ |
| `level`         | `"base" \| "raised" \| "overlay" \| "sunken"` | `"base"`    | Semantic elevation level. Drives which slot on `surfaceColors` is used for the background color. |
| `surfaceColors` | `Partial<SurfaceColors>`                      | —           | Per-instance color override. Missing slots fall through to the provider palette.                 |
| `testID`        | `string`                                      | `"surface"` | Root testID.                                                                                     |

Every Tamagui `YStackProps` (except `backgroundColor`, which is managed) flows through the spread: `padding`, `paddingHorizontal`, `margin`, `gap`, `flex`, `borderRadius`, `borderWidth`, `borderColor`, `pressStyle`, shorthand aliases (`px`, `py`, `mx`, `br`), every accessibility prop, etc.

## Color model

Surface has its own **`surfaceColors`** block on the token schema — 4 slots, one per level.

```tsx
import { UIKitProvider } from "ui-kraken";

<UIKitProvider
  tokens={{
    surfaceColors: {
      base: "#FAFAFA",
      raised: "#FFFFFF",
    },
  }}
  dark={{
    surfaceColors: {
      base: "#000000",
      raised: "#0B0B0F",
    },
  }}
>
  <App />
</UIKitProvider>;
```

### Slots

| Slot      | Paints                                            |
| --------- | ------------------------------------------------- |
| `base`    | Standard app background.                          |
| `raised`  | Cards, list items on top of the base surface.     |
| `overlay` | Modals, sheets, dropdowns (highest visual layer). |
| `sunken`  | Form sections, inset panels, muted regions.       |

### Default palettes

**Light**: `#FFFFFF` (base) → `#F9FAFB` (raised) → `#FFFFFF` (overlay) → `#F3F4F6` (sunken).

**Dark**: `#0B0B0F` (base) → `#111827` (raised) → `#1F2937` (overlay) → `#030712` (sunken). Follows Material 3's dark-mode convention where luminance INCREASES with elevation — a raised surface on a near-black background is slightly lighter so it reads as "closer" to the viewer.

## Usage

Root screen wrapper:

```tsx
import { Surface, Text } from "ui-kraken";

export default function HomeScreen() {
  return (
    <Surface level="base" flex={1} padding={16}>
      <Text.H1>Home</Text.H1>
    </Surface>
  );
}
```

Card:

```tsx
<Surface level="raised" padding={16} borderRadius={12} gap={8}>
  <Text.H4>Weekly summary</Text.H4>
  <Text.Body2 color="secondary">Your activity in the past 7 days.</Text.Body2>
</Surface>
```

Modal / sheet background:

```tsx
<Surface level="overlay" padding={24} borderRadius={16}>
  <Text.H3>Confirm delete?</Text.H3>
  <Button.Destructive onPress={onConfirm}>Delete</Button.Destructive>
</Surface>
```

Inset form section:

```tsx
<Surface level="sunken" padding={12} borderRadius={8}>
  <Text.Body2 color="secondary">Advanced options</Text.Body2>
  {/* fields... */}
</Surface>
```

Nested composition — a raised card containing a sunken row:

```tsx
<Surface level="raised" padding={16} borderRadius={12} gap={12}>
  <Text.H5>Trip details</Text.H5>
  <Surface level="sunken" padding={12} borderRadius={8}>
    <Text.Caption color="secondary">Distance · Duration · Cost</Text.Caption>
  </Surface>
</Surface>
```

Per-instance color override:

```tsx
<Surface level="raised" padding={16} borderRadius={12} surfaceColors={{ raised: "#FFF7ED" }}>
  <Text>Brand-tinted card without touching the provider palette.</Text>
</Surface>
```

## Accessibility

Surface has no default accessibility semantics — it is a visual container primitive. When a Surface is used as a landmark region, opt in via the Tamagui pass-through:

```tsx
<Surface level="raised" accessibilityRole="summary" accessibilityLabel="Weekly summary">
  {/* ... */}
</Surface>
```

## Notes

- **No shadows in v1** — elevation is expressed via background color only. Reach for `Button.elevation` if you need shadow chrome; wrap the Surface in your own shadow container if you need a shadowed card.
- **No default `flex`, no default padding** — Surface ships as a naked wrapper. Set `flex={1}` for a screen-sized surface; set `padding={...}` for a card. Consumer controls the layout.
- **No semantic-color variants** (`primary` / `success` / `warning`) — those live on `Alert` / `Button`. Surface is neutral.
- **No `pressable` mode** — if a Surface needs to be tappable, wrap it in `<Pressable>`. Adding press semantics would blur the primitive.

## Platform support

| Platform | Status | Notes                                                                                          |
| -------- | ------ | ---------------------------------------------------------------------------------------------- |
| iOS      | ✅     | Full support via native `View`.                                                                |
| Android  | ✅     | Full support.                                                                                  |
| Web      | ✅     | Via `react-native-web`. Renders as a `<div>`. Every accessibility prop translates to `aria-*`. |
