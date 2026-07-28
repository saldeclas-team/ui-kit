# Badge

Compact pill for notification counts, status labels, and inline indicators. Three rendering modes coexist: **text label**, **numeric count** (with overflow formatting), or **dot** (status indicator for use over Avatar and similar). Counterpart to `Alert` (banner) and `Hint` (inline paragraph) at the smallest visual weight.

## Import

```tsx
import { Badge } from "ui-kraken";
```

## Props

| Prop          | Type                                                           | Default     | Description                                                               |
| ------------- | -------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------- |
| `tone`        | `"neutral" \| "primary" \| "success" \| "warning" \| "danger"` | `"neutral"` | Semantic tone. Drives which slot on `badgeColors` is used.                |
| `size`        | `"sm" \| "md"`                                                 | `"md"`      | `sm` → fontSize 10 / minHeight 16; `md` → 12 / 20. Dots: 8px / 10px.      |
| `count`       | `number`                                                       | —           | Numeric count. Wins over `children`. Formatted (`99+`) when > `maxCount`. |
| `maxCount`    | `number`                                                       | `99`        | Clamp threshold — count > maxCount renders `"{maxCount}+"`.               |
| `dot`         | `boolean`                                                      | `false`     | Dot mode — small filled circle, no text. Wins over count + children.      |
| `children`    | `ReactNode`                                                    | —           | Text content. Ignored when `count` or `dot` is set.                       |
| `badgeColors` | `Partial<BadgeToneColors>`                                     | —           | Per-instance override. Applies to the picked tone only.                   |
| `testID`      | `string`                                                       | `"badge"`   | Root testID.                                                              |

Every Tamagui `YStackProps` also flows through the `...rest` spread. `backgroundColor` is intentionally omitted — override via `badgeColors`.

## Rendering modes

| Props                             | Renders                                      |
| --------------------------------- | -------------------------------------------- |
| `dot`                             | Filled circle at 8px (sm) / 10px (md)        |
| `count` (any number, including 0) | Formatted number (`"99+"` when > `maxCount`) |
| `children`                        | Children inside the pill                     |
| None of the above                 | Empty pill                                   |

## Color model

`badgeColors` — 5 tones × 2 slots (nested, same shape as `HintToneColors`):

```ts
BadgeToneColors: {
  (background, text);
}
BadgeColors: {
  (neutral, primary, success, warning, danger);
}
```

### Default palettes

Each tone uses a pale tinted background + darker semantic-hue text in light mode; deeper tint + lighter tone-hue text in dark mode. Same hue mapping as Hint's soft-emphasis palette — a Badge and a Hint of the same tone read as the same signal at different sizes.

## Compound access

```tsx
<Badge.Primary>New</Badge.Primary>
<Badge.Success count={5} />
<Badge.Warning>Beta</Badge.Warning>
<Badge.Danger dot />
```

No `Badge.Neutral` — that's the base `<Badge>` default.

## Usage

### Text label

```tsx
<Badge>Beta</Badge>
<Badge.Success>Active</Badge.Success>
```

### Count with overflow

```tsx
<Badge count={5} />                     {/* "5" */}
<Badge count={120} />                   {/* "99+" (default maxCount=99) */}
<Badge count={12} maxCount={9} />       {/* "9+" */}
```

### Dot indicator (status)

```tsx
<Badge dot tone="success" />            {/* 10px filled circle */}
<Badge dot size="sm" tone="danger" />   {/* 8px filled circle */}
```

### Dot over Avatar (composition)

```tsx
<View>
  <Avatar name="Alexis" size="lg" />
  <View style={{ position: "absolute", bottom: 0, right: 0 }}>
    <Badge dot tone="success" />
  </View>
</View>
```

### Per-instance color

```tsx
<Badge.Primary badgeColors={{ background: "#7C3AED", text: "#F5F3FF" }}>Brand</Badge.Primary>
```

### Provider-wide color (change every Badge of that tone)

```tsx
<UIKitProvider
  overrides={{
    light: {
      badgeColors: {
        primary: { background: "#7C3AED", text: "#F5F3FF" },
      },
    },
  }}
>
  ...
</UIKitProvider>
```

## Sub-element testIDs

- Root: `"badge"` (overridable via `testID`).
- Text (when rendering text/count): `"{root}-text"`.

## Accessibility

- `accessibilityRole="text"` by default — a badge is inline advisory content.
- `accessibilityLabel` defaults to:
  - Text mode: the string children
  - Count mode: the formatted count string
  - Dot mode: `"Indicator"`
  - Non-string children: `"Badge"`
- Consumers override for domain-specific copy: `<Badge dot accessibilityLabel="3 unread" />`.

## Notes

- **No `outline` / `ghost` emphasis variants** — one visual style keeps the tone signal readable.
- **No `pill` vs `square` shape** — always rounded pill (`borderRadius = height / 2`).
- **No `icon` slot** — a badge with an icon reads as a chip; consumers compose it manually.
- **No auto-hide when `count === 0`** — zero-count is a valid state. Consumers hide externally: `count > 0 ? <Badge count={count} /> : null`.
- **No `pulse` / `blink` animation** — ships when we introduce a `Motion` primitive.

## Platform support

| Platform | Status |
| -------- | ------ |
| iOS      | ✅     |
| Android  | ✅     |
| Web      | ✅     |
