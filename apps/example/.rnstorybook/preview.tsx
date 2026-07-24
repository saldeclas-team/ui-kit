import type { Preview } from "@storybook/react-native";
import { KrakenProvider } from "ui-kraken";

const preview: Preview = {
  decorators: [
    (Story) => (
      <KrakenProvider defaultTheme="light">
        <Story />
      </KrakenProvider>
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
