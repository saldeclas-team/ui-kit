# RefreshControl — design record

**Status:** shipped on 2026-07-25 in ui-kraken v0.8.0 as part of [`COMPONENTS-BATCH-1-PLAN.md`](./COMPONENTS-BATCH-1-PLAN.md) Phase A.

Living design doc for the `RefreshControl` primitive. Kept post-shipping so future contributors can understand the decisions behind the shape of the API, not just what it does today.

---

## Overview

Themed pull-to-refresh control for `ScrollView` / `FlatList` / `SectionList`. Wraps RN's native `RefreshControl` so consumers get theme-aware spinner + background colors on both iOS and Android automatically — with the same drop-in API surface RN developers already know.

**Locked decisions:**

- **Naming**: `RefreshControl` — matches RN's native `RefreshControl` name exactly. Consumers who know how to wire RN's version already know how to wire ours (via the `refreshControl` prop on a scrollable).
- **Wraps RN `RefreshControl`**: every `RefreshControlProps` (minus the color-related ones we manage — `tintColor`, `colors`, `progressBackgroundColor`, `titleColor`) flows through `...rest`. Consumer passes `refreshing`, `onRefresh`, `title` (iOS), `progressViewOffset`, `size`, every accessibility prop, etc.
- **Own color block on the token schema**: `refreshControlColors` with 3 slots (spinner, background, title). Provider-level + per-instance overrides.
- **Cross-platform color wiring**:
  - **iOS** — spinner color → `tintColor`; optional title text color → `titleColor`.
  - **Android** — spinner color → `colors={[spinner]}` (RN wants an array so it can rotate through multiple colors; we always pass a single-color monochrome array for a consistent look); background circle → `progressBackgroundColor`.
- **Per-instance override**: `refreshControlColors?: Partial<RefreshControlColors>` prop.
- **Not rendered standalone**: `RefreshControl` is passed to a `ScrollView` / `FlatList` via the `refreshControl` prop. It is not a visual container the consumer places directly in JSX. No `children` prop.
- **Accessibility**: RN's native `RefreshControl` handles accessibility natively (VoiceOver / TalkBack announce "pull to refresh" / "loading"). Every accessibility prop flows through the spread if a consumer needs to customize.

## API

### Props

`RefreshControlProps` re-declares only what is OURS. Every RN `RefreshControlProps` (except the four we own) flows through `...rest` with types inferred from `Omit<RNRefreshControlProps, "tintColor" | "colors" | "progressBackgroundColor" | "titleColor">`.

```ts
export type RefreshControlColorsInput = Partial<RefreshControlColors>;

export interface RefreshControlProps extends Omit<
  RNRefreshControlProps,
  "tintColor" | "colors" | "progressBackgroundColor" | "titleColor"
> {
  /** `true` while a refresh is in progress. */
  refreshing: boolean;
  /** Fires when the user pulls the scrollable down past the threshold. */
  onRefresh: () => void;
  /** Per-instance color override. Missing slots fall through to the provider palette. */
  refreshControlColors?: RefreshControlColorsInput;
  /** Root testID. Default: `"refresh-control"`. */
  testID?: string;
}
```

### Cross-platform color mapping

Every slot on `refreshControlColors` maps to one or two RN props depending on the platform:

| Slot         | iOS RN prop  | Android RN prop           | Paints                                                                           |
| ------------ | ------------ | ------------------------- | -------------------------------------------------------------------------------- |
| `spinner`    | `tintColor`  | `colors={[spinner]}`      | The spinning ring / arrows.                                                      |
| `background` | (n/a)        | `progressBackgroundColor` | The circular background behind the spinner (Android only).                       |
| `title`      | `titleColor` | (n/a)                     | Optional text below the spinner (iOS only, only rendered when `title` prop set). |

### Per-instance override

```tsx
<RefreshControl
  refreshing={loading}
  onRefresh={refetch}
  refreshControlColors={{ spinner: "#7C3AED" }}
/>
```

### A11y

RN's native `RefreshControl` ships built-in accessibility on both platforms. Every RN accessibility prop flows through the spread if a consumer needs to customize.

### Sub-element testIDs

Root `testID` (default `"refresh-control"`) — no sub-elements to derive (RefreshControl is a leaf).

## Token schema

RefreshControl introduces its own **`refreshControlColors`** block on `Tokens`.

```tsx
<UIKitProvider
  tokens={{
    refreshControlColors: {
      spinner: "#7C3AED",
    },
  }}
  dark={{
    refreshControlColors: {
      spinner: "#A78BFA",
      background: "#1F2937",
    },
  }}
>
  <App />
</UIKitProvider>
```

### `RefreshControlColors` interface

Slot-based, 3 slots.

```ts
export interface RefreshControlColors {
  /** The spinning ring / arrows color (iOS tintColor + Android colors[0]). */
  spinner: string;
  /** Android-only: circular background behind the spinner. */
  background: string;
  /** iOS-only: title text color (rendered when the `title` prop is set). */
  title: string;
}
```

### Default light palette

Spinner mirrors the interactive brand blue (matches RadioGroup / Input `borderFocused` / Text `interactive`). Background matches Surface `raised` so the Android circle blends with a card-like surface. Title matches Text `secondary` (muted).

```ts
export const DEFAULT_LIGHT_REFRESH_CONTROL_COLORS: RefreshControlColors = {
  spinner: "#2563EB",
  background: "#F9FAFB",
  title: "#5B6472",
};
```

### Default dark palette

```ts
export const DEFAULT_DARK_REFRESH_CONTROL_COLORS: RefreshControlColors = {
  spinner: "#60A5FA",
  background: "#111827",
  title: "#9CA3AF",
};
```

### Flatten to Tamagui tokens

`flattenRefreshControlColors()` → `$uiRefreshControlSpinner` / `$uiRefreshControlBackground` / `$uiRefreshControlTitle`. Wired into `buildConfig()`.

### Merge helper

```ts
export function mergeRefreshControlColors(
  base: RefreshControlColors,
  override?: Partial<RefreshControlColors>
): RefreshControlColors;
```

## File structure

```
packages/ui-kraken/src/components/refresh-control/
├── refresh-control.tsx           # component logic + resolvePalette helper
├── refresh-control-types.ts      # RefreshControlColorsInput, RefreshControlProps
├── refresh-control.spec.tsx      # unit tests + describe("snapshots") block
├── refresh-control.stories.tsx   # Storybook (~4 stories inside a ScrollView decorator)
├── README.md                     # props + slots + usage + Platform support
└── index.ts                      # explicit named exports
```

**Note**: no `refresh-control.styled.ts`. RefreshControl wraps RN's native `RefreshControl`, not a Tamagui-styled element. All visual styling is expressed through the native props (`tintColor`, `colors`, `progressBackgroundColor`, `titleColor`).

Token / provider wiring per [`creating-component-tamagui` Section 11](../.agents/skills/creating-component-tamagui/SKILL.md).

## Testing

**Coverage target: 100%** on `refresh-control.tsx` (per the "todo probado" rule).

### Behavioral coverage (~14 tests)

- Renders (returns an `RNRefreshControl` element with correct props)
- Forwards `refreshing`
- Forwards `onRefresh` (fires when triggered)
- iOS `tintColor` receives `spinner` slot from the provider palette
- Android `colors` array receives `[spinner]` from the provider palette
- Android `progressBackgroundColor` receives `background` slot
- iOS `titleColor` receives `title` slot
- Forwards `title` prop (iOS)
- Per-instance `refreshControlColors.spinner` override wins
- Per-instance `.background` and `.title` overrides
- Provider-level override propagates through `useUIKit()`
- `testID` defaults to `"refresh-control"` and can be overridden
- Passes through arbitrary RN `RefreshControlProps` (`progressViewOffset`, `size`)

### Structural snapshots (~4)

Default light / dark / per-instance override / with iOS title.

## Storybook (~4 stories)

RefreshControl is designed to sit inside a scrollable, so the stories embed it in a small `<ScrollView>` decorator that shows the pull affordance.

- `Default` — default palette, stateful `refreshing` that resolves after 1.5 s
- `WithTitle` — iOS title text ("Pulling…")
- `CustomColors` — brand-purple spinner + background
- `DarkTheme` — inside `<Theme name="dark">`

## Example app screen

`apps/example/app/(pages)/components/refresh-control.tsx` — a `ScrollView` wired to a real `RefreshControl`. Pulling down triggers a simulated 1.5 s refresh. Sections:

1. **Live demo** — a `ScrollView` with a real `RefreshControl` inside; refresh counter increments on each pull.
2. **Custom colors** — a second `ScrollView` with a per-instance override (brand-purple spinner).
3. **iOS title** — iOS-only demo with a `title` string below the spinner.

Register the route (`headerBackTitle: "Components"`) and add the components-home row.

## Non-goals

- **No standalone rendering** — RefreshControl only makes sense inside a `refreshControl={...}` prop on a scrollable. It does not render children.
- **No custom animation / duration** — RN's native implementation controls the animation.
- **No shadow / border chrome** — the native spinner draws itself; ui-kraken does not layer visual chrome on top.
- **No compound API** — the flat `refreshControlColors` prop covers every customization case.
- **No web-specific fallback** — `RefreshControl` on `react-native-web` renders as a no-op (pull-to-refresh is a mobile-only gesture).

## How to ship

Executed on branch `feat/duna-migration-batch-1`:

1. Token schema wiring (types + defaults + flatten + provider + barrels).
2. Component files: `refresh-control-types.ts` → `refresh-control.tsx` → `refresh-control.spec.tsx` (+ snapshots) → `refresh-control.stories.tsx` → `README.md` → `index.ts`.
3. Barrels: `components/index.ts` + `src/index.ts`.
4. Example: screen + route + components-home row. **Verify with `grep` after each Edit** (per `verify-example-wiring-per-component` memory).
5. Flip status here (`planned` → `shipped on <YYYY-MM-DD>`).
6. Flip Batch 1 plan doc: ⏳ → ✅ on RefreshControl's row.
7. Verify green + **100% coverage on `refresh-control.tsx`**.
8. Atomic commit with rich body.

## How to extend

- **Add a color scheme prop** — `scheme?: "brand" | "neutral"` sugar that picks between themed brand and neutral gray palettes.
- **Web fallback** — a `Pressable` "Refresh" button on `react-native-web` that mirrors the `refreshing` / `onRefresh` API.
- **Minimum spinner duration** — an optional `minDuration?: number` prop to keep the spinner visible for at least N ms even if `onRefresh` resolves faster.
