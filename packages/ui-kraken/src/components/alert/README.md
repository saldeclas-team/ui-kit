# Alert

Contextual feedback surface. 4 semantic variants (info / success / warning / danger), optional title + body + icon slot, per-instance color overrides, compound API. Uses the existing `textColors` block on `KrakenProvider` — no new tokens.

## Import

```tsx
import { Alert } from "ui-kraken";
```

## Props

| Prop          | Type                                                 | Default   | Description                                                                                                              |
| ------------- | ---------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------ |
| `variant`     | `"info" \| "success" \| "warning" \| "danger"`       | `"info"`  | Semantic variant. Drives the default color palette (icon + text + background) and the a11y announcement priority.        |
| `title`       | `string`                                             | —         | Optional bold title above the body.                                                                                      |
| `children`    | `ReactNode`                                          | —         | Body content. Plain string OR nested `<Text>` for rich content (inline links, formatting).                               |
| `icon`        | `ReactNode`                                          | —         | Optional leading icon. Consumer brings their own icon system (no dep on an icon library).                                |
| `radius`      | `number \| "none" \| "sm" \| "md" \| "lg" \| "pill"` | `"md"`    | Border radius. Presets map to the coarse theme scale, `"pill"` is fully rounded. Raw number is passed through as pixels. |
| `alertColors` | `Partial<{ background?, border?, text, icon }>`      | —         | Per-instance color override. Every field optional; missing slots fall through to the variant defaults.                   |
| `testID`      | `string`                                             | `"alert"` | Root testID. Sub-elements derive: `{testID}-title`, `{testID}-body`, `{testID}-icon`.                                    |

## Variants

| Variant   | Color slot on `textColors` | Typical use                                        |
| --------- | -------------------------- | -------------------------------------------------- |
| `info`    | `textColors.info`          | Neutral information, tips, non-actionable status   |
| `success` | `textColors.success`       | Confirmation messages, completed operations        |
| `warning` | `textColors.warning`       | Caution, non-blocking heads-up                     |
| `danger`  | `textColors.danger`        | Errors, blocking issues, destructive confirmations |

Background is computed at runtime as the variant color at ~15% opacity. No `error` variant — deliberately renamed to `danger` for consistency with `TextColors.danger`.

## Color model

Alert reuses the existing `textColors` block on `KrakenProvider` — no new schema. Override at the provider level to re-theme all alerts + all `<Text color="info">` etc.:

```tsx
import { KrakenProvider } from "ui-kraken";

<KrakenProvider
  tokens={{
    textColors: {
      info: "#0284C7",
      success: "#059669",
      warning: "#D97706",
      danger: "#DC2626",
      // ... other slots
    },
  }}
  defaultTheme="system"
>
  <App />
</KrakenProvider>;
```

For a one-off per-instance paint (without touching the provider palette), use the `alertColors` prop.

## Usage

Basic:

```tsx
<Alert>Body text, info variant by default.</Alert>

<Alert variant="success" title="Saved">
  Your changes were saved successfully.
</Alert>

<Alert.Danger title="Payment failed" icon={<XCircleIcon />}>
  Update your card and retry.
</Alert.Danger>
```

Compound shortcuts:

```tsx
<Alert.Info>Info</Alert.Info>
<Alert.Success>Success</Alert.Success>
<Alert.Warning>Warning</Alert.Warning>
<Alert.Danger>Danger</Alert.Danger>
```

Radius presets and pill / custom shapes:

```tsx
<Alert radius="none">Square edges</Alert>
<Alert radius="lg">Large radius</Alert>
<Alert radius="pill">Fully rounded</Alert>
<Alert radius={24}>Custom 24px</Alert>
```

With an icon (bring your own — Feather / Ionicons / custom SVG / plain `<Text>`):

```tsx
import { CheckCircle } from "lucide-react-native";

<Alert.Success icon={<CheckCircle size={20} />} title="Saved">
  Your profile is up to date.
</Alert.Success>;
```

Per-instance color override — only the fields you want to change:

```tsx
<Alert.Info
  title="Custom background"
  alertColors={{ background: "#FFEEDD" }}
>
  Text + icon still use the info variant defaults.
</Alert.Info>

<Alert.Danger
  title="Inverted"
  alertColors={{
    background: "#4A0000",
    text: "#FFFFFF",
    icon: "#FFFFFF",
  }}
>
  Every slot overridden.
</Alert.Danger>

<Alert.Success
  title="Bordered"
  alertColors={{ background: "#F0FDF4", border: "#059669" }}
>
  Opt into a border by providing `border`.
</Alert.Success>
```

Rich body content (nest any component inside `children`):

```tsx
import { Alert, Text } from "ui-kraken";

<Alert.Warning title="Free tier limit">
  <Text.Body2>
    You have reached 5/5 seats.{" "}
    <Text.Body2 color="interactive" onPress={openBilling}>
      Upgrade
    </Text.Body2>{" "}
    for unlimited.
  </Text.Body2>
</Alert.Warning>;
```

## Accessibility

Every variant sets `accessibilityRole="alert"`. The `accessibilityLiveRegion` differs by variant:

- `danger` → `"assertive"` (interrupts current announcement)
- `info` / `success` / `warning` → `"polite"` (announced when the reader finishes)

Follows the [MDN Live Region](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions) and Radix `Callout` guidance. Screen readers announce the title + body content in order.

## Notes

- **No `onClose` / dismiss** — v1 is display-only. Wrap `<Alert>` in a stateful parent for conditional rendering, or wait for a future `Alert.Dismissible` primitive.
- **No `action` slot** — compose actions inline via `children`: `<Alert><Text>Failed. <Button.Ghost>Retry</Button.Ghost></Text></Alert>`.
- **No `variant="error"`** — deliberately named `"danger"` to match `TextColors.danger`.
- **Icon is a slot** — Alert has zero dep on an icon library. Any `ReactNode` works; the wrapper tints via `color` prop (most icon libs pick this up).

## Platform support

| Platform | Status | Notes                                                                                                                                                                       |
| -------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| iOS      | ✅     | Full support. `accessibilityLiveRegion` maps to VoiceOver announcements.                                                                                                    |
| Android  | ✅     | Full support. `accessibilityLiveRegion` maps to TalkBack.                                                                                                                   |
| Web      | ✅     | Via `react-native-web`. Renders as nested `<div>` / `<span>`. `accessibilityRole="alert"` becomes `role="alert"` on the DOM. `accessibilityLiveRegion` becomes `aria-live`. |
