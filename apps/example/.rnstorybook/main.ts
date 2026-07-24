import type { StorybookConfig } from "@storybook/react-native";

const main: StorybookConfig = {
  // Stories live inside ui-kraken (co-located with components) and inside
  // the example app itself. Metro watches the whole monorepo so both are
  // hot-reloaded together.
  stories: [
    "../../../packages/ui-kraken/src/**/*.stories.?(ts|tsx)",
    "../src/**/*.stories.?(ts|tsx)",
  ],
  deviceAddons: [
    "@storybook/addon-ondevice-controls",
    "@storybook/addon-ondevice-actions",
    "@storybook/addon-ondevice-notes",
    "@storybook/addon-ondevice-backgrounds",
  ],
};

export default main;
