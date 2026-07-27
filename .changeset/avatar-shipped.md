---
"ui-kraken": minor
---

Add `Avatar` — displays a user image with an initials fallback. Two rendering modes coexist: pass `source` for a real image; pass `name` (or explicit `initials`) so ui-kraken computes initials on a colored background. If the image fails to load, the component swaps to initials automatically via `onError`.

## API

- `<Avatar>` extends `YStack`; every Tamagui layout prop flows through the spread. Own props: `source` (image), `name` (auto-compute initials), `initials` (explicit override, wins over `name`), `size` (`"sm" | "md" | "lg" | "xl" | number`, default `"md"`), `shape` (`"circle" | "rounded" | "square"`, default `"circle"`), `avatarColors` (per-instance palette override), `testID` (default `"avatar"`).
- Sizes: sm=24, md=40, lg=56, xl=80. Raw numeric sizes pass through.
- Shapes: circle → size/2 radius (perfectly round); rounded → 8; square → 0.
- Rendering rules: source + no error → `<Image>`; source + error → initials; no source + initials → initials as-passed; no source + name → computed initials; nothing → empty background.
- Initials computation: first letter of first word + first letter of last word, uppercased. Single-word names → first letter only. Empty / whitespace → empty background (no ghost text).
- Font size scales with dimension: `fontSize = floor(dimension × 0.4)` so sm has readable text and xl doesn't look empty.
- `accessibilityRole="image"` by default; `accessibilityLabel` defaults to `name` (or `"Avatar"` otherwise).

## Token schema — own color block

`avatarColors` — 2 slots: `background` (fill when showing initials) + `text` (initials color). Light `#E5E7EB` bg + `#374151` text (gray-200 / gray-700); dark `#374151` bg + `#F9FAFB` text (inverted for dark mode). Neutral placeholder in both themes.

Follows the each-component-owns-color-space rule. Full 13-step wiring: types + defaults + flatten (`$uiAvatarBackground`, `$uiAvatarText`) + provider merge + barrels.

## Non-goals (documented)

- No `status` dot / badge slot — distinct primitive (future `AvatarWithStatus`).
- No group / stacked variant — `<AvatarGroup>` is its own component.
- No initial-color-from-name-hash — auto-hashing hides the deterministic mapping. Consumers who want per-user tinting pass `avatarColors` explicitly.
- No loading skeleton state — consumers wrap in `<Skeleton>` or show `<Spinner>` while data loads.

## Testing

47 component tests + 4 snapshots on `avatar.tsx` + 4 defaults-spec tests. 100% coverage across statements / branches / functions / lines on `avatar.tsx` + `defaults/avatar.ts`. Three exported pure helpers (`computeInitials`, `resolveAvatarSize`, `resolveAvatarBorderRadius`) tested branch-by-branch.

## Example app

New `/components/avatar` route with 5 sections: size showcase (sm / md / lg / xl), shape showcase (circle / rounded / square), image vs initials (with a bad-URL fallback demo), explicit initials (`"?"` + emoji), custom colors inside a Card (composition example with a user-row).
