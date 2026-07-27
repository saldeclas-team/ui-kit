// Storybook Web preview — mounts `UIKitProvider` around every story so
// tokens, theme, and provider context all resolve, matching the on-device
// setup in `.rnstorybook/preview.tsx`.
//
// `<SafeAreaProvider>` is also mounted at the top so any story that consumes
// `useSafeAreaInsets()` (e.g. `<ScreenContainer>`) has a value source.
// `react-native-safe-area-context` v5+ THROWS when the hook is called
// without a provider (older versions returned zeros silently), which broke
// every ScreenContainer story on Chromatic. Mirrors the real-app setup our
// README recommends — no story should have to worry about it individually.
import type { Preview } from "@storybook/react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { UIKitProvider } from "ui-kraken";

const preview: Preview = {
  decorators: [
    (Story) => (
      <SafeAreaProvider
        initialMetrics={{
          // Web has no real insets — feed deterministic zeros so stories
          // render identically across viewports / Chromatic captures.
          frame: { x: 0, y: 0, width: 0, height: 0 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        }}
      >
        <UIKitProvider defaultTheme="light">
          <Story />
        </UIKitProvider>
      </SafeAreaProvider>
    ),
  ],
  parameters: {
    backgrounds: {
      default: "plain",
      values: [
        { name: "plain", value: "white" },
        { name: "dark", value: "#111" },
      ],
    },
  },
};

export default preview;
