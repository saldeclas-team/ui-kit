# Button

Interactive button with `primary` / `secondary` / `ghost` / `destructive` tones, three sizes, disabled / loading states, and per-instance color overrides.

## Import

```tsx
import { Button } from "ui-kraken";
```

## Props

| Prop                               | Type                                                   | Default     | Description                                                                                                                                   |
| ---------------------------------- | ------------------------------------------------------ | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `children`                         | `ReactNode`                                            | —           | Label content. Optional so icon-only buttons work.                                                                                            |
| `tone`                             | `"primary" \| "secondary" \| "ghost" \| "destructive"` | `"primary"` | Visual tone. Usually set implicitly by the compound subcomponent (`Button.Ghost`).                                                            |
| `size`                             | `"sm" \| "md" \| "lg"`                                 | `"md"`      | Vertical size.                                                                                                                                |
| `disabled`                         | `boolean`                                              | `false`     | Disables press interaction and dims the surface.                                                                                              |
| `loading`                          | `boolean`                                              | `false`     | Replaces the `leftIcon` slot with a loader and blocks presses. Sets `accessibilityState.busy`.                                                |
| `leftIcon`                         | `ReactNode`                                            | —           | Slot rendered before the label. Hidden while `loading`.                                                                                       |
| `rightIcon`                        | `ReactNode`                                            | —           | Slot rendered after the label.                                                                                                                |
| `buttonColors`                     | `ButtonColors`                                         | —           | Per-instance overrides for the button surface color. Slots: `primary`, `secondary`, `disabled`, `loading`.                                    |
| `textColors`                       | `TextColors`                                           | —           | Per-instance overrides for the label color. Slots: `primary`, `secondary`, `disabled`.                                                        |
| `iconColors`                       | `IconColors`                                           | —           | Per-instance overrides for icon tint. Slots: `primary`, `secondary`, `disabled`.                                                              |
| `testID`                           | `string`                                               | `"button"`  | Root testID. Subelements derive: `{testID}-label`, `{testID}-left-icon`, `{testID}-right-icon`, `{testID}-loader`.                            |
| ...`GetProps<typeof StyledButton>` | —                                                      | —           | Every Tamagui style prop the underlying `styled(Stack)` accepts flows through (`onPress`, `paddingHorizontal`, `animation`, `pressStyle`, …). |

## Usage

Basic:

```tsx
<Button onPress={onSubmit}>Save</Button>

<Button.Secondary onPress={onCancel}>Cancel</Button.Secondary>

<Button.Ghost leftIcon={<PlusIcon />} onPress={onAdd}>
  Add item
</Button.Ghost>

<Button.Destructive onPress={onDelete}>Delete</Button.Destructive>
```

Sizes:

```tsx
<Button.Primary size="sm">Small</Button.Primary>
<Button.Primary size="md">Medium</Button.Primary>
<Button.Primary size="lg">Large</Button.Primary>
```

Loading / disabled:

```tsx
<Button loading>Submitting</Button>
<Button disabled>Locked</Button>
```

Per-instance color overrides (grouped by role):

```tsx
<Button.Primary
  buttonColors={{ primary: "#FF6B00", disabled: "#FFB380" }}
  textColors={{ primary: "#FFFFFF", disabled: "#FFF3E0" }}
>
  Custom brand
</Button.Primary>
```

## Notes

- Minimum touch target is 48 × 48 px (grows to 56 × 56 for `size="lg"`).
- When you override `buttonColors.primary`, you almost always want to override `textColors.primary` too — ui-kraken does NOT auto-pick a contrasting label color. This is intentional: opinionated auto-contrast surprises consumers who intentionally want a low-contrast pairing.
- Overrides fall through the theme tokens set by `KrakenProvider`. Read `useKraken().tokens` if you need the resolved default at runtime.
