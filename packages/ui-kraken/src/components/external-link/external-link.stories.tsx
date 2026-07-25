import type { Meta, StoryObj } from "@storybook/react-native";
import { Text as RNText, View } from "react-native";
import { Theme } from "tamagui";

import { ExternalLink } from "./external-link";

const meta = {
  title: "UI Kit/ExternalLink",
  component: ExternalLink,
  args: { url: "https://example.com", children: "Read the docs" },
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, gap: 12 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof ExternalLink>;

export { meta as default };

type Story = StoryObj<typeof meta>;

export const Inline: Story = {
  render: (args) => (
    <RNText>
      For more information, please{" "}
      <ExternalLink {...args} hideTrailingIcon>
        read the docs
      </ExternalLink>
      .
    </RNText>
  ),
};

export const WithIcon: Story = {
  render: (args) => (
    <ExternalLink {...args} icon={<RNText style={{ fontWeight: "700" }}>i</RNText>}>
      Visit our documentation
    </ExternalLink>
  ),
};

export const HiddenTrailingIcon: Story = {
  render: (args) => (
    <RNText>
      By tapping continue you agree to our{" "}
      <ExternalLink {...args} hideTrailingIcon>
        Terms of Service
      </ExternalLink>
      .
    </RNText>
  ),
};

export const Disabled: Story = {
  render: (args) => <ExternalLink {...args} disabled />,
};

function AnalyticsHookDemo() {
  return (
    <ExternalLink
      url="https://example.com/docs"
      onPress={() => {
        console.warn("[analytics] External link tapped: docs");
      }}
    >
      Docs (with analytics hook)
    </ExternalLink>
  );
}

export const WithAnalyticsHook: Story = {
  render: () => <AnalyticsHookDemo />,
};

export const CustomColors: Story = {
  render: (args) => (
    <ExternalLink {...args} externalLinkColors={{ label: "#7C3AED", icon: "#7C3AED" }}>
      Brand-tinted link
    </ExternalLink>
  ),
};

export const DarkTheme: Story = {
  render: (args) => (
    <Theme name="dark">
      <View style={{ backgroundColor: "#0B0B0F", padding: 24, gap: 8, borderRadius: 12 }}>
        <ExternalLink {...args}>Inline dark link</ExternalLink>
        <ExternalLink {...args} icon={<RNText style={{ fontWeight: "700" }}>i</RNText>}>
          Dark link with icon
        </ExternalLink>
      </View>
    </Theme>
  ),
};
