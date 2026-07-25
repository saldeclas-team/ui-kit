# SocialButton

OAuth-provider button. Renders `"Continue with Google"` / `"Sign in with Apple"` / etc. as a compact horizontal button with the provider's logo on the left and a label on the right. Common uses: onboarding sign-in screens, account-linking flows, "connect your accounts" pages.

Separate from [`Button`](../button/README.md) — Button carries generic tone variants (primary / secondary / outline / ghost / destructive); SocialButton carries provider-specific brand palettes that would clutter Button's namespace.

## Import

```tsx
import { SocialButton } from "ui-kraken";
```

## Props

| Prop                 | Type                                  | Default           | Description                                                                        |
| -------------------- | ------------------------------------- | ----------------- | ---------------------------------------------------------------------------------- |
| `provider`           | `SocialButtonProvider`                | —                 | Provider identifier. Drives palette + compound-shortcut default. Required.         |
| `label`              | `string`                              | —                 | Button label (e.g. `"Continue with Google"`). Localized by the consumer. Required. |
| `icon`               | `ReactNode`                           | —                 | Provider logo. Consumer brings any element; **NO logos shipped** (trademark).      |
| `onPress`            | `() => void`                          | —                 | Standard press handler.                                                            |
| `disabled`           | `boolean`                             | `false`           | Disable the button (renders at 45% opacity, ignores taps).                         |
| `loading`            | `boolean`                             | `false`           | Show spinner in the icon slot; disables press to prevent double-submits.           |
| `size`               | `"sm" \| "md" \| "lg"`                | `"md"`            | Height scale (40 / 48 / 56 px min-height).                                         |
| `radius`             | `SocialButtonRadius`                  | `"md"`            | Border radius.                                                                     |
| `socialButtonColors` | `Partial<SocialButtonProviderColors>` | —                 | Per-instance override for the resolved provider. Missing slots fall through.       |
| `testID`             | `string`                              | `"social-button"` | Root testID. Sub-elements derive `-icon`, `-label`, `-loader`.                     |

Every Tamagui `XStackProps` flows through the spread — `padding`, `margin`, `width`, `borderColor`, `pressStyle`, shorthand aliases, every accessibility prop, etc. Set `width="100%"` when you want the button to span an auth screen's form width.

## Compound shortcuts

```tsx
<SocialButton.Google    label="Continue with Google"   icon={<GoogleLogo />}    onPress={...} />
<SocialButton.Apple     label="Sign in with Apple"     icon={<AppleLogo />}     onPress={...} />
<SocialButton.Facebook  label="Continue with Facebook" icon={<FacebookLogo />}  onPress={...} />
<SocialButton.Github    label="Sign in with GitHub"    icon={<GithubLogo />}    onPress={...} />
<SocialButton.Microsoft label="Continue with Microsoft" icon={<MicrosoftLogo />} onPress={...} />
<SocialButton.Generic   label="Continue with X"        icon={<XLogo />}         onPress={...} />
```

Same pattern as `Button.Primary` / `Alert.Info`. Top-level `<SocialButton provider="google" ...>` also works when the provider is dynamic.

## Color model

SocialButton has its own **`socialButtonColors`** block on the token schema — 6 providers × 3 slots.

```tsx
import { UIKitProvider } from "ui-kraken";

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
</UIKitProvider>;
```

### Slots

| Slot         | Paints                                                                          |
| ------------ | ------------------------------------------------------------------------------- |
| `background` | Button background.                                                              |
| `label`      | Label text + loader spinner color.                                              |
| `border`     | 1 px border. `background === border` for solid buttons; different for outlined. |

### Default light palette

| Provider    | Background | Label     | Border    |
| ----------- | ---------- | --------- | --------- |
| `google`    | `#FFFFFF`  | `#1F1F1F` | `#DADCE0` |
| `apple`     | `#000000`  | `#FFFFFF` | `#000000` |
| `facebook`  | `#1877F2`  | `#FFFFFF` | `#1877F2` |
| `github`    | `#24292F`  | `#FFFFFF` | `#24292F` |
| `microsoft` | `#FFFFFF`  | `#5E5E5E` | `#8C8C8C` |
| `generic`   | `#F3F4F6`  | `#111827` | `#D1D5DB` |

Values follow each provider's official button guidelines (Google's Material light card, Apple's black, Facebook's brand blue, GitHub's near-black, Microsoft's Fluent light card).

### Default dark palette

| Provider    | Background | Label     | Border    |
| ----------- | ---------- | --------- | --------- |
| `google`    | `#1F1F1F`  | `#F5F5F7` | `#3C4043` |
| `apple`     | `#FFFFFF`  | `#000000` | `#FFFFFF` |
| `facebook`  | `#1877F2`  | `#FFFFFF` | `#1877F2` |
| `github`    | `#F5F5F7`  | `#0B0B0F` | `#F5F5F7` |
| `microsoft` | `#1F1F1F`  | `#F5F5F7` | `#3C4043` |
| `generic`   | `#1F2937`  | `#F5F5F7` | `#374151` |

Facebook keeps the brand blue in both modes (Facebook's brand doesn't ship a dark variant). Apple flips to white on dark, per Apple's approved inverse. GitHub goes lighter on dark so the button pops against `Surface.base`.

## Usage

Basic:

```tsx
<SocialButton.Google
  label="Continue with Google"
  icon={<GoogleLogo />}
  onPress={handleGoogleSignIn}
/>
```

Loading state — prevents double-submits during the OAuth handshake:

```tsx
const [loading, setLoading] = useState(false);
<SocialButton.Google
  label="Continue with Google"
  icon={<GoogleLogo />}
  loading={loading}
  onPress={async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } finally {
      setLoading(false);
    }
  }}
/>;
```

Auth-screen composition — three full-width buttons stacked vertically:

```tsx
<YStack gap="$3" width="100%">
  <SocialButton.Google
    label="Continue with Google"
    icon={<GoogleLogo />}
    onPress={handleGoogle}
    width="100%"
  />
  <SocialButton.Apple
    label="Sign in with Apple"
    icon={<AppleLogo />}
    onPress={handleApple}
    width="100%"
  />
  <SocialButton.Generic
    label="Continue with SSO"
    icon={<SsoIcon />}
    onPress={handleSSO}
    width="100%"
  />
</YStack>
```

Per-instance brand-tinted button — for a custom provider or a promoted CTA:

```tsx
<SocialButton.Generic
  label="Continue with X"
  icon={<XLogo />}
  socialButtonColors={{
    background: "#4C1D95",
    label: "#F5F3FF",
    border: "#4C1D95",
  }}
  onPress={handleX}
/>
```

Size scale:

```tsx
<SocialButton.Google size="sm" label="Continue with Google" icon={<GoogleLogo />} />
<SocialButton.Google size="md" label="Continue with Google" icon={<GoogleLogo />} />
<SocialButton.Google size="lg" label="Continue with Google" icon={<GoogleLogo />} />
```

## Accessibility

Defaults:

- `accessibilityRole="button"`
- `accessibilityLabel={label}` (auto)
- `accessibilityState={{ disabled: disabled || loading, busy: loading }}`

All overridable via `...rest`. Pass a custom `accessibilityLabel` if the visible `label` isn't self-descriptive (e.g. localized short forms).

## Sub-element testIDs

- root: `"social-button"` (overridable via `testID`)
- icon (when `icon` passed, and NOT loading): `"{root}-icon"`
- label: `"{root}-label"`
- loader (when `loading`): `"{root}-loader"`

## Notes

- **No shipped logos** — bring your own. Trademark concerns + icon-library choice.
- **No auto label generation** — `"Continue with Google"` is a string the consumer localizes.
- **No `fullWidth` prop** — use `width="100%"` via the Tamagui spread when needed.
- **No OAuth flow logic** — SocialButton is presentational. Wire the flow in `onPress`.
- **No "or continue with" divider** built in — render your own `<Text>or</Text>` between button stacks.
- **No `iconOnly` mode** — the label is required. Icon-only social buttons need a11y label handling that would blur the primitive.

## Platform support

| Platform | Status | Notes                                                                                         |
| -------- | ------ | --------------------------------------------------------------------------------------------- |
| iOS      | ✅     | Native rendering via `XStack`.                                                                |
| Android  | ✅     | Native rendering.                                                                             |
| Web      | ✅     | Via `react-native-web`. Renders as `<button role="button">` with `aria-busy`/`aria-disabled`. |
