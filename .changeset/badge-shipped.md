---
"ui-kraken": minor
---

Add `Badge` — compact pill for notification counts, status labels, and inline indicators. Three rendering modes coexist: text label, numeric count (with `99+` overflow), and dot indicator (status marker for use over `<Avatar>` and similar). Counterpart to `Alert` (banner) and `Hint` (inline paragraph) at the smallest visual weight.

## API

- `<Badge>` extends `YStack`; every Tamagui layout prop flows through the spread. Own props: `tone` (`"neutral" | "primary" | "success" | "warning" | "danger"`, default `"neutral"`), `size` (`"sm" | "md"`, default `"md"`), `count` (numeric), `maxCount` (default `99`), `dot` (boolean), `children` (text), `badgeColors` (per-instance tone override), `testID` (default `"badge"`).
- Mode precedence: `dot` wins over `count` wins over `children`.
- Count formatting: `count > maxCount` renders `"{maxCount}+"`. `count === 0` renders `"0"` (no auto-hide — consumers hide externally if desired).
- Dot sizes: 8 px (sm) / 10 px (md).
- `accessibilityRole="text"` by default. `accessibilityLabel` auto-derives from text/count content; dot mode falls back to `"Indicator"`.

## Compound shortcuts

`Badge.Primary`, `Badge.Success`, `Badge.Warning`, `Badge.Danger` — same shape as `Hint`'s compound API. No `Badge.Neutral` since that's the base default.

## Token schema — own color block

`badgeColors` — 5 tones × 2 slots (`background` + `text`), nested shape matching `HintToneColors`. Each tone uses a pale tinted background + darker semantic-hue text in light mode; deeper tint + lighter tone-hue text in dark mode. Same hue mapping as Hint's soft emphasis so a Badge and a Hint of the same tone read as the same signal at different sizes.

Follows the each-component-owns-color-space rule. Full 13-step wiring: types + defaults + flatten (`$uiBadge{Tone}{Slot}`) + provider merge + barrels. Two merge helpers exported: `mergeBadgeToneColors` (single-tone, used per-instance) + `mergeBadgeColors` (cross-tone, used provider-side).

## Non-goals (documented)

- No `outline` / `ghost` emphasis variants — one visual style keeps the tone signal readable.
- No `pill` vs `square` shape — always rounded pill.
- No `icon` slot — a badge with an icon reads as a chip.
- No auto-hide when `count === 0` — zero-count is a valid state.
- No `pulse` / `blink` animation — ships with a future `Motion` primitive.

## Testing

56 component tests + 5 snapshots on `badge.tsx` + 8 defaults-spec tests (both merge helpers + all 5 tones' light-vs-dark sanity). 100% coverage across statements / branches / functions / lines on `badge.tsx` + `defaults/badge.ts`. Two exported pure helpers (`formatCount`, `resolveContent`) tested branch-by-branch.

## Example app

New `/components/badge` route with 5 sections: tones (all 5 side-by-side), sizes (sm/md pair + count comparison), count formatting (0/5/42/120 + custom maxCount), dot indicator (with Avatar composition — 3 avatars with status dots), inline in a Card (settings-row example with `Badge.Danger count=12`, `Badge.Success "Active"`, `Badge.Warning "Beta"`).
