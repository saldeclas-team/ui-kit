# ExternalLink

Tappable link that opens a URL in the platform browser. Router-agnostic — does NOT depend on `expo-router` or `react-navigation`. Common uses: "Read more" links in body copy, Terms & Conditions / Privacy Policy links on onboarding, help-center references in error messages.

The primitive prefers an in-app browser (`expo-web-browser`) when installed and falls back to the system browser (RN `Linking.openURL`) when it isn't. Consumers who want the nicer in-app UX install `expo-web-browser`; consumers who don't want the extra dep get the OS-level fallback automatically.

## Import

```tsx
import { ExternalLink } from "ui-kraken";
```

## Props

| Prop                 | Type                                        | Default           | Description                                                                                    |
| -------------------- | ------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------- |
| `url`                | `string`                                    | —                 | URL to open. Required.                                                                         |
| `children`           | `ReactNode`                                 | —                 | Visible label. Strings auto-wrap in styled underlined Text; ReactNodes render as-is. Required. |
| `icon`               | `ReactNode`                                 | —                 | Optional leading icon.                                                                         |
| `trailingIcon`       | `ReactNode`                                 | auto `↗`          | Override the default trailing arrow glyph.                                                     |
| `hideTrailingIcon`   | `boolean`                                   | `false`           | Hide the trailing icon entirely (useful for inline body-copy links).                           |
| `disabled`           | `boolean`                                   | `false`           | Disable the link.                                                                              |
| `onPress`            | `() => boolean \| Promise<boolean> \| void` | —                 | Pre-open hook — return `false` to prevent the open (analytics guard, custom URL rewrite).      |
| `externalLinkColors` | `Partial<ExternalLinkColors>`               | —                 | Per-instance color override. Missing slots fall through to the provider.                       |
| `testID`             | `string`                                    | `"external-link"` | Root testID. Sub-elements derive `-icon`, `-label`, `-trailing-icon`.                          |

Every Tamagui `XStackProps` flows through the spread — `padding`, `margin`, `hitSlop`, `pressRetentionOffset`, every accessibility prop, etc.

## Inline vs standalone layout

ExternalLink picks its render mode automatically based on the props:

- **Inline** — when the link has **no leading icon** AND `hideTrailingIcon=true`, it renders as a single `<Text onPress>` node. React Native's text-nesting only baselines `<Text>` children — a `<View>` (which an `<XStack>` becomes under the hood) rendered inside `<Text>` would float above the surrounding copy. Inline mode is what you want when the link sits inside a paragraph.
- **Standalone** — when the link has a leading `icon`, a trailing icon, or both, it renders as an `<XStack>` with fixed-size wrappers. Best for CTAs, dedicated rows, and card compositions.

Consumers don't pick the mode explicitly — set / don't set `icon` + `hideTrailingIcon` and the primitive routes automatically. In inline mode the `-icon`, `-label`, and `-trailing-icon` sub-testIDs collapse away (the root `testID` carries the label directly).

## Backend selection

At module import time, `open-url.ts` runs a `try { require("expo-web-browser") } catch {}` probe:

- **If `expo-web-browser` is installed**: `openBrowserAsync(url)` opens an in-app browser (chrome customization, back-button-in-webview).
- **If not**: `Linking.openURL(url)` kicks the URL to the OS-level system browser.

The consumer opts into the nicer UX by installing the optional peer dep — nothing to configure at runtime.

## Color model

ExternalLink has its own **`externalLinkColors`** block on the token schema — 2 slots (`label` + `icon`).

```tsx
import { UIKitProvider } from "ui-kraken";

<UIKitProvider
  tokens={{
    externalLinkColors: { label: "#2563EB", icon: "#2563EB" },
  }}
  dark={{
    externalLinkColors: { label: "#60A5FA", icon: "#60A5FA" },
  }}
>
  <App />
</UIKitProvider>;
```

### Slots

| Slot    | Paints                                                      |
| ------- | ----------------------------------------------------------- |
| `label` | Label text color + underline color (derived automatically). |
| `icon`  | Leading icon color + trailing arrow color.                  |

### Default palettes

**Light**: `#2563EB` (brand blue). **Dark**: `#60A5FA` (lighter blue for contrast on dark).

Both match `TextColors.interactive` — inline links in body copy look native alongside other interactive text.

## Usage

Inline in body copy:

```tsx
<Text>
  For more information, please{" "}
  <ExternalLink url="https://example.com/docs" hideTrailingIcon>
    read the docs
  </ExternalLink>
  .
</Text>
```

Standalone CTA with leading icon + trailing arrow:

```tsx
<ExternalLink url="https://example.com/docs" icon={<InfoIcon />}>
  Visit our documentation
</ExternalLink>
```

Terms & Conditions in an onboarding form:

```tsx
<Text>
  By tapping continue you agree to our{" "}
  <ExternalLink url="https://example.com/terms" hideTrailingIcon>
    Terms of Service
  </ExternalLink>
  .
</Text>
```

With an analytics guard:

```tsx
<ExternalLink
  url="https://example.com/pricing"
  onPress={() => {
    analytics.track("external_link_tap", { url: "pricing" });
  }}
>
  Pricing
</ExternalLink>
```

Preventing the open based on runtime logic:

```tsx
<ExternalLink
  url="https://internal.example.com"
  onPress={async () => {
    const allowed = await checkPermissions();
    if (!allowed) {
      showToast("Not allowed");
      return false; // ← prevent the open
    }
  }}
>
  Internal portal
</ExternalLink>
```

Per-instance brand-tinted link:

```tsx
<ExternalLink url="https://example.com" externalLinkColors={{ label: "#7C3AED", icon: "#7C3AED" }}>
  Brand-accent link
</ExternalLink>
```

## Accessibility

Defaults:

- `accessibilityRole="link"`
- `accessibilityLabel` — auto-composed from the string children; falls back to `url` when children is a ReactNode. Overridable via `...rest`.
- `accessibilityState={{ disabled: true }}` when `disabled=true`.

## Sub-element testIDs

- root: `"external-link"` (overridable via `testID`)
- leading icon (when `icon` passed): `"{root}-icon"`
- label: `"{root}-label"`
- trailing icon (when NOT hidden): `"{root}-trailing-icon"`

## Notes

- **No shipped logos or icons** — the trailing `↗` is a Unicode glyph, not an SVG. Consumers can replace via `trailingIcon`.
- **No download support** — that's a platform concern the consumer handles.
- **No deep-link routing** — internal navigation belongs on `expo-router`'s `<Link>`.
- **No `href` alias** — the prop is `url`, matching the RN `Linking` API and Expo docs.
- **No visited-state tracking** — RN doesn't ship browsing history like the web. Consumers who need it wire the `onPress` hook.
- **Open failures fail silently** — a broken URL doesn't crash the app. If you need to surface errors, wrap the call in your own tracking.

## Platform support

| Platform | Status | Notes                                                                                             |
| -------- | ------ | ------------------------------------------------------------------------------------------------- |
| iOS      | ✅     | Via `expo-web-browser` (preferred) or `Linking.openURL` (fallback).                               |
| Android  | ✅     | Same backend selection.                                                                           |
| Web      | ✅     | Via `react-native-web`. `Linking.openURL` opens a new browser tab; `expo-web-browser` also works. |
