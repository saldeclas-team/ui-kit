import type { Meta, StoryObj } from "@storybook/react-native";
import { Text as RNText, View } from "react-native";
import { Theme } from "tamagui";

import { Avatar } from "./avatar";

const meta = {
  title: "UI Kit/Avatar",
  component: Avatar,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, gap: 24 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Avatar>;

export { meta as default };

type Story = StoryObj<typeof meta>;

const MOCK_SOURCE = { uri: "https://i.pravatar.cc/150?img=13" };

function Caption({ children }: { children: string }) {
  return <RNText style={{ fontSize: 12, color: "#6B7280" }}>{children}</RNText>;
}

export const Initials: Story = {
  render: () => <Avatar name="Alexis Noriega" />,
};

export const WithImage: Story = {
  render: () => <Avatar source={MOCK_SOURCE} name="Alexis Noriega" />,
};

export const Sizes: Story = {
  render: () => (
    <View style={{ flexDirection: "row", gap: 16, alignItems: "flex-end" }}>
      <View style={{ alignItems: "center", gap: 6 }}>
        <Avatar name="AN" size="sm" />
        <Caption>sm (24)</Caption>
      </View>
      <View style={{ alignItems: "center", gap: 6 }}>
        <Avatar name="AN" size="md" />
        <Caption>md (40)</Caption>
      </View>
      <View style={{ alignItems: "center", gap: 6 }}>
        <Avatar name="AN" size="lg" />
        <Caption>lg (56)</Caption>
      </View>
      <View style={{ alignItems: "center", gap: 6 }}>
        <Avatar name="AN" size="xl" />
        <Caption>xl (80)</Caption>
      </View>
    </View>
  ),
};

export const Shapes: Story = {
  render: () => (
    <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
      <View style={{ alignItems: "center", gap: 6 }}>
        <Avatar name="AN" size="lg" shape="circle" />
        <Caption>circle</Caption>
      </View>
      <View style={{ alignItems: "center", gap: 6 }}>
        <Avatar name="AN" size="lg" shape="rounded" />
        <Caption>rounded</Caption>
      </View>
      <View style={{ alignItems: "center", gap: 6 }}>
        <Avatar name="AN" size="lg" shape="square" />
        <Caption>square</Caption>
      </View>
    </View>
  ),
};

export const CustomColors: Story = {
  render: () => (
    <View style={{ flexDirection: "row", gap: 12 }}>
      <Avatar name="AL" avatarColors={{ background: "#7C3AED", text: "#F5F3FF" }} />
      <Avatar name="MN" avatarColors={{ background: "#059669", text: "#ECFDF5" }} />
      <Avatar name="RG" avatarColors={{ background: "#DC2626", text: "#FEF2F2" }} />
    </View>
  ),
};

export const FallbackOnError: Story = {
  render: () => (
    <View style={{ flexDirection: "row", gap: 12 }}>
      <Avatar source={{ uri: "https://this-url-does-not-exist.example/x.jpg" }} name="Alexis" />
      <Caption>Bad URL → initials</Caption>
    </View>
  ),
};

export const ExplicitInitials: Story = {
  render: () => (
    <View style={{ flexDirection: "row", gap: 12 }}>
      <Avatar initials="?" />
      <Avatar initials="🙂" />
    </View>
  ),
};

export const DarkTheme: Story = {
  render: () => (
    <Theme name="dark">
      <View style={{ padding: 16, gap: 12, backgroundColor: "#0B0B0F" }}>
        <Avatar name="Alexis Noriega" />
        <Caption>Dark theme avatar</Caption>
      </View>
    </Theme>
  ),
};
