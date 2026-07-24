// Storybook Web preview — mounts `KrakenProvider` around every story so
// tokens, theme, and provider context all resolve, matching the on-device
// setup in `.rnstorybook/preview.tsx`.
import type { Preview } from "@storybook/react";
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
