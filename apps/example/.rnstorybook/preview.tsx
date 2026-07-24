import type { Preview } from "@storybook/react-native";
import { TamaguiProvider } from "tamagui";
import { tamaguiConfig } from "../tamagui.config";

const preview: Preview = {
  decorators: [
    (Story) => (
      <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
        <Story />
      </TamaguiProvider>
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
