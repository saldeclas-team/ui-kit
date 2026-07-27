# Divider

Thin line for visual separation between rows, sections, or slots. Horizontal by default; vertical variant for inline separators.

## Import

```tsx
import { Divider } from "ui-kraken";
```

## Props

| Prop            | Type                         | Default        | Description                                                                                       |
| --------------- | ---------------------------- | -------------- | ------------------------------------------------------------------------------------------------- |
| `orientation`   | `"horizontal" \| "vertical"` | `"horizontal"` | Line orientation. Horizontal → full-width row; vertical → full-height column.                     |
| `thickness`     | `number`                     | `1`            | Line thickness in px. Applied as `height` (horizontal) or `width` (vertical).                     |
| `inset`         | `number`                     | `0`            | Inset on both ends of the line. `marginHorizontal` for horizontal, `marginVertical` for vertical. |
| `dividerColors` | `Partial<DividerColors>`     | —              | Per-instance color override. Only the `line` slot is read.                                        |
| `testID`        | `string`                     | `"divider"`    | Root testID.                                                                                      |

Every Tamagui `YStackProps` also flows through the `...rest` spread — `margin`, `flex`, `borderRadius`, `opacity`, etc. `backgroundColor` is intentionally omitted; override the line color via `dividerColors`.

## Color model

`dividerColors` — 1 slot:

| Slot   | Paints                              |
| ------ | ----------------------------------- |
| `line` | The line's background color itself. |

### Default palettes

- **Light**: `line: "#E5E7EB"` (gray-200) — matches Input / Card border tones.
- **Dark**: `line: "#374151"` (gray-700) — visible on dark backgrounds without competing.

## Usage

### Horizontal — default

```tsx
<View>
  <Text>Row above</Text>
  <Divider />
  <Text>Row below</Text>
</View>
```

### Vertical — inline

```tsx
<View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
  <Icon />
  <Divider orientation="vertical" />
  <Icon />
</View>
```

Vertical dividers need a parent with a defined height (or `alignItems: "stretch"`) — `alignSelf: "stretch"` alone doesn't give the divider a height when the parent is a `flex-row` without a set height.

### Inset — iOS grouped-list look

```tsx
<Divider inset={16} />
```

The line pulls in 16 px on each end, matching the iOS Settings app / grouped `<TableView>` convention.

### Thick — section separator

```tsx
<Divider thickness={4} />
```

### Custom color

```tsx
// Per-instance
<Divider dividerColors={{ line: "#7C3AED" }} />

// Provider-wide (every Divider gets brand purple)
<UIKitProvider
  overrides={{
    light: { dividerColors: { line: "#7C3AED" } },
  }}
>
  ...
</UIKitProvider>
```

## Accessibility

`accessibilityRole="none"` by default — a divider is decorative. Screen readers skip it. If a Divider represents a landmark boundary between semantic sections, pass a more specific role at the callsite (RN's typings don't expose the iOS-only `.separator` trait; consumers who need it typically pass `accessibilityRole={"separator" as never}`):

```tsx
<Divider accessibilityRole="text" accessibilityLabel="End of card" />
```

## Sub-element testIDs

Divider is a single element — no sub-slots. Root testID overridable via `testID`.

## Notes

- **No `label` / `text` prop for labeled dividers.** A labeled divider is a distinct primitive — consumers who need one compose it themselves with a Text between two Dividers.
- **No `variant` prop (`"solid" | "dashed" | "dotted"`).** RN doesn't render dashed / dotted borders reliably across platforms.
- **`alignSelf: "stretch"` on the cross-axis** so the line fills its parent without a manual `width: '100%'`.

## Platform support

| Platform | Status |
| -------- | ------ |
| iOS      | ✅     |
| Android  | ✅     |
| Web      | ✅     |
