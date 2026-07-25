# Alert — design record

**Status:** shipped as v0.6.0 (initial API) → refactored on 2026-07-25 in v0.7.0 to own its color block on the token schema (the v0.6.0 palette-derivation from `textColors` was tech debt).

Living design doc for the `Alert` primitive. Kept post-shipping so future contributors can understand the decisions behind the shape of the API, not just what it does today.

---

## Overview

Contextual feedback surface for informational, success, warning, and destructive states. Common uses: form errors, empty-state hints, success confirmations, deprecation notices, inline callouts.

**Locked decisions:**

- **Naming**: `Alert` — matches every mature RN / React design system (MUI, Chakra, Radix, Ant, NativeBase).
- **Variant set**: 4 semantic variants — `info`, `success`, `warning`, `danger`. `danger` (not `error`) so the vocabulary matches `TextColors.danger` across the kit — one semantic slot, one name.
- **Content model**: optional `title` (bold, single line) + `children` (body, any ReactNode). `children` not `message: string` because Alert body content is often more than plain text — nested `<Text>` for inline links, code snippets, etc.
- **Icon**: `icon?: ReactNode` slot. Consumer brings their own icon system; ui-kraken does NOT ship an Icon component. Same pattern as `Button.leftIcon`.
- **Compound API**: `Alert.Info`, `Alert.Success`, `Alert.Warning`, `Alert.Danger` — PascalCase shortcuts, same pattern as `Button.Primary` and `Text.H1`.
- **Colors — own token block**: Alert defines its own `alertColors` on the token schema. Provider-level overrides + per-instance overrides. Zero coupling to `textColors` or any other component's palette (per the [each-component-owns-color-space](../.claude/…/each-component-owns-color-space.md) rule).
- **Per-instance override**: `alertColors?: AlertColorsInput` prop. Every slot optional; missing slots fall through to the provider-resolved palette for the resolved variant.
- **Accessibility**: `accessibilityRole="alert"` on all variants; `accessibilityLiveRegion` is `"assertive"` for `danger` (screen reader interrupts) and `"polite"` for the other three.

## API

### Props

`AlertProps` re-declares only props that are OURS. Every Tamagui style prop that `StyledAlert` accepts flows through the `...rest` spread with types inferred from `GetProps<typeof StyledAlert>`.

```ts
export interface AlertProps extends Omit<GetProps<typeof StyledAlert>, "children" | "color"> {
  variant?: AlertVariant; // "info" | "success" | "warning" | "danger"
  title?: string; // optional bold title above the body
  children?: ReactNode; // body content
  icon?: ReactNode; // optional leading icon slot
  radius?: AlertRadius; // "none" | "sm" | "md" | "lg" | "pill" | number
  alertColors?: AlertColorsInput; // per-instance override, all fields optional
  testID?: string; // root testID (default: "alert")
}
```

### Variant × slot mapping (per-variant color palette)

Every variant is a full 4-slot palette. All 4 variants coexist in the provider's `alertColors` block; the `variant` prop picks which palette is applied.

| Variant   | Slot: `background`                             | Slot: `text`      | Slot: `icon`      | Slot: `border`                   |
| --------- | ---------------------------------------------- | ----------------- | ----------------- | -------------------------------- |
| `info`    | Blue tint (`#EFF6FF` / `rgba(56,189,248,.15)`) | Blue 600 / 400    | Blue 600 / 400    | undefined (no border by default) |
| `success` | Green tint                                     | Emerald 600 / 400 | Emerald 600 / 400 | undefined                        |
| `warning` | Amber tint                                     | Amber 600 / 400   | Amber 600 / 400   | undefined                        |
| `danger`  | Red tint                                       | Red 600 / 400     | Red 600 / 400     | undefined                        |

Consumer overrides at the provider level to re-theme all alerts of a variant at once, or per-instance for a one-off paint.

### Sizes + radius

No `size` prop in v1 — Alert is inline content, not chrome. Content-driven height (icon dictates the row height at 24 px min; body wraps).

`radius?: AlertRadius` — same shape as `ButtonRadius` / `RadioRadius`. Default `"md"` (`$uiRadiusMd`). Preset names resolve to the theme scale, `"pill"` is 9999, a raw number is passed through as pixels.

### Per-instance color override

```tsx
<Alert.Info alertColors={{ background: "#FFEEDD" }}>
  Custom background, other slots still use the resolved info palette.
</Alert.Info>

<Alert.Danger alertColors={{ background: "#4A0000", text: "#FFFFFF", icon: "#FFFFFF" }}>
  Inverted danger — dark background, white text.
</Alert.Danger>
```

Every field on `AlertColorsInput` is optional. Missing slots fall through to the palette for the resolved `variant`. Variant itself is implicit because you already picked one (`Alert.Info` selected it).

### A11y

Every variant sets `accessibilityRole="alert"` and `accessibilityLiveRegion` — `"assertive"` for `danger` (screen reader interrupts current announcement), `"polite"` for the other three (announced when the reader finishes what it's saying). Follows MDN + Radix guidance.

### Compound namespace

Every variant gets a PascalCase pre-configured shortcut. Same pattern as `Button.Primary` and `Text.H1`:

```tsx
<Alert.Info title="FYI">This is informational.</Alert.Info>
<Alert.Success>Your changes were saved.</Alert.Success>
<Alert.Warning title="Heads up">Free tier caps at 5 seats.</Alert.Warning>
<Alert.Danger title="Payment failed">Update your card and retry.</Alert.Danger>
```

Each shortcut is a `forwardRef` that passes `variant="…"` and forwards everything else. Consumer can still use `<Alert variant="…">` — the shortcuts are sugar. The dual export uses `Object.assign(BaseAlert, { Info, Success, Warning, Danger })` so both forms produce the same subtree.

### Sub-element testIDs

Root `testID` (default `"alert"`) propagates to sub-elements:

- `{testID}` — root row
- `{testID}-icon` — icon slot wrapper (present when `icon != null`)
- `{testID}-title` — title element (present when `title != null && title.length > 0`)
- `{testID}-body` — body element (present when `children != null`)

Consumer tests query by these deterministic IDs instead of by text.

## Token schema

Alert introduces its own **`alertColors`** block on `Tokens`. Zero reuse of other component palettes. Consumers override at the provider level:

```tsx
<UIKitProvider
  tokens={{
    alertColors: {
      info: { background: "#EFF6FF", text: "#2563EB", icon: "#2563EB" },
      danger: { background: "#FEF2F2", text: "#DC2626", icon: "#DC2626", border: "#FCA5A5" },
    },
  }}
  dark={{
    alertColors: {
      info: { background: "#1E3A8A33", text: "#60A5FA", icon: "#60A5FA" },
    },
  }}
>
  <App />
</UIKitProvider>
```

### `AlertVariantColors` + `AlertColors` interfaces

```ts
export interface AlertVariantColors {
  /** Row background color. */
  background: string;
  /** Title + body text color. */
  text: string;
  /** Icon glyph color (applied via wrapper `color` prop). */
  icon: string;
  /** Optional border color. When set, a 1px border renders. */
  border?: string;
}

export interface AlertColors {
  info: AlertVariantColors;
  success: AlertVariantColors;
  warning: AlertVariantColors;
  danger: AlertVariantColors;
}
```

### Default light palette

Tuned for WCAG AA contrast on white / near-white surfaces. Backgrounds are the variant color at ~10-15% opacity (baked into the hex).

```ts
export const DEFAULT_LIGHT_ALERT_COLORS: AlertColors = {
  info: { background: "#EFF6FF", text: "#0284C7", icon: "#0284C7" },
  success: { background: "#F0FDF4", text: "#059669", icon: "#059669" },
  warning: { background: "#FFFBEB", text: "#D97706", icon: "#D97706" },
  danger: { background: "#FEF2F2", text: "#DC2626", icon: "#DC2626" },
};
```

### Default dark palette

Lighter variant colors so they pop on a dark surface; backgrounds are a darker tint that reads well against the near-black app surface.

```ts
export const DEFAULT_DARK_ALERT_COLORS: AlertColors = {
  info: { background: "#0C4A6E33", text: "#38BDF8", icon: "#38BDF8" },
  success: { background: "#064E3B33", text: "#34D399", icon: "#34D399" },
  warning: { background: "#78350F33", text: "#FBBF24", icon: "#FBBF24" },
  danger: { background: "#7F1D1D33", text: "#F87171", icon: "#F87171" },
};
```

### Flatten to Tamagui tokens

`flattenAlertColors()` produces the flat `$ui*` token map wired into `buildConfig()`:

```
uiAlertInfoBackground
uiAlertInfoText
uiAlertInfoIcon
uiAlertInfoBorder             // omitted when the slot is undefined
uiAlertSuccessBackground
uiAlertSuccessText
uiAlertSuccessIcon
uiAlertWarningBackground
uiAlertWarningText
uiAlertWarningIcon
uiAlertDangerBackground
uiAlertDangerText
uiAlertDangerIcon
```

Wired into both `themes.light` and `themes.dark` so `<Theme name="dark">` flips every reference automatically.

### Merge helpers

```ts
export function mergeAlertVariantColors(
  base: AlertVariantColors,
  override?: Partial<AlertVariantColors>
): AlertVariantColors;

export function mergeAlertColors(
  base: AlertColors,
  override?: Partial<Record<keyof AlertColors, Partial<AlertVariantColors>>>
): AlertColors;
```

Same signatures as `mergeButtonColors()` / `mergeButtonVariantColors()`. Called inside `UIKitProvider` for both light and dark passes.

## File structure

```
packages/ui-kraken/src/components/alert/
├── alert.tsx              # component logic + compound export + resolvePalette helper
├── alert.styled.ts        # StyledAlert (root row) + StyledAlertIconWrapper + StyledAlertContent + StyledAlertTitle + StyledAlertBody
├── alert-types.ts         # AlertVariant, AlertRadius, AlertVariantColors, AlertColors, AlertColorsInput, AlertProps
├── alert.spec.tsx         # unit tests + describe("snapshots") block
├── alert.stories.tsx      # Storybook (~8 stories)
├── README.md              # props table + usage + Platform support (iOS · Android · Web)
└── index.ts               # explicit named exports (Alert + 6 types)
```

Token / provider wiring (v0.7.0 refactor delta vs v0.6.0):

- `packages/ui-kraken/src/tokens/tokens-types.ts` — add `AlertVariantColors` + `AlertColors` + add `alertColors: AlertColors` field to `Tokens`
- `packages/ui-kraken/src/tokens/tokens-derive.ts` — add `DEFAULT_LIGHT_ALERT_COLORS` + `DEFAULT_DARK_ALERT_COLORS` + `mergeAlertColors()` + `mergeAlertVariantColors()`; update `DEFAULT_TOKENS` + `DEFAULT_DARK_TOKENS`
- `packages/ui-kraken/src/tokens/tokens.ts` — add `flattenAlertColors()`; wire into `buildConfig()` `tokens.color`, `themes.light`, `themes.dark`; re-export defaults + merge helpers
- `packages/ui-kraken/src/provider/provider-types.ts` — add `AlertColorsInput` type + optional `alertColors?` field to `TokensInput`
- `packages/ui-kraken/src/provider/provider.tsx` — extend `useMemo` merge to call `mergeAlertColors()` for both `mergedLight` and `mergedDark`
- `packages/ui-kraken/src/components/alert/alert.tsx` — refactor: replace the runtime derivation from `textColors` with a lookup into `tokens.alertColors[variant]`; keep the `alertColors?` per-instance override merging on top

Barrel updates:

- `packages/ui-kraken/src/components/index.ts` — re-export `Alert` + 6 types (add `AlertVariantColors`)
- `packages/ui-kraken/src/index.ts` — public barrel

Example app:

- `apps/example/app/(pages)/components/alert.tsx` — subtitle updated to describe the `alertColors` provider block (already fixed in this PR)

## Testing (Jest + RTL v14 + jest-expo)

Mock `./alert.styled` and `../../provider/use-ui-kit` the same way Button and Text do so the tests run without a live Tamagui / provider tree. The `useUIKit` mock now returns `tokens.alertColors` with the 4 variant palettes populated (matching `DEFAULT_LIGHT_ALERT_COLORS`).

**Behavioral coverage** (~22 targeted tests, extends the v0.6.0 set):

1. Renders body (`children`) when provided.
2. Renders `title` when provided; omits the title element when not.
3. Every variant maps to the correct `alertColors` slot (parametrized across 4).
4. Every compound shortcut sets the correct `variant`.
5. `icon` slot renders when provided; omits the wrapper when not.
6. `radius` prop resolves: preset name → theme token, `"pill"` → 9999, `"none"` → 0, raw number → itself.
7. `alertColors` per-instance override lands on the right styled props (background / text / icon / border).
8. `testID` propagates to `-title`, `-body`, `-icon` sub-elements deterministically.
9. `accessibilityRole="alert"` on every variant; `accessibilityLiveRegion` is `"assertive"` for `danger` and `"polite"` for others.
10. Every Tamagui style prop flow-through works (padding / margin / style array).
11. **v0.7.0 additions**: provider-level `alertColors` override propagates through `useUIKit()` — mock returns a custom `info.background`, assert `Alert.Info` uses it.
12. Border slot renders only when `alertColors[variant].border` is set.

**Snapshot block** (~19 snapshots):

- Every variant × default title + body (4)
- `title` + body vs body-only (2)
- With / without `icon` slot (2)
- Radius presets: `none`, `sm`, `md`, `lg`, `pill`, and one raw number (6)
- Dark theme × each variant (4)
- Per-instance `alertColors` override with all 4 slots set (1)

## Storybook (~8 stories)

- `Default` — `<Alert>Body only, info variant.</Alert>`
- `AllVariants` — vertical stack of the 4 variants, each with `title` + body + icon
- `WithTitle` — 4 variants, title vs no-title side-by-side
- `WithIcon` — 4 variants, icon vs no-icon side-by-side
- `LongContent` — multi-line body, wrap behavior
- `RadiusPresets` — one alert per preset
- `CustomColors` — 3 alerts using `alertColors` to override into brand palettes
- `DarkTheme` — 4 variants wrapped in `<Theme name="dark">` for the cross-check

## Example app screen

`apps/example/app/(pages)/components/alert.tsx` — using `<Section>` wrapper. Sections:

1. **Variants** — the 4 semantic variants with title + body + icon
2. **Title vs body-only** — same variant, side-by-side
3. **With icon vs without** — showing the icon slot at work
4. **Radius presets** — every radius option
5. **Custom colors** — `alertColors` per-instance override examples
6. **Long content** — a wrapping paragraph inside an Alert

Components-home row for Alert stays as `status: "shipped"`.

## Non-goals

Documented so future contributors know these were considered and deliberately deferred:

- **Dismissible / `onClose` prop** — v1 is display-only. A close button + slide-out animation deserves its own PR. Consumer wraps `<Alert>` in a stateful parent to conditionally render.
- **`action` slot** (e.g. inline "Retry" button) — composable today via `children` (`<Alert><Text>Payment failed. <Button.Ghost>Retry</Button.Ghost></Text></Alert>`). If a first-class `actions` prop turns out to be common, add later.
- **Auto-dismiss / toast conversion** — separate `Toast` component in a future PR. Alert stays inline.
- **`error` variant name** — deliberately `"danger"` for consistency with `TextColors.danger`. Not exposing `"error"` as an alias.
- **Icon library dependency** — Alert takes `icon?: ReactNode`; consumer brings their own icon system. When ui-kraken eventually ships `Icon`, no Alert change needed.
- **Fixed-height `size` prop** — Alert is inline content; height is content-driven.

## How to ship

**v0.7.0 refactor** (bundled in the RadioGroup + provider rename PR):

1. **Token schema** — extend `tokens-types.ts`, `tokens-derive.ts`, `tokens.ts` with `AlertVariantColors` + `AlertColors` + defaults + merge helpers + flatten
2. **Provider wiring** — extend `provider-types.ts` `TokensInput` + `provider.tsx` `useMemo` merge (both light + dark)
3. **Component refactor** — `alert.tsx`: replace `resolvePalette(variant, tokens.textColors, override)` with `resolvePalette(variant, tokens.alertColors, override)`; delete the `withAlpha` helper (backgrounds now come pre-tinted from defaults or provider override, not derived at runtime)
4. **Update tests** — `alert.spec.tsx`: mock `useUIKit` to return `tokens.alertColors`; add provider-override test; regenerate snapshots
5. **Barrels** — expose `AlertVariantColors` from `components/alert/index.ts` + `components/index.ts` + `src/index.ts`
6. **README** — swap the "Color model" section to document `alertColors` on the provider + per-instance
7. **Flip status** in this doc: append the v0.7.0 refactor date
8. **Verify**: `pnpm typecheck && pnpm -r lint && pnpm test && pnpm --filter ui-kraken build`
9. **Changeset** — bundled with the RadioGroup + `UIKitProvider` rename into a single `0.7.0` minor bump

## How to extend

- **New variant** — add to `AlertVariant` in `alert-types.ts`, add a key to `AlertColors` + both defaults in `tokens-derive.ts`, extend `flattenAlertColors` naming, add a compound shortcut in the `Object.assign` map, add a story, extend the a11y role map if the role differs.
- **New color slot** on the variant palette (e.g. `borderWidth` semantics) — extend `AlertVariantColors`, extend `mergeAlertVariantColors`, extend `flattenAlertColors`, thread the new prop through `alert.tsx`'s render.
- **Dismissible** — new file `alert-dismissible.tsx` wrapping `Alert` with `onClose` + close-button state. Do not add `onClose` to the base `AlertProps` — keeps the base component simple, dismissible is a distinct primitive.
- **Provider-level slot overrides for brand theming** — already supported today via `<UIKitProvider tokens={{ alertColors: {...} }}>`. No API change needed.
