# Avatar

Displays a user image with an initials fallback. Two rendering modes coexist: pass `source` for a real image; pass `name` (or explicit `initials`) so ui-kraken computes initials on a colored background. If the image fails to load, the component swaps to initials automatically via `onError`.

## Import

```tsx
import { Avatar } from "ui-kraken";
```

## Props

| Prop           | Type                                     | Default    | Description                                                              |
| -------------- | ---------------------------------------- | ---------- | ------------------------------------------------------------------------ |
| `source`       | `ImageSourcePropType`                    | —          | Image source. Falls back to initials on error or when absent.            |
| `name`         | `string`                                 | —          | Full name — computes initials automatically (first + last word initial). |
| `initials`     | `string`                                 | —          | Explicit initials override. Wins over the computed value from `name`.    |
| `size`         | `"sm" \| "md" \| "lg" \| "xl" \| number` | `"md"`     | Preset (sm=24, md=40, lg=56, xl=80) OR raw number.                       |
| `shape`        | `"circle" \| "rounded" \| "square"`      | `"circle"` | Circle → size/2 radius (round), rounded → 8, square → 0.                 |
| `avatarColors` | `Partial<AvatarColors>`                  | —          | Per-instance color override.                                             |
| `testID`       | `string`                                 | `"avatar"` | Root testID.                                                             |

Every Tamagui `YStackProps` also flows through the `...rest` spread. `backgroundColor` is intentionally omitted — override the fill via `avatarColors`.

## Rendering rules

| State                               | Renders                                            |
| ----------------------------------- | -------------------------------------------------- |
| `source` provided, image loads      | `<Image>` at the resolved size + shape             |
| `source` provided, image errors     | Initials (from `initials` OR computed from `name`) |
| No `source`, `initials` provided    | Initials as-passed                                 |
| No `source`, `name` provided        | Computed initials                                  |
| No `source`, no `name` / `initials` | Empty background at the resolved size + shape      |

## Color model

`avatarColors` — 2 slots:

| Slot         | Paints                                     |
| ------------ | ------------------------------------------ |
| `background` | Fill color when the Avatar shows initials. |
| `text`       | Color of the initials text.                |

### Default palettes

- **Light**: `background: "#E5E7EB"` (gray-200) + `text: "#374151"` (gray-700).
- **Dark**: `background: "#374151"` (gray-700) + `text: "#F9FAFB"` (gray-50).

## Usage

### Initials fallback

```tsx
<Avatar name="Alexis Noriega" /> {/* → "AN" on gray-200 */}
```

### Real image (with initials fallback on error)

```tsx
<Avatar source={{ uri: "https://..." }} name="Alexis Noriega" />
```

### Explicit initials (placeholder / emoji)

```tsx
<Avatar initials="?" />
<Avatar initials="🙂" size="lg" />
```

### Sizes + shapes

```tsx
<Avatar name="AN" size="sm" />
<Avatar name="AN" size="lg" shape="rounded" />
<Avatar name="AN" size={64} shape="square" />
```

### Custom color per-instance

```tsx
<Avatar name="AL" avatarColors={{ background: "#7C3AED", text: "#F5F3FF" }} />
```

### Custom color provider-wide

```tsx
<UIKitProvider
  overrides={{
    light: { avatarColors: { background: "#7C3AED", text: "#F5F3FF" } },
  }}
>
  {/* every Avatar without an image gets the brand tint */}
</UIKitProvider>
```

## Sub-element testIDs

- Root: `"avatar"` (overridable via `testID`).
- Image (when rendering): `"{root}-image"`.
- Initials text (when rendering): `"{root}-initials"`.

## Accessibility

- `accessibilityRole="image"` by default.
- `accessibilityLabel` defaults to `name` when provided, or `"Avatar"` otherwise. Consumers override for domain-specific copy: `<Avatar accessibilityLabel="Profile photo of Alexis" />`.

## Notes

- **No `status` dot / badge slot** — a status indicator around an Avatar is a distinct primitive (future).
- **No group / stacked variant** — `<AvatarGroup>` would be its own component; build when we see the pattern repeat.
- **No initial-color-from-name-hash** — auto-hashing hides the deterministic mapping and makes theming inconsistent. Consumers who want per-user tinting pass `avatarColors={{ background: ... }}` explicitly.
- **No loading skeleton state** — wrap in `<Skeleton>` or show a `<Spinner>` while data loads.
- **Font size scales with dimension** — initials use `fontSize = floor(dimension × 0.4)` so a `sm` Avatar has readable text and an `xl` doesn't look empty.

## Platform support

| Platform | Status |
| -------- | ------ |
| iOS      | ✅     |
| Android  | ✅     |
| Web      | ✅     |
