<div align="center">

# ui-kraken

**Highly customizable React Native / Expo component library, powered by [Tamagui](https://tamagui.dev/).**

[![npm version](https://img.shields.io/npm/v/ui-kraken?color=cb3837&logo=npm)](https://www.npmjs.com/package/ui-kraken)
[![Live Storybook](https://img.shields.io/badge/Storybook-live-ff4785?logo=storybook&logoColor=white)](https://main--6a63d07d1946f494a4c93ad3.chromatic.com/)
[![CI](https://github.com/saldeclas-team/ui-kit/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/saldeclas-team/ui-kit/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/saldeclas-team/ui-kit/branch/main/graph/badge.svg?flag=ui-kraken)](https://codecov.io/gh/saldeclas-team/ui-kit)
[![Chromatic](https://img.shields.io/badge/Chromatic-visual%20tests-ff4785?logo=storybook&logoColor=white)](https://www.chromatic.com/library?appId=6a63d07d1946f494a4c93ad3)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

**[📖 Live Storybook](https://main--6a63d07d1946f494a4c93ad3.chromatic.com/)** · **[🧩 Components](#components)** · **[⚡ Quick start](#quick-start)** · **[🎨 Design principles](#design-principles)** · **[🗺 Roadmap](./docs/PLAN.md)**

</div>

---

## What it is

ui-kraken is a curated set of **31 React Native components** for Expo apps that ship to iOS, Android, and web from a single codebase. It sits on top of [Tamagui](https://tamagui.dev/) for its runtime + style system, and layers on the pieces most apps need but shouldn't have to build again: opinionated color tokens, native-platform controls where they read better, and an escape hatch for everything else.

**Why it exists.** The web has Radix + Chakra + shadcn/ui. Mobile has react-native-paper and NativeBase — both underweight on theming and neither runs comfortably on web. Tamagui itself is a phenomenal runtime, but it's not a design system: it hands you styled primitives, not a Button, a Dialog, a DatePicker. ui-kraken is the layer that fills that gap — Tamagui-powered runtime + curated component set + strict theming contract (each component owns its color space, no cross-leaking).

**Design targets:**

- **iOS + Android + Web from one codebase** — via [`react-native-web`](https://necolas.github.io/react-native-web/) as an optional peer.
- **Native controls where they read better** — SelectNative, SegmentedControl, DatePicker, and BottomSheet all use [`@expo/ui`](https://docs.expo.dev/versions/latest/sdk/ui/) under the hood so consumers get the platform-native affordance for free.
- **Themeable end-to-end** — every color-using component defines its own `<Component>Colors` block on the token schema, exposed both at the provider level (globally) and per-instance (locally).
- **Escape hatch for everything** — every component extends its underlying Tamagui primitive, so `padding`, `margin`, `flex`, `pressStyle`, shorthand aliases (`px`, `py`, `br`), etc. all flow through untouched.
- **Fully typed + tested** — 100% coverage per component, structural + behavioral snapshots, all published with type-check on green.

## Live preview

**[📖 Storybook (Chromatic-hosted)](https://main--6a63d07d1946f494a4c93ad3.chromatic.com/)** — every component in every variant, size, and theme, rendered live from the latest `main`. Explore before you install; updated automatically on every merge. No login required.

Every merged PR is also visually diffed on Chromatic — no unintended visual regressions ship.

## Install

```bash
# npm
npm install ui-kraken tamagui react-native-reanimated

# pnpm
pnpm add ui-kraken tamagui react-native-reanimated

# yarn
yarn add ui-kraken tamagui react-native-reanimated
```

Then mount the provider at your app root — see [Quick start](#quick-start).

## Peer dependencies

Two tiers: **required** (installed above with `ui-kraken`) and **optional** (install only if you use the components that need them).

### Required

| Package                   | Version     | What it does                                                       |
| ------------------------- | ----------- | ------------------------------------------------------------------ |
| `react`                   | `>=18.2.0`  | Core dependency.                                                   |
| `react-native`            | `>=0.74.0`  | Core dependency.                                                   |
| `react-native-reanimated` | `>=3.6.0`   | Powers Skeleton, Collapsible, SegmentedControl Android animations. |
| `tamagui`                 | `>=1.100.0` | Runtime + style system that everything sits on.                    |

### Optional (install only when you use the corresponding component)

| Package                            | Needed by                                                                                 |
| ---------------------------------- | ----------------------------------------------------------------------------------------- |
| `react-native-web` `>=0.19.0`      | Web target only. Skip if you only ship to iOS + Android.                                  |
| `@expo/ui` `*`                     | `SelectNative`, `SegmentedControl` (iOS), `DatePicker`, `DateRangePicker`, `BottomSheet`. |
| `@gorhom/bottom-sheet` `*`         | Provider mount when using the legacy gorhom-backed sheet. Being phased out.               |
| `react-native-gesture-handler` `*` | Transitive dep of `@gorhom/bottom-sheet` when installed.                                  |
| `expo-image-picker` `*`            | `ImagePickerSheet`.                                                                       |

When a peer is missing, the affected component **does not crash** — it renders a friendly "install `<peer>`" fallback so consumers see what they need at build time.

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

`defaultTheme` accepts `"light" | "dark" | "system"`. `"system"` follows the OS setting.

### Custom brand colors

Every color slot is overridable at the provider level. Example — brand-purple every Button:

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

Every component's README documents its full color block.

## Components

31 components across 9 categories. **Click each name for its full README** (props, palette, sub-element testIDs, accessibility, examples).

### Typography & content

| Component                                                    | What it does                                                                                                             |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| [`Text`](./packages/ui-kraken/src/components/text/README.md) | Standalone text primitive. 13 HTML-familiar variants (`h1`–`h6`, `body1/2`, `caption`, etc.), 14 semantic color slots.   |
| [`Hint`](./packages/ui-kraken/src/components/hint/README.md) | Inline contextual tip. 5 tones, ghost / soft emphasis, optional icon + title. Quieter than `Alert`, embeds in body copy. |

### Layout & structure

| Component                                                          | What it does                                                                                         |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| [`Surface`](./packages/ui-kraken/src/components/surface/README.md) | Theme-bound background container with 4 elevation levels (`base` / `raised` / `overlay` / `sunken`). |
| [`Card`](./packages/ui-kraken/src/components/card/README.md)       | Rounded padded container on top of Surface. Compound `Card.Header` + `Card.Body` + `Card.Footer`.    |
| [`Divider`](./packages/ui-kraken/src/components/divider/README.md) | Thin horizontal / vertical line for separating rows and sections. Adjustable thickness + inset.      |

### Actions

| Component                                                                     | What it does                                                                                                                      |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| [`Button`](./packages/ui-kraken/src/components/button/README.md)              | 5 tones (`primary` / `secondary` / `outline` / `ghost` / `destructive`), 3 sizes, disabled / loading states, configurable radius. |
| [`SocialButton`](./packages/ui-kraken/src/components/social-button/README.md) | OAuth-provider button (Google / Apple / Facebook / GitHub / Microsoft / generic). Icon slot + provider label.                     |
| [`ExternalLink`](./packages/ui-kraken/src/components/external-link/README.md) | Tappable link that opens a URL in the platform browser. Router-agnostic — no `expo-router` or `react-navigation` dependency.      |

### Data display

| Component                                                             | What it does                                                                                                                    |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [`Avatar`](./packages/ui-kraken/src/components/avatar/README.md)      | Image with initials fallback. 4 sizes × 3 shapes (circle / rounded / square). `onError` automatically swaps to initials.        |
| [`Badge`](./packages/ui-kraken/src/components/badge/README.md)        | Compact pill for counts, status labels, or dot indicators. 5 tones × 2 sizes, `Badge.Primary/Success/Warning/Danger` compounds. |
| [`StatCard`](./packages/ui-kraken/src/components/stat-card/README.md) | Compact metric card. Title + big value + optional trend arrow + delta + icon. For dashboards, analytics, admin widgets.         |

### Feedback

| Component                                                                         | What it does                                                                                                                                |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| [`Alert`](./packages/ui-kraken/src/components/alert/README.md)                    | Contextual feedback banner. 4 semantic variants (info / success / warning / danger), optional title + body + icon slot, compound API.       |
| [`Spinner`](./packages/ui-kraken/src/components/spinner/README.md)                | Themed `ActivityIndicator`. Size presets (`sm` / `md` / `lg`) + palette-resolved color.                                                     |
| [`ProgressBar`](./packages/ui-kraken/src/components/progress-bar/README.md)       | Determinate progress. Track + fill, size presets, optional value label, custom `min` / `max` / `step`. Complements Spinner (indeterminate). |
| [`Skeleton`](./packages/ui-kraken/src/components/skeleton/README.md)              | Animated placeholder for loading states. Rectangles, circles, arbitrary shapes. Pulse animation via Reanimated.                             |
| [`RefreshControl`](./packages/ui-kraken/src/components/refresh-control/README.md) | Theme-bound pull-to-refresh for `ScrollView` / `FlatList` / `SectionList`. Wraps RN's native `RefreshControl`.                              |

### Overlays

| Component                                                                              | What it does                                                                                                                        |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| [`Dialog`](./packages/ui-kraken/src/components/dialog/README.md)                       | Centered modal panel. Wraps RN `<Modal>` with backdrop + compound `Dialog.Header/Body/Footer`. Controlled visibility.               |
| [`BottomSheet`](./packages/ui-kraken/src/components/bottom-sheet/README.md)            | Native bottom sheet with snap points. Ref-controlled (`ref.current.present() / dismiss()`). Uses `@expo/ui/community/bottom-sheet`. |
| [`ImagePickerSheet`](./packages/ui-kraken/src/components/image-picker-sheet/README.md) | Bottom sheet with camera / gallery / cancel action rows. Wraps `expo-image-picker`, permission-aware.                               |

### Form inputs — text

| Component                                                                       | What it does                                                                                                                   |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| [`Input`](./packages/ui-kraken/src/components/input/README.md)                  | Single-line text input. Label, helper text, error state, optional icon slots. Every RN `TextInput` prop flows through.         |
| [`CurrencyInput`](./packages/ui-kraken/src/components/currency-input/README.md) | Numeric input formatted as currency. Locale-aware separators, configurable decimals + prefix. Stores a `number` in form state. |

### Form inputs — choice

| Component                                                                                | What it does                                                                                                                     |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| [`RadioGroup`](./packages/ui-kraken/src/components/radio-group/README.md)                | Group of mutually-exclusive selectable options. Controlled, generic value type, vertical / horizontal layout.                    |
| [`SegmentedControl`](./packages/ui-kraken/src/components/segmented-control/README.md)    | Horizontal segmented picker. Native `UISegmentedControl` on iOS, Material 3 on Android (pure JS + Reanimated).                   |
| [`Select`](./packages/ui-kraken/src/components/select/README.md)                         | Single-choice picker as a trigger + centered modal card. Generic value type, zero peer deps.                                     |
| [`SelectNative`](./packages/ui-kraken/src/components/select-native/README.md)            | Single-choice picker with fully-native `@expo/ui` `Picker` — SwiftUI `Menu` on iOS, Compose `DropdownMenu` on Android.           |
| [`SelectBottomSheet`](./packages/ui-kraken/src/components/select-bottom-sheet/README.md) | Single-choice picker rendered as a native bottom sheet. Composes our `BottomSheet` under the hood.                               |
| [`MultiSelect`](./packages/ui-kraken/src/components/multi-select/README.md)              | Multi-choice picker rendered as a wrap of pill chips. Generic value type, per-option `disabled`.                                 |
| [`Slider`](./packages/ui-kraken/src/components/slider/README.md)                         | Draggable range input. Controlled value, custom `min` / `max` / `step`, sm / md / lg sizes, a11y increment / decrement. Pure JS. |

### Form inputs — dates

| Component                                                                            | What it does                                                                                                                  |
| ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| [`DatePicker`](./packages/ui-kraken/src/components/date-picker/README.md)            | Native date / time / datetime picker. iOS inline modal, Android Material 3 dialog, browser `<input>` on web. Via `@expo/ui`.  |
| [`DateRangePicker`](./packages/ui-kraken/src/components/date-range-picker/README.md) | Controlled start / end date range. Composes two `DatePicker`s with auto-clamping (end always ≥ start). Vertical / horizontal. |

### Disclosure

| Component                                                                  | What it does                                                                                                                               |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| [`Collapsible`](./packages/ui-kraken/src/components/collapsible/README.md) | Animated expand-collapse section. Pressable header toggles visibility of a body region below. For FAQ accordions, settings, filter panels. |

## Design principles

Four rules the library sticks to consistently. They're the reason components feel similar even when they solve very different problems.

### 1. Each component owns its color space

Every color-using component defines its own `<Component>Colors` block on the token schema — `buttonColors`, `alertColors`, `sliderColors`, etc. No shared "primary" color that half the components read from and half don't. If you want to change Button's primary tone, you edit `buttonColors.primary`; that never affects Alert or SegmentedControl.

Overrides work at two levels:

- **Provider-level** — via `<UIKitProvider overrides={{ light: { buttonColors: {...} } }}>`. Every Button in the app picks it up.
- **Per-instance** — via `<Button buttonColors={{...}}>`. Only that one button.

Missing slots fall through — you never re-declare colors you don't want to change.

### 2. Native controls where they read better

Some components ship the native platform control (via `@expo/ui`) instead of a JS re-implementation. Users get the platform-native affordance — haptics, animations, dark-mode chrome — for free. Consumers get a Tamagui-styled trigger wrapping the native popup, so the trigger matches your app while the popup matches the OS.

Applies to: `SelectNative`, `SegmentedControl` (iOS), `DatePicker`, `DateRangePicker`, `BottomSheet`.

### 3. Escape hatch for everything

Every component extends its underlying Tamagui primitive (`YStack` / `XStack` / `Text` / `Pressable`). Every layout / animation / gesture prop flows through untouched:

```tsx
<Button padding={24} pressStyle={{ scale: 0.95 }} animation="quick">
  Ship it
</Button>
```

If a specific prop is intentionally NOT forwarded (like `backgroundColor` — the palette owns it), the component's README calls it out explicitly.

### 4. Missing peer? Graceful fallback

Optional peers (`@expo/ui`, `expo-image-picker`, `@gorhom/bottom-sheet`) are wrapped in a `try / catch require` probe. When the peer isn't installed, the component doesn't crash — it renders a small "install `<peer>`" hint at the callsite. Your build still runs, your app still boots, and the missing dependency is discoverable at the exact place it's needed.

## Requirements

- **Node.js** ≥ 20 (use `nvm use` — see `.nvmrc`)
- **pnpm** (auto-provisioned via `corepack enable pnpm`)
- **iOS simulator** (Xcode) and/or **Android emulator** (Android Studio)
- **Expo SDK** ≥ 51 for consumer apps

## Platform support

| Platform | Status                                 | Notes                                                                                                                                    |
| -------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| iOS      | ✅ full support                        | Every component tested on iOS simulator + Storybook on-device.                                                                           |
| Android  | ✅ full support                        | Every component tested on Android emulator + Storybook on-device.                                                                        |
| Web      | ✅ full support (via react-native-web) | Chromatic visual-diff coverage on every merge; some native controls fall back to web-appropriate equivalents (documented per component). |

## Monorepo layout

```
ui-kit/
├── packages/
│   └── ui-kraken/                # The library published to npm
│       ├── src/
│       │   ├── components/       # 31 components, each with README + spec + stories
│       │   ├── tokens/           # Color / spacing / radius schema + defaults
│       │   ├── provider/         # UIKitProvider + useUIKit hook
│       │   └── utils/            # Shared helpers (flatten, resolvePalette, radius, color, tint)
│       └── README.md             # npm-facing README
├── apps/
│   └── example/                  # Expo app that showcases every component + hosts Storybook
├── docs/                         # Design records — one PLAN.md per component + top-level PLAN.md
└── .changeset/                   # Consumed on every release
```

## Repo quick start

```bash
corepack enable pnpm
pnpm install
pnpm --filter @ui-kraken/example start                # run the example app
pnpm --filter @ui-kraken/example web                  # same app in the browser (react-native-web)
pnpm --filter @ui-kraken/example storybook:ios        # Storybook on-device (iOS simulator)
pnpm --filter @ui-kraken/example storybook:web        # Storybook Web at localhost:6006
```

## Roadmap

See [`docs/PLAN.md`](./docs/PLAN.md) for the version-by-version plan and open decisions. Per-component design records live at [`docs/{COMPONENT}-PLAN.md`](./docs/) — the "why we chose this API" behind every shipped component.

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md). Every new component follows a 13-step recipe (types + defaults + flatten + provider merge + component + spec + stories + README + example screen + changeset + atomic commit); the recipe is documented and enforced via a repo-wide skill.

## License

MIT © [saldeclas-team](https://github.com/saldeclas-team)
