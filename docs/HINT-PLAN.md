# Hint — design record

**Status:** shipped on 2026-07-25 in ui-kraken v0.8.0 as part of [`COMPONENTS-BATCH-1-PLAN.md`](./COMPONENTS-BATCH-1-PLAN.md) Phase B.

Living design doc for the `Hint` primitive. Kept post-shipping so future contributors can understand the decisions behind the shape of the API, not just what it does today.

---

## Overview

Inline contextual tip or gentle hint row. Sits next to a form field, at the bottom of a section, or embedded in a screen paragraph to guide the user with a short bit of copy. Smaller and quieter than [`Alert`](./ALERT-PLAN.md) — Alert is a full-width banner with a strong background and border; Hint is compact, often has no background at all, and reads as inline advisory copy rather than a system-level notification.

**Locked decisions:**

- **Naming**: `Hint` — reads as "helpful contextual copy" in the way `Alert` reads as "attention-required system notice". Alternate names considered (`Callout`, `Tip`, `Note`, `Advisory`) all felt heavier than the actual use case.
- **Five tones**: `"neutral" | "info" | "success" | "warning" | "danger"`. Neutral is the default and covers the generic "small piece of copy" case where no color signal is needed. The other four match Alert's semantic set so consumers get a coherent palette across the two primitives.
- **Two emphasis modes**: `"ghost"` (default) — no background, tone-colored text + icon on a transparent row; `"soft"` — tinted background matched to the tone. Consumers reach for `soft` when the hint needs to visually separate from the surrounding layout (e.g. next to a sensitive password field).
- **Optional bold title** via `title?: string`. The body wraps under the title in the shared right-column when present. Both fields render `<Text>` with the tone-resolved color.
- **Optional icon slot** via `icon?: ReactNode`. Follows the Alert convention — consumer brings any icon element; ui-kraken wraps it in a color-inheriting `<Text>` container so most icon libraries pick up the tone tint automatically. Falls back gracefully — icons that ignore color simply render their intrinsic color.
- **Compact by default** — smaller font (12pt body / 13pt title) and tighter padding than Alert. This is the primary visual differentiator; a Hint next to a text input should not look like an Alert next to a text input.
- **`dense?: boolean` opt-in** for even tighter spacing (padding drops to spacingXs and gap shrinks). Use when the hint sits directly beneath an Input or CurrencyInput's helper-text region and the parent already provides breathing room.
- **Own color block on the token schema**: `hintColors` with 5 tones × 3 slots (`text`, `icon`, `background`). Same nested shape as Alert. Provider-level + per-instance overrides.
- **Per-instance override**: `hintColors?: Partial<HintToneColors>` applies to the tone the consumer picked — no cross-tone leakage. Matches Alert's `alertColors?` shape.
- **Compound shortcuts**: `Hint.Info`, `Hint.Success`, `Hint.Warning`, `Hint.Danger` for ergonomic consumption. No `Hint.Neutral` — that's the base `<Hint>` default.
- **Extends `XStack`**: horizontal row, icon left, content right. Every Tamagui `XStackProps` flows through the spread.
- **Accessibility**: `accessibilityRole="text"` by default (Hint is advisory, not interactive). `warning` + `danger` tones set `accessibilityLiveRegion="polite"` so late-appearing hints get announced without stealing focus.

## API

### Props

`HintProps` re-declares only what is OURS. Every Tamagui `XStackProps` flows through the `...rest` spread.

```ts
export type HintTone = "neutral" | "info" | "success" | "warning" | "danger";

export type HintEmphasis = "ghost" | "soft";

export type HintColorsInput = Partial<HintToneColors>;

export interface HintProps extends Omit<XStackProps, "children"> {
  /** Semantic tone. Drives which slot on `hintColors` is used. Default: `"neutral"`. */
  tone?: HintTone;
  /**
   * Visual weight.
   *
   * - `"ghost"` (default) — transparent background, tone-colored text + icon.
   * - `"soft"` — tinted background matched to the tone.
   */
  emphasis?: HintEmphasis;
  /**
   * Compact spacing mode — padding and gap shrink one step. Use next
   * to Input / CurrencyInput helper-text regions where the parent
   * already provides breathing room.
   */
  dense?: boolean;
  /** Optional leading icon slot. Any ReactNode; tone-tinted via a color-inheriting wrapper. */
  icon?: ReactNode;
  /** Optional bold heading rendered above the body. */
  title?: string;
  /** Body content. Strings are wrapped in `<Text>`; ReactNodes render as-is. */
  children?: ReactNode;
  /**
   * Per-instance color override applied to the tone the consumer
   * picked. Missing slots fall through to the provider palette.
   */
  hintColors?: HintColorsInput;
  /** Root testID. Default: `"hint"`. */
  testID?: string;
}
```

### Tone × slot mapping

Every tone maps to a 3-slot block on `hintColors`:

| Slot         | Paints                                                                  |
| ------------ | ----------------------------------------------------------------------- |
| `text`       | Both the title and body text.                                           |
| `icon`       | The icon-slot wrapper's color (consumer's icon inherits via ReactNode). |
| `background` | Row background — only rendered when `emphasis="soft"`.                  |

### Per-instance override

```tsx
<Hint tone="info" hintColors={{ text: "#1E3A8A", background: "#DBEAFE" }} emphasis="soft">
  Your session will end in 5 minutes.
</Hint>
```

### Sub-element testIDs

`Hint` derives these testIDs from the root ID:

- root: `"hint"` (overridable via `testID`)
- icon wrapper (when `icon` is passed): `"{root}-icon"`
- title (when `title` is passed): `"{root}-title"`
- body (when `children` is passed): `"{root}-body"`

### A11y

Defaults:

- `accessibilityRole="text"` — Hint is advisory copy, not a system alert.
- `accessibilityLiveRegion="polite"` on `warning` + `danger` tones so late-mounted hints get announced.
- `accessibilityLiveRegion="none"` on neutral / info / success (default; no announcement).

Both flow through the spread — consumers can bump `warning` up to `assertive` or drop the role entirely on a decorative hint.

## Token schema

Hint introduces its own **`hintColors`** block on `Tokens`. Zero reuse of Alert's block — Hint's palette leans softer and lower-contrast than Alert's since it renders inline rather than as a full banner.

```tsx
<UIKitProvider
  tokens={{
    hintColors: {
      info: { text: "#1E40AF", icon: "#2563EB", background: "#EFF6FF" },
    },
  }}
  dark={{
    hintColors: {
      info: { text: "#93C5FD", icon: "#60A5FA", background: "#1E3A8A" },
    },
  }}
>
  <App />
</UIKitProvider>
```

### `HintColors` interface

Nested (tone → 3 slots).

```ts
export interface HintToneColors {
  text: string;
  icon: string;
  background: string;
}

export interface HintColors {
  neutral: HintToneColors;
  info: HintToneColors;
  success: HintToneColors;
  warning: HintToneColors;
  danger: HintToneColors;
}
```

### Default light palette

Tuned for inline copy on a white surface — text colors slightly darker than Alert's since Hint carries less visual weight to compensate. `background` slots are pale tints for `emphasis="soft"`.

```ts
export const DEFAULT_LIGHT_HINT_COLORS: HintColors = {
  neutral: { text: "#4B5563", icon: "#6B7280", background: "#F3F4F6" },
  info: { text: "#1E40AF", icon: "#2563EB", background: "#EFF6FF" },
  success: { text: "#065F46", icon: "#059669", background: "#ECFDF5" },
  warning: { text: "#92400E", icon: "#D97706", background: "#FFFBEB" },
  danger: { text: "#991B1B", icon: "#DC2626", background: "#FEF2F2" },
};
```

### Default dark palette

Inverse rhythm — text uses lighter tone shades, backgrounds use deeper tinted grays so `emphasis="soft"` reads as a subtle differentiation from `Surface.base`.

```ts
export const DEFAULT_DARK_HINT_COLORS: HintColors = {
  neutral: { text: "#D1D5DB", icon: "#9CA3AF", background: "#1F2937" },
  info: { text: "#93C5FD", icon: "#60A5FA", background: "#1E3A8A" },
  success: { text: "#6EE7B7", icon: "#34D399", background: "#064E3B" },
  warning: { text: "#FCD34D", icon: "#FBBF24", background: "#78350F" },
  danger: { text: "#FCA5A5", icon: "#F87171", background: "#7F1D1D" },
};
```

### Flatten to Tamagui tokens

`flattenHintColors()` produces the flat `$uiHint{Tone}{Slot}` token map wired into `buildConfig()`:

```
uiHintNeutralText  uiHintNeutralIcon  uiHintNeutralBackground
uiHintInfoText     uiHintInfoIcon     uiHintInfoBackground
uiHintSuccessText  uiHintSuccessIcon  uiHintSuccessBackground
uiHintWarningText  uiHintWarningIcon  uiHintWarningBackground
uiHintDangerText   uiHintDangerIcon   uiHintDangerBackground
```

### Merge helper

```ts
export function mergeHintColors(base: HintColors, override?: HintColorsInput): HintColors;
export function mergeHintToneColors(
  base: HintToneColors,
  override?: Partial<HintToneColors>
): HintToneColors;
```

Same signature pair as `mergeAlertColors` / `mergeAlertVariantColors`.

## File structure

```
packages/ui-kraken/src/components/hint/
├── hint.tsx           # component logic + resolvePalette + IconTintOverride
├── hint.styled.ts     # StyledHint (XStack), StyledHintIconWrapper, StyledHintContent,
│                      # StyledHintTitle, StyledHintBody
├── hint-types.ts      # HintTone, HintEmphasis, HintColorsInput, HintProps
├── hint.spec.tsx      # unit tests + describe("snapshots") block
├── hint.stories.tsx   # Storybook (~8 stories)
├── README.md          # props table + usage + Platform support
└── index.ts           # explicit named exports
```

Token / provider wiring per [`creating-component-tamagui` Section 11](../.agents/skills/creating-component-tamagui/SKILL.md).

## Testing

**Coverage target: 100%** on the component (per the "todo probado" rule).

### Behavioral coverage (~18 tests)

- Renders default `testID="hint"` + custom testID
- Default `tone="neutral"` + default `emphasis="ghost"` (no background paint)
- Each of the 5 tones resolves to the correct text + icon slot (parametrized `it.each`)
- `emphasis="soft"` renders the tone's background; `emphasis="ghost"` renders transparent
- Icon slot mounts only when `icon` is passed; `-icon` testID present/absent
- Title mounts only when `title` is passed; `-title` testID present/absent
- Body wraps a string in `<Text>`; ReactNode children render as-is
- Per-instance `hintColors` override wins on the resolved tone (parametrized across slots)
- Per-instance override on tone X does NOT leak to tone Y
- Provider-level palette propagates through `useUIKit()`
- Dark palette resolves when `activeTheme === "dark"`
- `dense` prop trims padding + gap (verify via style / snapshot)
- Compound shortcuts (`Hint.Info` / `.Success` / `.Warning` / `.Danger`) render correct tone
- `accessibilityLiveRegion` defaults: none for neutral/info/success, polite for warning/danger
- Tamagui pass-through (padding, margin, borderRadius) flows through spread

### Structural snapshots (~7)

- Each tone × ghost emphasis (5 snapshots)
- Warning tone × soft emphasis (1 snapshot showing soft background paint)
- Dark palette × info tone × soft (1 snapshot)

## Storybook (~8 stories)

- `Neutral` — default `<Hint>` with body text only
- `WithIcon` — info tone + icon + body
- `WithTitleAndBody` — success tone + title + body
- `Soft` — warning tone + `emphasis="soft"` background
- `Dense` — info tone + `dense` next to a "field" placeholder
- `AllTones` — 5 hints stacked showing each tone in `soft` emphasis
- `CustomColors` — brand-tinted per-instance override
- `DarkTheme` — the AllTones composition in dark mode

## Example app screen

`apps/example/app/(pages)/components/hint.tsx` — 5 sections:

1. **All tones** — 5 `<Hint>` rows stacked (neutral → danger) in ghost emphasis.
2. **Ghost vs soft** — one row per emphasis mode side by side, both info tone.
3. **With title + icon** — a success hint carrying a title, body, and leading icon (`Text` glyph placeholder).
4. **Dense mode** — a fake `Input` label + row + dense info hint underneath (simulating a form-field advisory).
5. **Per-instance brand palette** — an info hint with a custom `{ text, background }` override.

Plus route registration + row on the components home.

## Non-goals

- **No dismiss button** — Hint is contextual copy, not a notification. If the tip must be dismissable, the consumer wraps in a `<Pressable>` and hides it themselves (or uses `Alert` which is closer to a system message).
- **No auto-mount animation** — Hint appears instantly. Animation belongs to whatever container is mounting/unmounting the Hint.
- **No `size` variants** (`sm` / `md` / `lg`) — the `dense` toggle covers 90% of the "smaller when needed" use case without ballooning the API.
- **No icon library dependency** — consumer brings any icon element. Same convention as Alert.
- **No block-level compound** (`Hint.Section` for full-width) — Alert already covers full-width banners. Hint stays inline.
- **No embedded action button** — that's Alert territory. Hint is a leaf advisory row.

## How to ship

Executed on branch `feat/duna-migration-batch-1`:

1. Token schema wiring (types + defaults + flatten + provider + barrels).
2. Component files: `hint-types.ts` → `hint.styled.ts` → `hint.tsx` → `hint.spec.tsx` (+ snapshots) → `hint.stories.tsx` → `README.md` → `index.ts`.
3. Barrels: `components/index.ts` + `src/index.ts`.
4. Example: screen + route + components-home row.
5. Flip status here (`planned` → `shipped on <YYYY-MM-DD>`).
6. Flip Batch 1 plan doc: ⏳ → ✅ on Hint's row.
7. Verify green + **100% coverage on `hint.tsx`** via `pnpm --filter ui-kraken test:coverage`.
8. Atomic commit with rich body.

## How to extend

- **Add a `dismissible` mode** — `onDismiss?: () => void` renders a trailing close button in the right column. Would blur the "advisory-only" positioning; probably better as a separate `DismissableHint` if demand emerges.
- **Add a `link` compound slot** — `action?: { label: string; onPress: () => void }` renders inline as an underlined pressable text. Cleaner than embedding a `<Pressable>` under the body via children.
- **Add auto-truncation** — `numberOfLines?: number` prop that clamps the body. Currently the body wraps freely.
- **Add a `sm` / `md` / `lg` size scale** — if the two-level `dense` boolean turns out too coarse.
