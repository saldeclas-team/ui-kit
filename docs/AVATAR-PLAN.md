# Avatar — design record

**Status:** planned for ui-kraken v0.10.0 (Batch 3 alongside Card + Divider + Spinner). Standard user-representation primitive for profile cards, comment rows, contact lists, and any UI that identifies a person.

Living design doc for the `Avatar` primitive. Kept post-shipping so future contributors can understand the decisions behind the shape of the API, not just what it does today.

---

## Overview

Displays a user image with an initials fallback. The image slot is optional — an Avatar without a source (or one whose image failed to load) shows initials on a colored background instead. Extremely narrow surface: one prop for the image, one for the name (auto-computes initials), one for size, one for shape, plus the standard palette + testID conventions every ui-kraken primitive has.

**Locked decisions:**

- **Two rendering modes — image OR initials.** Consumers pass `source` for a real image; ui-kraken renders `<Image>`. Consumers pass `name="Alexis Noriega"` (or explicit `initials="AN"`); ui-kraken computes the initials + renders them on `avatarColors.background`. If the image fails to load (network error, broken URL), the component swaps to initials automatically via `onError`. Both modes coexist — an Avatar can be given both a `source` and a `name` so the initials fallback is ready when the image errors.
- **Initials computed from `name`** — first letter of the first word + first letter of the last word. `"Alexis Noriega"` → `"AN"`. Single-word names → just the first letter. Empty / missing `name` → renders an empty background (no ghost initials). Consumers who want a specific string (`"?"`, an emoji) pass `initials` explicitly, which wins over the computed value.
- **Four size presets — `"sm"` (24px) / `"md"` (40px, default) / `"lg"` (56px) / `"xl"` (80px)** — or a raw `number`. Presets cover the 4 common contexts: comment rows / list rows / profile headers / hero avatars.
- **Three shapes — `"circle"` (default) / `"rounded"` / `"square"`.** Circle uses `borderRadius = size / 2` (perfect round); rounded is a fixed `8` (softer chrome for corporate / dashboard UIs); square is `0`. No prop for arbitrary radius — consumers who need one pass a Tamagui `borderRadius={...}` via the spread.
- **Two palette slots — `background` + `text`.** Background is the fill color when showing initials; text is the initials color. Light default: `#E5E7EB` bg + `#374151` text. Dark default: `#374151` bg + `#F9FAFB` text. Reads as a neutral placeholder in both themes.
- **Extends `YStack`.** Every Tamagui `YStackProps` flows through the `...rest` spread. `backgroundColor` is intentionally omitted — the palette owns it.

## API

### Props

```ts
export type AvatarSize = "sm" | "md" | "lg" | "xl";
export type AvatarShape = "circle" | "rounded" | "square";

export type AvatarColorsInput = Partial<AvatarColors>;

export interface AvatarProps extends Omit<YStackProps, "backgroundColor"> {
  /**
   * Image source. When provided AND the image loads successfully,
   * the Avatar renders it. On error (or absent), falls back to
   * initials.
   */
  source?: ImageSourcePropType;
  /**
   * Full name — used to compute initials automatically when no
   * explicit `initials` is passed. First + last word initial;
   * single-word names yield just the first letter.
   */
  name?: string;
  /**
   * Explicit initials override. Wins over the computed value from
   * `name`. Use for placeholder strings (`"?"`) or emoji.
   */
  initials?: string;
  /**
   * Size preset OR raw number.
   * `"sm"` → 24, `"md"` → 40 (default), `"lg"` → 56, `"xl"` → 80.
   */
  size?: AvatarSize | number;
  /**
   * Corner shape. `"circle"` → perfectly round; `"rounded"` → 8px
   * radius; `"square"` → 0. Default: `"circle"`.
   */
  shape?: AvatarShape;
  /** Per-instance color override. */
  avatarColors?: AvatarColorsInput;
  /** Root testID. Default: `"avatar"`. */
  testID?: string;
}
```

### Rendering rules

| State                               | Renders                                            |
| ----------------------------------- | -------------------------------------------------- |
| `source` provided, image loads      | `<Image>` at the resolved size + shape             |
| `source` provided, image errors     | Initials (from `initials` OR computed from `name`) |
| No `source`, `initials` provided    | Initials as-passed                                 |
| No `source`, `name` provided        | Computed initials                                  |
| No `source`, no `name` / `initials` | Empty background at the resolved size + shape      |

### Sub-element testIDs

- Root: `"avatar"` (overridable via `testID`).
- Image (when rendering): `"{root}-image"`.
- Initials text (when rendering): `"{root}-initials"`.

### A11y

- `accessibilityRole="image"` by default — screen readers announce the Avatar as an image.
- `accessibilityLabel` defaults to `name` when provided (or `"Avatar"` otherwise). Consumers override for domain-specific copy.

## Token schema

`avatarColors` — 2 slots:

| Slot         | Paints                                     |
| ------------ | ------------------------------------------ |
| `background` | Fill color when the Avatar shows initials. |
| `text`       | Color of the initials text.                |

### Default light palette

```ts
{ background: "#E5E7EB", text: "#374151" }
// gray-200 bg + gray-700 text — neutral placeholder
```

### Default dark palette

```ts
{ background: "#374151", text: "#F9FAFB" }
// gray-700 bg + gray-50 text — inverted for dark mode
```

### Merge helper

`mergeAvatarColors(base, override?)` — same shape as every other merge helper. Early-return when `override` is null.

## File structure

```
packages/ui-kraken/src/components/avatar/
  ├─ avatar-types.ts            # AvatarProps + AvatarSize + AvatarShape + AvatarColorsInput
  ├─ avatar.tsx                 # Component + computeInitials + resolveAvatarSize + resolveAvatarBorderRadius
  ├─ avatar.spec.tsx            # 100% coverage
  ├─ avatar.stories.tsx         # Storybook stories
  ├─ README.md                  # Consumer-facing docs
  ├─ __snapshots__/             # Auto-generated
  └─ index.ts                   # Barrel

packages/ui-kraken/src/tokens/defaults/avatar.ts   # Palettes + mergeAvatarColors + spec
```

No styled file — Avatar is a `<YStack>` with computed `backgroundColor` / `width` / `height` / `borderRadius` at render time.

## Testing

### Behavioral coverage (~15 tests)

- Renders default root testID (`"avatar"`).
- Custom `testID` overrides + propagates to sub-element testIDs.
- With `source`: renders `<Image>` (sub-slot testID).
- With `source` + image errors → falls back to initials.
- Without `source`, with `name` → computed initials render.
- Without `source`, with `initials` → explicit initials render (wins over `name`).
- Without `source`, without `name` / `initials` → renders empty background (no text child).
- `computeInitials`: single word → first letter uppercased.
- `computeInitials`: multi-word → first + last word initials uppercased.
- `computeInitials`: 3+ words → first + last only.
- `computeInitials`: empty / whitespace → empty string.
- Size resolution: each preset → correct px.
- Size resolution: raw number pass-through.
- Shape resolution: circle → size/2, rounded → 8, square → 0.
- Palette resolution: per-instance override wins, provider override propagates, dark theme.
- A11y: default role, default label from name, custom label override.

### Structural snapshots (~4)

- With initials (`name="Alexis Noriega"`, md, circle).
- With image (mock source, lg, circle).
- Rounded shape × xl size.
- Dark theme × sm × initials.

### Defaults spec (`defaults/avatar.spec.ts`)

Same shape as other defaults specs — 4 tests covering both merge branches + light-vs-dark palette sanity.

## Storybook (~7 stories)

- `Initials` — `name="Alexis Noriega"`, default md.
- `WithImage` — actual source (Storybook fixture).
- `Sizes` — sm / md / lg / xl side-by-side.
- `Shapes` — circle / rounded / square side-by-side.
- `CustomColors` — brand-tinted background + text.
- `FallbackOnError` — invalid URL → shows initials.
- `DarkTheme` — dark palette via `<Theme name="dark">`.

## Example app screen

`apps/example/app/(pages)/components/avatar.tsx` — 5 sections:

1. Size showcase — sm / md / lg / xl of the same name.
2. Shape showcase — circle / rounded / square.
3. Image vs initials — one with source, one with just name.
4. Explicit initials — `"?"` and emoji fallback.
5. Custom color — brand-tinted background.

## Non-goals

- **No `status` dot / badge slot.** Composing a status indicator around an Avatar is a distinct primitive (`AvatarWithStatus` — future).
- **No group / stacked variant.** `<AvatarGroup>` is a distinct primitive — build later if we see the pattern repeated across apps.
- **No initial-color-from-name-hash.** Consumers who want per-user tinting pass `avatarColors={{ background: ... }}` explicitly at the callsite. Auto-hashing hides the deterministic mapping and makes theming inconsistent.
- **No loading skeleton state.** Consumers wrap in `<Skeleton>` or show a `<Spinner>` while data loads.
- **No `SVG` icon slot for the empty state.** The empty state renders an empty colored background — consumers who want an icon compose it via children.
