import type { Meta, StoryObj } from "@storybook/react-native";
import { Text as RNText, View } from "react-native";
import { Theme } from "tamagui";

import { Spinner } from "./spinner";

const meta = {
  title: "UI Kit/Spinner",
  component: Spinner,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, gap: 24, alignItems: "center" }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Spinner>;

export { meta as default };

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Spinner />,
};

export const Sizes: Story = {
  render: () => (
    <View style={{ flexDirection: "row", gap: 24, alignItems: "center" }}>
      <View style={{ alignItems: "center", gap: 8 }}>
        <Spinner size="sm" />
        <RNText style={{ fontSize: 12 }}>sm</RNText>
      </View>
      <View style={{ alignItems: "center", gap: 8 }}>
        <Spinner size="md" />
        <RNText style={{ fontSize: 12 }}>md</RNText>
      </View>
      <View style={{ alignItems: "center", gap: 8 }}>
        <Spinner size="lg" />
        <RNText style={{ fontSize: 12 }}>lg</RNText>
      </View>
      <View style={{ alignItems: "center", gap: 8 }}>
        <Spinner size={64} />
        <RNText style={{ fontSize: 12 }}>64px</RNText>
      </View>
    </View>
  ),
};

export const CustomColor: Story = {
  render: () => (
    <Spinner size="lg" spinnerColors={{ color: "#7C3AED" }} accessibilityLabel="Loading tasks" />
  ),
};

export const InsideRow: Story = {
  render: () => (
    <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
      <Spinner size="sm" />
      <RNText style={{ fontSize: 14 }}>Loading…</RNText>
    </View>
  ),
};

export const Static: Story = {
  render: () => <Spinner size="md" animating={false} />,
};

export const DarkTheme: Story = {
  render: () => (
    <Theme name="dark">
      <View
        style={{
          padding: 24,
          gap: 16,
          alignItems: "center",
          backgroundColor: "#0B0B0F",
        }}
      >
        <Spinner size="md" />
        <RNText style={{ fontSize: 12, color: "#D1D5DB" }}>Dark theme spinner</RNText>
      </View>
    </Theme>
  ),
};
