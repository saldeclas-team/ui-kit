# Badge — design record

**Status:** planned for ui-kraken v0.10.0 (Batch 3 alongside Card + Divider + Spinner + Avatar). Small pill primitive for notification counts, status labels, and inline indicators — the counterpart to `Alert` (banner) and `Hint` (inline paragraph) at the smallest visual weight.

Living design doc for the `Badge` primitive. Kept post-shipping so future contributors can understand the decisions behind the shape of the API, not just what it does today.

---

## Overview

Compact pill for surfacing one of three things: a **short text label** (`"Active"`, `"Beta"`, `"New"`), a **numeric count** (`5`, `99+`, `"Unread messages"` slot), or a **dot indicator** (status marker over an Avatar). One prop for each mode; they coexist so consumers can start with a count and later switch to a text label without changing the tone / color plumbing.

**Locked decisions:**

- **Three rendering modes — text, count, dot.** Text is the default: children render inside the pill. Count is a numeric prop: `count={5}` renders `5`, `count={120}` with `maxCount={99}` renders `99+`. Dot is a boolean: `dot` renders a small filled circle with no text (the status-indicator use case). Modes are exclusive — `count` wins over `children`; `dot` wins over both.
- **Five tones — `neutral` (default) / `primary` / `success` / `warning` / `danger`.** Same tone set as [`Alert`](./ALERT-PLAN.md) and [`Hint`](./HINT-PLAN.md) so consumers get a coherent palette across the three feedback primitives. Neutral is the default because most badges (`"Beta"`, `"New"`) don't carry a semantic signal.
- **Two size presets — `sm` (compact, fontSize 10) and `md` (default, fontSize 12).** Badges are small by nature — no `lg` preset. Consumers who need something bigger reach for `Hint` or `Alert`. Dot mode uses fixed pixel sizes (8 px for sm, 10 px for md) because a "dot" isn't a text glyph.
- **Own color block on the token schema.** Follows the [each-component-owns-color-space rule](../CLAUDE.md) — `badgeColors` with 5 tones × 2 slots (background + text). Provider-level + per-instance overrides.
- **Compound shortcuts — `Badge.Primary`, `Badge.Success`, `Badge.Warning`, `Badge.Danger`.** No `Badge.Neutral` — that's the base `<Badge>` default. Same shape as `Hint` compound.
- **Extends `YStack`.** Every Tamagui `YStackProps` flows through the `...rest` spread. `backgroundColor` is intentionally omitted — the palette owns it.

## API

### Props

```ts
export type BadgeTone = "neutral" | "primary" | "success" | "warning" | "danger";
export type BadgeSize = "sm" | "md";

export type BadgeColorsInput = Partial<BadgeToneColors>;

export interface BadgeProps extends Omit<YStackProps, "backgroundColor" | "children"> {
  /** Semantic tone. Default: `"neutral"`. */
  tone?: BadgeTone;
  /** Size preset. Default: `"md"`. */
  size?: BadgeSize;
  /**
   * Numeric count. When set, renders the formatted number
   * (clamped at `maxCount`) as the badge content — wins over
   * `children`.
   */
  count?: number;
  /**
   * Clamp threshold for the count display. When `count > maxCount`,
   * renders `"{maxCount}+"`. Default: `99`.
   */
  maxCount?: number;
  /**
   * Dot mode. When true, renders a small filled circle with no
   * text — wins over both `count` and `children`. Sizes: 8 px (sm)
   * / 10 px (md).
   */
  dot?: boolean;
  /** Text content. Ignored when `count` or `dot` is set. */
  children?: ReactNode;
  /**
   * Per-instance color override. Applies to the tone the consumer
   * picked — no cross-tone leakage. Same shape as `Hint`.
   */
  badgeColors?: BadgeColorsInput;
  /** Root testID. Default: `"badge"`. */
  testID?: string;
}
```

### Mode precedence

| Props                             | Renders                                  |
| --------------------------------- | ---------------------------------------- |
| `dot`                             | Filled circle at dot size                |
| `count` (any number, including 0) | Formatted number (`99+` when > maxCount) |
| `children`                        | Children inside the pill                 |
| None of the above                 | Empty pill                               |

### Sub-element testIDs

- Root: `"badge"` (overridable via `testID`).
- Text (when rendering text/count): `"{root}-text"`.

### A11y

- `accessibilityRole="text"` by default — a badge is inline advisory content, not interactive.
- `accessibilityLabel` defaults to the rendered text when `count` or `children` is a string. For dot mode, defaults to `"Indicator"` — consumers override with domain-specific copy (`"3 unread"`, `"Online"`, etc.).

## Token schema

`badgeColors` — 5 tones × 2 slots (nested, same shape as `HintToneColors`):

```ts
export interface BadgeToneColors {
  background: string;
  text: string;
}

export interface BadgeColors {
  neutral: BadgeToneColors;
  primary: BadgeToneColors;
  success: BadgeToneColors;
  warning: BadgeToneColors;
  danger: BadgeToneColors;
}
```

### Default light palette (per tone)

| Tone      | `background` | `text`    |
| --------- | ------------ | --------- |
| `neutral` | `#F3F4F6`    | `#374151` |
| `primary` | `#DBEAFE`    | `#1E3A8A` |
| `success` | `#DCFCE7`    | `#166534` |
| `warning` | `#FEF3C7`    | `#92400E` |
| `danger`  | `#FEE2E2`    | `#991B1B` |

### Default dark palette (per tone)

Each tone uses a darker bg + lighter text to preserve contrast against dark surfaces (same tint pattern as Hint's soft emphasis).

### Merge helpers

- `mergeBadgeColors(base, override?)` — full-palette merge (used at provider level).
- `mergeBadgeToneColors(base, override?)` — single-tone merge (used at per-instance level for the picked tone).

Both follow the same shape as every other merge helper — early-return when `override` is null.

## File structure

```
packages/ui-kraken/src/components/badge/
  ├─ badge-types.ts             # BadgeProps + BadgeTone + BadgeSize + BadgeColorsInput
  ├─ badge-styled.ts            # StyledBadge + StyledBadgeText + StyledBadgeDot
  ├─ badge.tsx                  # Component + formatCount helper + compound subcomponents
  ├─ badge.spec.tsx             # 100% coverage
  ├─ badge.stories.tsx          # Storybook stories
  ├─ README.md                  # Consumer-facing docs
  ├─ __snapshots__/             # Auto-generated
  └─ index.ts                   # Barrel

packages/ui-kraken/src/tokens/defaults/badge.ts   # Palettes + mergeBadgeColors + mergeBadgeToneColors + spec
```

## Testing

### Behavioral coverage (~20 tests)

- Renders with default root testID (`"badge"`).
- Custom `testID` overrides + propagates to text sub-slot.
- Default `tone="neutral"` → uses neutral palette.
- Each tone resolves its slot (5 tones × background + text = 10 assertions via `it.each`).
- Default `size="md"` → resolves to md dimensions.
- Compound: `Badge.Primary` sets `tone="primary"`; same for Success / Warning / Danger.
- Text mode: children render inside `-text` slot.
- Count mode: numeric count formats as string; text sub-slot renders it.
- Count mode: `count > maxCount` → renders `"{maxCount}+"`.
- Count mode: `count === 0` renders `"0"` (badge shows even with zero — consumers can hide externally).
- Count mode wins over children.
- Dot mode: renders no text, just the dot; dot uses 8px (sm) / 10px (md).
- Dot mode wins over count + children.
- Per-instance `badgeColors={{ background, text }}` overrides for the picked tone.
- Provider-level `badgeColors` propagates for a tone.
- Dark theme resolves the dark tone palette.
- A11y: default role, dot mode's `"Indicator"` fallback label, consumer override.
- `formatCount` pure helper covers every branch.

### Structural snapshots (~5)

- Text `"Beta"`, md, neutral.
- Count `5`, md, primary.
- Count `120` with `maxCount=99` → `"99+"`, sm, danger.
- Dot mode, md, success.
- Dark theme × sm × warning.

### Defaults spec (`defaults/badge.spec.ts`)

Same shape as other defaults specs — 4+ tests covering both merge branches (full + tone-only) + light-vs-dark palette sanity across all 5 tones.

## Storybook (~8 stories)

- `Text` — default `Badge` with children.
- `Tones` — all 5 side-by-side.
- `Sizes` — sm / md pair.
- `Count` — 0, 5, 42, 120 (overflow to "99+").
- `Dot` — sm / md dot side-by-side.
- `DotOverAvatar` — composition: dot positioned over an `<Avatar>` (status indicator).
- `CustomColors` — brand-tinted per-instance override.
- `DarkTheme` — all tones under `<Theme name="dark">`.

## Example app screen

`apps/example/app/(pages)/components/badge.tsx` — 5 sections:

1. Tones showcase — all 5 side-by-side, both sm and md.
2. Count formatting — 0, 5, 42, 120 (overflow), custom maxCount.
3. Dot mode — sm / md standalone, plus dot-over-Avatar composition.
4. Inline in a Card — badges next to labels (`"Status" [Active]`, `"Notifications" [5]`).
5. Custom color — brand-tinted per-instance override.

## Non-goals

- **No `outline` / `ghost` emphasis variants.** Badge is small — one visual style (soft tinted background) keeps the tone signal readable. Consumers who want an outlined pill compose it themselves with a `<XStack borderWidth={1}>` at the callsite.
- **No `pill` vs `square` shape prop.** Badges are always rounded pills (`borderRadius = height / 2`). Corner variants are Card's job, not Badge's.
- **No `icon` slot.** A badge with an icon reads as a chip, not a status indicator; that's a distinct primitive. Consumers who want an icon compose `<XStack gap={4}><Icon /><Badge /></XStack>`.
- **No auto-hide when `count === 0`.** Consumers who want to hide zero-counts do `count > 0 ? <Badge count={count} /> : null` at the callsite. Auto-hide inside the component hides the semantic ("zero unread" is a valid state to display).
- **No `pulse` / `blink` animation prop.** Ships when we add a `Motion` primitive.
