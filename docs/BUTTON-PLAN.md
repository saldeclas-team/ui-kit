# Button — design record

**Status:** shipped in v0.2.0 (initial cut in v0.1.0) — see the [component README](../packages/ui-kraken/src/components/button/README.md) and the git history for the incremental commits.

Living design doc for the `Button` primitive — the very first component ui-kraken shipped, and the one that established every convention the rest of the library follows. Kept post-shipping so future contributors can understand the decisions behind the shape of the API.

---

## Overview

Interactive button that covers the classic 80% of button use cases in a mobile app: submit / cancel / delete / add / skip. Locked decisions from the design workflow that preceded v0.2.0:

- **Naming**: `Button` — no debate needed; it's the RN convention and matches every design system in the wild.
- **Tone set (5)**: `primary`, `secondary`, `outline`, `ghost`, `destructive`. Rejected shipping only three (primary / secondary / destructive) — the maintainer wanted `outline` and `ghost` on day one because they cover common "cancel" / "skip" / "meta action" cases that would otherwise force a workaround.
- **Compound API**: `Button.Primary` / `Button.Secondary` / `Button.Outline` / `Button.Ghost` / `Button.Destructive` — PascalCase (React JSX convention). Default `Button` export **aliases `Button.Primary`** so `<Button>Save</Button>` covers the 80% case without a compound prefix.
- **Sizes**: `sm` / `md` / `lg` — kept minimal. Bigger apps can add per-instance style props.
- **States**: `disabled` and `loading` — both apply `opacity: 0.45`. No separate "inactive color" slot; the maintainer explicitly asked to keep opacity as the single inactivation signal rather than growing the token surface.
- **Icon slots**: `leftIcon` + `rightIcon`, both `ReactNode`. No icon library dependency — consumer brings their own.
- **Radius**: `radius?: number | "none" | "sm" | "md" | "lg" | "pill"` — mixed preset + escape hatch. Presets map to the theme scale, `"pill"` is 9999, a raw number is passed through as px.
- **Elevation**: `elevation?: "none" | "sm" | "md" | "lg"` — hardcoded shadow presets (no theme knob in v0.2). Dark mode swaps shadow for a translucent-white border because black shadows are invisible on dark surfaces (see "Dark-mode elevation swap" below).
- **Per-instance color override**: `buttonColors?: Partial<{ background?, label, border? }>` — same slots as the provider-level variant palette but every field optional. Missing slots fall through to the theme. Variant is implicit because you already picked it (`Button.Primary` already selected the variant).
- **`testID` propagation**: `testID` on the root propagates deterministic subelement IDs — `{testID}-label`, `{testID}-left-icon`, `{testID}-right-icon`, `{testID}-loader` — so tests never have to reach for `getByText`.

## API

### Props

`ButtonProps` re-declares only props that are OURS. Every Tamagui style prop (`onPress`, `paddingHorizontal`, `animation`, `pressStyle`, `hoverStyle`, shorthand aliases like `px` / `py`, etc.) flows through the `...rest` spread — they arrive typed via `GetProps<typeof StyledButton>` inference.

```ts
export interface ButtonProps extends Omit<StyledButtonProps, "children" | "size" | "borderRadius"> {
  children?: ReactNode;
  tone?: ButtonTone; // "primary" | "secondary" | "outline" | "ghost" | "destructive"
  size?: ButtonSize; // "sm" | "md" | "lg"
  radius?: ButtonRadius; // number | "none" | "sm" | "md" | "lg" | "pill"
  elevation?: ButtonElevation; // "none" | "sm" | "md" | "lg"
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  buttonColors?: ButtonColorsInput; // Partial<{ background?, label, border? }>
  testID?: string;
}
```

Notable props that "just work" from the Tamagui `StyledButton` inference:

- **`onPress`** / `onLongPress` / `onPressIn` / `onPressOut`
- **`pressStyle`** / `hoverStyle` — press-in / hover restyle from Tamagui
- **`accessibilityLabel`** / `accessibilityHint` — a11y overrides on top of the auto-set `accessibilityRole="button"` + `accessibilityState`
- Every Tamagui style prop and shorthand alias

### Tone × color slot matrix

The palette is grouped per-tone at the provider level — the whole point of the per-component token schema is that consumers tune each tone independently.

| Tone          | Uses `background` | Uses `label` | Uses `border` | Notes                                                |
| ------------- | :---------------: | :----------: | :-----------: | ---------------------------------------------------- |
| `primary`     |        ✅         |      ✅      |       —       | Solid surface, brand primary                         |
| `secondary`   |        ✅         |      ✅      |       —       | Solid surface, brand secondary                       |
| `outline`     |         —         |      ✅      |      ✅       | Transparent surface, colored border + matching label |
| `ghost`       |         —         |      ✅      |       —       | Pure text — no background, no border                 |
| `destructive` |        ✅         |      ✅      |       —       | Solid surface, red-family                            |

`outline` and `ghost` share the same label color pattern (label = brand color) but only `outline` renders a border.

### Sizes

| `size` | Height | Horizontal padding | Font size |
| ------ | -----: | -----------------: | --------: |
| `sm`   |     36 |                 12 |        14 |
| `md`   |     44 |                 16 |        16 |
| `lg`   |     56 |                 20 |        18 |

Height also drives the default `radius` when the prop is omitted.

### Radius

`radius?: number | "none" | "sm" | "md" | "lg" | "pill"`:

- `"none"` → 0
- `"sm"` / `"md"` / `"lg"` → theme scale (`$krakenRadiusSm` / `Md` / `Lg`)
- `"pill"` → 9999 (fully rounded)
- `number` → raw pixel value

When omitted, the radius is derived from `size` — each size ships a sensible default so a plain `<Button.Primary size="lg">` reads as a big, appropriately-rounded button without extra props.

### Elevation

`elevation?: "none" | "sm" | "md" | "lg"` — default `"none"` (flat). Values map to hardcoded shadow config in `button.tsx` (`FLAT_ELEVATION` + `LIGHT_ELEVATION[level]`). No theme knob in v0.2 — deferred until a real consumer asks.

Under the hood it emits both iOS shadow props (`shadowColor` / `shadowOpacity` / `shadowRadius` / `shadowOffset`) AND Android `elevation` so it works on both platforms.

**Dark-mode elevation swap** (implemented in `useElevationStyle`): black shadows are invisible on a dark surface. When `activeTheme === "dark"` and `elevation !== "none"`, Button:

1. Cancels every shadow prop (sets `shadowColor` to `"transparent"` and Android `elevation` to `0`).
2. Renders a translucent-white border instead, with opacity scaling by level (`sm` → 0.08, `md` → 0.12, `lg` → 0.16).

Skipped for `outline` / `ghost` tones (they own their border), and yields to any explicit `buttonColors.border` override. The pattern was lifted from how Linear / Notion / Vercel handle elevated cards in dark mode.

### Loading + disabled

Both apply `opacity: 0.45` and set the underlying Tamagui `disabled` prop so `pressStyle` doesn't fire. `loading` additionally:

- Replaces `leftIcon` with a native `<ActivityIndicator>` colored by `buttonColors?.label` (falls back to Tamagui's default label color).
- Wraps it in a `View` with `testID={rootId + "-loader"}` for deterministic test access.
- Sets `accessibilityState.busy: true`.

### Per-instance color override

```tsx
<Button.Primary buttonColors={{ background: "#FF6B00", label: "#FFFFFF" }}>
  Custom brand
</Button.Primary>

<Button.Ghost buttonColors={{ label: "#DC2626" }}>Danger ghost</Button.Ghost>

<Button.Outline buttonColors={{ border: "#FF6B00", label: "#FF6B00" }}>
  Custom outline
</Button.Outline>
```

Every field on `Partial<KrakenButtonVariantColors>` is optional. Missing slots fall through to the theme palette for the variant that this compound already selected — the API is scoped, not global, so you don't have to redeclare the other four tones just to tweak one.

### Compound namespace

Each tone gets a PascalCase pre-configured shortcut plus the plain `Button` alias:

```tsx
<Button>Save</Button>            {/* → Button.Primary */}
<Button.Primary>Save</Button.Primary>
<Button.Secondary>Alt</Button.Secondary>
<Button.Outline>Alt</Button.Outline>
<Button.Ghost>Skip</Button.Ghost>
<Button.Destructive>Delete</Button.Destructive>
```

Built with `Object.assign(ButtonPrimary, { Primary, Secondary, Outline, Ghost, Destructive })` so both `<Button tone="ghost">` and `<Button.Ghost>` produce the same tree. Consumers can still use the `tone` prop — the shortcuts are sugar.

### Deterministic testIDs

Root `testID` (default `"button"`) propagates to subelements:

- `{testID}` — root Pressable
- `{testID}-label` — the styled label wrapper (present when `children != null`)
- `{testID}-left-icon` — left icon wrapper (present when `leftIcon != null` and NOT loading)
- `{testID}-right-icon` — right icon wrapper (present when `rightIcon != null`)
- `{testID}-loader` — loader wrapper (present when `loading`)

Consumer tests never have to guess or reach for `getByText`.

## Token schema

Per-component grouped color block on `KrakenTokens`. This was the shape the maintainer explicitly asked for after rejecting a global `primaryColor: string` — different components have different color surfaces and should be tuned independently.

```ts
export interface KrakenButtonVariantColors {
  background?: string; // filled by primary / secondary / destructive
  label: string; // required — every variant has a label
  border?: string; // filled by outline
}

export interface KrakenButtonColors {
  primary: KrakenButtonVariantColors;
  secondary: KrakenButtonVariantColors;
  outline: KrakenButtonVariantColors;
  ghost: KrakenButtonVariantColors;
  destructive: KrakenButtonVariantColors;
}

export interface KrakenTokens {
  buttonColors: KrakenButtonColors;
  textColors: KrakenTextColors; // added in v0.3
  radius: number;
  spacing: number;
}
```

Only `label` is required per variant — `outline` skips `background`, `ghost` skips both `background` and `border`. This keeps the token file honest about what each variant actually paints.

### Default light

```ts
export const DEFAULT_LIGHT_BUTTON_COLORS: KrakenButtonColors = {
  primary: { background: "#2563EB", label: "#FFFFFF" }, // Blue-600 on white
  secondary: { background: "#0EA5E9", label: "#FFFFFF" }, // Sky-500
  outline: { border: "#2563EB", label: "#2563EB" },
  ghost: { label: "#2563EB" },
  destructive: { background: "#DC2626", label: "#FFFFFF" }, // Red-600
};
```

### Default dark

```ts
export const DEFAULT_DARK_BUTTON_COLORS: KrakenButtonColors = {
  primary: { background: "#3B82F6", label: "#FFFFFF" }, // Blue-500
  secondary: { background: "#38BDF8", label: "#0B0B0F" }, // Sky-400 (light → dark label for contrast)
  outline: { border: "#60A5FA", label: "#60A5FA" }, // Blue-400
  ghost: { label: "#60A5FA" },
  destructive: { background: "#EF4444", label: "#FFFFFF" }, // Red-500
};
```

Both palettes yield WCAG AA contrast for the label color on the corresponding background.

### Tamagui token flattening

`buildKrakenConfig` flattens `buttonColors` to `$krakenButton{Variant}{Slot}` — flat naming, one token per slot:

```
$krakenButtonPrimaryBackground
$krakenButtonPrimaryLabel
$krakenButtonSecondaryBackground
$krakenButtonSecondaryLabel
$krakenButtonOutlineBorder
$krakenButtonOutlineLabel
$krakenButtonGhostLabel
$krakenButtonDestructiveBackground
$krakenButtonDestructiveLabel
```

These land in both the `light_kraken` and `dark_kraken` themes so a Tamagui `<Theme name="dark">` block flips them all at once.

## File structure

```
packages/ui-kraken/src/components/button/
├── button.tsx              # component logic + compound export + elevation hook + radius resolver
├── button.styled.ts        # StyledButton + StyledButtonLabel with tone/size variants
├── button-types.ts         # ButtonProps, ButtonTone, ButtonSize, ButtonRadius, ButtonElevation, ButtonColorsInput
├── button.spec.tsx         # unit tests
├── button.stories.tsx      # Storybook on-device
├── README.md               # props table + usage
└── index.ts                # explicit named exports
```

Barrel updates that landed with Button:

- `packages/ui-kraken/src/components/index.ts` — re-export Button + types
- `packages/ui-kraken/src/index.ts` — public barrel

Tokens layer (established by Button, extended later by Text):

- `kraken-tokens-types.ts` — `KrakenButtonColors`, `KrakenButtonVariantColors`, `KrakenTokens`, `ResolvedKrakenTokens`
- `kraken-tokens-derive.ts` — `DEFAULT_LIGHT_BUTTON_COLORS`, `DEFAULT_DARK_BUTTON_COLORS`, `DEFAULT_KRAKEN_TOKENS`, `DEFAULT_DARK_KRAKEN_TOKENS`, `mergeButtonColors`, `mergeButtonVariantColors`, `coarseToFineTokens`
- `kraken-tokens.ts` — `buildKrakenConfig` that flattens the palette and installs it under both themes

Provider (established by Button):

- `kraken-provider-types.ts` — `KrakenTokensInput`, `KrakenButtonColorsInput`, `KrakenProviderProps`, `KrakenThemeMode`
- `kraken-provider.tsx` — `KrakenProvider` mounting `TamaguiProvider` + `KrakenContext`, merging light/dark overrides via `useMemo`
- `use-kraken.ts` — hook returning `{ activeTheme, tokens, tamaguiConfig }` — the raw Tamagui config is intentionally reachable as an escape hatch for power users

Example app:

- `apps/example/app/(pages)/components/button.tsx` — the very first demo screen; established the `Screen` / `Section` layout wrappers reused by every later component demo

## Testing (Jest + RTL v14 + jest-expo)

Mocks `./button.styled` and `../../provider/use-kraken` so the tests run under jest-expo without a live Tamagui/provider tree. Coverage spans the full API:

- Renders label (`children`) when provided.
- Icon-only mode (no `children`) doesn't render the label wrapper.
- Every tone forwards to the styled prop (`primary`, `secondary`, `outline`, `ghost`, `destructive`).
- Every size forwards (`sm` / `md` / `lg`).
- Radius resolution — preset names, raw numbers, `"pill"` → 9999, `undefined` derives from size.
- Elevation resolution — flat when `"none"`, shadow config when set, dark-mode swap to border, override respected via `buttonColors.border`.
- `disabled` and `loading` set `accessibilityState` correctly and block interaction.
- `loading` replaces `leftIcon` with the loader and skips right icon rendering rules unchanged.
- Per-instance `buttonColors` overrides land on the right style props (`background`, `label`, `border`).
- `testID` propagates to `-label`, `-left-icon`, `-right-icon`, `-loader` subelements.
- Compound shortcuts (`Button.Primary`, `Button.Ghost`, etc.) set the correct tone.

## Storybook stories

`button.stories.tsx` — one story per axis for scannability:

- `Default` (primary, md)
- `AllTones` — each of the 5 tones side by side
- `AllSizes` — sm / md / lg × primary
- `Radius` — each preset (`none` / `sm` / `md` / `lg` / `pill`) + a raw number
- `Elevation` — `none` / `sm` / `md` / `lg` across primary
- `WithIcons` — leftIcon, rightIcon, both, icon-only
- `Loading` — `<Button loading>` per tone
- `Disabled` — `<Button disabled>` per tone
- `PerInstanceOverride` — `buttonColors` prop showing scoped customization
- `DarkTheme` — full matrix under `<Theme name="dark">` showing the elevation border swap in action

## Example app screen

`apps/example/app/(pages)/components/button.tsx` — the reference implementation for later component demos. Sections:

1. **Tones** — every compound shortcut side by side.
2. **Sizes** — sm / md / lg column.
3. **Radius** — every preset + a couple of raw numbers.
4. **Elevation** — every level, with a note about the dark-mode border swap.
5. **Loading + disabled** — one row per tone.
6. **With icons** — leftIcon, rightIcon, both, icon-only (Feather icons imported by the example app, NOT by ui-kraken).
7. **Per-instance overrides** — an orange primary, a red ghost, a custom outline.

Catalog home links to this screen at `/components/button`.

## Non-goals (explicitly deferred)

- **Icon library dependency** — Button accepts `leftIcon` / `rightIcon` slots as `ReactNode`; consumer brings their own icon system. Not adding a dependency in v0.x.
- **Auto-contrast label color** — Button does NOT compute `label` from `background`. Consumer picks explicitly. `pickContrastText` is exposed as a utility but never auto-applied — matches the "predictable > opinionated" rule.
- **Elevation as a theme token** — the shadow config is hardcoded per level in v0.2. Once a real consumer asks, we'll surface `elevation.sm/md/lg` in `KrakenTokens` and read from there.
- **Separate `inactive` color slot** — `disabled` and `loading` apply `opacity: 0.45`; no dedicated slot. If a consumer needs a different inactive tint they use `buttonColors.background` per-instance.
- **Long-press haptics** — not baked in. Consumer wires `onLongPress` + `expo-haptics` themselves.
- **Loading with label** — the loader replaces the leftIcon; label stays visible. Not offering a "loader over label" mode until someone asks.
- **`rgb()` / named color inputs on `buttonColors`** — v0.2 accepts hex only. Extending to arbitrary color strings would require a parser dep; deferred until a real consumer asks. (Text's `color` prop DOES accept any string because RN Text passes it through natively — Button plumbs the value into Tamagui theme tokens, which have stricter parsing.)

## How the work shipped

Landed across several PRs on the way to v0.2.0:

1. **v0.1.0 initial cut** (`d2fd1b8`): `feat(ui-kraken): add KrakenProvider, coarse tokens, and the Button component` — three tones, single size, first pass at the token pipeline.
2. **v0.2.0 the real deal** (`8077325`): `feat(ui-kraken): per-component token schema, Button v2 (5 tones + radius), dark mode, catalog` — refactored tokens from a flat `primaryColor: string` to the per-component grouped block (breaking, gated by the v0.2 minor), added `outline` and `ghost` tones, added the `radius` prop, added dark-mode support end-to-end (`dark` prop on provider + `defaultTheme` + `DEFAULT_DARK_KRAKEN_TOKENS`), and shipped the example catalog home.
3. **Testing rework** (`f7f6234`): `test(ui-kraken): realistic coverage thresholds + drop dead override helpers` — pruned utilities that testing revealed were unused.
4. **Elevation feature** (`6b6613d`): `feat(button): add elevation prop with none / sm / md / lg presets` — added hardcoded shadow presets and the iOS shadow + Android elevation dual output.
5. **Dark-mode shadow fix** (`23ec72e` → `9354fa0` → `3cad421`): iterative fix for invisible black shadows on dark surfaces. Landed on the "translucent-white border in dark mode" pattern; also had to null out `shadowColor` + Android `elevation` to fully suppress the invisible shadow layer.

## How to extend

- **New tone** — add to `ButtonTone` in `button-types.ts`, add a variant entry to `variants.tone` in `button.styled.ts` referencing the new palette tokens, extend `KrakenButtonColors` in `kraken-tokens-types.ts`, add defaults to both `DEFAULT_LIGHT_BUTTON_COLORS` and `DEFAULT_DARK_BUTTON_COLORS`, add a compound shortcut in `button.tsx` (register in `Object.assign` map), and add a row to the README table.
- **New size** — add to `ButtonSize`, add the variant entry in `button.styled.ts` (height + horizontalPadding + label size), pick a sensible default `radius`, and update the README size table.
- **New radius preset** — extend `ButtonRadius`, add the mapping branch to `resolveRadius` in `button.tsx`, and document it.
- **New elevation level** — extend `ButtonElevation`, add an entry to `LIGHT_ELEVATION` and `DARK_ELEVATION_BORDER` in `button.tsx`, and add a Storybook row.
- **Auto-contrast helper** — `pickContrastText(hex): "#000" | "#FFF"` already lives in the tokens layer; wire it into Button as an opt-in prop (`autoContrast?: boolean`) rather than making it the default — the maintainer's "predictable > opinionated" rule applies.
