import type { Meta, StoryObj } from "@storybook/react-native";
import { Text as RNText, View } from "react-native";
import { Theme } from "tamagui";

import { Divider } from "./divider";

const meta = {
  title: "UI Kit/Divider",
  component: Divider,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, gap: 16 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Divider>;

export { meta as default };

type Story = StoryObj<typeof meta>;

function Label({ children }: { children: string }) {
  return <RNText style={{ fontSize: 14 }}>{children}</RNText>;
}

export const Horizontal: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <Label>Row above the divider</Label>
      <Divider />
      <Label>Row below the divider</Label>
    </View>
  ),
};

export const Vertical: Story = {
  render: () => (
    <View style={{ flexDirection: "row", gap: 12, alignItems: "center", height: 24 }}>
      <Label>Left</Label>
      <Divider orientation="vertical" />
      <Label>Middle</Label>
      <Divider orientation="vertical" />
      <Label>Right</Label>
    </View>
  ),
};

export const Inset: Story = {
  render: () => (
    <View style={{ backgroundColor: "#F3F4F6", padding: 12, borderRadius: 8, gap: 8 }}>
      <Label>Settings row 1</Label>
      <Divider inset={16} />
      <Label>Settings row 2</Label>
      <Divider inset={16} />
      <Label>Settings row 3</Label>
    </View>
  ),
};

export const Thick: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <Label>Section A</Label>
      <Divider thickness={4} />
      <Label>Section B</Label>
    </View>
  ),
};

export const CustomColor: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <Label>Brand-tinted divider</Label>
      <Divider dividerColors={{ line: "#7C3AED" }} thickness={2} />
      <Label>Below</Label>
    </View>
  ),
};

export const DarkTheme: Story = {
  render: () => (
    <Theme name="dark">
      <View style={{ gap: 12, backgroundColor: "#0B0B0F", padding: 16 }}>
        <RNText style={{ color: "#F5F5F7" }}>Row above the divider</RNText>
        <Divider />
        <RNText style={{ color: "#F5F5F7" }}>Row below the divider</RNText>
      </View>
    </Theme>
  ),
};
