# StatCard — design record

**Status:** shipped on 2026-07-26 in ui-kraken v0.8.0 as part of [`COMPONENTS-BATCH-1-PLAN.md`](./COMPONENTS-BATCH-1-PLAN.md) Phase B.

Living design doc for the `StatCard` primitive. Kept post-shipping so future contributors can understand the decisions behind the shape of the API, not just what it does today.

---

## Overview

Compact metric display card for dashboards, analytics screens, financial widgets, and admin panels. Renders one number prominently with a title above, an optional trend indicator (arrow + delta) below, and an optional icon in the top-right corner. Fits naturally into a horizontal or grid layout.

**Locked decisions:**

- **Naming**: `StatCard` — reads unambiguously as "a card that shows one stat". Alternates considered (`MetricCard`, `KPI`, `NumberTile`) all felt narrower or more jargon-heavy.
- **Single-value focus**: exactly one `value` per card. Multi-metric dashboards compose several `<StatCard>`s side by side; the primitive intentionally does not try to display two numbers.
- **Trend indicator as a first-class slot**: `trend: "up" | "down" | "neutral"` drives both the arrow glyph AND the delta color. No manual color plumbing — a consumer passes `trend="up"` and gets the green-arrow-plus-value affordance for free.
- **Auto glyph, overridable**: the up / down / neutral arrows default to Unicode glyphs (`▲` / `▼` / `—`) so consumers never have to import an icon library just for a trend arrow. Overridable per-instance via `deltaIcon?: ReactNode` when the design system already ships a specific icon.
- **Icon slot in top-right corner**: `icon?: ReactNode`. Consumer brings any icon element; tinted via a color-inheriting wrapper (same convention as `Alert` / `Hint`).
- **Optional description below the delta row**: `description?: string` for the small "vs last week" / "since Q3" secondary label. Reads as a caption under the delta.
- **Own color block on the token schema**: `statCardColors` with 8 slots — `background`, `title`, `value`, `description`, `icon`, `trendUp`, `trendDown`, `trendNeutral`. Provider-level + per-instance overrides.
- **Per-instance color override**: `statCardColors?: Partial<StatCardColors>` for brand-tinted cards. Any subset of the 8 slots; missing slots fall through.
- **`radius` prop** (matches Button / Skeleton / Alert): `"none" | "sm" | "md" | "lg" | "pill" | number`. Default `"lg"` because a card at `md` reads too tight.
- **Extends `YStack`** — StatCard owns its vertical stack layout. Every Tamagui `YStackProps` flows through the spread (padding, margin, width, etc.).
- **Accessibility**: default `accessibilityRole="summary"` (RN accessibility role for a summarized region), auto-composed `accessibilityLabel` combining title + value + delta when set. Both overridable via `...rest`.

## API

### Props

```ts
export type StatCardTrend = "up" | "down" | "neutral";

export type StatCardRadius = number | "none" | "sm" | "md" | "lg" | "pill";

export type StatCardColorsInput = Partial<StatCardColors>;

export interface StatCardProps extends Omit<YStackProps, "children"> {
  /** Small heading rendered above the value. */
  title: string;
  /** Main metric. String or number — numbers render via `String(value)`. */
  value: string | number;
  /** Optional secondary caption below the delta row. */
  description?: string;
  /** Optional icon in the top-right corner. Consumer brings any ReactNode. */
  icon?: ReactNode;
  /**
   * Trend direction. Drives the delta color AND the auto arrow glyph.
   * When omitted, no trend / delta row renders even if `delta` is set.
   */
  trend?: StatCardTrend;
  /** Delta value (e.g. `"+12%"`, `-3.5`, `"0"`). Rendered next to the trend arrow. */
  delta?: string | number;
  /**
   * Override for the default arrow glyph (`▲` / `▼` / `—`). Consumer
   * brings any ReactNode when their design system ships specific
   * trend icons.
   */
  deltaIcon?: ReactNode;
  /** Border radius. Defaults to `"lg"`. */
  radius?: StatCardRadius;
  /**
   * Per-instance color override. Missing slots fall through to the
   * provider-resolved palette.
   */
  statCardColors?: StatCardColorsInput;
  /**
   * Root testID. Sub-elements derive:
   * `{root}-title`, `{root}-value`, `{root}-icon`,
   * `{root}-description`, `{root}-delta`, `{root}-trend-icon`.
   */
  testID?: string;
}
```

### Trend × auto-glyph mapping

| Trend       | Default glyph | Palette slot   |
| ----------- | ------------- | -------------- |
| `"up"`      | `▲`           | `trendUp`      |
| `"down"`    | `▼`           | `trendDown`    |
| `"neutral"` | `—`           | `trendNeutral` |

The delta row (arrow + `delta` text) only renders when `trend` is set. If `delta` is missing, the arrow renders alone.

### Layout

```
┌──────────────────────────────────┐
│ Title                       Icon │
│                                  │
│ Value                            │
│                                  │
│ ▲ +12%   description...          │
└──────────────────────────────────┘
```

- Top row: title (left, flex 1) + icon (right, fixed slot).
- Middle: value (large, bold).
- Bottom row: trend arrow + delta text + description (all optional, individually).

### Per-instance override

```tsx
<StatCard
  title="Revenue"
  value="$12,340"
  trend="up"
  delta="+8.2%"
  statCardColors={{ background: "#F5F3FF", value: "#4C1D95" }}
/>
```

### Sub-element testIDs

`StatCard` derives these testIDs from the root ID:

- root: `"stat-card"` (overridable via `testID`)
- title: `"{root}-title"`
- value: `"{root}-value"`
- icon (when passed): `"{root}-icon"`
- description (when passed): `"{root}-description"`
- delta (when `trend` set): `"{root}-delta"` (the text next to the arrow)
- trend icon (when `trend` set): `"{root}-trend-icon"`

### A11y

Defaults:

- `accessibilityRole="summary"` — RN's role for a summarized region of content.
- `accessibilityLabel` — auto-composed as `"{title}, {value}"` (+ `", {trend} {delta}"` when set, + `", {description}"` when set). Consumers can pass an explicit `accessibilityLabel` to override the auto-composition.

Both flow through the spread.

## Token schema

StatCard introduces its own **`statCardColors`** block on `Tokens`. Zero reuse of Surface / Text / Alert palettes — the card owns its own visual grammar so consumers can theme cards independently of every other primitive.

```tsx
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
</UIKitProvider>
```

### `StatCardColors` interface

Slot-based, 8 slots.

```ts
export interface StatCardColors {
  /** Card background color. */
  background: string;
  /** Small heading above the value. */
  title: string;
  /** Main metric text. */
  value: string;
  /** Secondary caption below the delta row. */
  description: string;
  /** Icon-slot wrapper color (consumer's icon inherits). */
  icon: string;
  /** Arrow + delta text color when `trend="up"`. */
  trendUp: string;
  /** Arrow + delta text color when `trend="down"`. */
  trendDown: string;
  /** Arrow + delta text color when `trend="neutral"`. */
  trendNeutral: string;
}
```

### Default light palette

Tuned for a white app background — cards read as raised surfaces via a very light gray fill; typography sits on a strong dark-primary; trend arrows use the standard green (up) / red (down) / gray (neutral) semantics.

```ts
export const DEFAULT_LIGHT_STAT_CARD_COLORS: StatCardColors = {
  background: "#F9FAFB",
  title: "#6B7280",
  value: "#0B0B0F",
  description: "#6B7280",
  icon: "#6B7280",
  trendUp: "#059669",
  trendDown: "#DC2626",
  trendNeutral: "#6B7280",
};
```

### Default dark palette

Card background sits one step lighter than `Surface.base` (near-black) so cards read as elevated in dark mode. Text hierarchy inverts; trend hues shift to lighter shades that pop on dark.

```ts
export const DEFAULT_DARK_STAT_CARD_COLORS: StatCardColors = {
  background: "#111827",
  title: "#9CA3AF",
  value: "#F5F5F7",
  description: "#9CA3AF",
  icon: "#9CA3AF",
  trendUp: "#34D399",
  trendDown: "#F87171",
  trendNeutral: "#9CA3AF",
};
```

### Flatten to Tamagui tokens

`flattenStatCardColors()` produces the flat `$uiStatCard{PascalCase}` token map wired into `buildConfig()`:

```
uiStatCardBackground
uiStatCardTitle
uiStatCardValue
uiStatCardDescription
uiStatCardIcon
uiStatCardTrendUp
uiStatCardTrendDown
uiStatCardTrendNeutral
```

### Merge helper

```ts
export function mergeStatCardColors(
  base: StatCardColors,
  override?: Partial<StatCardColors>
): StatCardColors;
```

Same signature as `mergeSurfaceColors` / `mergeSkeletonColors`.

## File structure

```
packages/ui-kraken/src/components/stat-card/
├── stat-card.tsx           # component logic + resolvePalette + resolveRadius + auto glyph
├── stat-card.styled.ts     # StyledStatCard (YStack), sub-styled elements
├── stat-card-types.ts      # StatCardTrend, StatCardRadius, StatCardColorsInput, StatCardProps
├── stat-card.spec.tsx      # unit tests + describe("snapshots") block
├── stat-card.stories.tsx   # Storybook (~7 stories)
├── README.md               # props table + usage + Platform support
└── index.ts                # explicit named exports
```

Token / provider wiring per [`creating-component-tamagui` Section 11](../.agents/skills/creating-component-tamagui/SKILL.md).

## Testing

**Coverage target: 100%** on the component (per the "todo probado" rule).

### Behavioral coverage (~20 tests)

- Renders title + value with the default testIDs
- `testID` prop overrides the root; sub-testIDs derive from it
- Value accepts both string and number (parametrized)
- Icon slot mounts only when `icon` prop is passed
- Description mounts only when `description` prop is passed
- Trend row (arrow + delta) mounts only when `trend` is set
- If `trend` is set without `delta`, arrow renders alone
- Auto glyph per trend (`▲` / `▼` / `—`) — parametrized `it.each`
- `deltaIcon` override wins over the auto glyph
- Trend arrow + delta text painted from the correct slot (`trendUp` / `trendDown` / `trendNeutral`)
- Per-instance `statCardColors` override wins on each slot (parametrized)
- Provider-level override propagates via `useUIKit()`
- Dark palette resolves when `activeTheme === "dark"`
- `radius` prop maps to correct value on each of `none` / `sm` / `md` / `lg` / `pill` / number
- Explicit `borderRadius` via spread wins over `radius` prop
- `accessibilityRole` defaults to `"summary"` and is overridable
- Auto `accessibilityLabel` composes `title, value` (+ trend/delta, + description) when unset
- Consumer-provided `accessibilityLabel` wins over auto-composition
- Tamagui pass-through: padding, margin, width, borderColor flow through the spread

### Structural snapshots (~5)

- Default light — title + value only (minimal)
- Light + icon + description
- Light + trend="up" + delta + description
- Light + trend="down" + delta
- Dark palette + all slots populated

## Storybook (~7 stories)

- `Minimal` — title + value only
- `WithDelta` — trend="up" + delta="+8.2%"
- `WithIconAndDescription` — icon slot + description caption
- `FullExample` — title + value + icon + trend + delta + description
- `TrendDown` — negative trend example
- `CustomColors` — brand-tinted per-instance override
- `DarkTheme` — full example in dark mode

## Example app screen

`apps/example/app/(pages)/components/stat-card.tsx` — 5 sections:

1. **Minimal** — a single card with just title + value.
2. **Trend variants** — three cards stacked showing up / down / neutral with matching deltas.
3. **Full card** — one card demonstrating title + icon + value + trend + delta + description.
4. **Dashboard row** — three cards in a horizontal row (2-column grid pattern most consumers will hit).
5. **Per-instance brand palette** — one card with custom `statCardColors` override.

Plus route registration + row on the components home.

## Non-goals

- **No multi-value cards** — one metric per card. Multi-metric layouts compose several StatCards.
- **No sparkline / chart embed** in v1. If demand emerges, add `chart?: ReactNode` as a slot below the delta row.
- **No press interaction** built in. If the card should navigate, consumers wrap it in a `<Pressable>` — adding onPress would blur the primitive.
- **No `size` variants** (`sm` / `md` / `lg`). Card sizing follows the parent container width; typography is fixed. If demand emerges, revisit.
- **No formatting** of the `value` prop — consumers pass a pre-formatted string. Locale-aware number formatting belongs to the caller, not the display primitive.
- **No compound API** (`StatCard.Trend`, `StatCard.Icon`) — the flat prop shape is already the minimum surface.

## How to ship

Executed on branch `feat/duna-migration-batch-1`:

1. Token schema wiring (types + defaults + flatten + provider + barrels).
2. Component files: `stat-card-types.ts` → `stat-card.styled.ts` → `stat-card.tsx` → `stat-card.spec.tsx` (+ snapshots) → `stat-card.stories.tsx` → `README.md` → `index.ts`.
3. Barrels: `components/index.ts` + `src/index.ts`.
4. Example: screen + route + components-home row.
5. Flip status here (`planned` → `shipped on <YYYY-MM-DD>`).
6. Flip Batch 1 plan doc: ⏳ → ✅ on StatCard's row.
7. Verify green + **100% coverage on `stat-card.tsx`** via `pnpm --filter ui-kraken test:coverage`.
8. Atomic commit with rich body.

## How to extend

- **Add `chart?: ReactNode`** — a slot below the delta row for a sparkline / mini bar chart. Consumer brings any chart component.
- **Add `onPress?: () => void`** — wrap the internal YStack in a `Pressable`; would blur the primitive but common for dashboard drill-down UX.
- **Add `size` variants** — if the fixed typography scale proves too rigid.
- **Add value formatting hook** — `formatValue?: (raw: string | number) => string` that runs inside the component (locale, currency, thousands). Keep the escape hatch to pre-format at the call site.
