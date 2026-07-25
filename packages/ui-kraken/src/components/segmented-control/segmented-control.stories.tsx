import type { Meta, StoryObj } from "@storybook/react-native";
import { useState } from "react";
import { View } from "react-native";
import { Theme } from "tamagui";

import { SegmentedControl } from "./segmented-control";

const meta = {
  title: "UI Kit/SegmentedControl",
  component: SegmentedControl,
  args: { options: [], value: "", onChange: () => undefined },
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof SegmentedControl>;

export { meta as default };

type Story = StoryObj<typeof meta>;

const VIEW_MODES = [
  { value: "list", label: "List" },
  { value: "grid", label: "Grid" },
  { value: "map", label: "Map" },
] as const;

type ViewMode = (typeof VIEW_MODES)[number]["value"];

type ControlledProps = Omit<
  React.ComponentProps<typeof SegmentedControl<ViewMode>>,
  "value" | "onChange" | "options"
> & {
  initial?: ViewMode;
};

function Controlled({ initial = "list", ...props }: ControlledProps) {
  const [selected, setSelected] = useState<ViewMode>(initial);
  return (
    <SegmentedControl<ViewMode>
      {...props}
      options={[...VIEW_MODES]}
      value={selected}
      onChange={setSelected}
    />
  );
}

export const Default: Story = {
  render: () => <Controlled />,
};

function TwoOptionsDemo() {
  const [tab, setTab] = useState<"active" | "archived">("active");
  return (
    <SegmentedControl<"active" | "archived">
      options={[
        { value: "active", label: "Active" },
        { value: "archived", label: "Archived" },
      ]}
      value={tab}
      onChange={setTab}
      label="Filter"
    />
  );
}

export const TwoOptions: Story = {
  render: () => <TwoOptionsDemo />,
};

function FiveOptionsDemo() {
  const [sort, setSort] = useState<string>("new");
  return (
    <SegmentedControl
      options={[
        { value: "az", label: "A→Z" },
        { value: "za", label: "Z→A" },
        { value: "new", label: "New" },
        { value: "old", label: "Old" },
        { value: "pop", label: "Top" },
      ]}
      value={sort}
      onChange={setSort}
      label="Sort by"
    />
  );
}

export const FiveOptions: Story = {
  render: () => <FiveOptionsDemo />,
};

export const WithLabel: Story = {
  render: () => <Controlled label="View mode" />,
};

export const WithHelperText: Story = {
  render: () => <Controlled label="View mode" helperText="Tap a segment to switch." />,
};

export const WithErrorText: Story = {
  render: () => <Controlled label="View mode" errorText="Selection failed to save." />,
};

export const Disabled: Story = {
  render: () => <Controlled initial="grid" disabled label="View mode (read-only)" />,
};

export const DarkTheme: Story = {
  render: () => (
    <Theme name="dark">
      <View style={{ backgroundColor: "#0B0B0F", padding: 24, borderRadius: 12 }}>
        <Controlled label="View mode" initial="map" />
      </View>
    </Theme>
  ),
};
