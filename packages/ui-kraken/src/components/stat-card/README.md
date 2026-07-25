# StatCard

Compact metric display card for dashboards, analytics screens, financial widgets, and admin panels. Renders one number prominently with a title above, an optional trend indicator (arrow + delta) below, and an optional icon in the top-right corner.

## Import

```tsx
import { StatCard } from "ui-kraken";
```

## Props

| Prop             | Type                          | Default       | Description                                                                                            |
| ---------------- | ----------------------------- | ------------- | ------------------------------------------------------------------------------------------------------ |
| `title`          | `string`                      | —             | Small heading above the value. Required.                                                               |
| `value`          | `string \| number`            | —             | Main metric. Numbers render via `String(value)`. Required.                                             |
| `description`    | `string`                      | —             | Optional secondary caption on the footer row.                                                          |
| `icon`           | `ReactNode`                   | —             | Optional icon in the top-right corner. Consumer brings any element; tone-tinted.                       |
| `trend`          | `"up" \| "down" \| "neutral"` | —             | Drives the delta color AND the auto arrow glyph. Omit to hide the trend row.                           |
| `delta`          | `string \| number`            | —             | Delta value next to the trend arrow (e.g. `"+8.2%"`).                                                  |
| `deltaIcon`      | `ReactNode`                   | auto glyph    | Override for the default arrow (`▲` / `▼` / `—`).                                                      |
| `radius`         | `StatCardRadius`              | `"lg"`        | Border radius. Cards use `lg` by default (form fields use `md`).                                       |
| `statCardColors` | `Partial<StatCardColors>`     | —             | Per-instance color override. Missing slots fall through to the provider palette.                       |
| `testID`         | `string`                      | `"stat-card"` | Root testID. Sub-elements derive `-title`, `-value`, `-icon`, `-description`, `-delta`, `-trend-icon`. |

Every Tamagui `YStackProps` flows through the spread — `padding`, `margin`, `width`, `borderColor`, `pressStyle`, shorthand aliases (`px`, `py`, `mx`, `br`), every accessibility prop, etc.

## Trend × auto glyph mapping

| Trend       | Default glyph | Palette slot   |
| ----------- | ------------- | -------------- |
| `"up"`      | `▲`           | `trendUp`      |
| `"down"`    | `▼`           | `trendDown`    |
| `"neutral"` | `—`           | `trendNeutral` |

The trend row (arrow + delta text) only renders when `trend` is set. If `delta` is missing, the arrow renders alone.

## Layout

```
┌──────────────────────────────────┐
│ Title                       Icon │
│                                  │
│ Value                            │
│                                  │
│ ▲ +12%   description...          │
└──────────────────────────────────┘
```

Top row: title (flex-1) + icon (fixed right slot). Middle: value (large, bold). Bottom row: trend + delta + description (all optional).

## Color model

StatCard has its own **`statCardColors`** block on the token schema — 8 slots.

```tsx
import { UIKitProvider } from "ui-kraken";

<UIKitProvider
  tokens={{
    statCardColors: {
      background: "#FFFFFF",
      value: "#0B0B0F",
      trendUp: "#059669",
    },
  }}
  dark={{
    statCardColors: {
      background: "#111827",
      value: "#F5F5F7",
      trendUp: "#34D399",
    },
  }}
>
  <App />
</UIKitProvider>;
```

### Slots

| Slot           | Paints                                              |
| -------------- | --------------------------------------------------- |
| `background`   | Card background.                                    |
| `title`        | Small heading above the value.                      |
| `value`        | Main metric text.                                   |
| `description`  | Secondary caption on the footer row.                |
| `icon`         | Icon-slot wrapper color (consumer's icon inherits). |
| `trendUp`      | Arrow + delta text when `trend="up"`.               |
| `trendDown`    | Arrow + delta text when `trend="down"`.             |
| `trendNeutral` | Arrow + delta text when `trend="neutral"`.          |

### Default palettes

**Light**: `#F9FAFB` background · `#0B0B0F` value · `#6B7280` title/description/icon · `#059669` trendUp · `#DC2626` trendDown · `#6B7280` trendNeutral.

**Dark**: `#111827` background · `#F5F5F7` value · `#9CA3AF` title/description/icon · `#34D399` trendUp · `#F87171` trendDown · `#9CA3AF` trendNeutral.

## Usage

Minimal — just a headline metric:

```tsx
<StatCard title="Active users" value={1_240} />
```

With trend indicator:

```tsx
<StatCard title="Revenue" value="$12,340" trend="up" delta="+8.2%" />
```

With icon + description:

```tsx
<StatCard title="Sessions" value="4,120" icon={<SessionsIcon />} description="vs last week" />
```

Full example — the shape most dashboards land on:

```tsx
<StatCard
  title="Revenue"
  value="$12,340"
  icon={<DollarIcon />}
  trend="up"
  delta="+8.2%"
  description="vs last week"
/>
```

Negative trend:

```tsx
<StatCard title="Bounce rate" value="42.3%" trend="down" delta="-2.1%" />
```

Dashboard row — three cards side by side in a grid:

```tsx
<XStack gap="$3">
  <StatCard title="Users" value={1_240} trend="up" delta="+8%" />
  <StatCard title="Revenue" value="$12,340" trend="up" delta="+12%" />
  <StatCard title="Bounce rate" value="42.3%" trend="down" delta="-2%" />
</XStack>
```

Per-instance brand-tinted card:

```tsx
<StatCard
  title="Sales"
  value="$4,120"
  trend="up"
  delta="+12%"
  statCardColors={{ background: "#F5F3FF", value: "#4C1D95", trendUp: "#7C3AED" }}
/>
```

Override the trend arrow with a custom icon:

```tsx
<StatCard title="Revenue" value="$12,340" trend="up" delta="+8%" deltaIcon={<ArrowUpIcon />} />
```

## Accessibility

Defaults:

- `accessibilityRole="summary"` — RN's role for a summarized region of content.
- `accessibilityLabel` — auto-composed as `"{title}, {value}"` (+ `", {trend} {delta}"` when set, + `", {description}"` when set). Consumers can pass an explicit `accessibilityLabel` to override.

Both flow through the spread.

## Sub-element testIDs

- root: `"stat-card"` (overridable via `testID`)
- title: `"{root}-title"`
- value: `"{root}-value"`
- icon (when passed): `"{root}-icon"`
- description (when passed): `"{root}-description"`
- delta (when `trend` set + `delta` set): `"{root}-delta"`
- trend icon (when `trend` set): `"{root}-trend-icon"`

## Notes

- **One value per card** — multi-metric layouts compose several StatCards side by side.
- **No sparkline / chart embed in v1**. If demand emerges, add `chart?: ReactNode` as a slot below the delta row.
- **No press interaction built in** — wrap in `<Pressable>` if the card should navigate. Adding `onPress` would blur the primitive.
- **No value formatting** — consumers pass a pre-formatted string. Locale-aware number formatting belongs to the caller.
- **No `size` variants** — cards fill their parent width; typography is fixed.

## Platform support

| Platform | Status | Notes                                                                                        |
| -------- | ------ | -------------------------------------------------------------------------------------------- |
| iOS      | ✅     | Native rendering via `YStack`.                                                               |
| Android  | ✅     | Native rendering via `YStack`.                                                               |
| Web      | ✅     | Via `react-native-web`. Renders as flex `<div>`s; every accessibility prop maps to `aria-*`. |
