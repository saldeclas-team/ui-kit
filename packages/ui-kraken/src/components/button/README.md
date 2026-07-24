# Button

Interactive button with five tones (`primary` / `secondary` / `outline` / `ghost` / `destructive`), three sizes, disabled / loading states, per-instance color overrides, and a configurable `radius` prop. Colors come from the `buttonColors` block on `KrakenProvider`.

## Import

```tsx
import { Button } from "ui-kraken";
```

## Props

| Prop           | Type                                                                | Default             | Description                                                                                                                                                                                     |
| -------------- | ------------------------------------------------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `children`     | `ReactNode`                                                         | —                   | Label content. Optional so icon-only buttons work.                                                                                                                                              |
| `tone`         | `"primary" \| "secondary" \| "outline" \| "ghost" \| "destructive"` | `"primary"`         | Visual tone. Usually set implicitly by the compound subcomponent (`Button.Ghost`).                                                                                                              |
| `size`         | `"sm" \| "md" \| "lg"`                                              | `"md"`              | Vertical size. Also drives the default border radius when `radius` is not provided.                                                                                                             |
| `radius`       | `number \| "none" \| "sm" \| "md" \| "lg" \| "pill"`                | derived from `size` | Border radius. Presets map to the coarse theme scale (`sm` / `md` / `lg`), `"none"` is 0, `"pill"` is fully rounded. A raw number is passed through as pixels.                                  |
| `disabled`     | `boolean`                                                           | `false`             | Disables press interaction and dims the surface (opacity 0.45).                                                                                                                                 |
| `loading`      | `boolean`                                                           | `false`             | Replaces the `leftIcon` slot with a loader and blocks presses. Sets `accessibilityState.busy`.                                                                                                  |
| `leftIcon`     | `ReactNode`                                                         | —                   | Slot rendered before the label. Hidden while `loading`.                                                                                                                                         |
| `rightIcon`    | `ReactNode`                                                         | —                   | Slot rendered after the label.                                                                                                                                                                  |
| `buttonColors` | `Partial<{ background?: string; label: string; border?: string }>`  | —                   | Per-instance color override for THIS button's variant. Same slots as the corresponding variant at the provider — `background` / `label` / `border` — every field optional. Fills in from theme. |
| `testID`       | `string`                                                            | `"button"`          | Root testID. Subelements derive: `{testID}-label`, `{testID}-left-icon`, `{testID}-right-icon`, `{testID}-loader`.                                                                              |

## Color model

Colors for every Button variant are configured **at the `KrakenProvider` level** under the `buttonColors` block:

```tsx
import { KrakenProvider } from "ui-kraken";

<KrakenProvider
  tokens={{
    buttonColors: {
      primary: { background: "#2563EB", label: "#FFFFFF" },
      secondary: { background: "#0EA5E9", label: "#FFFFFF" },
      outline: { border: "#2563EB", label: "#2563EB" },
      ghost: { label: "#2563EB" },
      destructive: { background: "#DC2626", label: "#FFFFFF" },
    },
    radius: 12,
    spacing: 8,
  }}
  dark={{
    buttonColors: {
      primary: { background: "#3B82F6", label: "#FFFFFF" },
      // …
    },
  }}
  defaultTheme="system"
>
  <App />
</KrakenProvider>;
```

Each variant fills only the slots it needs — `outline` uses `border` (not `background`); `ghost` uses `label` only (no background, no border).

If you don't pass anything, ui-kraken ships sensible defaults (`DEFAULT_TOKENS` and `DEFAULT_DARK_TOKENS`).

## Usage

Basic:

```tsx
<Button onPress={onSubmit}>Save</Button>

<Button.Secondary onPress={onCancel}>Cancel</Button.Secondary>

<Button.Outline leftIcon={<PlusIcon />} onPress={onAdd}>
  Add item
</Button.Outline>

<Button.Ghost onPress={onSkip}>Skip</Button.Ghost>

<Button.Destructive onPress={onDelete}>Delete</Button.Destructive>
```

Sizes:

```tsx
<Button.Primary size="sm">Small</Button.Primary>
<Button.Primary size="md">Medium</Button.Primary>
<Button.Primary size="lg">Large</Button.Primary>
```

Radius presets and pill / custom shapes:

```tsx
<Button.Primary radius="none">Square</Button.Primary>
<Button.Primary radius="lg">Large radius</Button.Primary>
<Button.Primary radius="pill">Fully rounded</Button.Primary>
<Button.Primary radius={24}>Custom 24px</Button.Primary>
```

Elevation (shadows):

```tsx
<Button.Primary elevation="none">Flat</Button.Primary>
<Button.Primary elevation="sm">Subtle lift</Button.Primary>
<Button.Primary elevation="md">Card-like</Button.Primary>
<Button.Primary elevation="lg">Raised</Button.Primary>
```

**Dark-mode note**: black shadows are invisible against a dark surface. When `activeTheme === "dark"` and `elevation !== "none"`, Button automatically renders a translucent-white border (opacity scales with the level) as a substitute — a pattern lifted from Linear / Notion / Vercel. The swap is skipped for `outline` / `ghost` tones (they own their border) and yields to any explicit `buttonColors.border` override.

Loading / disabled:

```tsx
<Button loading>Submitting</Button>
<Button disabled>Locked</Button>
```

Per-instance color overrides — only the fields you want to change, rest come from the theme:

```tsx
<Button.Primary buttonColors={{ background: "#FF6B00", label: "#FFFFFF" }}>
  Custom brand primary
</Button.Primary>

<Button.Ghost buttonColors={{ label: "#DC2626" }}>
  Danger ghost
</Button.Ghost>

<Button.Outline buttonColors={{ border: "#FF6B00", label: "#FF6B00" }}>
  Custom outline
</Button.Outline>
```

## Notes

- Minimum touch target is 48 × 48 px (grows to 56 × 56 for `size="lg"`, shrinks to 36 for `size="sm"`).
- `disabled` and `loading` both apply `opacity: 0.45`. There is no separate "inactive color" slot — if you need one, pass `buttonColors.background` per-instance for the disabled state or wrap the button in a container that adjusts the tint.
- `outline` and `ghost` have transparent backgrounds; passing `buttonColors.background` on them explicitly fills the surface if you need it.
- Difference between `outline` and `ghost`: both use `buttonColors[variant].label` for the text, but `outline` adds a 1 px border (`buttonColors.outline.border`), `ghost` renders as pure text.
