# Collapsible

Animated expand-collapse section. A pressable header toggles visibility of a body region below it — tap the header, the body slides open. Common uses: FAQ accordions, settings pages ("Advanced options"), long detail views broken into sections, filter panels on list screens.

## Import

```tsx
import { Collapsible } from "ui-kraken";
```

## Props

| Prop                | Type                          | Default         | Description                                                                                          |
| ------------------- | ----------------------------- | --------------- | ---------------------------------------------------------------------------------------------------- |
| `title`             | `string`                      | —               | Header label. Required.                                                                              |
| `expanded`          | `boolean`                     | —               | Body visibility. Required (controlled).                                                              |
| `onExpandedChange`  | `(expanded: boolean) => void` | —               | Fires when the user taps the header. Required.                                                       |
| `children`          | `ReactNode`                   | —               | Body content.                                                                                        |
| `icon`              | `ReactNode`                   | —               | Optional leading icon in the header.                                                                 |
| `chevron`           | `ReactNode`                   | auto `"▸"`      | Override the default chevron glyph. The rotation transform still applies (rotates 90° on expand).    |
| `disabled`          | `boolean`                     | `false`         | Disable the header press.                                                                            |
| `animation`         | `"height" \| "none"`          | `"height"`      | `height` slides via measured height; `none` mounts/unmounts instantly.                               |
| `duration`          | `number`                      | `200`           | Animation duration in ms. Chevron uses `min(duration, 150)`.                                         |
| `radius`            | `CollapsibleRadius`           | `"md"`          | Border radius.                                                                                       |
| `collapsibleColors` | `Partial<CollapsibleColors>`  | —               | Per-instance color override. Missing slots fall through to the provider.                             |
| `testID`            | `string`                      | `"collapsible"` | Root testID. Sub-elements derive `-header`, `-icon`, `-title`, `-chevron`, `-body`, `-body-content`. |

Every Tamagui `YStackProps` flows through the spread — `padding`, `margin`, `width`, `pressStyle`, shorthand aliases, every accessibility prop, etc.

## Toggle behavior

- Tapping the header fires `onExpandedChange(!expanded)`.
- When `disabled`, taps are ignored (no `onExpandedChange` fires; the header renders at 50% opacity).
- The primitive never touches the incoming `expanded` prop — consumer holds state.

## Animation

`animation="height"` (default):

1. Body mounts at natural height on first render → `onLayout` measures it.
2. A reanimated `<Animated.View>` wrapper clamps `height` to the measured value via `useAnimatedStyle`.
3. Every `expanded` change animates the shared `height` value between `0` and the measured content height via `withTiming`.
4. Chevron rotates 90° via a separate shared value (`transform: [{ rotate: `${value * 90}deg` }]`).

`animation="none"`:

- Skips the height animation entirely. Body mounts when `expanded=true`, unmounts when `false`.
- Chevron rotation still animates (fast).
- Use for reduced-motion contexts or long lists where measuring dozens of Collapsibles would be wasteful.

Animations run through `react-native-reanimated` (required peer dep, already installed by consumers).

## Color model

Collapsible has its own **`collapsibleColors`** block on the token schema — 6 slots.

```tsx
import { UIKitProvider } from "ui-kraken";

<UIKitProvider
  tokens={{
    collapsibleColors: {
      headerBackground: "#F9FAFB",
      title: "#0B0B0F",
    },
  }}
  dark={{
    collapsibleColors: {
      headerBackground: "#111827",
      title: "#F5F5F7",
    },
  }}
>
  <App />
</UIKitProvider>;
```

### Slots

| Slot               | Paints                                        |
| ------------------ | --------------------------------------------- |
| `headerBackground` | Header row background.                        |
| `title`            | Header title text.                            |
| `icon`             | Leading icon color (when `icon` prop passed). |
| `chevron`          | Trailing chevron color.                       |
| `bodyBackground`   | Body region background.                       |
| `border`           | Outer 1 px border around the whole card.      |

### Default palettes

**Light**: `#F9FAFB` header · `#0B0B0F` title · `#6B7280` icon / chevron · `#FFFFFF` body · `#E5E7EB` border.

**Dark**: `#111827` header (surface-raised) · `#F5F5F7` title · `#9CA3AF` icon / chevron · `#0B0B0F` body (surface-base) · `#1F2937` border.

Dark mode inverts the elevation rhythm — header sits slightly LIGHTER than the body, matching Material 3's dark-surface convention where higher elevation is lighter.

## Usage

Basic toggle:

```tsx
const [open, setOpen] = useState(false);

<Collapsible title="Advanced options" expanded={open} onExpandedChange={setOpen}>
  <Text>Body content here.</Text>
</Collapsible>;
```

With icon + custom chevron:

```tsx
<Collapsible
  title="Notifications"
  expanded={open}
  onExpandedChange={setOpen}
  icon={<BellIcon />}
  chevron={<Text>{open ? "−" : "+"}</Text>}
>
  <NotificationsForm />
</Collapsible>
```

Accordion pattern — three stacked Collapsibles wired to only-one-open state:

```tsx
const [openIndex, setOpenIndex] = useState<number | null>(0);

<YStack gap="$2">
  {SECTIONS.map((section, idx) => (
    <Collapsible
      key={section.id}
      title={section.title}
      expanded={openIndex === idx}
      onExpandedChange={(next) => setOpenIndex(next ? idx : null)}
    >
      {section.body}
    </Collapsible>
  ))}
</YStack>;
```

Animation opt-out — for reduced-motion:

```tsx
const reduceMotion = useAccessibilityReduceMotion();
<Collapsible
  title="Details"
  expanded={open}
  onExpandedChange={setOpen}
  animation={reduceMotion ? "none" : "height"}
>
  {/* ... */}
</Collapsible>;
```

Per-instance brand palette:

```tsx
<Collapsible
  title="Brand-accent section"
  expanded={open}
  onExpandedChange={setOpen}
  collapsibleColors={{
    headerBackground: "#F5F3FF",
    title: "#4C1D95",
    chevron: "#7C3AED",
    border: "#DDD6FE",
  }}
>
  {/* ... */}
</Collapsible>
```

## Accessibility

- Header sets `accessibilityRole="button"`, `accessibilityLabel={title}`, and `accessibilityState={{ expanded, disabled }}`.
- Chevron rotation is decorative — screen readers announce the expand/collapse state via `accessibilityState.expanded` on the header, not the visual rotation.
- `disabled=true` sets `accessibilityState.disabled=true` and blocks touches.

## Sub-element testIDs

- root: `"collapsible"` (overridable via `testID`)
- header (pressable): `"{root}-header"`
- icon (when `icon` passed): `"{root}-icon"`
- title: `"{root}-title"`
- chevron (always renders — auto or custom): `"{root}-chevron"`
- body wrapper: `"{root}-body"`
- body content (measured): `"{root}-body-content"`

## Notes

- **Controlled only** — no `defaultExpanded` / uncontrolled mode. Mirrors RadioGroup / MultiSelect. Accordion coordination is easier when the container owns state.
- **No coordinated accordion mode** built in — wire "only-one-open" via shared state across siblings (see the Usage section for the recipe).
- **No `onAnimationEnd` callback** in v1 — animations complete via `useEffect` cleanup.
- **Animation uses `react-native-reanimated`** — repo-wide policy (AGENTS.md § Animation). RN's built-in `Animated` is banned in the library so every animated component in ui-kraken runs on the same stack (worklets on the UI thread).
- **Body renders at natural height on first mount** to measure it — for one frame the body is visible before clamping. If you start with `expanded=true`, this isn't visible. If you start with `expanded=false`, there's a very brief flash on mount.

## Platform support

| Platform | Status | Notes                                                                                     |
| -------- | ------ | ----------------------------------------------------------------------------------------- |
| iOS      | ✅     | Native rendering + `react-native-reanimated` worklets on the UI thread (height + rotate). |
| Android  | ✅     | Native rendering + same reanimated stack.                                                 |
| Web      | ✅     | Via `react-native-web`. Reanimated runs on the main thread via `requestAnimationFrame`.   |
