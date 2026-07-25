import type { Meta, StoryObj } from "@storybook/react-native";
import { Text as RNText, View } from "react-native";
import { Theme } from "tamagui";

import { Surface } from "./surface";

const meta = {
  title: "UI Kit/Surface",
  component: Surface,
  args: { padding: 16, borderRadius: 8 },
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, gap: 12 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Surface>;

export { meta as default };

type Story = StoryObj<typeof meta>;

function Label({ children }: { children: string }) {
  return <RNText style={{ fontSize: 14 }}>{children}</RNText>;
}

export const Base: Story = {
  render: (args) => (
    <Surface {...args} level="base">
      <Label>level="base" — standard app background</Label>
    </Surface>
  ),
};

export const Raised: Story = {
  render: (args) => (
    <Surface {...args} level="raised">
      <Label>level="raised" — card / list item</Label>
    </Surface>
  ),
};

export const Overlay: Story = {
  render: (args) => (
    <Surface {...args} level="overlay">
      <Label>level="overlay" — modal / sheet</Label>
    </Surface>
  ),
};

export const Sunken: Story = {
  render: (args) => (
    <Surface {...args} level="sunken">
      <Label>level="sunken" — inset region</Label>
    </Surface>
  ),
};

export const Nested: Story = {
  render: (args) => (
    <Surface {...args} level="raised" gap={12}>
      <Label>Outer raised surface</Label>
      <Surface {...args} level="sunken">
        <Label>Inner sunken surface</Label>
      </Surface>
    </Surface>
  ),
};

export const CustomColors: Story = {
  render: (args) => (
    <Surface {...args} level="raised" surfaceColors={{ raised: "#FFF7ED" }}>
      <Label>Brand-tinted raised surface (per-instance override)</Label>
    </Surface>
  ),
};

export const DarkTheme: Story = {
  render: (args) => (
    <Theme name="dark">
      <View style={{ gap: 12 }}>
        <Surface {...args} level="base">
          <Label>Dark base</Label>
        </Surface>
        <Surface {...args} level="raised">
          <Label>Dark raised</Label>
        </Surface>
        <Surface {...args} level="overlay">
          <Label>Dark overlay</Label>
        </Surface>
        <Surface {...args} level="sunken">
          <Label>Dark sunken</Label>
        </Surface>
      </View>
    </Theme>
  ),
};
