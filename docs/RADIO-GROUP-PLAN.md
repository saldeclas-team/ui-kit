# RadioGroup — design record

**Status:** shipped on 2026-07-25 in ui-kraken v0.7.0.

Living design doc for the `RadioGroup` primitive. Kept post-shipping so future contributors can understand the decisions behind the shape of the API, not just what it does today.

---

## Overview

Group of mutually-exclusive selectable options (single-choice picker). Common uses: form radio questions, filter groups, settings segmented choices, "yes / no" prompts, "small / medium / large" pickers.

**Locked decisions:**

- **Naming**: `RadioGroup` — matches every mature RN / React design system (Radix, MUI, Chakra, Ant, NativeBase, Reach UI). Not `Radio` on its own — a lone radio outside a group is a checkbox with worse ergonomics. The component owns the group semantics.
- **Controlled only**: `value: T | null` + `onChange: (v: T) => void`. No `defaultValue` / uncontrolled mode in v1 — consumers wrap in `useState`.
- **Generic value type**: `RadioGroup<T extends string = string>` so `<RadioGroup<"yes" | "no">>` gives full type-safety on `value`, `onChange`, and `options[].value`. The generic defaults to `string` for the 80% case where consumers do not want to reach for the type param.
- **Options as data**: `options: Array<{ value: T; label: string }>` — data-driven, not JSX-driven. Enables `.map()` / `.filter()` from server data. `label` is a string in v1; rich content is a future addition documented in Non-goals.
- **Orientation**: `orientation?: "vertical" | "horizontal"`. Vertical is the mobile default (stacked cards). Horizontal is for tight segmented pickers like "S / M / L" or "1 / 2 / 3 / 4". A single style-prop switch inside `radio-group.styled.ts`; small code, big usability win. Ships in v1.
- **Colors — own token block**: RadioGroup defines its own `radioGroupColors` on the token schema. Provider-level overrides + per-instance overrides. Zero coupling to `textColors` or any other component's palette (per the [each-component-owns-color-space](../../.claude/…/each-component-owns-color-space.md) rule).
- **Per-instance override**: `radioGroupColors?: Partial<RadioGroupColors>` prop. Every slot optional; missing slots fall through to the provider-resolved defaults.
- **Accessibility**: container gets `accessibilityRole="radiogroup"`; every option row gets `accessibilityRole="radio"` + `accessibilityState={{ selected, disabled }}`. 48 × 48 px minimum touch target per option (skill requirement).

## API

### Props

`RadioGroupProps<T>` re-declares only props that are OURS. Every Tamagui style prop that `StyledRadioGroup` accepts flows through `...rest` with types inferred from `GetProps<typeof StyledRadioGroup>`.

```ts
export interface RadioOption<T extends string = string> {
  value: T;
  label: string;
}

export interface RadioGroupProps<T extends string = string> extends Omit<
  GetProps<typeof StyledRadioGroup>,
  "children" | "onChange"
> {
  /** Controlled selection. `null` = nothing selected. */
  value: T | null;
  /** Fires on tap of an unselected option. Never fires for a tap on the already-selected option. */
  onChange: (value: T) => void;
  /** Enumerated choices. `label` is displayed; `value` is the identity. */
  options: RadioOption<T>[];
  /** Optional bold heading above the group. */
  label?: string;
  /** Disables all options at once. Individual per-option disabling is a Non-goal for v1. */
  disabled?: boolean;
  /** Layout direction. Default: `"vertical"`. */
  orientation?: "vertical" | "horizontal";
  /** Border radius on each option row. Same shape as `ButtonRadius` / `AlertRadius`. Default: `"md"`. */
  radius?: RadioRadius;
  /**
   * Per-instance color override. Missing slots fall through to the provider-resolved
   * palette. Enables brand-color radios without touching the provider.
   */
  radioGroupColors?: Partial<RadioGroupColors>;
  /**
   * Root testID. Sub-elements derive:
   * `{testID}-label`, `{testID}-option-{value}`,
   * `{testID}-option-{value}-circle`, `{testID}-option-{value}-dot`,
   * `{testID}-option-{value}-label`.
   */
  testID?: string;
}
```

### Radius

`RadioRadius = "none" | "sm" | "md" | "lg" | "pill" | number` — same shape as `ButtonRadius` / `AlertRadius`. Default `"md"`. Applies to the option **row** (the pressable card around each choice), not to the ring — the ring stays perfectly circular (`radius: 9999`, non-configurable).

### Per-instance override

```tsx
<RadioGroup
  value={size}
  onChange={setSize}
  options={SIZES}
  orientation="horizontal"
  radioGroupColors={{ selectedBorder: "#FF6B00", dot: "#FF6B00" }}
/>

<RadioGroup
  value={owner}
  onChange={setOwner}
  options={OWNER_OPTIONS}
  radioGroupColors={{
    selectedBorder: "#059669",
    unselectedBorder: "#D1FAE5",
    dot: "#059669",
    label: "#064E3B",
    groupLabel: "#064E3B",
    selectedBackground: "#F0FDF4",
  }}
/>
```

Every field on `Partial<RadioGroupColors>` is optional. Missing slots fall through to the provider-resolved palette.

### A11y

- Container: `accessibilityRole="radiogroup"` + `accessibilityLabel` set to the `label` prop when provided. Screen readers announce "radio group, `<label>`".
- Each option: `accessibilityRole="radio"` + `accessibilityState={{ selected, disabled }}`. Screen readers announce "radio button, `<option.label>`, selected / unselected, 1 of N".
- Every option row's touch target is at least **48 × 48 px** (skill requirement — minimum touch target on interactive elements).
- Tap on an already-selected option is a **no-op** (does not fire `onChange`) — matches native platform behavior; prevents redundant re-renders.
- `disabled=true` propagates to `accessibilityState.disabled` on every option AND blocks `onChange`.

### Sub-element testIDs

Root `testID` (default `"radio-group"`) propagates deterministically:

- `{testID}` — root container (`<StyledRadioGroup>`)
- `{testID}-label` — group heading (present only when `label != null && label.length > 0`)
- `{testID}-option-{value}` — pressable option row (one per option)
- `{testID}-option-{value}-circle` — the ring around the dot
- `{testID}-option-{value}-dot` — inner filled dot (present only when `value === option.value`)
- `{testID}-option-{value}-label` — option label text

Consumer tests query by these deterministic IDs instead of by text — safer across i18n.

## Token schema

RadioGroup introduces its own **`radioGroupColors`** block on `Tokens`. Zero reuse of other component palettes. Consumers override at the provider level:

```tsx
<UIKitProvider
  tokens={{
    radioGroupColors: {
      selectedBorder: "#7C3AED",
      dot: "#7C3AED",
      selectedBackground: "#F5F3FF",
    },
  }}
  dark={{
    radioGroupColors: {
      selectedBorder: "#A78BFA",
      dot: "#A78BFA",
    },
  }}
>
  <App />
</UIKitProvider>
```

### `RadioGroupColors` interface

```ts
export interface RadioGroupColors {
  /** Ring border + row border when option is selected. */
  selectedBorder: string;
  /** Ring border + row border when option is NOT selected. */
  unselectedBorder: string;
  /** Inner filled dot on the selected option. */
  dot: string;
  /** Option label text color. */
  label: string;
  /** Group heading text color (the `label` prop). */
  groupLabel: string;
  /** Subtle row background tint when option is selected. Optional (defaults to transparent). */
  selectedBackground?: string;
  /** Row background when option is NOT selected. Optional (defaults to transparent). */
  unselectedBackground?: string;
}
```

### Default light palette

Tuned for WCAG AA contrast on white / near-white surfaces. Selected color mirrors the brand blue used across Button / Text.

```ts
export const DEFAULT_LIGHT_RADIO_GROUP_COLORS: RadioGroupColors = {
  selectedBorder: "#2563EB", // Blue-600
  unselectedBorder: "#9CA3AF", // Gray-400
  dot: "#2563EB", // Blue-600
  label: "#0B0B0F", // near-black
  groupLabel: "#0B0B0F",
  selectedBackground: "#EFF6FF", // Blue-50 tint
  unselectedBackground: undefined, // transparent
};
```

### Default dark palette

Lighter brand blue so it pops on a dark surface; higher-contrast border for unselected rings.

```ts
export const DEFAULT_DARK_RADIO_GROUP_COLORS: RadioGroupColors = {
  selectedBorder: "#60A5FA", // Blue-400
  unselectedBorder: "#6B7280", // Gray-500
  dot: "#60A5FA", // Blue-400
  label: "#F5F5F7",
  groupLabel: "#F5F5F7",
  selectedBackground: "#1E3A8A33", // Blue-900 at ~20% alpha
  unselectedBackground: undefined,
};
```

### Flatten to Tamagui tokens

`flattenRadioGroupColors()` produces the flat `$ui*` token map wired into `buildConfig()`:

```
uiRadioGroupSelectedBorder
uiRadioGroupUnselectedBorder
uiRadioGroupDot
uiRadioGroupLabel
uiRadioGroupGroupLabel
uiRadioGroupSelectedBackground   // omitted if undefined
uiRadioGroupUnselectedBackground // omitted if undefined
```

Wired into both `themes.light` and `themes.dark` so `<Theme name="dark">` flips every reference automatically.

### Merge helper

```ts
export function mergeRadioGroupColors(
  base: RadioGroupColors,
  override?: Partial<RadioGroupColors>
): RadioGroupColors;
```

Same signature and shape as `mergeTextColors()`. Called inside `UIKitProvider` for both light and dark passes.

## File structure

```
packages/ui-kraken/src/components/radio-group/
├── radio-group.tsx              # component logic + resolvePalette helper
├── radio-group.styled.ts        # StyledRadioGroup + StyledRadioGroupLabel + StyledRadioOptionRow + StyledRadioOptionCircle + StyledRadioOptionDot + StyledRadioOptionLabel
├── radio-group-types.ts         # RadioOption, RadioRadius, RadioGroupColors, RadioGroupProps
├── radio-group.spec.tsx         # unit tests + describe("snapshots") block
├── radio-group.stories.tsx      # Storybook (~8 stories)
├── README.md                    # props table + usage + Platform support (iOS · Android · Web)
└── index.ts                     # explicit named exports (RadioGroup + 4 types)
```

Token / provider wiring:

- `packages/ui-kraken/src/tokens/tokens-types.ts` — add `RadioGroupColors` + add `radioGroupColors: RadioGroupColors` field to `Tokens`
- `packages/ui-kraken/src/tokens/tokens-derive.ts` — add `DEFAULT_LIGHT_RADIO_GROUP_COLORS` + `DEFAULT_DARK_RADIO_GROUP_COLORS` + `mergeRadioGroupColors()`; update `DEFAULT_TOKENS` + `DEFAULT_DARK_TOKENS` + `coarseToFineTokens()`
- `packages/ui-kraken/src/tokens/tokens.ts` — add `flattenRadioGroupColors()`; wire into `buildConfig()` `tokens.color`, `themes.light`, `themes.dark`; re-export defaults + merge helper
- `packages/ui-kraken/src/provider/provider-types.ts` — add optional `radioGroupColors?: Partial<RadioGroupColors>` to `TokensInput`
- `packages/ui-kraken/src/provider/provider.tsx` — extend `useMemo` merge to call `mergeRadioGroupColors()` for both `mergedLight` and `mergedDark`

Barrel updates:

- `packages/ui-kraken/src/components/index.ts` — re-export `RadioGroup` + 4 types
- `packages/ui-kraken/src/index.ts` — public barrel

Example app:

- `apps/example/app/(pages)/components/radio-group.tsx` — full showcase (5 sections)
- `apps/example/app/_layout.tsx` — register `Stack.Screen` with `headerBackTitle: "Components"`
- `apps/example/app/(pages)/index.tsx` — add RadioGroup components-home row with `status: "shipped"`

## Testing (Jest + RTL v14 + jest-expo)

Same shape as Alert / Button / Text specs. Mock `./radio-group.styled` with `rn.View` / `rn.Text` stubs so the component logic is tested without booting Tamagui. Mock `../../provider/use-ui-kit` with a `MockUIKit` type to swap themes per-test.

### Behavioral coverage (~18 targeted tests)

- Renders all options
- Renders `label` when provided; omits label testID when not
- Selected option shows the dot; unselected options do NOT
- Tap on unselected option fires `onChange` with correct value
- Tap on already-selected option does NOT fire `onChange`
- `disabled` blocks `onChange` on tap
- `disabled` propagates to `accessibilityState.disabled` on every option
- `orientation="horizontal"` sets the correct `flexDirection` on the root
- `orientation="vertical"` (default) sets column layout
- Per-slot `radioGroupColors` override applies (parametrized `it.each` over 7 slots)
- `radius="pill"` → 9999; `"none"` → 0; preset → `$uiRadius*`; number passthrough
- `accessibilityRole` on container = `"radiogroup"`, on each option = `"radio"`
- `accessibilityState.selected` matches `value === option.value` per option
- Generic value type — TypeScript-only smoke: `RadioGroup<"yes" | "no">` compiles
- Provider-level palette overrides propagate through `useUIKit()` — mock returns a custom `radioGroupColors` block, assert every option uses it
- `groupLabel` text color follows the palette

### Structural snapshots (`describe("snapshots")`, ~12 total)

- 2 orientations × default 2-option group (2)
- Selected vs unselected initial state (2)
- With label, without label (2)
- Disabled state (1)
- Dark theme × default 2-option group (1)
- Per-instance `radioGroupColors` override — all 7 slots set (1)
- Horizontal 3-option "S / M / L" group (1)
- Radius presets — pill on a vertical group (1)
- Custom-palette provider override — assert selected/dot use the custom color (1)

Intentional snapshot changes: `pnpm --filter ui-kraken test -- -u`, review diff, commit both.

## Storybook (~8 stories)

- `Default` — vertical 2-option group, nothing selected
- `WithSelection` — vertical 2-option group, one preselected
- `WithLabel` — vertical group with a heading
- `Horizontal` — 3-option "S / M / L" segmented horizontal group
- `Disabled` — vertical group, `disabled=true`
- `RadiusPresets` — 5 rows demonstrating none / sm / md / lg / pill
- `CustomColors` — brand-orange override on `selectedBorder` + `dot`
- `DarkTheme` — vertical group inside `<Theme name="dark">`

Every story is one Chromatic snapshot on Storybook Web. Adding a variant without adding a story is an unreviewed regression risk.

## Example app screen

`apps/example/app/(pages)/components/radio-group.tsx` — 5 sections using the `<Section>` wrapper:

1. **Basic** — controlled 2-option vertical group ("Sí / No"), shows the selected value below the group.
2. **With label** — same but with a bold heading.
3. **Horizontal** — 3-option segmented "Small / Medium / Large".
4. **Disabled** — full group disabled.
5. **Custom colors** — brand-color override showing `radioGroupColors` in action.
6. **Radius presets** — 5 rows demonstrating each `radius` value.

Register the route in `_layout.tsx` (`headerBackTitle: "Components"`) and add a `status: "shipped"` components-home row in `(pages)/index.tsx`.

## Non-goals

Documented so future contributors know these were considered and deliberately deferred:

- **No standalone `<Radio>`** — a radio without a group is a poorly-designed checkbox. Enforce the pattern by only shipping the group.
- **No `defaultValue` / uncontrolled mode** — v1 is controlled only. If demand surfaces, add `defaultValue` in a minor release; API-safe because passing `value` continues to override the internal state.
- **No rich option content** (`description`, `icon` per option) — v1 is `label: string` only. A follow-up minor can extend `RadioOption` with optional `description?: string` + `icon?: ReactNode` without breaking existing consumers.
- **No `renderOption` render prop** — extension goes via data first (`description` / `icon` fields), escape hatch second. A render prop now would fragment the surface.
- **No inline error state** (`error?: string`) — validation UX belongs in a future `FormField` wrapper that composes RadioGroup + label + error text uniformly across all form primitives.
- **No per-option `disabled`** — v1 disables the whole group. Per-option disabling can land as `RadioOption.disabled?: boolean` in a later minor; MVP does not need it.
- **No `size` prop** — the touch target must be 48 px minimum for accessibility regardless. Consumers who want a compact look use `orientation="horizontal"` and lean on natural width contraction.
- **No animation on the dot appearing** — pure state flip in v1. A Reanimated transition can land later without an API change.

## How to ship

Branch: `feat/radio-group-component` (already cut).

Order of implementation:

1. **Token schema** — extend `tokens-types.ts`, `tokens-derive.ts`, `tokens.ts` with `RadioGroupColors` + defaults + merge helper + flatten
2. **Provider wiring** — extend `provider-types.ts` `TokensInput` + `provider.tsx` `useMemo` merge (both light + dark)
3. **Component** — `radio-group-types.ts` → `radio-group.styled.ts` → `radio-group.tsx`
4. **Tests** — `radio-group.spec.tsx` targeted asserts + `describe("snapshots")` block; regenerate snapshots on first pass
5. **Storybook** — `radio-group.stories.tsx` (8 stories)
6. **Docs** — `README.md` for the component
7. **Barrels** — `radio-group/index.ts` → `components/index.ts` → `src/index.ts`
8. **Example** — new screen + route registration + components-home row
9. **Flip status** in this doc to `shipped on <YYYY-MM-DD> in ui-kraken v0.7.0`
10. **Verify**: `pnpm typecheck && pnpm -r lint && pnpm test && pnpm --filter ui-kraken build`
11. **Changeset** — bundled with the Alert refactor + provider rename into a single `0.7.0` minor bump

## How to extend

Post-launch API growth paths that stay backward-compatible:

- **Rich option content** — extend `RadioOption` with optional `description?: string` + `icon?: ReactNode`; the component renders them when present, nothing when absent. Existing consumers unaffected.
- **Uncontrolled mode** — add optional `defaultValue?: T`; when `value` is `undefined`, fall back to internal `useState(defaultValue ?? null)`. Passing `value` continues to override.
- **Per-option disabled** — add optional `disabled?: boolean` to `RadioOption`; component OR's it with the group-level `disabled` prop.
- **Checkbox variant** — build `<CheckboxGroup>` as a **separate** component that reuses the same palette-derivation helper. Do NOT bolt multi-select onto RadioGroup — one component, one job.
- **Segmented "button" chrome** — add `variant: "cards" | "segmented"` where `"segmented"` merges adjacent rows into a pill-shaped bar with dividers. Same options data, different chrome; new default palette slots land under the same token block.
- **Animated dot transition** — wrap the dot in `Animated.View` + `withTiming` on `selected` change. Purely internal, no API change.
- **Provider-level slot overrides for brand theming** — already supported today via `<UIKitProvider tokens={{ radioGroupColors: {...} }}>`. No API change needed.
