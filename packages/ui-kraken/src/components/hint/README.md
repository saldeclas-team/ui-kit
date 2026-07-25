# Hint

Inline contextual tip or gentle hint row. Sits next to a form field, at the bottom of a section, or embedded in a screen paragraph to guide the user with a short bit of copy. Quieter than `Alert` — Alert is a full-width banner with a strong background and border; Hint is compact, often has no background at all, and reads as inline advisory copy.

## Import

```tsx
import { Hint } from "ui-kraken";
```

## Props

| Prop         | Type                                                        | Default     | Description                                                                                    |
| ------------ | ----------------------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------- |
| `tone`       | `"neutral" \| "info" \| "success" \| "warning" \| "danger"` | `"neutral"` | Semantic tone. Drives the resolved 3-slot palette.                                             |
| `emphasis`   | `"ghost" \| "soft"`                                         | `"ghost"`   | `ghost` = transparent background; `soft` = tinted background matched to the tone.              |
| `dense`      | `boolean`                                                   | `false`     | Compact spacing mode. Use next to Input helper-text where the parent provides breathing room.  |
| `icon`       | `ReactNode`                                                 | —           | Optional leading icon. Consumer brings any icon component; tone-tinted via inheriting wrapper. |
| `title`      | `string`                                                    | —           | Optional bold heading rendered above the body.                                                 |
| `hintColors` | `Partial<HintToneColors>`                                   | —           | Per-instance color override for the resolved tone. Missing slots fall through.                 |
| `testID`     | `string`                                                    | `"hint"`    | Root testID. Sub-elements derive `{root}-icon`, `{root}-title`, `{root}-body`.                 |

Every Tamagui `XStackProps` flows through the spread — `padding`, `margin`, `borderRadius`, `borderWidth`, `borderColor`, `pressStyle`, shorthand aliases (`px`, `py`, `mx`, `br`), every accessibility prop, etc.

## Compound shortcuts

```tsx
<Hint.Info>...</Hint.Info>
<Hint.Success>...</Hint.Success>
<Hint.Warning>...</Hint.Warning>
<Hint.Danger>...</Hint.Danger>
```

Same pattern as `Alert.Info` and `Button.Primary`. `Hint.Neutral` is intentionally omitted — that's the base `<Hint>` default.

## Color model

Hint has its own **`hintColors`** block on the token schema — 5 tones × 3 slots.

```tsx
import { UIKitProvider } from "ui-kraken";

<UIKitProvider
  tokens={{
    hintColors: {
      info: { text: "#1E40AF", icon: "#2563EB", background: "#EFF6FF" },
    },
  }}
  dark={{
    hintColors: {
      info: { text: "#93C5FD", icon: "#60A5FA", background: "#1E3A8A" },
    },
  }}
>
  <App />
</UIKitProvider>;
```

### Slots

| Slot         | Paints                                                                                 |
| ------------ | -------------------------------------------------------------------------------------- |
| `text`       | Title + body text.                                                                     |
| `icon`       | Icon-slot wrapper color (consumer's icon inherits via `color` prop or `currentColor`). |
| `background` | Row background — only rendered when `emphasis="soft"`.                                 |

### Default palettes

**Light** — text sits slightly darker than the matching Alert `text` slot; backgrounds are pale tints for the `soft` emphasis:

| Tone      | Text      | Icon      | Background |
| --------- | --------- | --------- | ---------- |
| `neutral` | `#4B5563` | `#6B7280` | `#F3F4F6`  |
| `info`    | `#1E40AF` | `#2563EB` | `#EFF6FF`  |
| `success` | `#065F46` | `#059669` | `#ECFDF5`  |
| `warning` | `#92400E` | `#D97706` | `#FFFBEB`  |
| `danger`  | `#991B1B` | `#DC2626` | `#FEF2F2`  |

**Dark** — inverted rhythm; text uses lighter tone hues, backgrounds use deeper tinted grays that read as subtle differentiation from `Surface.base`.

| Tone      | Text      | Icon      | Background |
| --------- | --------- | --------- | ---------- |
| `neutral` | `#D1D5DB` | `#9CA3AF` | `#1F2937`  |
| `info`    | `#93C5FD` | `#60A5FA` | `#1E3A8A`  |
| `success` | `#6EE7B7` | `#34D399` | `#064E3B`  |
| `warning` | `#FCD34D` | `#FBBF24` | `#78350F`  |
| `danger`  | `#FCA5A5` | `#F87171` | `#7F1D1D`  |

## Usage

Simple inline neutral hint:

```tsx
<Hint>A short piece of contextual copy.</Hint>
```

Info hint with an icon:

```tsx
<Hint.Info icon={<InfoIcon />}>Your session will end in 5 minutes.</Hint.Info>
```

Success confirmation with title + body + icon:

```tsx
<Hint.Success icon={<CheckIcon />} title="Saved">
  Your changes are safe. You can leave this screen.
</Hint.Success>
```

Warning with soft emphasis (tinted background) — reads as a callout without being a full banner:

```tsx
<Hint.Warning emphasis="soft" icon={<AlertIcon />} title="Heads up">
  You are approaching your monthly limit.
</Hint.Warning>
```

Dense mode next to an Input's helper region — tighter spacing so the hint sits close under the field:

```tsx
<Input label="Password" secureTextEntry />
<Hint.Info dense icon={<InfoIcon />}>
  Minimum 8 characters, one uppercase, one number.
</Hint.Info>
```

Per-instance brand-tinted hint:

```tsx
<Hint tone="info" emphasis="soft" hintColors={{ text: "#4C1D95", background: "#F5F3FF" }}>
  Brand-accent hint on a promoted feed.
</Hint>
```

## Accessibility

Defaults:

- `accessibilityRole="text"` — Hint is advisory copy, not a system alert.
- `accessibilityLiveRegion="polite"` on `warning` + `danger` tones so late-mounted hints get announced without stealing focus.
- `accessibilityLiveRegion="none"` on `neutral` / `info` / `success` (default; no announcement).

Both flow through the spread — consumers can bump `warning` up to `assertive` or drop the role entirely on a decorative hint.

## Sub-element testIDs

- root: `"hint"` (overridable via `testID`)
- icon wrapper (when `icon` passed): `"{root}-icon"`
- title (when `title` passed): `"{root}-title"`
- body (when children passed): `"{root}-body"`

## Notes

- **No dismiss button** — Hint is contextual copy, not a notification. If the tip must be dismissible, wrap in your own `<Pressable>` (or reach for `Alert`, which is closer to a system message).
- **No auto-mount animation** — Hint appears instantly. Animation belongs to whatever container is mounting/unmounting the Hint.
- **No `size` variants** — the `dense` toggle covers the "smaller when needed" use case.
- **No icon library dependency** — consumer brings any icon element. Same convention as Alert.
- **No embedded action button** — that's Alert territory. Hint is a leaf advisory row.

## Platform support

| Platform | Status | Notes                                                                                        |
| -------- | ------ | -------------------------------------------------------------------------------------------- |
| iOS      | ✅     | Native rendering via `XStack`.                                                               |
| Android  | ✅     | Native rendering via `XStack`. Live-region announcement fires on `warning` + `danger` tones. |
| Web      | ✅     | Via `react-native-web`. Renders as a flex `<div>`; `aria-live="polite"` on warning + danger. |
