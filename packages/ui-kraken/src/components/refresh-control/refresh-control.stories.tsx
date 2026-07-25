import type { Meta, StoryObj } from "@storybook/react-native";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Theme } from "tamagui";

import { RefreshControl } from "./refresh-control";

const meta = {
  title: "UI Kit/RefreshControl",
  component: RefreshControl,
  args: { refreshing: false, onRefresh: () => undefined },
  decorators: [
    (Story) => (
      <View style={{ flex: 1, height: 320 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof RefreshControl>;

export { meta as default };

type Story = StoryObj<typeof meta>;

function DemoList({
  refreshControlColors,
  title,
}: {
  refreshControlColors?: React.ComponentProps<typeof RefreshControl>["refreshControlColors"];
  title?: string;
}) {
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          refreshControlColors={refreshControlColors}
          title={title}
        />
      }
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <View key={i} style={{ padding: 12, borderRadius: 8, backgroundColor: "#F9FAFB" }}>
          <Text>Item #{i + 1} — pull the list down to trigger a refresh</Text>
        </View>
      ))}
    </ScrollView>
  );
}

export const Idle: Story = {
  render: () => <DemoList />,
};

export const Refreshing: Story = {
  render: () => (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      refreshControl={<RefreshControl refreshing={true} onRefresh={() => undefined} />}
    >
      <Text>Refreshing state — spinner visible.</Text>
    </ScrollView>
  ),
};

export const WithTitleIOS: Story = {
  render: () => <DemoList title="Pulling to refresh…" />,
};

export const CustomColors: Story = {
  render: () => (
    <DemoList
      refreshControlColors={{
        spinner: "#7C3AED",
        background: "#F5F3FF",
        title: "#4C1D95",
      }}
      title="Custom palette"
    />
  ),
};

export const DarkTheme: Story = {
  render: () => (
    <Theme name="dark">
      <View style={{ flex: 1, backgroundColor: "#0B0B0F" }}>
        <DemoList />
      </View>
    </Theme>
  ),
};
