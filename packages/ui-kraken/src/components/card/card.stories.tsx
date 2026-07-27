import type { Meta, StoryObj } from "@storybook/react-native";
import { Text as RNText, View } from "react-native";
import { Theme } from "tamagui";

import { Button } from "../button";
import { Card } from "./card";

const meta = {
  title: "UI Kit/Card",
  component: Card,
  args: { children: null },
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, gap: 12, backgroundColor: "#EEF2F7" }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Card>;

export { meta as default };

type Story = StoryObj<typeof meta>;

function Label({ children }: { children: string }) {
  return <RNText style={{ fontSize: 14 }}>{children}</RNText>;
}

function Title({ children }: { children: string }) {
  return <RNText style={{ fontSize: 16, fontWeight: "600" }}>{children}</RNText>;
}

export const Default: Story = {
  render: () => (
    <Card>
      <Title>Notification</Title>
      <Label>You have 3 unread messages.</Label>
    </Card>
  ),
};

export const WithSlots: Story = {
  render: () => (
    <Card>
      <Card.Header>
        <Title>Publish post</Title>
        <Button size="sm" tone="ghost">
          Draft
        </Button>
      </Card.Header>
      <Card.Body>
        <Label>Your post will be visible to your followers as soon as you publish.</Label>
      </Card.Body>
      <Card.Footer>
        <Button tone="ghost">Cancel</Button>
        <Button>Publish</Button>
      </Card.Footer>
    </Card>
  ),
};

export const LevelBase: Story = {
  render: () => (
    <Card level="base">
      <Title>level="base"</Title>
      <Label>Flatter card — reads flush with the screen background.</Label>
    </Card>
  ),
};

export const LevelOverlay: Story = {
  render: () => (
    <Card level="overlay">
      <Title>level="overlay"</Title>
      <Label>For cards that sit on top of a modal or sheet.</Label>
    </Card>
  ),
};

export const CustomPadding: Story = {
  render: () => (
    <Card padding={32} borderRadius={20} gap={20}>
      <Title>Roomy card</Title>
      <Label>padding=32, borderRadius=20, gap=20 — overrides via Tamagui pass-through.</Label>
    </Card>
  ),
};

export const CustomColors: Story = {
  render: () => (
    <Card surfaceColors={{ raised: "#FFF7ED" }}>
      <Title>Brand-tinted card</Title>
      <Label>Per-instance surfaceColors override — only the resolved level slot is read.</Label>
    </Card>
  ),
};

export const DarkTheme: Story = {
  render: () => (
    <Theme name="dark">
      <Card>
        <Card.Header>
          <RNText style={{ fontSize: 16, fontWeight: "600", color: "#F9FAFB" }}>
            Dark theme card
          </RNText>
        </Card.Header>
        <Card.Body>
          <RNText style={{ fontSize: 14, color: "#D1D5DB" }}>
            Card background follows the provider's dark palette automatically.
          </RNText>
        </Card.Body>
      </Card>
    </Theme>
  ),
};
