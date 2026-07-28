# ui-kraken

**Highly customizable React Native / Expo component library, powered by [Tamagui](https://tamagui.dev/).**

[![npm version](https://img.shields.io/npm/v/ui-kraken?color=cb3837&logo=npm)](https://www.npmjs.com/package/ui-kraken)
[![Live Storybook](https://img.shields.io/badge/Storybook-live-ff4785?logo=storybook&logoColor=white)](https://main--6a63d07d1946f494a4c93ad3.chromatic.com/)
[![codecov](https://codecov.io/gh/saldeclas-team/ui-kit/branch/main/graph/badge.svg?flag=ui-kraken)](https://codecov.io/gh/saldeclas-team/ui-kit)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/saldeclas-team/ui-kit/blob/main/LICENSE)

31 curated components for Expo apps that ship to iOS, Android, and web from a single codebase. Sits on top of Tamagui for its runtime + style system, adds opinionated color tokens, native-platform controls where they read better, and an escape hatch for everything else.

📖 **[Live Storybook →](https://main--6a63d07d1946f494a4c93ad3.chromatic.com/)** — every component in every variant, size, and theme.

🧩 **[Full docs, component catalog, and design principles on GitHub →](https://github.com/saldeclas-team/ui-kit#readme)**

## Install

```bash
npm install ui-kraken tamagui react-native-reanimated
# or
pnpm add ui-kraken tamagui react-native-reanimated
# or
yarn add ui-kraken tamagui react-native-reanimated
```

## Peer dependencies

**Required** (installed above with `ui-kraken`):

| Package                   | Version     |
| ------------------------- | ----------- |
| `react`                   | `>=18.2.0`  |
| `react-native`            | `>=0.74.0`  |
| `react-native-reanimated` | `>=3.6.0`   |
| `tamagui`                 | `>=1.100.0` |

**Optional** — install only when using the corresponding component:

| Package                        | Needed by                                                                                 |
| ------------------------------ | ----------------------------------------------------------------------------------------- |
| `react-native-web` `>=0.19.0`  | Web target only.                                                                          |
| `@expo/ui`                     | `SelectNative`, `SegmentedControl` (iOS), `DatePicker`, `DateRangePicker`, `BottomSheet`. |
| `@gorhom/bottom-sheet`         | Legacy gorhom-backed sheet path (being phased out).                                       |
| `react-native-gesture-handler` | Transitive dep of `@gorhom/bottom-sheet`.                                                 |
| `expo-image-picker`            | `ImagePickerSheet`.                                                                       |

When an optional peer is missing, the affected component renders a friendly "install `<peer>`" fallback instead of crashing.

## Quick start

Wrap your app in `UIKitProvider`, then use any component:

```tsx
import { UIKitProvider, Button, Card, Text, Input } from "ui-kraken";
import { useState } from "react";

export default function App() {
  const [email, setEmail] = useState("");
  return (
    <UIKitProvider defaultTheme="system">
      <Card>
        <Card.Header>
          <Text variant="h4">Welcome back</Text>
        </Card.Header>
        <Card.Body>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
          />
        </Card.Body>
        <Card.Footer>
          <Button onPress={() => console.log(email)}>Continue</Button>
        </Card.Footer>
      </Card>
    </UIKitProvider>
  );
}
```

## Custom brand colors

Every color slot is overridable at the provider level:

```tsx
<UIKitProvider
  overrides={{
    light: {
      buttonColors: {
        primary: { background: "#7C3AED", text: "#F5F3FF", disabledBackground: "#E9D5FF" },
      },
    },
  }}
>
  {/* your app */}
</UIKitProvider>
```

Or per-instance:

```tsx
<Button buttonColors={{ primary: { background: "#7C3AED" } }}>Brand</Button>
```

## Components

31 components across 9 categories. **Every component ships with its own README** (props, palette, sub-element testIDs, accessibility, examples).

**Typography & content** · [`Text`](https://github.com/saldeclas-team/ui-kit/blob/main/packages/ui-kraken/src/components/text/README.md) · [`Hint`](https://github.com/saldeclas-team/ui-kit/blob/main/packages/ui-kraken/src/components/hint/README.md)

**Layout & structure** · [`Surface`](https://github.com/saldeclas-team/ui-kit/blob/main/packages/ui-kraken/src/components/surface/README.md) · [`Card`](https://github.com/saldeclas-team/ui-kit/blob/main/packages/ui-kraken/src/components/card/README.md) · [`Divider`](https://github.com/saldeclas-team/ui-kit/blob/main/packages/ui-kraken/src/components/divider/README.md)

**Actions** · [`Button`](https://github.com/saldeclas-team/ui-kit/blob/main/packages/ui-kraken/src/components/button/README.md) · [`SocialButton`](https://github.com/saldeclas-team/ui-kit/blob/main/packages/ui-kraken/src/components/social-button/README.md) · [`ExternalLink`](https://github.com/saldeclas-team/ui-kit/blob/main/packages/ui-kraken/src/components/external-link/README.md)

**Data display** · [`Avatar`](https://github.com/saldeclas-team/ui-kit/blob/main/packages/ui-kraken/src/components/avatar/README.md) · [`Badge`](https://github.com/saldeclas-team/ui-kit/blob/main/packages/ui-kraken/src/components/badge/README.md) · [`StatCard`](https://github.com/saldeclas-team/ui-kit/blob/main/packages/ui-kraken/src/components/stat-card/README.md)

**Feedback** · [`Alert`](https://github.com/saldeclas-team/ui-kit/blob/main/packages/ui-kraken/src/components/alert/README.md) · [`Spinner`](https://github.com/saldeclas-team/ui-kit/blob/main/packages/ui-kraken/src/components/spinner/README.md) · [`ProgressBar`](https://github.com/saldeclas-team/ui-kit/blob/main/packages/ui-kraken/src/components/progress-bar/README.md) · [`Skeleton`](https://github.com/saldeclas-team/ui-kit/blob/main/packages/ui-kraken/src/components/skeleton/README.md) · [`RefreshControl`](https://github.com/saldeclas-team/ui-kit/blob/main/packages/ui-kraken/src/components/refresh-control/README.md)

**Overlays** · [`Dialog`](https://github.com/saldeclas-team/ui-kit/blob/main/packages/ui-kraken/src/components/dialog/README.md) · [`BottomSheet`](https://github.com/saldeclas-team/ui-kit/blob/main/packages/ui-kraken/src/components/bottom-sheet/README.md) · [`ImagePickerSheet`](https://github.com/saldeclas-team/ui-kit/blob/main/packages/ui-kraken/src/components/image-picker-sheet/README.md)

**Form inputs — text** · [`Input`](https://github.com/saldeclas-team/ui-kit/blob/main/packages/ui-kraken/src/components/input/README.md) · [`CurrencyInput`](https://github.com/saldeclas-team/ui-kit/blob/main/packages/ui-kraken/src/components/currency-input/README.md)

**Form inputs — choice** · [`RadioGroup`](https://github.com/saldeclas-team/ui-kit/blob/main/packages/ui-kraken/src/components/radio-group/README.md) · [`SegmentedControl`](https://github.com/saldeclas-team/ui-kit/blob/main/packages/ui-kraken/src/components/segmented-control/README.md) · [`Select`](https://github.com/saldeclas-team/ui-kit/blob/main/packages/ui-kraken/src/components/select/README.md) · [`SelectNative`](https://github.com/saldeclas-team/ui-kit/blob/main/packages/ui-kraken/src/components/select-native/README.md) · [`SelectBottomSheet`](https://github.com/saldeclas-team/ui-kit/blob/main/packages/ui-kraken/src/components/select-bottom-sheet/README.md) · [`MultiSelect`](https://github.com/saldeclas-team/ui-kit/blob/main/packages/ui-kraken/src/components/multi-select/README.md) · [`Slider`](https://github.com/saldeclas-team/ui-kit/blob/main/packages/ui-kraken/src/components/slider/README.md)

**Form inputs — dates** · [`DatePicker`](https://github.com/saldeclas-team/ui-kit/blob/main/packages/ui-kraken/src/components/date-picker/README.md) · [`DateRangePicker`](https://github.com/saldeclas-team/ui-kit/blob/main/packages/ui-kraken/src/components/date-range-picker/README.md)

**Disclosure** · [`Collapsible`](https://github.com/saldeclas-team/ui-kit/blob/main/packages/ui-kraken/src/components/collapsible/README.md)

## Design principles

- **Each component owns its color space.** No shared `primary` that leaks across components. Change `buttonColors.primary` and it only affects Button.
- **Native controls where they read better.** `SelectNative`, `SegmentedControl` (iOS), `DatePicker`, `DateRangePicker`, `BottomSheet` all use `@expo/ui` under the hood so users get the platform-native affordance for free.
- **Escape hatch for everything.** Every component extends its Tamagui primitive — `padding`, `pressStyle`, `animation`, shorthand aliases (`px`, `br`) all flow through untouched.
- **Missing peer? Graceful fallback.** Optional peers are wrapped in a `try / catch require` probe. Missing peer → friendly "install `<peer>`" hint, not a crash.

## Platform support

| Platform | Status                           |
| -------- | -------------------------------- |
| iOS      | ✅ full                          |
| Android  | ✅ full                          |
| Web      | ✅ full (via `react-native-web`) |

Every merged PR is visually diffed on [Chromatic](https://www.chromatic.com/library?appId=6a63d07d1946f494a4c93ad3) against the previous baseline — no unintended visual regressions ship.

## Links

- 📖 [Live Storybook](https://main--6a63d07d1946f494a4c93ad3.chromatic.com/)
- 🧩 [Repo on GitHub](https://github.com/saldeclas-team/ui-kit)
- 🗺 [Roadmap](https://github.com/saldeclas-team/ui-kit/blob/main/docs/PLAN.md)
- 🐛 [Report an issue](https://github.com/saldeclas-team/ui-kit/issues)

## License

MIT © [saldeclas-team](https://github.com/saldeclas-team)
