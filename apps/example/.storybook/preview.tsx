// Storybook Web preview — mounts `UIKitProvider` around every story so
// tokens, theme, and provider context all resolve, matching the on-device
// setup in `.rnstorybook/preview.tsx`.
import type { Preview } from "@storybook/react";
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
