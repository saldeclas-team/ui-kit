import type { Meta, StoryObj } from "@storybook/react-native";
import { Text as RNText, View } from "react-native";
import { Theme } from "tamagui";

import { StatCard } from "./stat-card";

const meta = {
  title: "UI Kit/StatCard",
  component: StatCard,
  args: { title: "Revenue", value: "$12,340" },
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, gap: 12 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof StatCard>;

export { meta as default };

type Story = StoryObj<typeof meta>;

function Glyph({ children }: { children: string }) {
  return <RNText style={{ fontWeight: "700" }}>{children}</RNText>;
}

export const Minimal: Story = {
  render: (args) => <StatCard {...args} />,
};

export const WithDelta: Story = {
  render: (args) => <StatCard {...args} trend="up" delta="+8.2%" />,
};

export const WithIconAndDescription: Story = {
  render: (args) => <StatCard {...args} icon={<Glyph>◉</Glyph>} description="vs last week" />,
};

export const FullExample: Story = {
  render: (args) => (
    <StatCard
      {...args}
      icon={<Glyph>◉</Glyph>}
      trend="up"
      delta="+8.2%"
      description="vs last week"
    />
  ),
};

export const TrendDown: Story = {
  render: (args) => (
    <StatCard
      {...args}
      title="Bounce rate"
      value="42.3%"
      trend="down"
      delta="-2.1%"
      description="vs last week"
    />
  ),
};

export const CustomColors: Story = {
  render: (args) => (
    <StatCard
      {...args}
      title="Sales"
      value="$4,120"
      trend="up"
      delta="+12%"
      icon={<Glyph>★</Glyph>}
      statCardColors={{
        background: "#F5F3FF",
        title: "#4C1D95",
        value: "#312E81",
        trendUp: "#7C3AED",
        icon: "#7C3AED",
      }}
    />
  ),
};

export const DarkTheme: Story = {
  render: (args) => (
    <Theme name="dark">
      <View style={{ backgroundColor: "#0B0B0F", padding: 24, borderRadius: 12 }}>
        <StatCard
          {...args}
          icon={<Glyph>◉</Glyph>}
          trend="up"
          delta="+8.2%"
          description="vs last week"
        />
      </View>
    </Theme>
  ),
};
