import type { Meta, StoryObj } from "@storybook/react-native";
import { Text as RNText, View } from "react-native";
import { Theme, YStack } from "tamagui";

import { Alert } from "./alert";

const meta = {
  title: "UI Kit/Alert",
  component: Alert,
  args: { children: "Your session will expire in 5 minutes." },
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, gap: 16 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Alert>;

export { meta as default };

type Story = StoryObj<typeof meta>;

// Tiny inline "icon" for the stories — a text glyph. Real consumers
// pass their own icon library (Feather, Ionicons, custom SVG, etc.).
function Glyph({ children }: { children: string }) {
  return <RNText style={{ fontSize: 16 }}>{children}</RNText>;
}

export const Default: Story = {};

export const AllVariants: Story = {
  render: (args) => (
    <YStack gap="$3">
      <Alert.Info {...args} title="Info" icon={<Glyph>ℹ</Glyph>} />
      <Alert.Success {...args} title="Success" icon={<Glyph>✓</Glyph>}>
        Your changes were saved.
      </Alert.Success>
      <Alert.Warning {...args} title="Warning" icon={<Glyph>!</Glyph>}>
        Free tier caps at 5 seats.
      </Alert.Warning>
      <Alert.Danger {...args} title="Danger" icon={<Glyph>✗</Glyph>}>
        Payment failed — update your card and retry.
      </Alert.Danger>
    </YStack>
  ),
};

export const WithTitle: Story = {
  render: (args) => (
    <YStack gap="$3">
      <Alert.Info {...args}>Body only, no title.</Alert.Info>
      <Alert.Info {...args} title="With a title" />
    </YStack>
  ),
};

export const WithIcon: Story = {
  render: (args) => (
    <YStack gap="$3">
      <Alert.Info {...args}>No icon</Alert.Info>
      <Alert.Info {...args} icon={<Glyph>ℹ</Glyph>}>
        With icon
      </Alert.Info>
    </YStack>
  ),
};

export const LongContent: Story = {
  args: {
    children:
      "This alert has a paragraph of body content that intentionally wraps onto multiple lines to demonstrate that the flex layout expands the content column and does not overflow the row. The icon stays fixed on the left, the content grows to fill the width, and the alert grows vertically to match.",
    title: "Long content",
  },
  render: (args) => <Alert.Info {...args} icon={<Glyph>ℹ</Glyph>} />,
};

export const RadiusPresets: Story = {
  render: (args) => (
    <YStack gap="$3">
      <Alert.Info {...args} radius="none">
        radius=&quot;none&quot;
      </Alert.Info>
      <Alert.Info {...args} radius="sm">
        radius=&quot;sm&quot;
      </Alert.Info>
      <Alert.Info {...args} radius="md">
        radius=&quot;md&quot; (default)
      </Alert.Info>
      <Alert.Info {...args} radius="lg">
        radius=&quot;lg&quot;
      </Alert.Info>
      <Alert.Info {...args} radius="pill">
        radius=&quot;pill&quot;
      </Alert.Info>
      <Alert.Info {...args} radius={24}>
        radius=&#123;24&#125; (raw px)
      </Alert.Info>
    </YStack>
  ),
};

export const CustomColors: Story = {
  render: (args) => (
    <YStack gap="$3">
      <Alert.Info {...args} title="Custom background" alertColors={{ background: "#FFEEDD" }}>
        Override only the background — text + icon still use variant defaults.
      </Alert.Info>
      <Alert.Danger
        {...args}
        title="Inverted danger"
        icon={<Glyph>✗</Glyph>}
        alertColors={{
          background: "#4A0000",
          text: "#FFFFFF",
          icon: "#FFFFFF",
        }}
      >
        Every slot overridden — dark background, white text.
      </Alert.Danger>
      <Alert.Success
        {...args}
        title="With border"
        alertColors={{
          background: "#F0FDF4",
          border: "#059669",
        }}
      >
        Add a border color to opt into the border stroke.
      </Alert.Success>
    </YStack>
  ),
};

export const DarkTheme: Story = {
  render: (args) => (
    <Theme name="dark">
      <YStack gap="$3">
        <Alert.Info {...args} title="Info" icon={<Glyph>ℹ</Glyph>} />
        <Alert.Success {...args} title="Success" icon={<Glyph>✓</Glyph>} />
        <Alert.Warning {...args} title="Warning" icon={<Glyph>!</Glyph>} />
        <Alert.Danger {...args} title="Danger" icon={<Glyph>✗</Glyph>} />
      </YStack>
    </Theme>
  ),
};
