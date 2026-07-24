import type { Meta, StoryObj } from "@storybook/react-native";
import { View } from "react-native";
import { Theme, YStack } from "tamagui";

import { Text } from "./text";

const meta = {
  title: "UI Kit/Text",
  component: Text,
  args: { children: "The quick brown fox jumps over the lazy dog." },
  decorators: [
    (Story) => (
      <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Text>;

export { meta as default };

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllVariants: Story = {
  render: (args) => (
    <YStack gap="$2">
      <Text.H1 {...args}>H1 — hero title</Text.H1>
      <Text.H2 {...args}>H2 — section title</Text.H2>
      <Text.H3 {...args}>H3 — subsection</Text.H3>
      <Text.H4 {...args}>H4 — card title</Text.H4>
      <Text.H5 {...args}>H5 — small title</Text.H5>
      <Text.H6 {...args}>H6 — smallest heading</Text.H6>
      <Text.Subtitle1 {...args}>Subtitle1 — prominent subtitle</Text.Subtitle1>
      <Text.Subtitle2 {...args}>Subtitle2 — compact subtitle</Text.Subtitle2>
      <Text.Body1 {...args}>Body1 — prominent body copy</Text.Body1>
      <Text.Body2 {...args}>Body2 (default) — standard body copy</Text.Body2>
      <Text.Caption {...args}>Caption — metadata, timestamps</Text.Caption>
      <Text.Overline {...args}>Overline — eyebrow</Text.Overline>
      <Text.Label {...args}>Label — form field label</Text.Label>
    </YStack>
  ),
};

export const HierarchyColors: Story = {
  render: (args) => (
    <YStack gap="$2">
      <Text.Body1 {...args} color="primary">
        primary — main content
      </Text.Body1>
      <Text.Body1 {...args} color="secondary">
        secondary — supporting content
      </Text.Body1>
      <Text.Body1 {...args} color="tertiary">
        tertiary — de-emphasized
      </Text.Body1>
      <Text.Body1 {...args} color="disabled">
        disabled — inactive
      </Text.Body1>
    </YStack>
  ),
};

export const SemanticColors: Story = {
  render: (args) => (
    <YStack gap="$2">
      <Text.Body1 {...args} color="interactive">
        interactive — link / tappable
      </Text.Body1>
      <Text.Body1 {...args} color="success">
        success — operation succeeded
      </Text.Body1>
      <Text.Body1 {...args} color="warning">
        warning — needs attention
      </Text.Body1>
      <Text.Body1 {...args} color="danger">
        danger — destructive / error
      </Text.Body1>
      <Text.Body1 {...args} color="info">
        info — informational message
      </Text.Body1>
    </YStack>
  ),
};

export const OnColors: Story = {
  render: (args) => (
    <YStack gap="$2">
      <View style={{ backgroundColor: "#2563EB", padding: 12, borderRadius: 8 }}>
        <Text.Body1 {...args} color="onPrimary">
          onPrimary — on brand primary surface
        </Text.Body1>
      </View>
      <View style={{ backgroundColor: "#0EA5E9", padding: 12, borderRadius: 8 }}>
        <Text.Body1 {...args} color="onSecondary">
          onSecondary — on brand secondary surface
        </Text.Body1>
      </View>
      <View style={{ backgroundColor: "#059669", padding: 12, borderRadius: 8 }}>
        <Text.Body1 {...args} color="onSuccess">
          onSuccess — on success surface
        </Text.Body1>
      </View>
      <View style={{ backgroundColor: "#DC2626", padding: 12, borderRadius: 8 }}>
        <Text.Body1 {...args} color="onDanger">
          onDanger — on danger surface
        </Text.Body1>
      </View>
    </YStack>
  ),
};

export const Intensities: Story = {
  render: (args) => (
    <YStack gap="$2">
      <Text.Body1 {...args} intensity="subtle">
        subtle — opacity 0.65
      </Text.Body1>
      <Text.Body1 {...args} intensity="normal">
        normal (default)
      </Text.Body1>
      <Text.Body1 {...args} intensity="strong">
        strong — bumped fontWeight
      </Text.Body1>
    </YStack>
  ),
};

export const CustomHex: Story = {
  render: (args) => (
    <YStack gap="$2">
      <Text.Body1 {...args} color="#FF6B00">
        color=&quot;#FF6B00&quot;
      </Text.Body1>
      <Text.Body1 {...args} color="rgb(139, 92, 246)">
        color=&quot;rgb(139, 92, 246)&quot;
      </Text.Body1>
      <Text.Body1 {...args} color="hotpink">
        color=&quot;hotpink&quot;
      </Text.Body1>
    </YStack>
  ),
};

export const Alignment: Story = {
  render: (args) => (
    <YStack gap="$2">
      <Text.Body1 {...args} textAlign="left">
        textAlign=&quot;left&quot;
      </Text.Body1>
      <Text.Body1 {...args} textAlign="center">
        textAlign=&quot;center&quot;
      </Text.Body1>
      <Text.Body1 {...args} textAlign="right">
        textAlign=&quot;right&quot;
      </Text.Body1>
      <Text.Body1 {...args} textAlign="justify">
        textAlign=&quot;justify&quot; — this longer paragraph shows the effect of justify alignment
        on a multi-line body copy in the storybook preview.
      </Text.Body1>
    </YStack>
  ),
};

export const Truncation: Story = {
  args: {
    numberOfLines: 2,
    children:
      "This is a longer paragraph that will be truncated after two lines with an ellipsis, thanks to the numberOfLines prop passing straight through from the underlying RN Text.",
  },
};

export const DarkTheme: Story = {
  render: (args) => (
    <Theme name="dark">
      <YStack gap="$2">
        <Text.H2 {...args}>Dark heading</Text.H2>
        <Text.Body1 {...args} color="secondary">
          Secondary body in dark
        </Text.Body1>
        <Text.Caption {...args} color="tertiary">
          Tertiary caption in dark
        </Text.Caption>
        <Text.Body1 {...args} color="interactive">
          Interactive link in dark
        </Text.Body1>
      </YStack>
    </Theme>
  ),
};
