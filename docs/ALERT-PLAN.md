# Alert — design record

**Status:** shipped on 2026-07-24 in ui-kraken v0.6.0.

Living design doc for the `Alert` primitive. Kept post-shipping so future contributors can understand the decisions behind the shape of the API, not just what it does today.

---

## Overview

Contextual feedback surface for informational, success, warning, and destructive states. Common uses: form errors, empty-state hints, success confirmations, deprecation notices, inline callouts. Locked decisions:

- **Naming**: `Alert` — matches every mature RN/React design system (MUI, Chakra, Radix, Ant, NativeBase).
- **Variant set**: 4 semantic variants — `info`, `success`, `warning`, `danger`. The vocabulary matches `KrakenTextColors` (`.danger`, not `.error`) so one semantic slot has one name across the kit.
- **Content model**: optional `title` (bold, single line) + `children` (body, any ReactNode). `children` not `message: string` because Alert body content is often more than plain text — nested `<Text>` for inline links, code snippets, etc.
- **Icon**: `icon?: ReactNode` slot. Consumer brings their own icon system; ui-kraken does NOT ship an Icon component. Same pattern as `Button.leftIcon`.
- **Compound API**: `Alert.Info`, `Alert.Success`, `Alert.Warning`, `Alert.Danger` — PascalCase shortcuts, same pattern as `Button.Primary` and `Text.H1`.
- **Colors**: reuses the existing `textColors` block on `KrakenProvider`. Variants map to slots (info → `textColors.info`, danger → `textColors.danger`, etc.). No new token schema.
- **Per-instance override**: `alertColors?: Partial<{ background, border, text, icon }>` — scoped to the resolved variant. Missing slots fall through to the variant palette.

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

### Variant × color-slot mapping

Every variant maps to one slot in the existing `KrakenTextColors` block:

| Variant   | Slot on `textColors` | Icon + text color                                  | Background                 |
| --------- | -------------------- | -------------------------------------------------- | -------------------------- |
| `info`    | `info`               | `textColors.info` (Blue-600 light / Blue-400 dark) | Same color at ~15% opacity |
| `success` | `success`            | `textColors.success` (Emerald-600 / Emerald-400)   | Same color at ~15% opacity |
| `warning` | `warning`            | `textColors.warning` (Amber-600 / Amber-400)       | Same color at ~15% opacity |
| `danger`  | `danger`             | `textColors.danger` (Red-600 / Red-400)            | Same color at ~15% opacity |

Background is computed at runtime via `withAlpha(variantColor, 0.15)` — a small helper in `alert.tsx` that appends an `AA` alpha channel to a `#RRGGBB` hex, or returns the color as-is for `rgb(...)` / named inputs.

### Sizes + radius

No `size` prop in v1 — Alert is inline content, not chrome. Content-driven height (icon dictates the row height at 24px min; body wraps).

`radius?: AlertRadius` — same shape as `ButtonRadius`. Default `"md"` (`$uiRadiusMd`). Preset names resolve to the theme scale, `"pill"` is 9999, a raw number is passed through as pixels.

### Per-instance color override

```tsx
<Alert.Info alertColors={{ background: "#FFEEDD" }}>
  Custom background, other slots still use the variant defaults.
</Alert.Info>

<Alert.Danger alertColors={{ background: "#4A0000", text: "#FFFFFF", icon: "#FFFFFF" }}>
  Inverted danger — dark background, white text.
</Alert.Danger>
```

Every field on `AlertColorsInput` is optional. Missing slots fall through to the palette derived from `variant`. Variant itself is implicit because you already picked one (`Alert.Info` selected it).

### A11y

Every variant sets `accessibilityRole="alert"` and `accessibilityLiveRegion` — `assertive` for `danger` (screen reader interrupts current announcement), `polite` for the other three (announced when the reader finishes what it's saying). Follows MDN + Radix guidance.

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

**No changes.** Alert reuses the existing `textColors` block that shipped in ui-kraken v0.3.0 with the Text component. The 4 variant slots (`info`, `success`, `warning`, `danger`) are already there in both `DEFAULT_LIGHT_TEXT_COLORS` and `DEFAULT_DARK_TEXT_COLORS`.

Rationale for reuse (not introducing `alertColors`): the semantic surface an Alert paints (info / success / warning / danger text + icon) is the same semantic surface Text.color slots paint. Two schemas for the same intent would fragment the palette API — consumers overriding `textColors.info` to their brand blue would rightly expect their alerts to use it too.

Per-instance override (`alertColors` prop on `<Alert>`) fills the gap when a specific instance needs a custom paint without touching the provider palette.

## File structure

```
packages/ui-kraken/src/components/alert/
├── alert.tsx              # component logic + compound export + resolvePalette / withAlpha helpers
├── alert.styled.ts        # StyledAlert (root row) + StyledAlertIconWrapper + StyledAlertContent + StyledAlertTitle + StyledAlertBody
├── alert-types.ts         # AlertVariant, AlertRadius, AlertColors, AlertColorsInput, AlertProps
├── alert.spec.tsx         # unit tests + describe("snapshots") block
├── alert.stories.tsx      # Storybook (~8 stories)
├── README.md              # props table + usage + Platform support (iOS · Android · Web)
└── index.ts               # explicit named exports (Alert + 5 types)
```

Barrel updates:

- `packages/ui-kraken/src/components/index.ts` — re-export `Alert` + all 5 types
- `packages/ui-kraken/src/index.ts` — public barrel

Example app:

- `apps/example/app/(pages)/components/alert.tsx` — full showcase
- `apps/example/app/_layout.tsx` — register `Stack.Screen`
- `apps/example/app/(pages)/index.tsx` — flip Alert row from "Planned" → "Ready"

## Testing (Jest + RTL v14 + jest-expo)

Mock `./alert.styled` and `../../provider/use-ui-kit` the same way Button and Text do so the tests run without a live Tamagui / provider tree. ~10 specs + a `describe("snapshots")` block:

1. Renders body (`children`) when provided.
2. Renders `title` when provided; omits the title element when not.
3. Every variant maps to the correct color slot (parametrized across 4).
4. Every compound shortcut sets the correct `variant`.
5. `icon` slot renders when provided; omits the wrapper when not.
6. `radius` prop resolves: preset name → theme token, `"pill"` → 9999, `"none"` → 0, raw number → itself.
7. `alertColors` per-instance override lands on the right styled props (background / text / icon / border).
8. `testID` propagates to `-title`, `-body`, `-icon` sub-elements deterministically.
9. `accessibilityRole="alert"` on every variant; `accessibilityLiveRegion` is `"assertive"` for `danger` and `"polite"` for others.
10. Every Tamagui style prop flow-through works (padding / margin / style array).

### Snapshot block (~18 snapshots)

- Every variant × default title + body (4).
- `title` + body vs body-only (2).
- With / without `icon` slot (2).
- Radius presets: `none`, `sm`, `md`, `lg`, `pill`, and one raw number (6).
- Dark theme × each variant (4).
- Per-instance `alertColors` override with all 4 slots set (1).

## Storybook (~8 stories)

- `Default` — `<Alert>Body only, info variant.</Alert>`
- `AllVariants` — vertical stack of the 4 variants, each with `title` + body + icon
- `WithTitle` — 4 variants, title vs no-title side-by-side
- `WithIcon` — 4 variants, icon vs no-icon side-by-side
- `LongContent` — multi-line body, wrap behavior
- `RadiusPresets` — one alert per preset
- `CustomColors` — 3 alerts using `alertColors` to override into brand palettes
- `DarkTheme` — 4 variants wrapped in `<Theme name="dark">` for the elevation-border cross-check

## Example app screen

`apps/example/app/(pages)/components/alert.tsx` — using `<Section>` wrapper. Sections:

1. **Variants** — the 4 semantic variants with title + body + icon
2. **Title vs body-only** — same variant, side-by-side
3. **With icon vs without** — showing the icon slot at work (using a plain `<Text>` glyph or a Feather icon from the example app's icon set)
4. **Radius presets** — every radius option
5. **Custom colors** — `alertColors` override examples
6. **Long content** — a wrapping paragraph inside an Alert

Catalog home flips the Alert row from `status: "planned"` → `status: "shipped"` and wires it to `/components/alert`.

## AGENTS.md / skill updates

No skill or AGENTS.md change needed — Alert follows the existing conventions exactly:

- kebab-case files ✅
- named exports only ✅
- `*.styled.ts` for Tamagui primitives ✅
- `*-types.ts` for types ✅
- `*.spec.tsx` co-located ✅
- `*.stories.tsx` co-located ✅
- `README.md` per component ✅
- `testID` propagates ✅
- No new tokens ✅
- Compound API pattern ✅

## Non-goals (deferred)

- **Dismissible / `onClose` prop** — v1 is display-only. A close button + slide-out animation deserves its own PR. Consumer wraps `<Alert>` in a stateful parent to conditionally render.
- **`action` slot** (e.g. inline "Retry" button) — composable today via `children` (`<Alert><Text>Payment failed. <Button.Ghost>Retry</Button.Ghost></Text></Alert>`). If a first-class `actions` prop turns out to be common, add later.
- **Auto-dismiss / toast conversion** — separate `Toast` component in a future PR. Alert stays inline.
- **`error` variant name** — deliberately `"danger"` for consistency with `TextColors.danger`. Not exposing `"error"` as an alias.
- **Icon library dependency** — Alert takes `icon?: ReactNode`; consumer brings their own icon system. When ui-kraken eventually ships `Icon`, no Alert change needed.
- **Fixed-height `size` prop** — Alert is inline content; height is content-driven. If a "compact" or "banner-full-width" variant surfaces demand, add later.

## How to ship

Executed in this order on branch `feat/alert-component`:

1. Types + styled + tsx.
2. Spec + snapshot block.
3. Storybook stories.
4. README.
5. index.ts + wire into public barrels (`components/index.ts`, `src/index.ts`).
6. Example screen + register `Stack.Screen` + flip catalog row.
7. Verify: `pnpm typecheck && pnpm lint && pnpm test && pnpm --filter ui-kraken build`. Expect 122 → ~140 tests, 66 → ~84 snapshots.
8. Changeset for the `0.6.0` minor bump.
9. This plan doc flips Status to `shipped on <date> (ui-kraken v0.6.0)`.
10. Commit atomically. Handoff PR title + body per [`drafting-pr-descriptions`](../.agents/skills/drafting-pr-descriptions/SKILL.md).

## How to extend

- **New variant** — add to `AlertVariant` in `alert-types.ts`, extend `VARIANT_TO_TEXT_SLOT` in `alert.tsx`, extend `ACCESSIBILITY_ROLE` if the a11y role differs, add a row to the README variant table, add a compound shortcut in the `Object.assign` map, and add a story to `alert.stories.tsx`.
- **New color slot** (e.g. `borderWidth` semantics) — extend `AlertColors` + `AlertColorsInput` in `alert-types.ts`, extend `resolvePalette` in `alert.tsx`, thread the new prop through `alert.tsx`'s render.
- **Dismissible** — new file `alert-dismissible.tsx` wrapping `Alert` with `onClose` + close-button state. Do not add `onClose` to the base `AlertProps` — keeps the base component simple, dismissible is a distinct primitive.
