# Collapsible — design record

**Status:** shipped on 2026-07-26 in ui-kraken v0.8.0 as part of [`COMPONENTS-BATCH-1-PLAN.md`](./COMPONENTS-BATCH-1-PLAN.md) Phase C.

Living design doc for the `Collapsible` primitive. Kept post-shipping so future contributors can understand the decisions behind the shape of the API, not just what it does today.

---

## Overview

Animated expand-collapse section. A header row toggles visibility of a body region below it — the header stays pressable, the body slides open on tap. Common uses: FAQ accordions, settings pages ("Advanced options"), long detail views broken into sections, filter panels on list screens.

**Locked decisions:**

- **Naming**: `Collapsible` — reads unambiguously ("this section can collapse"). `Accordion` was considered but implies multi-section coordination (only one open at a time); Collapsible is a single self-contained unit. Consumers stack multiple Collapsibles to build an accordion.
- **Controlled only**: consumer holds `expanded: boolean` in state, updates via `onExpandedChange`. Mirrors RadioGroup / MultiSelect. No `defaultExpanded` in v1 — accordion coordination (only-one-open) is easier when the container owns state.
- **Header layout**: horizontal row with optional leading `icon`, `title` text, and a trailing `chevron` that rotates 90° when expanded. Icon + chevron are `ReactNode` slots (consumer brings any element).
- **Auto chevron glyph, overridable**: the trailing chevron defaults to `"▸"` (right-pointing triangle) so consumers never have to import an icon library just for a disclosure arrow. Overridable per-instance via `chevron?: ReactNode` when the design system ships a specific icon.
- **`title` is required** — the header always displays a text label. No auto-generated fallback.
- **Height animation via plain RN `Animated`**: the body wraps in an `Animated.View` whose `height` interpolates between `0` and the measured content height. Plain RN `Animated` (not `react-native-reanimated`) mirrors Skeleton's animation approach — zero babel-plugin setup for jest-expo, no extra runtime deps. Reanimated is available as a peer for consumer apps but Collapsible does not require it.
- **`animation` prop for opt-out**: `"height"` (default) animates the smooth height slide; `"none"` skips the animation entirely (body just mounts/unmounts). Consumers on reduced-motion or in performance-sensitive contexts pass `"none"`.
- **Configurable `duration`**: default `200ms`. Chevron rotation uses `min(duration, 150ms)` so it always finishes slightly before the height animation.
- **Own color block on the token schema**: `collapsibleColors` with 6 slots (`headerBackground`, `title`, `icon`, `chevron`, `bodyBackground`, `border`). Provider-level + per-instance overrides.
- **`radius` prop** matching Button / Alert. Default `"md"`.
- **Extends `YStack`** — Collapsible is a vertical stack (header row + body region). Every Tamagui `YStackProps` flows through the spread.
- **Accessibility**: header sets `accessibilityRole="button"` + `accessibilityState={{ expanded, disabled }}` + `accessibilityLabel={title}`. The rotating chevron is decorative — the state affordance is announced via `accessibilityState.expanded`.

## API

### Props

```ts
export type CollapsibleAnimation = "height" | "none";

export type CollapsibleRadius = number | "none" | "sm" | "md" | "lg" | "pill";

export type CollapsibleColorsInput = Partial<CollapsibleColors>;

export interface CollapsibleProps extends Omit<GetProps<typeof StyledCollapsible>, "children"> {
  /** Header text label. Required. */
  title: string;
  /** Whether the body is visible. Controlled. */
  expanded: boolean;
  /** Fires when the user taps the header. */
  onExpandedChange: (expanded: boolean) => void;
  /** Body content — any ReactNode. */
  children?: ReactNode;
  /** Optional leading icon in the header. */
  icon?: ReactNode;
  /**
   * Override for the default trailing chevron glyph (`▸`). Consumer
   * brings any ReactNode. The rotation transform still applies to
   * the wrapper — the icon rotates 90° on expand.
   */
  chevron?: ReactNode;
  /** Disable the header press (renders at 50% opacity, ignores taps). */
  disabled?: boolean;
  /** Animation mode. `"height"` (default) slides; `"none"` mounts/unmounts. */
  animation?: CollapsibleAnimation;
  /** Animation duration in ms. Default `200`. */
  duration?: number;
  /** Border radius. Defaults to `"md"`. */
  radius?: CollapsibleRadius;
  /**
   * Per-instance color override. Missing slots fall through to the
   * provider-resolved palette.
   */
  collapsibleColors?: CollapsibleColorsInput;
  /**
   * Root testID. Sub-elements derive:
   * `{root}-header`, `{root}-icon`, `{root}-title`, `{root}-chevron`,
   * `{root}-body`, `{root}-body-content`.
   */
  testID?: string;
}
```

### Toggle behavior

- Tapping the header fires `onExpandedChange(!expanded)`.
- When `disabled`, taps are ignored (no `onExpandedChange` fires).
- The primitive never touches the incoming `expanded` prop — consumer holds state.

### Animation lifecycle

1. **First render**: body mounts at natural height so `onLayout` measures it.
2. **Measurement**: `onLayout` fires and stores the content height in local state.
3. **Height clamp activates**: the `Animated.View` wrapper switches from `height: undefined` (natural) to `height: heightAnim` (clamped).
4. **Every subsequent `expanded` change**: `Animated.timing` animates `heightAnim` between `0` and the measured content height.
5. **Chevron**: rotates via a separate `Animated.Value` that interpolates to `"0deg" | "90deg"`.

Consumers that want zero mount-flash can start with `expanded={true}` (body renders at its natural height immediately, no animation needed).

### Per-instance override

```tsx
<Collapsible
  title="Advanced options"
  expanded={open}
  onExpandedChange={setOpen}
  collapsibleColors={{ headerBackground: "#F5F3FF", chevron: "#7C3AED" }}
>
  {/* body */}
</Collapsible>
```

### Sub-element testIDs

- root: `"collapsible"` (overridable via `testID`)
- header (pressable): `"{root}-header"`
- icon (when `icon` passed): `"{root}-icon"`
- title: `"{root}-title"`
- chevron (always renders — either custom or auto glyph): `"{root}-chevron"`
- body wrapper: `"{root}-body"`
- body content (measured): `"{root}-body-content"`

### A11y

Defaults:

- Header: `accessibilityRole="button"`, `accessibilityLabel={title}`, `accessibilityState={{ expanded, disabled }}`.
- Chevron: decorative — screen readers rely on `accessibilityState.expanded` on the header for the state announcement.

All overridable via `...rest` (which passes to the root — not the header pressable). For header-level overrides, wrap Collapsible in your own accessibility container.

## Token schema

Collapsible introduces its own **`collapsibleColors`** block on `Tokens`. Zero reuse of Surface / Alert palettes — the header + body chrome evolves independently.

```tsx
<UIKitProvider
  tokens={{
    collapsibleColors: {
      headerBackground: "#F9FAFB",
      title: "#0B0B0F",
    },
  }}
  dark={{
    collapsibleColors: {
      headerBackground: "#111827",
      title: "#F5F5F7",
    },
  }}
>
  <App />
</UIKitProvider>
```

### `CollapsibleColors` interface

Slot-based, 6 slots.

```ts
export interface CollapsibleColors {
  /** Header row background. */
  headerBackground: string;
  /** Header title text color. */
  title: string;
  /** Leading icon color (when `icon` passed). */
  icon: string;
  /** Trailing chevron color. */
  chevron: string;
  /** Body region background. */
  bodyBackground: string;
  /** Outer border (1 px around the whole card). */
  border: string;
}
```

### Default light palette

Header is a light gray card (matches `Surface.raised`); body is white so the sections read as distinct panels stacked in a form. Border draws a subtle outline to separate stacked Collapsibles.

```ts
export const DEFAULT_LIGHT_COLLAPSIBLE_COLORS: CollapsibleColors = {
  headerBackground: "#F9FAFB",
  title: "#0B0B0F",
  icon: "#6B7280",
  chevron: "#6B7280",
  bodyBackground: "#FFFFFF",
  border: "#E5E7EB",
};
```

### Default dark palette

Inverted rhythm — header uses `Surface.raised` dark (`#111827`), body uses `Surface.base` (near-black) so expanded content reads as sitting "below" the header.

```ts
export const DEFAULT_DARK_COLLAPSIBLE_COLORS: CollapsibleColors = {
  headerBackground: "#111827",
  title: "#F5F5F7",
  icon: "#9CA3AF",
  chevron: "#9CA3AF",
  bodyBackground: "#0B0B0F",
  border: "#1F2937",
};
```

### Flatten to Tamagui tokens

`flattenCollapsibleColors()` produces the flat `$uiCollapsible{PascalCase}` token map:

```
uiCollapsibleHeaderBackground
uiCollapsibleTitle
uiCollapsibleIcon
uiCollapsibleChevron
uiCollapsibleBodyBackground
uiCollapsibleBorder
```

### Merge helper

```ts
export function mergeCollapsibleColors(
  base: CollapsibleColors,
  override?: Partial<CollapsibleColors>
): CollapsibleColors;
```

Same signature as `mergeSurfaceColors` / `mergeSkeletonColors`.

## File structure

```
packages/ui-kraken/src/components/collapsible/
├── collapsible.tsx           # component logic + resolvePalette + resolveRadius + animation
├── collapsible.styled.ts     # StyledCollapsible (YStack), StyledCollapsibleHeader (XStack),
│                             # StyledCollapsibleTitle, StyledCollapsibleIconWrapper,
│                             # StyledCollapsibleBody
├── collapsible-types.ts      # CollapsibleAnimation, CollapsibleRadius,
│                             # CollapsibleColorsInput, CollapsibleProps
├── collapsible.spec.tsx      # unit tests + describe("snapshots") block
├── collapsible.stories.tsx   # Storybook (~7 stories)
├── README.md                 # props table + usage + Platform support
└── index.ts                  # explicit named exports
```

Token / provider wiring per [`creating-component-tamagui` Section 11](../.agents/skills/creating-component-tamagui/SKILL.md).

## Testing

**Coverage target: 100%** on the component.

### Behavioral coverage (~22 tests)

- Renders header title under the derived testID
- Root default testID `"collapsible"` + custom override + derived sub-testIDs
- Body content mounts when `expanded=true`; unmounts when `animation="none"` + `expanded=false`
- Body wrapper mounts always with `animation="height"` (natural render → measured → clamped)
- Tapping the header fires `onExpandedChange(!expanded)` — parametrized (currently collapsed / expanded)
- `disabled` prop suppresses `onExpandedChange`
- Icon slot mounts only when `icon` passed
- Chevron auto glyph `"▸"` renders when `chevron` prop is unset
- `chevron` override wins over the auto glyph
- Chevron testID always present regardless of custom / auto
- Chevron rotates 90° when `expanded=true` (verify transform)
- Header accessibilityRole=button, accessibilityLabel=title, accessibilityState reflects expanded + disabled — parametrized
- Palette slots paint correctly (parametrized across the 6 slots)
- Per-instance `collapsibleColors` override wins on each slot (parametrized)
- Provider-level palette propagates via `useUIKit()`
- Dark palette resolves when `activeTheme === "dark"`
- `radius` prop maps to correct value on each preset + number
- `duration` prop passes through to the Animated.timing config
- `animation="none"` skips the Animated.View wrapper entirely
- YStack pass-through (padding, margin, width) flows through the spread

### Structural snapshots (~4)

- Default light — collapsed
- Default light — expanded + icon + custom chevron
- Dark palette — expanded
- `animation="none"` — expanded

## Storybook (~7 stories)

- `Collapsed` — default state, no icon, no children mounted
- `Expanded` — pre-expanded, body populated
- `WithIcon` — header carries a leading icon
- `CustomChevron` — override the chevron with a `+` / `−` glyph
- `AnimationNone` — mounts/unmounts without slide
- `Disabled` — header not tappable
- `CustomColors` — brand-tinted per-instance override
- `AccordionStack` — three stacked Collapsibles wired to only-one-open state
- `DarkTheme` — expanded + icon in dark mode

## Example app screen

`apps/example/app/(pages)/components/collapsible.tsx` — 5 sections:

1. **Basic toggle** — a single Collapsible with real state; tap the header to expand.
2. **With icon + custom chevron** — leading icon in the header, custom `+/−` chevron.
3. **Animation opt-out** — `animation="none"` for the reduced-motion case.
4. **Accordion pattern** — three stacked Collapsibles wired to "only-one-open" state (consumer-owned coordination).
5. **Per-instance brand palette** — a purple-tinted Collapsible via `collapsibleColors` override.

Plus route registration + row on the components home.

## Non-goals

- **No coordinated accordion mode** built in — consumers wire "only one open at a time" via shared state across sibling Collapsibles (documented recipe in README).
- **No `defaultExpanded` / uncontrolled mode** — controlled only. Simpler API surface, accordion pattern is easier with a single owning state.
- **No `onAnimationEnd` callback** in v1 — animations complete via `useEffect` cleanup. If demand emerges, add a callback prop.
- **No custom easing / spring configs** — `Animated.timing` with the default easing curve. Consumers who need fancier motion wrap in `react-native-reanimated` themselves.
- **No `renderHeader` render-prop** — the `icon` + `title` + `chevron` slot combination covers the 95% case. Consumers who need a fully-custom header build their own accordion + reuse only the body-animation pattern.
- **No `animation="fade"` opt-in** in v1 — the two modes (`"height"` / `"none"`) cover the reduced-motion case cleanly. Fade adds one more state axis without clear demand.

## How to ship

Executed on branch `feat/duna-migration-batch-1`:

1. Token schema wiring (types + defaults + flatten + provider + barrels).
2. Component files: `collapsible-types.ts` → `collapsible.styled.ts` → `collapsible.tsx` → `collapsible.spec.tsx` (+ snapshots) → `collapsible.stories.tsx` → `README.md` → `index.ts`.
3. Barrels: `components/index.ts` + `src/index.ts`.
4. Example: screen + route + components-home row.
5. Flip status here (`planned` → `shipped on <YYYY-MM-DD>`).
6. Flip Batch 1 plan doc: ⏳ → ✅ on Collapsible's row.
7. Verify green + **100% coverage on `collapsible.tsx`** via `pnpm --filter ui-kraken test:coverage`.
8. Atomic commit with rich body.

## How to extend

- **Add an uncontrolled mode** — `defaultExpanded?: boolean` with internal state. Would parallel what RadioGroup would need if it grows uncontrolled support.
- **Add `renderHeader?` render-prop** — for full header customization beyond the icon + title + chevron slots.
- **Add `onAnimationEnd?: () => void` callback** — fires once the height/rotation animations settle.
- **Add a reanimated backend** — swap `Animated.timing` for `useSharedValue` + `withTiming` for smoother 120fps easing. Would require the reanimated babel-plugin in tests.
- **Add an `Accordion` compound** — coordinates state across multiple Collapsibles (only-one-open, all-open, all-closed). Would live as a separate primitive, not a mode on Collapsible.
