import type { Meta, StoryObj } from "@storybook/react-native";
import { View } from "react-native";
import { Theme, XStack, YStack } from "tamagui";

import { Button } from "./button";

const meta = {
  title: "UI Kit/Button",
  component: Button,
  args: { children: "Save" },
  argTypes: { onPress: { action: "pressed" } },
  decorators: [
    (Story) => (
      <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Button>;

export { meta as default };

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  render: (args) => <Button.Secondary {...args} />,
};

export const Ghost: Story = {
  render: (args) => <Button.Ghost {...args} />,
};

export const Destructive: Story = {
  render: (args) => <Button.Destructive {...args}>Delete</Button.Destructive>,
};

export const AllSizes: Story = {
  render: (args) => (
    <YStack gap="$3">
      <Button.Primary {...args} size="sm">
        Small
      </Button.Primary>
      <Button.Primary {...args} size="md">
        Medium
      </Button.Primary>
      <Button.Primary {...args} size="lg">
        Large
      </Button.Primary>
    </YStack>
  ),
};

export const Loading: Story = {
  args: { loading: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const WithOverride: Story = {
  args: {
    buttonColors: { primary: "#FF6B00" },
    textColors: { primary: "#FFFFFF" },
  },
};

export const AllVariantsRow: Story = {
  render: (args) => (
    <XStack gap="$3" flexWrap="wrap">
      <Button.Primary {...args}>Primary</Button.Primary>
      <Button.Secondary {...args}>Secondary</Button.Secondary>
      <Button.Ghost {...args}>Ghost</Button.Ghost>
      <Button.Destructive {...args}>Destructive</Button.Destructive>
    </XStack>
  ),
};

export const DarkTheme: Story = {
  render: (args) => (
    <Theme name="dark">
      <YStack gap="$3">
        <Button.Primary {...args}>Primary</Button.Primary>
        <Button.Ghost {...args}>Ghost</Button.Ghost>
      </YStack>
    </Theme>
  ),
};
