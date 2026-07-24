import type { Meta, StoryObj } from "@storybook/react-native";
import { View } from "react-native";
import { Theme, YStack } from "tamagui";

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

export const Outline: Story = {
  render: (args) => <Button.Outline {...args} />,
};

export const Ghost: Story = {
  render: (args) => <Button.Ghost {...args} />,
};

export const Destructive: Story = {
  render: (args) => <Button.Destructive {...args}>Delete</Button.Destructive>,
};

export const AllVariants: Story = {
  render: (args) => (
    <YStack gap="$3">
      <Button.Primary {...args}>Primary</Button.Primary>
      <Button.Secondary {...args}>Secondary</Button.Secondary>
      <Button.Outline {...args}>Outline</Button.Outline>
      <Button.Ghost {...args}>Ghost</Button.Ghost>
      <Button.Destructive {...args}>Destructive</Button.Destructive>
    </YStack>
  ),
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

export const WithBackgroundOverride: Story = {
  args: {
    buttonColors: { background: "#FF6B00", label: "#FFFFFF" },
  },
};

export const WithLabelOverride: Story = {
  args: {
    buttonColors: { label: "#111827" },
  },
};

export const OutlineWithBorderOverride: Story = {
  render: (args) => (
    <Button.Outline {...args} buttonColors={{ border: "#FF6B00", label: "#FF6B00" }}>
      Custom outline
    </Button.Outline>
  ),
};

export const RadiusPresets: Story = {
  render: (args) => (
    <YStack gap="$3">
      <Button.Primary {...args} radius="none">
        Square (none)
      </Button.Primary>
      <Button.Primary {...args} radius="sm">
        sm
      </Button.Primary>
      <Button.Primary {...args} radius="md">
        md (default)
      </Button.Primary>
      <Button.Primary {...args} radius="lg">
        lg
      </Button.Primary>
      <Button.Primary {...args} radius="pill">
        pill (full round)
      </Button.Primary>
    </YStack>
  ),
};

export const RadiusCustomNumber: Story = {
  args: { radius: 24 },
  render: (args) => <Button.Primary {...args}>radius=24</Button.Primary>,
};

export const DarkTheme: Story = {
  render: (args) => (
    <Theme name="dark">
      <YStack gap="$3">
        <Button.Primary {...args}>Primary</Button.Primary>
        <Button.Secondary {...args}>Secondary</Button.Secondary>
        <Button.Outline {...args}>Outline</Button.Outline>
        <Button.Ghost {...args}>Ghost</Button.Ghost>
        <Button.Destructive {...args}>Destructive</Button.Destructive>
      </YStack>
    </Theme>
  ),
};
