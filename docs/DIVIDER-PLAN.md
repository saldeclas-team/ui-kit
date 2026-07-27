# Divider — design record

**Status:** planned for ui-kraken v0.10.0 (alongside Card). Small layout primitive that unblocks future slot-divider variants in Card, MultiSelect, and any list component that wants visible separators between rows.

Living design doc for the `Divider` primitive. Kept post-shipping so future contributors can understand the decisions behind the shape of the API, not just what it does today.

---

## Overview

Thin line for visual separation between rows, sections, or slots. Horizontal by default; vertical variant for inline separators (e.g. between two icons in a Header row). Extremely narrow surface area — one prop for orientation, one for thickness, one for inset, plus the standard palette + testID conventions every ui-kraken primitive has.

**Locked decisions:**

- **Two orientations — `"horizontal"` (default) and `"vertical"`.** Horizontal renders a full-width row with a 1-px background stripe; vertical renders a full-height column with a 1-px background stripe. `stretch` on the cross-axis so the divider fills whatever container it sits in without a manual `width: '100%'`.
- **One palette slot: `line`.** Divider has exactly one color — the line itself. Light default `#E5E7EB` (gray-200); dark default `#374151` (gray-700). Matches the existing Card / Input border tones so a Divider between two Cards reads as native chrome.
- **`thickness` prop with `1` default.** Numeric px value; Tamagui rounds fractional values per platform. Consumers who want a "hairline" (`StyleSheet.hairlineWidth`) pass it explicitly at the callsite — the ui-kraken preset opts out of that iOS-specific value because it renders inconsistently on Android + web.
- **`inset` prop with `0` default.** Number of px inset on both ends of the line (left + right for horizontal, top + bottom for vertical). Consumers set `inset={16}` for the "iOS grouped list" look where the divider doesn't reach the container edge.
- **Extends `YStack`.** Every Tamagui pass-through prop flows through the spread. `backgroundColor` is intentionally omitted from the spread because the palette-resolved `line` slot controls it — override via `dividerColors={{ line: "#..." }}` instead.
- **No compound API, no `spacing` prop, no `label` prop.** A Divider is a line, not a section header. Consumers who want a labeled divider render `<Text>label</Text>` between two `<Divider>` themselves — a labeled divider is a distinct primitive that deserves its own component if we ever ship one.
- **Own color block on the token schema.** Follows the [each-component-owns-color-space rule](../CLAUDE.md) — `dividerColors` with one slot.

## API

### Props

```ts
export type DividerOrientation = "horizontal" | "vertical";

export interface DividerColorsInput extends Partial<DividerColors> {}

export interface DividerProps extends Omit<YStackProps, "backgroundColor"> {
  /** Line orientation. Default: `"horizontal"`. */
  orientation?: DividerOrientation;
  /**
   * Line thickness in px. Applied as `height` (horizontal) or
   * `width` (vertical). Default: `1`.
   */
  thickness?: number;
  /**
   * Inset on both ends of the line. For horizontal dividers, this
   * is left + right margin; for vertical, top + bottom. Default: `0`
   * (line stretches edge-to-edge).
   */
  inset?: number;
  /**
   * Per-instance color override. Only the `line` slot is read but
   * the input shape accepts the full palette for consistency with
   * other components' override APIs.
   */
  dividerColors?: DividerColorsInput;
  /** Root testID. Default: `"divider"`. */
  testID?: string;
}
```

### Sub-element testIDs

Divider is a single element — no sub-slots. Root testID overridable via `testID`.

### A11y

`accessibilityRole="none"` by default — a divider is decorative and not a semantic landmark. Screen readers should skip it. Consumers who use a divider to separate landmark sections should set `accessibilityRole="separator"` at the callsite (RN maps this to iOS's `.separator` trait / Android's `AccessibilityRole.NONE` with a role description).

## Token schema

`dividerColors` — 1 slot:

| Slot   | Paints                              |
| ------ | ----------------------------------- |
| `line` | The line's background color itself. |

### Default light palette

```ts
{
  line: "#E5E7EB";
} // gray-200 — matches Input / Card border tones
```

### Default dark palette

```ts
{
  line: "#374151";
} // gray-700 — visible on dark backgrounds without competing
```

### Merge helper

`mergeDividerColors(base, override?)` — same shape as every other merge helper. Early-return when `override` is null.

## File structure

```
packages/ui-kraken/src/components/divider/
  ├─ divider-types.ts           # DividerProps + DividerOrientation + DividerColorsInput
  ├─ divider.tsx                # Single component — no styled file (plain YStack with resolved backgroundColor)
  ├─ divider.spec.tsx           # 100% coverage
  ├─ divider.stories.tsx        # Storybook stories
  ├─ README.md                  # Consumer-facing docs
  ├─ __snapshots__/             # Auto-generated
  └─ index.ts                   # Barrel

packages/ui-kraken/src/tokens/defaults/divider.ts   # Palettes + mergeDividerColors + spec
```

No styled file — Divider is just a `<YStack>` with `backgroundColor` + `height` / `width` computed at render time. No compound primitives to declare.

## Testing

### Behavioral coverage (~12 tests)

- Renders with default root testID (`"divider"`).
- Custom `testID` overrides the root.
- Default `orientation="horizontal"` → `height=1`, `alignSelf="stretch"` (no width prop needed).
- `orientation="vertical"` → `width=1`, `alignSelf="stretch"`.
- Default `thickness=1`.
- Custom `thickness` propagates to `height` (horizontal) or `width` (vertical).
- Default `inset=0`.
- Custom `inset` propagates to `marginHorizontal` (horizontal) or `marginVertical` (vertical).
- Default `line` color comes from provider's `dividerColors.line`.
- Per-instance `dividerColors={{ line: "..." }}` overrides the provider palette.
- Dark theme resolves the dark `dividerColors.line`.
- Tamagui pass-through: `padding`, `flex`, etc.

### Structural snapshots (~4)

- Horizontal default.
- Horizontal with inset + custom thickness.
- Vertical default.
- Dark theme × horizontal.

### Defaults spec (`defaults/divider.spec.ts`)

Same shape as `bottom-sheet.spec.ts` / `date-picker.spec.ts` — 4 tests covering both merge branches + light-vs-dark palette sanity.

## Storybook (~5 stories)

- `Horizontal` — default line between two Text blocks.
- `Vertical` — inline between two icons in a Row.
- `Inset` — iOS grouped-list look (`inset={16}`).
- `Thick` — `thickness={4}` for a strong section break.
- `DarkTheme` — dark palette applied via `<Theme name="dark">`.

## Example app screen

`apps/example/app/(pages)/components/divider.tsx` — 5 sections:

1. Horizontal default — between two text paragraphs.
2. Vertical inline — inside a row of icons.
3. Inset — mimics an iOS settings list divider.
4. Thick — section separator with `thickness=4`.
5. Custom color — brand-tinted divider via per-instance `dividerColors={{ line: "..." }}`.

## Non-goals

- **No `label` / `text` prop for labeled dividers.** A labeled divider is a distinct primitive; ship as its own component if we ever need one.
- **No `variant` prop (`"solid" | "dashed" | "dotted"`).** RN doesn't render dashed / dotted borders reliably across all platforms; consumers who need it compose via `borderStyle` at the callsite.
- **No gradient dividers.** Ships when we introduce a `LinearGradient` primitive.
- **No auto-orientation-detection based on parent (row vs column).** Explicit `orientation` prop keeps the API predictable — a Divider without props is horizontal, always.
