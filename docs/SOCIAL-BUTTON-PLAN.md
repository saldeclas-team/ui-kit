# SocialButton — design record

**Status:** shipped on 2026-07-26 in ui-kraken v0.8.0 as part of [`COMPONENTS-BATCH-1-PLAN.md`](./COMPONENTS-BATCH-1-PLAN.md) Phase B.

Living design doc for the `SocialButton` primitive. Kept post-shipping so future contributors can understand the decisions behind the shape of the API, not just what it does today.

---

## Overview

OAuth-provider button. Renders `"Continue with Google"` / `"Sign in with Apple"` / etc. as a compact horizontal button with the provider's logo on the left and a label on the right. Common uses: onboarding sign-in screens, account-linking flows, "connect your accounts" pages.

Separate from [`Button`](./BUTTON-PLAN.md) — Button carries generic tone variants (primary / secondary / outline / ghost / destructive); SocialButton carries provider-specific brand palettes that would clutter Button's namespace and drift over time as brand guidelines change. Both are pressable; they differ in what they visually announce.

**Locked decisions:**

- **Naming**: `SocialButton` — reads unambiguously as "button that logs the user in via a social provider". `OAuthButton` / `ProviderButton` were considered but `SocialButton` is the industry-familiar term (used by Auth0, Clerk, Firebase docs, etc.).
- **Six providers in v1**: `"google" | "apple" | "facebook" | "github" | "microsoft" | "generic"`. Covers the OAuth flows we see 90% of the time; `generic` is a brand-agnostic fallback for anything else (custom SSO, LinkedIn, X, Discord, GitLab, etc.). Consumers add new provider palettes by overriding the `generic` slot per-instance or by extending `socialButtonColors` at the provider level.
- **No logos shipped** — the `icon` prop is a `ReactNode` the consumer brings themselves. Reasons: (a) provider logos are trademarked and licensing terms vary; (b) consumers already have their icon library of choice (`@tabler/icons-react-native`, `react-native-vector-icons`, Expo's `@expo/vector-icons`, etc.). Shipping default logos would drag every consumer into a peer dependency they may not need.
- **`label` is required** — no auto-generated "Continue with X" strings. Localization is the consumer's responsibility; a shipped default in English would need per-app i18n handling anyway.
- **Compound shortcuts**: `SocialButton.Google`, `SocialButton.Apple`, `SocialButton.Facebook`, `SocialButton.Github`, `SocialButton.Microsoft`, `SocialButton.Generic`. Same pattern as `Button.Primary` / `Alert.Info`.
- **`loading` prop** — same shape as `Button.loading`. Replaces the leading icon with an `ActivityIndicator` colored by the resolved `label` slot; disables the press.
- **Own color block on the token schema**: `socialButtonColors` with 6 providers × 3 slots (`background`, `label`, `border`). Per-provider defaults match each brand's official button guidelines (Google's Material-inspired white card, Apple's black, Facebook's `#1877F2`, GitHub's `#24292F`, Microsoft's white card, generic's neutral gray).
- **Per-instance override**: `socialButtonColors?: Partial<SocialButtonProviderColors>` — targets the resolved provider only (same pattern as `Button.buttonColors` for the resolved tone / `Alert.alertColors` for the resolved variant).
- **`size` prop**: `"sm" | "md" | "lg"` — same scale as Button (40 / 48 / 56 px min-height). Default `"md"`.
- **`radius` prop**: `"none" | "sm" | "md" | "lg" | "pill" | number`. Default `"md"` to match Button (auth screens read cleanly with rounded rectangles, not pills).
- **No `fullWidth` prop** — auth screens typically want the button to span the form width, but hard-coding that would leak into card / inline usage. Consumers pass `width="100%"` via the Tamagui spread when they need it.
- **Extends `XStack`** — horizontal row (icon left, label centered-ish). Every Tamagui `XStackProps` flows through the spread.
- **Accessibility**: `accessibilityRole="button"` + `accessibilityState={{ disabled, busy: loading }}` + auto-composed `accessibilityLabel={label}`. All overridable via `...rest`.

## API

### Props

```ts
export type SocialButtonProvider =
  "google" | "apple" | "facebook" | "github" | "microsoft" | "generic";

export type SocialButtonSize = "sm" | "md" | "lg";

export type SocialButtonRadius = number | "none" | "sm" | "md" | "lg" | "pill";

export type SocialButtonColorsInput = Partial<SocialButtonProviderColors>;

export interface SocialButtonProps extends Omit<
  GetProps<typeof StyledSocialButton>,
  "children" | "onPress"
> {
  /** OAuth provider. Drives the resolved palette + compound-shortcut default. */
  provider: SocialButtonProvider;
  /** Button label (e.g. `"Continue with Google"`). Localized by the consumer. */
  label: string;
  /**
   * Provider logo. Consumer brings any ReactNode; SocialButton does
   * NOT ship logos (trademark + icon-library choice).
   */
  icon?: ReactNode;
  /** Standard press handler. */
  onPress?: () => void;
  /** Disable the button (renders at 50% opacity, ignores taps). */
  disabled?: boolean;
  /**
   * Show a loading spinner in place of the icon. Also disables the
   * press to prevent double-submits.
   */
  loading?: boolean;
  /** Size variant. Defaults to `"md"` (48 px min-height). */
  size?: SocialButtonSize;
  /** Border radius. Defaults to `"md"`. */
  radius?: SocialButtonRadius;
  /**
   * Per-instance color override for THIS button's resolved provider.
   * Missing slots fall through to the provider-resolved palette.
   */
  socialButtonColors?: SocialButtonColorsInput;
  /**
   * Root testID. Sub-elements derive:
   * `{root}-icon`, `{root}-label`, `{root}-loader`.
   */
  testID?: string;
}
```

### Compound shortcuts

```tsx
<SocialButton.Google onPress={...} label="Continue with Google" icon={<GoogleLogo />} />
<SocialButton.Apple onPress={...} label="Sign in with Apple" icon={<AppleLogo />} />
<SocialButton.Facebook onPress={...} label="Continue with Facebook" icon={<FacebookLogo />} />
<SocialButton.Github onPress={...} label="Sign in with GitHub" icon={<GithubLogo />} />
<SocialButton.Microsoft onPress={...} label="Continue with Microsoft" icon={<MicrosoftLogo />} />
<SocialButton.Generic onPress={...} label="Continue with X" icon={<XLogo />} />
```

Same pattern as `Button.Primary` / `Alert.Info`. Top-level `<SocialButton provider="google" ...>` also works for the dynamic-provider case.

### Per-instance override

```tsx
<SocialButton
  provider="google"
  label="Continue with Google"
  icon={<GoogleLogo />}
  socialButtonColors={{ background: "#111827", label: "#F5F5F7", border: "#374151" }}
/>
```

### Sub-element testIDs

`SocialButton` derives these testIDs from the root ID:

- root: `"social-button"` (overridable via `testID`)
- icon (when `icon` passed, and NOT loading): `"{root}-icon"`
- label: `"{root}-label"`
- loader (when `loading`): `"{root}-loader"`

### A11y

Defaults:

- `accessibilityRole="button"`
- `accessibilityState={{ disabled: disabled || loading, busy: loading }}`
- `accessibilityLabel={label}` (auto)

All overridable via `...rest`.

## Token schema

SocialButton introduces its own **`socialButtonColors`** block on `Tokens`. Nested (provider → 3 slots), same shape as Button / Alert.

```tsx
<UIKitProvider
  tokens={{
    socialButtonColors: {
      google: { background: "#FFFFFF", label: "#1F1F1F", border: "#DADCE0" },
    },
  }}
  dark={{
    socialButtonColors: {
      google: { background: "#1F1F1F", label: "#F5F5F7", border: "#3C4043" },
    },
  }}
>
  <App />
</UIKitProvider>
```

### `SocialButtonColors` interface

```ts
export interface SocialButtonProviderColors {
  /** Button background color. */
  background: string;
  /** Button label + loader spinner color. */
  label: string;
  /** Border color. `background === border` for solid buttons; different for outlined. */
  border: string;
}

export interface SocialButtonColors {
  google: SocialButtonProviderColors;
  apple: SocialButtonProviderColors;
  facebook: SocialButtonProviderColors;
  github: SocialButtonProviderColors;
  microsoft: SocialButtonProviderColors;
  generic: SocialButtonProviderColors;
}
```

### Default light palette

Per-brand values follow each provider's official button guidelines (Google's Material light card, Apple's black, Facebook's brand blue, GitHub's near-black, Microsoft's Fluent light card, generic's neutral gray).

```ts
export const DEFAULT_LIGHT_SOCIAL_BUTTON_COLORS: SocialButtonColors = {
  google: { background: "#FFFFFF", label: "#1F1F1F", border: "#DADCE0" },
  apple: { background: "#000000", label: "#FFFFFF", border: "#000000" },
  facebook: { background: "#1877F2", label: "#FFFFFF", border: "#1877F2" },
  github: { background: "#24292F", label: "#FFFFFF", border: "#24292F" },
  microsoft: { background: "#FFFFFF", label: "#5E5E5E", border: "#8C8C8C" },
  generic: { background: "#F3F4F6", label: "#111827", border: "#D1D5DB" },
};
```

### Default dark palette

Providers that ship a dark-mode variant flip appropriately (Google → dark card, Microsoft → dark card, GitHub → light card since GitHub's brand goes lighter on dark). Apple stays black-on-dark for continuity with Apple's official guidance. Facebook keeps its brand blue in both modes.

```ts
export const DEFAULT_DARK_SOCIAL_BUTTON_COLORS: SocialButtonColors = {
  google: { background: "#1F1F1F", label: "#F5F5F7", border: "#3C4043" },
  apple: { background: "#FFFFFF", label: "#000000", border: "#FFFFFF" },
  facebook: { background: "#1877F2", label: "#FFFFFF", border: "#1877F2" },
  github: { background: "#F5F5F7", label: "#0B0B0F", border: "#F5F5F7" },
  microsoft: { background: "#1F1F1F", label: "#F5F5F7", border: "#3C4043" },
  generic: { background: "#1F2937", label: "#F5F5F7", border: "#374151" },
};
```

### Flatten to Tamagui tokens

`flattenSocialButtonColors()` produces the flat `$uiSocialButton{Provider}{Slot}` token map:

```
uiSocialButtonGoogleBackground / uiSocialButtonGoogleLabel / uiSocialButtonGoogleBorder
uiSocialButtonAppleBackground  / uiSocialButtonAppleLabel  / uiSocialButtonAppleBorder
... (18 tokens total: 6 providers × 3 slots)
```

### Merge helper

```ts
export function mergeSocialButtonColors(
  base: SocialButtonColors,
  override?: Partial<Record<keyof SocialButtonColors, Partial<SocialButtonProviderColors>>>
): SocialButtonColors;

export function mergeSocialButtonProviderColors(
  base: SocialButtonProviderColors,
  override?: Partial<SocialButtonProviderColors>
): SocialButtonProviderColors;
```

Same shape pair as `mergeButtonColors` / `mergeButtonVariantColors`.

## File structure

```
packages/ui-kraken/src/components/social-button/
├── social-button.tsx           # component logic + resolvePalette + resolveRadius + compound export
├── social-button.styled.ts     # StyledSocialButton (XStack) + size variants + StyledSocialButtonLabel
├── social-button-types.ts      # SocialButtonProvider, SocialButtonSize, SocialButtonRadius,
│                               # SocialButtonColorsInput, SocialButtonProps
├── social-button.spec.tsx      # unit tests + describe("snapshots") block
├── social-button.stories.tsx   # Storybook (~8 stories)
├── README.md                   # props table + usage + Platform support
└── index.ts                    # explicit named exports
```

Token / provider wiring per [`creating-component-tamagui` Section 11](../.agents/skills/creating-component-tamagui/SKILL.md).

## Testing

**Coverage target: 100%** on the component.

### Behavioral coverage (~25 tests)

- Renders label under `{root}-label`; default testID `"social-button"` + custom override
- Icon slot mounts only when `icon` prop passed AND not loading
- Loader mounts only when `loading`; hides icon slot; disables press
- `disabled` prop disables press and dims via a11y state
- `disabled` OR `loading` — either sets `accessibilityState.disabled` to true
- `loading` sets `accessibilityState.busy` to true
- `onPress` fires when tapped and not disabled/loading (parametrized: normal + loading + disabled)
- Each provider resolves to the correct 3-slot palette (parametrized 6× — google/apple/facebook/github/microsoft/generic)
- Compound shortcuts (`SocialButton.Google` / `.Apple` / etc.) resolve to their provider (parametrized 6×)
- Per-instance `socialButtonColors.background` / `label` / `border` override wins (parametrized)
- Provider-level palette propagates via `useUIKit()`
- Dark palette resolves when `activeTheme === "dark"`
- `size` maps correctly (parametrized 3× — sm/md/lg)
- `radius` maps correctly on all 6 preset values + a raw number
- `accessibilityRole="button"` default + auto `accessibilityLabel={label}`
- Consumer `accessibilityLabel` overrides the auto default
- XStack pass-through: padding, margin, width, `pressStyle` flow through the spread
- ActivityIndicator inside loader is colored by the resolved `label` slot (per-instance override wins)

### Structural snapshots (~5)

- Google provider, md size, light palette
- Apple provider, md size, light palette (visual contrast)
- Facebook provider, lg size, light palette
- Loading state (any provider)
- Dark palette + Google (dark-mode flip)

## Storybook (~8 stories)

- `Google`, `Apple`, `Facebook`, `Github`, `Microsoft`, `Generic` — one story per compound shortcut
- `Loading` — Google + loading spinner
- `DisabledStack` — disabled Google + Apple stacked vertically
- `SizeScale` — sm / md / lg of Google
- `CustomColors` — brand-tinted per-instance override
- `DarkTheme` — Google + Apple + GitHub in dark mode

## Example app screen

`apps/example/app/(pages)/components/social-button.tsx` — 5 sections:

1. **All providers** — 6 buttons stacked (one per provider) with placeholder glyphs as icons.
2. **Size scale** — sm / md / lg of `SocialButton.Google` side by side.
3. **Loading + disabled** — Google (loading) + Apple (disabled) stacked.
4. **Per-instance override** — Generic button with a custom brand palette.
5. **Auth-screen composition** — a vertical stack of 3 full-width buttons (Google + Apple + Generic) inside a card that reads like a real login form.

Plus route registration + row on the components home.

## Non-goals

- **No shipped provider logos** — trademark + peer-dep concerns. Consumers bring their own.
- **No auto label generation** — "Continue with Google" is a string the consumer localizes. English defaults would need i18n plumbing anyway.
- **No `fullWidth` prop** — pass `width="100%"` via the Tamagui spread when you need auth-screen width.
- **No provider-specific behavior** (OAuth flow, redirect, PKCE handshake) — SocialButton is a presentational primitive. Consumers wire the flow in `onPress`.
- **No "sign-out" variant** — that's a Button.Ghost with a lock icon in the consumer's app; not a SocialButton concern.
- **No divider / "or continue with" separator** built in — consumers render `<Text>or</Text>` or a custom line between buttons themselves.

## How to ship

Executed on branch `feat/duna-migration-batch-1`:

1. Token schema wiring (types + defaults + flatten + provider + barrels).
2. Component files: `social-button-types.ts` → `social-button.styled.ts` → `social-button.tsx` → `social-button.spec.tsx` (+ snapshots) → `social-button.stories.tsx` → `README.md` → `index.ts`.
3. Barrels: `components/index.ts` + `src/index.ts`.
4. Example: screen + route + components-home row.
5. Flip status here (`planned` → `shipped on <YYYY-MM-DD>`).
6. Flip Batch 1 plan doc: ⏳ → ✅ on SocialButton's row.
7. Verify green + **100% coverage on `social-button.tsx`** via `pnpm --filter ui-kraken test:coverage`.
8. Atomic commit with rich body.

## How to extend

- **Add more providers** — extend `SocialButtonColors` with additional keys (linkedin, x, discord, gitlab, ...) + defaults + a compound shortcut. Additive; no existing consumer breaks.
- **Add a `divider` compound** — `<SocialButton.Divider>or continue with</SocialButton.Divider>` between button stacks. Cleaner than requiring consumers to compose their own.
- **Ship an official logo pack** — resolve trademark concerns, publish a separate `@ui-kraken/social-icons` package with default logos consumers can drop in. Keeps the primitive lean.
- **Add `iconOnly` mode** — no label, square icon-only social buttons (useful in secondary auth affordances). Would need a new `size` scale + a11y label handling since the visible text disappears.
