import type { Meta, StoryObj } from "@storybook/react-native";
import { Text as RNText, View } from "react-native";
import { Theme } from "tamagui";

import { Avatar } from "../avatar";
import { Badge } from "./badge";

const meta = {
  title: "UI Kit/Badge",
  component: Badge,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, gap: 16 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Badge>;

export { meta as default };

type Story = StoryObj<typeof meta>;

function Caption({ children }: { children: string }) {
  return <RNText style={{ fontSize: 12, color: "#6B7280" }}>{children}</RNText>;
}

export const Text: Story = {
  render: () => <Badge>Beta</Badge>,
};

export const Tones: Story = {
  render: () => (
    <View style={{ flexDirection: "row", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <Badge tone="neutral">Neutral</Badge>
      <Badge.Primary>Primary</Badge.Primary>
      <Badge.Success>Success</Badge.Success>
      <Badge.Warning>Warning</Badge.Warning>
      <Badge.Danger>Danger</Badge.Danger>
    </View>
  ),
};

export const Sizes: Story = {
  render: () => (
    <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
      <Badge size="sm">sm</Badge>
      <Badge size="md">md</Badge>
      <Badge size="sm" tone="danger" count={5} />
      <Badge size="md" tone="danger" count={5} />
    </View>
  ),
};

export const Count: Story = {
  render: () => (
    <View style={{ flexDirection: "row", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <Badge.Primary count={0} />
      <Badge.Primary count={5} />
      <Badge.Primary count={42} />
      <Badge.Danger count={120} />
      <Badge.Danger count={12} maxCount={9} />
    </View>
  ),
};

export const Dot: Story = {
  render: () => (
    <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
      <View style={{ alignItems: "center", gap: 6 }}>
        <Badge dot size="sm" tone="success" />
        <Caption>sm dot</Caption>
      </View>
      <View style={{ alignItems: "center", gap: 6 }}>
        <Badge dot size="md" tone="success" />
        <Caption>md dot</Caption>
      </View>
      <View style={{ alignItems: "center", gap: 6 }}>
        <Badge dot size="md" tone="danger" />
        <Caption>danger</Caption>
      </View>
    </View>
  ),
};

export const DotOverAvatar: Story = {
  render: () => (
    <View style={{ flexDirection: "row", gap: 24 }}>
      <View>
        <Avatar name="Alexis Noriega" size="lg" />
        <View style={{ position: "absolute", bottom: 0, right: 0 }}>
          <Badge dot tone="success" />
        </View>
      </View>
    </View>
  ),
};

export const CustomColors: Story = {
  render: () => (
    <View style={{ flexDirection: "row", gap: 8 }}>
      <Badge.Primary badgeColors={{ background: "#7C3AED", text: "#F5F3FF" }}>Brand</Badge.Primary>
    </View>
  ),
};

export const DarkTheme: Story = {
  render: () => (
    <Theme name="dark">
      <View style={{ padding: 16, gap: 12, backgroundColor: "#0B0B0F" }}>
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          <Badge>Neutral</Badge>
          <Badge.Primary>Primary</Badge.Primary>
          <Badge.Success>Success</Badge.Success>
          <Badge.Warning>Warning</Badge.Warning>
          <Badge.Danger>Danger</Badge.Danger>
        </View>
      </View>
    </Theme>
  ),
};
