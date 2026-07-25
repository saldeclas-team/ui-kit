# Surface — design record

**Status:** planned for ui-kraken v0.8.0 as part of [`COMPONENTS-BATCH-1-PLAN.md`](./COMPONENTS-BATCH-1-PLAN.md) Phase A.

Living design doc for the `Surface` primitive. Kept post-shipping so future contributors can understand the decisions behind the shape of the API, not just what it does today.

---

## Overview

Theme-bound background container. Common uses: root screen wrappers, cards, modal / sheet backgrounds, inset form sections. The `Surface` primitive replaces bare `<View style={{ backgroundColor: '#fff' }}>` scaffolding — one prop (`level`) picks the correct background from the active theme, and everything else (padding, radius, flex, gap) flows through as a Tamagui `YStack`.

**Locked decisions:**

- **Naming**: `Surface` — Material Design term for a theme-bound background surface. Reads unambiguously for RN developers ("Container" is too generic, "Box" collides with Chakra / MUI Box which is a layout primitive, "ThemedView" is descriptive but casual).
- **Slot-based level model**: `level` prop with 4 semantic values — `"base"`, `"raised"`, `"overlay"`, `"sunken"`. Each maps to a background color slot. This is inspired by Material 3's SurfaceContainer scale but simpler (4 levels instead of 5, no auto-tinting math, no shadows).
- **No shadows in v1**. `Button` already ships `elevation` shadows. `Surface` stays quiet — its "elevation" is expressed purely through background color, following the Material 3 "tint over shadow" direction. If a consumer needs a real shadow they wrap the Surface in a shadow container or use `Button` chrome.
- **No semantic-color surfaces** (`primary` / `success` / `warning` / etc.). Those live on `Alert` / `Button`. `Surface` is a neutral container primitive.
- **No default `flex`, no default padding**. Consumer sets `flex={1}` / `padding={...}` via Tamagui pass-through when needed. Ships as a naked wrapper so `<Surface>` inside a row does not accidentally grow.
- **Extends `YStack`**: every Tamagui style prop flows through — `padding`, `paddingHorizontal`, `margin`, `gap`, `flex`, `borderRadius`, `borderWidth`, `borderColor`, `pressStyle`, shorthand aliases (`px`, `py`, `mx`, `br`, `bg`), etc.
- **Own color block on the token schema**: `surfaceColors` with 4 slots (one per level). Provider-level + per-instance overrides.
- **Per-instance color override**: `surfaceColors?: Partial<SurfaceColors>` prop for one-off paints.
- **Accessibility**: `Surface` has no interactive semantics by default. `accessibilityRole` / `accessibilityLabel` / etc. flow through from `YStack` pass-through so consumers can opt in when the surface is actually a landmark region.

## API

### Props

`SurfaceProps` re-declares only props that are OURS. Every Tamagui `YStackProps` flows through the `...rest` spread.

```ts
export type SurfaceLevel = "base" | "raised" | "overlay" | "sunken";

export type SurfaceColorsInput = Partial<SurfaceColors>;

export interface SurfaceProps extends Omit<YStackProps, "backgroundColor"> {
  /**
   * Semantic elevation level. Drives which slot on `surfaceColors` is
   * used for the background color.
   *
   * - `"base"`     — standard app background (default).
   * - `"raised"`   — cards, list items on top of the base surface.
   * - `"overlay"`  — modals, sheets, dropdowns (highest visual layer).
   * - `"sunken"`   — inset areas (form sections, code blocks, muted panels).
   */
  level?: SurfaceLevel;
  /**
   * Per-instance color override. Missing slots fall through to the
   * provider-resolved palette.
   */
  surfaceColors?: SurfaceColorsInput;
  /** Root testID. Default: `"surface"`. */
  testID?: string;
}
```

### Level × slot mapping

Every level maps to one slot in `surfaceColors`:

| Level     | Slot on `surfaceColors` | Typical use                                  |
| --------- | ----------------------- | -------------------------------------------- |
| `base`    | `surfaceColors.base`    | Root screen background                       |
| `raised`  | `surfaceColors.raised`  | Cards, list items on top of the base surface |
| `overlay` | `surfaceColors.overlay` | Modals, sheets, dropdowns                    |
| `sunken`  | `surfaceColors.sunken`  | Form sections, inset panels, muted regions   |

### Per-instance override

```tsx
<Surface level="raised" surfaceColors={{ raised: "#FFF7ED" }}>
  <Text>Custom-tinted card.</Text>
</Surface>
```

Every field on `SurfaceColorsInput` is optional. Only the slot for the resolved `level` is actually read at render time, but the type accepts the full palette so provider-level and per-instance overrides use the same shape.

### A11y

No default accessibility semantics. Consumer opts in when a Surface is used as a landmark:

```tsx
<Surface level="raised" accessibilityRole="summary" accessibilityLabel="Weekly summary">
  {/* ... */}
</Surface>
```

Because `Surface` extends `YStack`, every accessibility prop flows through the spread — `accessibilityRole`, `accessibilityLabel`, `accessibilityHint`, `accessibilityLiveRegion`, etc.

### Sub-element testIDs

`Surface` renders a single element — only the root `testID` is exposed. Default `"surface"`. No sub-element derivations because there are no sub-elements.

## Token schema

Surface introduces its own **`surfaceColors`** block on `Tokens`. Zero reuse of other component palettes.

```tsx
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
</UIKitProvider>
```

### `SurfaceColors` interface

Slot-based (no variants — each level is a single background color).

```ts
export interface SurfaceColors {
  /** Standard app background. */
  base: string;
  /** Cards, list items, elevated content on top of the base surface. */
  raised: string;
  /** Modals, sheets, dropdowns — highest visual layer. */
  overlay: string;
  /** Inset areas — form sections, code blocks, muted regions. */
  sunken: string;
}
```

### Default light palette

Tuned for a subtle vertical rhythm on white / near-white surfaces. `raised` is slightly darker than `base` so a card on the screen bg reads as elevated without a shadow. `sunken` is one step below `raised`. `overlay` matches `base` in v1 — future shadow / border cues distinguish it.

```ts
export const DEFAULT_LIGHT_SURFACE_COLORS: SurfaceColors = {
  base: "#FFFFFF",
  raised: "#F9FAFB",
  overlay: "#FFFFFF",
  sunken: "#F3F4F6",
};
```

### Default dark palette

Inverse rhythm — `raised` is slightly LIGHTER than `base` (Material 3 dark-mode surface tint convention: as elevation increases, so does luminance). `overlay` a step higher; `sunken` a step below `base`.

```ts
export const DEFAULT_DARK_SURFACE_COLORS: SurfaceColors = {
  base: "#0B0B0F",
  raised: "#111827",
  overlay: "#1F2937",
  sunken: "#030712",
};
```

### Flatten to Tamagui tokens

`flattenSurfaceColors()` produces the flat `$uiSurface{PascalCase}` token map wired into `buildConfig()`:

```
uiSurfaceBase
uiSurfaceRaised
uiSurfaceOverlay
uiSurfaceSunken
```

### Merge helper

```ts
export function mergeSurfaceColors(
  base: SurfaceColors,
  override?: Partial<SurfaceColors>
): SurfaceColors;
```

Same signature as `mergeTextColors` / `mergeInputColors`.

## File structure

```
packages/ui-kraken/src/components/surface/
├── surface.tsx           # component logic + resolvePalette helper
├── surface.styled.ts     # StyledSurface (styled YStack)
├── surface-types.ts      # SurfaceLevel, SurfaceColorsInput, SurfaceProps
├── surface.spec.tsx      # unit tests + describe("snapshots") block
├── surface.stories.tsx   # Storybook (~7 stories)
├── README.md             # props table + usage + Platform support
└── index.ts              # explicit named exports
```

Token / provider wiring per [`creating-component-tamagui` Section 11](../.agents/skills/creating-component-tamagui/SKILL.md).

## Testing

**Coverage target: 100%** on the component (per the "todo probado" rule).

### Behavioral coverage (~12 tests)

- Renders children
- Default `level="base"` → wrapper `backgroundColor` matches `surfaceColors.base`
- Each of the 4 levels resolves to the correct slot (parametrized `it.each`)
- Per-instance `surfaceColors` override applies (parametrized across slots)
- Provider-level override propagates through `useUIKit()`
- Tamagui pass-through: `padding`, `flex`, `borderRadius` flow through the spread
- Accessibility props flow through (`accessibilityRole`, `accessibilityLabel`)
- `testID` defaults to `"surface"` and can be overridden

### Structural snapshots (~6)

- Each level (base / raised / overlay / sunken) at rest
- Dark theme × raised
- Per-instance `surfaceColors` override

## Storybook (~7 stories)

- `Base` — plain base-level Surface with a `<Text>` child
- `Raised` — card-like surface with padding + radius
- `Overlay` — modal-like Surface with padding
- `Sunken` — inset area with padding
- `Nested` — a `raised` Surface containing a `sunken` Surface to show the level rhythm
- `CustomColors` — brand-tinted per-instance override
- `DarkTheme` — 4 levels stacked in dark mode

## Example app screen

`apps/example/app/(pages)/components/surface.tsx` — 4 sections:

1. **All levels** — a vertical stack showing each of `base` / `raised` / `overlay` / `sunken` with a label inside.
2. **Card composition** — a `raised` Surface with padding + borderRadius wrapping a title + body.
3. **Nested surfaces** — `raised` outer + `sunken` inner (visual rhythm demo).
4. **Per-instance override** — a Surface with a brand-tinted background via `surfaceColors={{ raised: "#FFF7ED" }}`.

Plus route registration + row on the components home.

## Non-goals

- **No shadows.** Elevation is expressed via background color only in v1. If demand emerges for real shadows, extend `SurfaceProps` with an optional `elevation?: "none" | "sm" | "md" | "lg"` in a future minor that reuses the shadow tokens Button already computes.
- **No `variant="primary" | "success" | ...`**. Semantic-color surfaces belong on `Alert` / `Button`. `Surface` is a neutral container.
- **No default `flex: 1`, no default padding**. Consumer sets those via Tamagui pass-through. Ships as a naked wrapper so `<Surface>` inside a row does not accidentally stretch or add whitespace.
- **No compound API** (`Surface.Card`, `Surface.Overlay`) — flat `level` prop is more flexible than presets.
- **No `pressable` mode** — if a Surface needs to be interactive, wrap it in a `Pressable`. Adding press semantics to `Surface` would blur the primitive.

## How to ship

Executed on branch `feat/duna-migration-batch-1`:

1. Token schema wiring (types + defaults + flatten + provider + barrels).
2. Component files: `surface-types.ts` → `surface.styled.ts` → `surface.tsx` → `surface.spec.tsx` (+ snapshots) → `surface.stories.tsx` → `README.md` → `index.ts`.
3. Barrels: `components/index.ts` + `src/index.ts`.
4. Example: screen + route + components-home row.
5. Flip status here (`planned` → `shipped on <YYYY-MM-DD>`).
6. Flip Batch 1 plan doc: ⏳ → ✅ on Surface's row.
7. Verify green + **100% coverage on `surface.tsx`** via `pnpm --filter ui-kraken test:coverage`.
8. Atomic commit with rich body.

## How to extend

- **Add real shadows** — `elevation?: "none" | "sm" | "md" | "lg"` prop that computes RN `shadow*` + Android `elevation` styles from the theme. Reuses Button's elevation lookup.
- **Add a compound API** — `Surface.Card` / `Surface.Overlay` as sugar for `<Surface level="raised" padding="$4" borderRadius="$3" />` / `<Surface level="overlay" padding="$4" />`.
- **Add a `pressable` mode** — `onPress?: () => void` that wraps in `Pressable` with `pressStyle`. Would blur the primitive; probably better as a separate `PressableSurface` component if demand emerges.
- **Auto-tint math** — instead of 4 discrete slots, derive `raised` / `overlay` / `sunken` from a single `base` color + a delta (Material 3 style). Would remove 3 defaults but add color math.
