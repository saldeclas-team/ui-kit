# RefreshControl

Theme-bound pull-to-refresh control for `ScrollView`, `FlatList`, and `SectionList`. Wraps React Native's native `RefreshControl` so consumers get theme-aware spinner + background colors on both iOS and Android automatically. Provider-level + per-instance color overrides.

Not rendered standalone — passed to a scrollable via the `refreshControl` prop.

## Import

```tsx
import { RefreshControl } from "ui-kraken";
```

## Props

| Prop                    | Type                            | Default             | Description                                                              |
| ----------------------- | ------------------------------- | ------------------- | ------------------------------------------------------------------------ |
| `refreshing`            | `boolean`                       | —                   | `true` while a refresh is in progress. Controls spinner visibility.      |
| `onRefresh`             | `() => void`                    | —                   | Fires when the user pulls the scrollable down past the threshold.        |
| `refreshControlColors?` | `Partial<RefreshControlColors>` | —                   | Per-instance color override. Missing slots fall through to the provider. |
| `testID?`               | `string`                        | `"refresh-control"` | Root testID.                                                             |

Every RN `RefreshControlProps` (except the four we own — `tintColor`, `colors`, `progressBackgroundColor`, `titleColor`) flows through the spread: `title` (iOS), `progressViewOffset`, `size`, `enabled`, every accessibility prop, etc.

## Color model

RefreshControl has its own **`refreshControlColors`** block on the token schema — 3 slots, each of which maps to specific RN props on iOS and/or Android.

```tsx
import { UIKitProvider } from "ui-kraken";

<UIKitProvider
  tokens={{
    refreshControlColors: {
      spinner: "#2563EB",
      background: "#F9FAFB",
      title: "#5B6472",
    },
  }}
  dark={{
    refreshControlColors: {
      spinner: "#60A5FA",
      background: "#111827",
      title: "#9CA3AF",
    },
  }}
>
  <App />
</UIKitProvider>;
```

### Slots

| Slot         | Paints                                                                                          |
| ------------ | ----------------------------------------------------------------------------------------------- |
| `spinner`    | iOS: color of the spinning arrow (`tintColor`). Android: monochrome `colors={[spinner]}` array. |
| `background` | Android: circular background behind the spinner (`progressBackgroundColor`). No iOS effect.     |
| `title`      | iOS: color of the optional `title` text below the spinner (`titleColor`). No Android effect.    |

RN wants `colors` as an array so the Android spinner can rotate through multiple hues — we pass a single-color monochrome array to keep the visual consistent with iOS. If you need multi-hue rotation, drop down to RN's `RefreshControl` directly.

### Default palettes

**Light**: `#2563EB` spinner (brand blue-600) · `#F9FAFB` background (matches `Surface.raised`) · `#5B6472` title (matches `Text.secondary`).

**Dark**: `#60A5FA` spinner (blue-400, pops on dark) · `#111827` background (matches dark `Surface.raised`) · `#9CA3AF` title.

## Usage

Basic — controlled via `refreshing` state:

```tsx
import { RefreshControl } from "ui-kraken";
import { useState, useCallback } from "react";
import { ScrollView } from "react-native";

export function Feed() {
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, []);
  return (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {/* rows */}
    </ScrollView>
  );
}
```

With `FlatList` — same pattern:

```tsx
<FlatList
  data={items}
  renderItem={renderItem}
  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
/>
```

Per-instance color override — e.g., an accent palette for a promoted feed:

```tsx
<RefreshControl
  refreshing={refreshing}
  onRefresh={onRefresh}
  refreshControlColors={{ spinner: "#7C3AED", background: "#F5F3FF" }}
/>
```

iOS pull-down title:

```tsx
<RefreshControl refreshing={refreshing} onRefresh={onRefresh} title="Pulling to refresh…" />
```

## Accessibility

RefreshControl inherits every RN accessibility prop via pass-through — set `accessibilityLabel` on the parent scrollable to describe what pulling will refresh:

```tsx
<ScrollView
  accessibilityLabel="News feed"
  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
>
  {/* ... */}
</ScrollView>
```

## Notes

- **iOS-only slots are silently ignored on Android** and vice versa — this is how RN's `RefreshControl` behaves natively, we just forward.
- **No auto-timeout / no built-in state** — `refreshing` is fully controlled. If you forget to set it back to `false`, the spinner stays.
- **No `variant` prop** — same visual on every screen. If you need branded per-screen palettes, use `refreshControlColors`.

## Platform support

| Platform | Status | Notes                                                                                               |
| -------- | ------ | --------------------------------------------------------------------------------------------------- |
| iOS      | ✅     | Native `UIRefreshControl`. `spinner` + `title` slots apply.                                         |
| Android  | ✅     | Native `SwipeRefreshLayout`. `spinner` + `background` slots apply.                                  |
| Web      | ⚠️     | `react-native-web` renders a no-op; pull-to-refresh is not a web gesture. Wire your own refresh UI. |
