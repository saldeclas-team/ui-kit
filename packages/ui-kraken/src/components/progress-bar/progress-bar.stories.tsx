import type { Meta, StoryObj } from "@storybook/react-native";
import { Text as RNText, View } from "react-native";
import { Theme } from "tamagui";

import { ProgressBar } from "./progress-bar";

const meta = {
  title: "UI Kit/ProgressBar",
  component: ProgressBar,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, gap: 20 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof ProgressBar>;

export { meta as default };

type Story = StoryObj<typeof meta>;

function Caption({ children }: { children: string }) {
  return <RNText style={{ fontSize: 12, color: "#6B7280" }}>{children}</RNText>;
}

export const Default: Story = {
  render: () => <ProgressBar value={50} />,
};

export const Sizes: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <View style={{ gap: 4 }}>
        <ProgressBar value={50} size="sm" />
        <Caption>sm (track 4)</Caption>
      </View>
      <View style={{ gap: 4 }}>
        <ProgressBar value={50} size="md" />
        <Caption>md (track 8)</Caption>
      </View>
      <View style={{ gap: 4 }}>
        <ProgressBar value={50} size="lg" />
        <Caption>lg (track 12)</Caption>
      </View>
    </View>
  ),
};

export const WithValueLabel: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <ProgressBar value={0} showValueLabel />
      <ProgressBar value={30} showValueLabel />
      <ProgressBar value={73} showValueLabel />
      <ProgressBar value={100} showValueLabel />
    </View>
  ),
};

export const WithCustomLabel: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <ProgressBar value={40} label="Uploading photo…" />
      <ProgressBar value={2} min={0} max={5} label="Step 2 of 5" size="lg" />
    </View>
  ),
};

export const CustomRange: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <ProgressBar value={650000} min={0} max={1024000} showValueLabel size="lg" />
      <Caption>650 KB of 1 MB → 63%</Caption>
    </View>
  ),
};

export const CustomColors: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <ProgressBar
        value={75}
        showValueLabel
        progressBarColors={{ track: "#FFF7ED", fill: "#F97316", label: "#7C2D12" }}
      />
    </View>
  ),
};

export const StraightBar: Story = {
  render: () => <ProgressBar value={50} size="lg" radius="none" />,
};

export const DarkTheme: Story = {
  render: () => (
    <Theme name="dark">
      <View style={{ padding: 16, gap: 12, backgroundColor: "#0B0B0F" }}>
        <ProgressBar value={30} showValueLabel />
        <ProgressBar value={75} size="lg" />
      </View>
    </Theme>
  ),
};
