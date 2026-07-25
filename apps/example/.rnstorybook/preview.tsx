import type { Preview } from "@storybook/react-native";
import { UIKitProvider } from "ui-kraken";

const preview: Preview = {
  decorators: [
    (Story) => (
      <UIKitProvider defaultTheme="light">
        <Story />
      </UIKitProvider>
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
