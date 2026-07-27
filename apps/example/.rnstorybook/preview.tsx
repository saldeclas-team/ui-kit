import type { Preview } from "@storybook/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { UIKitProvider } from "ui-kraken";

// `<SafeAreaProvider>` is mounted at the preview root so stories that
// consume `useSafeAreaInsets()` (e.g. `<ScreenContainer>`) have a value
// source. `react-native-safe-area-context` v5+ throws when the hook is
// called without a provider — older versions returned zeros silently.
const preview: Preview = {
  decorators: [
    (Story) => (
      <SafeAreaProvider>
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
