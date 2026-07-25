import type { Meta, StoryObj } from "@storybook/react-native";
import { Text as RNText, View } from "react-native";
import { Theme } from "tamagui";

import { Skeleton } from "./skeleton";

const meta = {
  title: "UI Kit/Skeleton",
  component: Skeleton,
  args: { variant: "pulse", radius: "md" },
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, gap: 16 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Skeleton>;

export { meta as default };

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <Skeleton {...args} style={{ width: 240, height: 16 }} />,
};

export const Text: Story = {
  render: (args) => (
    <View style={{ gap: 8 }}>
      <Skeleton {...args} style={{ width: 240, height: 14 }} />
      <Skeleton {...args} style={{ width: 200, height: 14 }} />
      <Skeleton {...args} style={{ width: 160, height: 14 }} />
    </View>
  ),
};

export const Avatar: Story = {
  render: (args) => (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      <Skeleton {...args} radius="pill" style={{ width: 48, height: 48 }} />
      <View style={{ gap: 6, flex: 1 }}>
        <Skeleton {...args} style={{ width: 140, height: 14 }} />
        <Skeleton {...args} style={{ width: 90, height: 12 }} />
      </View>
    </View>
  ),
};

export const Card: Story = {
  render: (args) => (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Skeleton {...args} radius="pill" style={{ width: 48, height: 48 }} />
        <View style={{ gap: 6, flex: 1 }}>
          <Skeleton {...args} style={{ width: 140, height: 14 }} />
          <Skeleton {...args} style={{ width: 90, height: 12 }} />
        </View>
      </View>
      <Skeleton {...args} radius="lg" style={{ width: "100%", height: 160 }} />
    </View>
  ),
};

export const Static: Story = {
  render: (args) => (
    <View style={{ gap: 8 }}>
      <RNText style={{ color: "#6B7280", fontSize: 12 }}>
        variant=&quot;static&quot; — for reduced-motion.
      </RNText>
      <Skeleton {...args} variant="static" style={{ width: 240, height: 16 }} />
    </View>
  ),
};

export const CustomColors: Story = {
  render: (args) => (
    <Skeleton
      {...args}
      style={{ width: 240, height: 16 }}
      skeletonColors={{ base: "#DBEAFE", highlight: "#EFF6FF" }}
    />
  ),
};

export const DarkTheme: Story = {
  render: (args) => (
    <Theme name="dark">
      <View style={{ backgroundColor: "#0B0B0F", padding: 24, gap: 12, borderRadius: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Skeleton {...args} radius="pill" style={{ width: 48, height: 48 }} />
          <View style={{ gap: 6, flex: 1 }}>
            <Skeleton {...args} style={{ width: 140, height: 14 }} />
            <Skeleton {...args} style={{ width: 90, height: 12 }} />
          </View>
        </View>
        <Skeleton {...args} radius="lg" style={{ width: "100%", height: 120 }} />
      </View>
    </Theme>
  ),
};
