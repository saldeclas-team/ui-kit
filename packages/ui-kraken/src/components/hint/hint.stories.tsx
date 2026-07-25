import type { Meta, StoryObj } from "@storybook/react-native";
import { Text as RNText, View } from "react-native";
import { Theme } from "tamagui";

import { Hint } from "./hint";

const meta = {
  title: "UI Kit/Hint",
  component: Hint,
  args: { tone: "neutral", emphasis: "ghost" },
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, gap: 12 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Hint>;

export { meta as default };

type Story = StoryObj<typeof meta>;

function Glyph({ children }: { children: string }) {
  return <RNText style={{ fontWeight: "700" }}>{children}</RNText>;
}

export const Neutral: Story = {
  render: (args) => <Hint {...args}>A short piece of contextual copy.</Hint>,
};

export const WithIcon: Story = {
  render: (args) => (
    <Hint {...args} tone="info" icon={<Glyph>i</Glyph>}>
      Your session will end in 5 minutes.
    </Hint>
  ),
};

export const WithTitleAndBody: Story = {
  render: (args) => (
    <Hint {...args} tone="success" icon={<Glyph>✓</Glyph>} title="Saved">
      Your changes are safe. You can leave this screen.
    </Hint>
  ),
};

export const Soft: Story = {
  render: (args) => (
    <Hint {...args} tone="warning" emphasis="soft" icon={<Glyph>!</Glyph>} title="Heads up">
      You are approaching your monthly limit.
    </Hint>
  ),
};

export const Dense: Story = {
  render: (args) => (
    <View style={{ gap: 6 }}>
      <RNText style={{ fontWeight: "600" }}>Password</RNText>
      <View style={{ padding: 12, borderRadius: 8, borderWidth: 1, borderColor: "#E5E7EB" }}>
        <RNText style={{ color: "#9CA3AF" }}>••••••••</RNText>
      </View>
      <Hint {...args} tone="info" dense icon={<Glyph>i</Glyph>}>
        Minimum 8 characters, one uppercase, one number.
      </Hint>
    </View>
  ),
};

export const AllTones: Story = {
  render: (args) => (
    <View style={{ gap: 8 }}>
      <Hint {...args} tone="neutral" emphasis="soft">
        Neutral tone
      </Hint>
      <Hint {...args} tone="info" emphasis="soft">
        Info tone
      </Hint>
      <Hint {...args} tone="success" emphasis="soft">
        Success tone
      </Hint>
      <Hint {...args} tone="warning" emphasis="soft">
        Warning tone
      </Hint>
      <Hint {...args} tone="danger" emphasis="soft">
        Danger tone
      </Hint>
    </View>
  ),
};

export const CustomColors: Story = {
  render: (args) => (
    <Hint
      {...args}
      tone="info"
      emphasis="soft"
      icon={<Glyph>★</Glyph>}
      hintColors={{ text: "#4C1D95", icon: "#7C3AED", background: "#F5F3FF" }}
    >
      Brand-tinted hint via the hintColors override.
    </Hint>
  ),
};

export const DarkTheme: Story = {
  render: (args) => (
    <Theme name="dark">
      <View style={{ backgroundColor: "#0B0B0F", padding: 24, gap: 8, borderRadius: 12 }}>
        <Hint {...args} tone="neutral" emphasis="soft">
          Neutral tone
        </Hint>
        <Hint {...args} tone="info" emphasis="soft">
          Info tone
        </Hint>
        <Hint {...args} tone="success" emphasis="soft">
          Success tone
        </Hint>
        <Hint {...args} tone="warning" emphasis="soft">
          Warning tone
        </Hint>
        <Hint {...args} tone="danger" emphasis="soft">
          Danger tone
        </Hint>
      </View>
    </Theme>
  ),
};
