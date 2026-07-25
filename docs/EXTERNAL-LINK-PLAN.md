# ExternalLink — design record

**Status:** planned for ui-kraken v0.8.0 as part of [`COMPONENTS-BATCH-1-PLAN.md`](./COMPONENTS-BATCH-1-PLAN.md) Phase C.

Living design doc for the `ExternalLink` primitive. Kept post-shipping so future contributors can understand the decisions behind the shape of the API, not just what it does today.

---

## Overview

Tappable link that opens a URL in the platform browser. Router-agnostic — does NOT depend on `expo-router` or `react-navigation`. Common uses: "Read more" links in body copy, "Terms & Conditions" / "Privacy Policy" links on onboarding, help-center references in error messages.

The primitive prefers an in-app browser (`expo-web-browser`) when installed and falls back to the system browser (RN `Linking.openURL`) when it isn't. Consumers get the nicer in-app UX by installing `expo-web-browser`; consumers who don't want the extra dep get the OS-level fallback automatically.

**Locked decisions:**

- **Naming**: `ExternalLink` — reads unambiguously as "link that goes outside the app". `WebLink` / `UrlLink` / `Anchor` were considered; `ExternalLink` is the industry-familiar term (Expo, Next.js, MUI all use it for this purpose).
- **Router-agnostic**: no `expo-router` / `react-navigation` import. This is not an in-app navigation primitive — it's for URLs that leave the app.
- **Two-backend strategy**: at module import time we try `require("expo-web-browser")`. If present, `openBrowserAsync` becomes the primary opener; if absent, we fall back to RN `Linking.openURL` (both the try-catch require pattern and the fallback are standard RN library conventions).
- **`url` is required** — no auto-detection or href parsing.
- **`children` is required** — the visible label. Strings auto-wrap in a styled underlined `<Text>`; ReactNode children render as-is (for consumers who want custom label layouts).
- **Optional leading `icon` slot + trailing icon** — `icon?: ReactNode` before the label, `trailingIcon?: ReactNode` after (defaults to the `↗` glyph so consumers get the "external" affordance for free). Both tone-tinted via the color-inheriting wrapper convention.
- **`hideTrailingIcon?: boolean`** — opt out of the auto trailing icon (useful for inline body-copy links where a trailing arrow reads noisy).
- **`onPress?` interception hook** — consumer can inject analytics / logging before the URL opens. Returning `false` (or a promise that resolves to `false`) prevents the default open behavior.
- **`disabled?: boolean`** — renders at 50% opacity and blocks the press.
- **Own color block on the token schema**: `externalLinkColors` with 2 slots (`label` + `icon`). The label's underline color is derived from `label` automatically (via `textDecorationColor`).
- **Per-instance override**: `externalLinkColors?: Partial<ExternalLinkColors>` — matches the Surface / Skeleton pattern.
- **Extends `Pressable`** — the whole row is tappable. Every RN `PressableProps` flows through (`hitSlop`, `pressRetentionOffset`, `accessibility*`, etc.).
- **Accessibility**: `accessibilityRole="link"` + auto-composed `accessibilityLabel` from string children (falls back to `url` when children is a ReactNode). Consumers can override.

## API

### Props

```ts
export type ExternalLinkColorsInput = Partial<ExternalLinkColors>;

export interface ExternalLinkProps extends Omit<PressableProps, "onPress" | "children"> {
  /** URL to open. Required. */
  url: string;
  /** Visible label. Strings auto-wrap in a styled underlined Text; ReactNodes render as-is. */
  children: ReactNode;
  /** Optional leading icon slot. */
  icon?: ReactNode;
  /**
   * Override for the default trailing arrow glyph (`↗`). Consumer
   * brings any ReactNode when their design system ships a specific
   * external-link icon.
   */
  trailingIcon?: ReactNode;
  /** Hide the trailing icon entirely (useful for inline body-copy links). */
  hideTrailingIcon?: boolean;
  /** Disable the link (renders at 50% opacity, ignores taps). */
  disabled?: boolean;
  /**
   * Optional pre-open hook. Runs before the URL opens. Return
   * `false` (or a promise that resolves to `false`) to prevent the
   * default open behavior — useful for analytics guards or custom
   * URL rewriting.
   */
  onPress?: () => boolean | Promise<boolean> | void | Promise<void>;
  /**
   * Per-instance color override. Missing slots fall through to the
   * provider-resolved palette.
   */
  externalLinkColors?: ExternalLinkColorsInput;
  /**
   * Root testID. Sub-elements derive:
   * `{root}-icon`, `{root}-label`, `{root}-trailing-icon`.
   */
  testID?: string;
}
```

### Open behavior

At module import time, `packages/ui-kraken/src/components/external-link/open-url.ts` runs a `try { require("expo-web-browser") } catch {}` probe. The result is captured in a module-level variable:

- If `expo-web-browser` is installed: `openBrowserAsync(url)` opens an in-app browser (consumer gets the nicer UX, chrome customization, back-button-in-webview affordance).
- If not: `Linking.openURL(url)` kicks the URL to the OS-level system browser.

On tap:

1. If `disabled`, the press is ignored.
2. If `onPress` is provided, we `await` it. If it returns `false`, we bail (no open).
3. Otherwise, `openExternalUrl(url)` is called (either backend, whichever is available).

### Per-instance override

```tsx
<ExternalLink
  url="https://example.com/terms"
  externalLinkColors={{ label: "#7C3AED", icon: "#7C3AED" }}
>
  Terms & Conditions
</ExternalLink>
```

### Sub-element testIDs

- root: `"external-link"` (overridable via `testID`)
- leading icon (when `icon` passed): `"{root}-icon"`
- label: `"{root}-label"`
- trailing icon (when NOT hidden): `"{root}-trailing-icon"`

### A11y

Defaults:

- `accessibilityRole="link"`
- `accessibilityLabel` — auto-composed as the string children if children is a string; falls back to `url` otherwise. Overridable via pass-through.
- `accessibilityState={{ disabled }}` when `disabled=true`.

## Token schema

ExternalLink introduces its own **`externalLinkColors`** block on `Tokens`. Zero reuse of Text / Button palettes — link chrome evolves independently.

```tsx
<UIKitProvider
  tokens={{
    externalLinkColors: {
      label: "#2563EB",
      icon: "#2563EB",
    },
  }}
  dark={{
    externalLinkColors: {
      label: "#60A5FA",
      icon: "#60A5FA",
    },
  }}
>
  <App />
</UIKitProvider>
```

### `ExternalLinkColors` interface

Slot-based, 2 slots.

```ts
export interface ExternalLinkColors {
  /** Label text color + underline color (derived automatically). */
  label: string;
  /** Icon color (both leading + trailing). */
  icon: string;
}
```

### Default light palette

Matches `TextColors.interactive` for cohesion — links in body copy look native alongside other interactive text.

```ts
export const DEFAULT_LIGHT_EXTERNAL_LINK_COLORS: ExternalLinkColors = {
  label: "#2563EB",
  icon: "#2563EB",
};
```

### Default dark palette

Lighter blue for contrast on dark surfaces.

```ts
export const DEFAULT_DARK_EXTERNAL_LINK_COLORS: ExternalLinkColors = {
  label: "#60A5FA",
  icon: "#60A5FA",
};
```

### Flatten to Tamagui tokens

`flattenExternalLinkColors()` produces the flat `$uiExternalLink{PascalCase}` token map:

```
uiExternalLinkLabel
uiExternalLinkIcon
```

### Merge helper

```ts
export function mergeExternalLinkColors(
  base: ExternalLinkColors,
  override?: Partial<ExternalLinkColors>
): ExternalLinkColors;
```

Same signature as `mergeSurfaceColors` / `mergeSkeletonColors`.

## File structure

```
packages/ui-kraken/src/components/external-link/
├── external-link.tsx           # component logic + resolvePalette + a11y compose
├── external-link.styled.ts     # StyledExternalLink (XStack Pressable), StyledLabel,
│                               # StyledIconWrapper
├── external-link-types.ts      # ExternalLinkColorsInput, ExternalLinkProps
├── open-url.ts                 # openExternalUrl() — try-catch require expo-web-browser;
│                               # fallback to Linking.openURL
├── external-link.spec.tsx      # unit tests + describe("snapshots") block
├── open-url.spec.ts            # unit tests for the backend selection logic
├── external-link.stories.tsx   # Storybook (~6 stories)
├── README.md                   # props table + usage + Platform support
└── index.ts                    # explicit named exports
```

Token / provider wiring per [`creating-component-tamagui` Section 11](../.agents/skills/creating-component-tamagui/SKILL.md).

## Testing

**Coverage target: 100%** on the component + the URL opener helper.

### Behavioral coverage (~15 tests)

- Renders string children under `{root}-label` with the interactive underlined text style
- Renders ReactNode children as-is (custom label passes through)
- Trailing icon defaults to `↗` glyph
- `trailingIcon` prop override wins
- `hideTrailingIcon` unmounts the trailing icon entirely
- Leading icon mounts only when `icon` passed
- Tapping opens the URL via `openExternalUrl` (mocked)
- `onPress` hook fires before the open; returning `false` prevents the open
- `onPress` hook that returns a Promise is awaited
- `disabled` prop suppresses press
- Palette slots paint from the resolved palette (parametrized across `label` + `icon`)
- Per-instance `externalLinkColors` override wins on each slot (parametrized)
- Provider-level palette propagates via `useUIKit()`
- Dark palette resolves when `activeTheme === "dark"`
- `accessibilityRole="link"` by default; auto-composed `accessibilityLabel` from string children, falls back to `url` for ReactNode children
- Consumer `accessibilityLabel` wins over auto composition
- Pressable pass-through: `hitSlop`, `pressRetentionOffset`, extra a11y props

### `open-url.spec.ts` — ~4 tests

- When `expo-web-browser` is installed: `openExternalUrl` calls `openBrowserAsync(url)`
- When `expo-web-browser` is not installed: `openExternalUrl` falls back to `Linking.openURL(url)`
- If `expo-web-browser` is installed but `openBrowserAsync` is not a function, still falls back to Linking
- The opener helper never throws — errors from either backend are caught and swallowed (link fails silently rather than crashing the app)

### Structural snapshots (~3)

- Default light — string children + auto trailing icon
- Light + leading + custom trailing icon
- Dark palette + disabled

## Storybook (~6 stories)

- `Inline` — bare `<ExternalLink url="...">Read the docs</ExternalLink>` in body copy
- `WithIcon` — leading icon + label + auto trailing arrow
- `HiddenTrailingIcon` — inline link with no trailing arrow (for embedded copy)
- `Disabled` — grayed out
- `WithAnalyticsHook` — `onPress` demo that logs to `console.warn` before open
- `CustomColors` — brand-tinted per-instance override
- `DarkTheme` — inline + with-icon in dark mode

## Example app screen

`apps/example/app/(pages)/components/external-link.tsx` — 5 sections:

1. **Inline in body copy** — a paragraph of text with an ExternalLink embedded in the middle.
2. **Standalone with icon** — a row-style link ("Visit our documentation") with leading + trailing icons.
3. **onPress hook** — an ExternalLink that alerts before opening (demonstrating the interception hook).
4. **Hide trailing icon** — inline link without the arrow.
5. **Per-instance brand palette** — a purple-accent ExternalLink.

Plus route registration + row on the components home.

## Non-goals

- **No download support** (e.g. detecting `.pdf` and offering a save dialog) — that's a platform concern the consumer wraps around ExternalLink.
- **No deep-link routing** — this is strictly for URLs that leave the app. Internal navigation belongs on `expo-router`'s `<Link>`.
- **No `href` alias** — the prop is `url`, matching Expo and the RN Linking API.
- **No `target`-like control** — `expo-web-browser` opens in-app when available, system browser otherwise. Consumers who need explicit control drop down to `Linking` / `WebBrowser` themselves.
- **No fetch / prefetch** — link content stays untouched by ui-kraken.
- **No visited-state tracking** — RN doesn't ship browsing-history APIs the way the web does. Consumers who track it can wire the `onPress` hook to their own analytics.

## How to ship

Executed on branch `feat/duna-migration-batch-1`:

1. Token schema wiring (types + defaults + flatten + provider + barrels).
2. Helper file: `open-url.ts` + `open-url.spec.ts` first (the opener is the trickiest part).
3. Component files: `external-link-types.ts` → `external-link.styled.ts` → `external-link.tsx` → `external-link.spec.tsx` (+ snapshots) → `external-link.stories.tsx` → `README.md` → `index.ts`.
4. Barrels: `components/index.ts` + `src/index.ts`.
5. Example: screen + route + components-home row.
6. Flip status here (`planned` → `shipped on <YYYY-MM-DD>`).
7. Flip Batch 1 plan doc: ⏳ → ✅ on ExternalLink's row.
8. Verify green + **100% coverage on `external-link.tsx` + `open-url.ts`** via `pnpm --filter ui-kraken test:coverage`.
9. Atomic commit with rich body.
10. **Batch 1 closeout**: PR handoff (per [[pr-handoff-after-initiative]]) with title + body summarizing the full 11-component migration.

## How to extend

- **Add a `preferSystemBrowser?: boolean`** — an opt-out for consumers who always want the OS-level browser (e.g. for OAuth flows where in-app browsers cause session-cookie confusion).
- **Add an `errorFallback?: (error, url) => void`** — currently open failures are swallowed silently; consumers who want to surface them (toast / logging) get a hook.
- **Add a `visited?: boolean` prop** — consumer-controlled visited state that dims the label color to `TextColors.tertiary`.
- **Add a `webBrowserOptions?` prop** — pass-through of `expo-web-browser`'s presentation options (`presentationStyle`, `controlsColor`, `dismissButtonStyle`).
- **Support `mailto:` / `tel:` schemes** — currently these work through `Linking.openURL` transparently; `expo-web-browser` would reject them. Add scheme detection to route non-http URLs directly to Linking regardless of backend.
