# Skeleton — design record

**Status:** shipped on 2026-07-25 in ui-kraken v0.8.0 as part of [`COMPONENTS-BATCH-1-PLAN.md`](./COMPONENTS-BATCH-1-PLAN.md) Phase A.

Living design doc for the `Skeleton` primitive. Kept post-shipping so future contributors can understand the decisions behind the shape of the API, not just what it does today.

---

## Overview

Animated placeholder for loading states. Consumers stamp Skeletons in the shape of the content that will replace them — a rounded rectangle where a `Text.H4` will render, a circle where an avatar will render, a stack of narrow rectangles where a paragraph will render. The pulse animation gives the user a visual signal that something is coming, without committing to a specific content shape.

Common uses: profile cards during initial fetch, feed items before the API resolves, form pre-fill placeholders, image slots while assets download.

**Locked decisions:**

- **Naming**: `Skeleton` — the term is industry-standard (React Native Paper, MUI, Chakra all use it). No ambiguity.
- **Single primitive, no compound API** — `Skeleton` is one leaf element. Consumers compose stacks / groups themselves; no `Skeleton.Text` / `Skeleton.Avatar` / `Skeleton.Card` sub-components. The composition ergonomics are already good with plain layout, and presets would just be sugar over the same primitive.
- **Pulse animation only in v1** — animated via RN's `Animated.Value` opacity loop (no gradient shimmer, no external deps). Shimmer requires `LinearGradient` (or Reanimated 3 + Skia) and doubles the API surface. If demand emerges, add `variant="shimmer"` in a future minor.
- **Reduced-motion opt-out**: `variant="static"` disables the animation and paints a solid `base` fill. Consumers wire `AccessibilityInfo.isReduceMotionEnabled()` themselves — the primitive stays declarative.
- **Own color block on the token schema**: `skeletonColors` with 2 slots — `base` (the fill at rest) and `highlight` (the pulse peak). Both are typically alpha-tinted grays that read as "loading" against any surface.
- **Per-instance color override**: `skeletonColors?: Partial<SkeletonColors>` prop for one-off palettes (e.g. a promoted feed with brand-tinted skeletons).
- **Shape via layout props**: `width` + `height` (numbers, percentage strings, or `"100%"`) drive the rectangle; `borderRadius` picks up any Tamagui `$` token or numeric value. Circles are `width === height` + `borderRadius: 9999`. No `variant="circle" | "text"` — the same primitive covers everything.
- **`radius` prop** (matches Button / Input / CurrencyInput pattern): `"none" | "sm" | "md" | "lg" | "pill"` — sugar over `borderRadius` that pulls the resolved radius scale from the theme. Explicit `borderRadius` still overrides.
- **Extends `View`** (not `YStack`) — Skeleton is a leaf, not a container. Children pass through as a courtesy but are typically empty. Every RN `ViewProps` (accessibility, style, layout) flows through the spread.
- **Accessibility**: default `accessibilityRole="progressbar"` + `accessibilityLabel="Loading"`, both overridable via pass-through. Consumers replacing content should switch off the Skeleton before the real content mounts so screen readers don't announce "loading" indefinitely.

## API

### Props

`SkeletonProps` re-declares only props that are OURS. Every RN `ViewProps` flows through the `...rest` spread.

```ts
export type SkeletonRadius = "none" | "sm" | "md" | "lg" | "pill";

export type SkeletonVariant = "pulse" | "static";

export type SkeletonColorsInput = Partial<SkeletonColors>;

export interface SkeletonProps extends Omit<ViewProps, "children"> {
  /**
   * Animation mode. `"pulse"` fades between `base` and `highlight` on
   * a loop; `"static"` paints a solid `base` fill (use when the user
   * has reduced-motion enabled).
   *
   * Default: `"pulse"`.
   */
  variant?: SkeletonVariant;
  /**
   * Border-radius shorthand. Numbers / Tamagui `$` tokens flow through
   * `borderRadius` on the spread and win over this prop.
   *
   * - `"none"` → `0`
   * - `"sm"`   → `radius.sm`
   * - `"md"`   → `radius.md` (default)
   * - `"lg"`   → `radius.lg`
   * - `"pill"` → `9999`
   */
  radius?: SkeletonRadius;
  /**
   * Per-instance color override. Missing slots fall through to the
   * provider-resolved palette.
   */
  skeletonColors?: SkeletonColorsInput;
  /** Root testID. Default: `"skeleton"`. */
  testID?: string;
}
```

### Sizing

Consumer sets `width` and `height` directly via RN `style` (numeric px or percentage string). No `size` prop — width / height cover the two orthogonal dimensions with zero ambiguity.

```tsx
<Skeleton style={{ width: 240, height: 16 }} />
<Skeleton style={{ width: "100%", height: 120 }} radius="lg" />
<Skeleton style={{ width: 48, height: 48 }} radius="pill" /> {/* avatar circle */}
```

### Per-instance override

```tsx
<Skeleton
  style={{ width: 240, height: 16 }}
  skeletonColors={{ base: "#DBEAFE", highlight: "#EFF6FF" }}
/>
```

Every field on `SkeletonColorsInput` is optional. Provider-level and per-instance overrides use the same shape.

### A11y

```ts
accessibilityRole = "progressbar";
accessibilityLabel = "Loading";
```

Both apply as defaults and are overridable via the `...rest` spread. Once the real content is ready, consumers should swap the Skeleton out — leaving it mounted announces "loading" indefinitely.

### Sub-element testIDs

`Skeleton` renders a single element — only the root `testID` is exposed. Default `"skeleton"`. No sub-element derivations because there are no sub-elements.

## Token schema

Skeleton introduces its own **`skeletonColors`** block on `Tokens`. Zero reuse of other component palettes.

```tsx
<UIKitProvider
  tokens={{
    skeletonColors: {
      base: "#E5E7EB",
      highlight: "#F3F4F6",
    },
  }}
  dark={{
    skeletonColors: {
      base: "#1F2937",
      highlight: "#374151",
    },
  }}
>
  <App />
</UIKitProvider>
```

### `SkeletonColors` interface

Slot-based (2 slots — no variants).

```ts
export interface SkeletonColors {
  /** Fill at rest. Also the resting color in `variant="static"`. */
  base: string;
  /** Peak of the pulse animation. */
  highlight: string;
}
```

### Default light palette

Neutral grays that read as "loading" against a white base surface.

```ts
export const DEFAULT_LIGHT_SKELETON_COLORS: SkeletonColors = {
  base: "#E5E7EB", // gray-200
  highlight: "#F3F4F6", // gray-100 (slightly lighter for the pulse peak)
};
```

### Default dark palette

Same rhythm inverted — a mid-gray base with a slightly lighter highlight so the pulse remains visible on dark backgrounds.

```ts
export const DEFAULT_DARK_SKELETON_COLORS: SkeletonColors = {
  base: "#1F2937", // gray-800
  highlight: "#374151", // gray-700
};
```

### Flatten to Tamagui tokens

`flattenSkeletonColors()` produces the flat `$uiSkeleton{PascalCase}` token map wired into `buildConfig()`:

```
uiSkeletonBase
uiSkeletonHighlight
```

### Merge helper

```ts
export function mergeSkeletonColors(
  base: SkeletonColors,
  override?: Partial<SkeletonColors>
): SkeletonColors;
```

Same signature as `mergeSurfaceColors` / `mergeRefreshControlColors`.

## Animation

The pulse loop uses RN's `Animated.Value` opacity:

- Two `View` layers stacked absolutely — `base` fill on the bottom, `highlight` fill on top with animated opacity.
- Opacity animates `0 → 1 → 0` on a 1200ms loop (600ms ease-in, 600ms ease-out).
- `Animated.loop(Animated.sequence([...]))` — canceled in the cleanup of the `useEffect` so unmounting stops the loop cleanly.
- `variant="static"` skips the effect entirely; the highlight layer is not mounted.

No Reanimated dependency. `Animated` ships with RN and works under jest-expo without extra config.

## File structure

```
packages/ui-kraken/src/components/skeleton/
├── skeleton.tsx           # component logic + resolvePalette + resolveRadius helpers
├── skeleton-types.ts      # SkeletonRadius, SkeletonVariant, SkeletonColorsInput, SkeletonProps
├── skeleton.spec.tsx      # unit tests + describe("snapshots") block
├── skeleton.stories.tsx   # Storybook (~7 stories)
├── README.md              # props table + usage + Platform support
└── index.ts               # explicit named exports
```

No `skeleton.styled.ts` because Skeleton is a leaf View, not a Tamagui-styled container — the animated opacity logic lives in the component file and does not benefit from Tamagui's style props at the leaf level.

Token / provider wiring per [`creating-component-tamagui` Section 11](../.agents/skills/creating-component-tamagui/SKILL.md).

## Testing

**Coverage target: 100%** on the component (per the "todo probado" rule).

### Behavioral coverage (~12 tests)

- Renders the default `testID="skeleton"` and can be overridden
- Default `variant="pulse"` mounts both fill layers (base + highlight)
- `variant="static"` mounts only the base layer (no highlight)
- Base layer uses `skeletonColors.base` from the resolved palette
- Highlight layer uses `skeletonColors.highlight` from the resolved palette
- Per-instance `skeletonColors` override wins on each slot (parametrized)
- Provider-level palette propagates through `useUIKit()`
- Dark palette resolves when `activeTheme === "dark"`
- `radius` prop maps to the correct numeric value on each of the 5 values (parametrized `it.each`)
- Explicit `style={{ borderRadius: ... }}` wins over `radius` prop
- `style={{ width, height }}` flows through the spread
- Accessibility defaults (`role="progressbar"` + `label="Loading"`) apply and are overridable

### Structural snapshots (~4)

- Default pulse × light palette × md radius
- Static variant × light palette
- Pill radius × avatar dimensions (48×48)
- Dark palette × pulse

## Storybook (~7 stories)

- `Default` — plain pulse skeleton 240×16 md radius
- `Text` — three stacked skeletons of decreasing widths (paragraph placeholder)
- `Avatar` — 48×48 pill skeleton (circle)
- `Card` — an avatar + two text lines + a big rectangle (feed card placeholder)
- `Static` — `variant="static"` for reduced-motion demo
- `CustomColors` — brand-tinted per-instance override
- `DarkTheme` — the Card composition in dark mode

## Example app screen

`apps/example/app/(pages)/components/skeleton.tsx` — 5 sections:

1. **Basic rectangle** — one 240×16 md-radius skeleton.
2. **Radius scale** — 5 skeletons showing `none` / `sm` / `md` / `lg` / `pill`.
3. **Avatar (circle)** — 48×48 pill skeleton next to a "loading name…" label.
4. **Card composition** — a feed-item placeholder: avatar + two text lines + a big rectangle.
5. **Pulse vs static** — two skeletons side by side; `static` for reduced-motion.
6. **Per-instance colors** — brand-tinted skeleton via `skeletonColors={{ base: "#DBEAFE", highlight: "#EFF6FF" }}`.

Plus route registration + row on the components home.

## Non-goals

- **No shimmer** in v1. Shimmer needs `LinearGradient` (extra dep) or Reanimated 3 + Skia. Pulse is 90% of the value at 10% of the API surface.
- **No compound API** (`Skeleton.Text`, `Skeleton.Avatar`, `Skeleton.Card`) — the primitive composes trivially with plain layout, and presets rot as designs evolve.
- **No `count` prop** for repeating skeletons — `Array.from({ length: n }).map((_, i) => <Skeleton key={i} />)` is fine.
- **No `duration` prop** in v1 — 1200ms is tuned to feel "alive" without being distracting. If demand emerges, add `pulseDurationMs?: number` in a future minor.
- **No auto-`hidden`** — Skeleton stays mounted until the consumer swaps it. The primitive has no idea what "loaded" means.

## How to ship

Executed on branch `feat/duna-migration-batch-1`:

1. Token schema wiring (types + defaults + flatten + provider + barrels).
2. Component files: `skeleton-types.ts` → `skeleton.tsx` → `skeleton.spec.tsx` (+ snapshots) → `skeleton.stories.tsx` → `README.md` → `index.ts`.
3. Barrels: `components/index.ts` + `src/index.ts`.
4. Example: screen + route + components-home row.
5. Flip status here (`planned` → `shipped on <YYYY-MM-DD>`).
6. Flip Batch 1 plan doc: ⏳ → ✅ on Skeleton's row.
7. Verify green + **100% coverage on `skeleton.tsx`** via `pnpm --filter ui-kraken test:coverage`.
8. Atomic commit with rich body.

## How to extend

- **Add shimmer** — `variant="shimmer"` that renders an `Animated.View` translating a `LinearGradient` across the fill. Requires `expo-linear-gradient` (peer). Keep pulse as the default.
- **Add reduced-motion auto-detect** — read `AccessibilityInfo.isReduceMotionEnabled()` in a `useEffect` and swap `variant` to `"static"` automatically. Would introduce a subscription; probably better as an opt-in prop `respectReducedMotion?: boolean`.
- **Add compound presets** — if the same "avatar + 2 lines" shape appears often in downstream apps, ship `Skeleton.Card` / `Skeleton.Avatar` / `Skeleton.Text` as thin wrappers.
- **Tune the pulse curve** — swap `Animated.timing` for `Animated.spring` if the current linear ease feels stiff; or expose `pulseDurationMs?: number` for consumers who want a slower / faster cadence.
