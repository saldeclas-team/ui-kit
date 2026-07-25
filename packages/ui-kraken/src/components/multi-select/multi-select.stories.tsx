import type { Meta, StoryObj } from "@storybook/react-native";
import { useState } from "react";
import { View } from "react-native";
import { Theme } from "tamagui";

import { MultiSelect } from "./multi-select";

const meta = {
  title: "UI Kit/MultiSelect",
  component: MultiSelect,
  args: { options: [], value: [], onChange: () => undefined },
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof MultiSelect>;

export { meta as default };

type Story = StoryObj<typeof meta>;

const TOPICS = [
  { value: "design", label: "Design" },
  { value: "engineering", label: "Engineering" },
  { value: "product", label: "Product" },
  { value: "growth", label: "Growth" },
  { value: "ops", label: "Ops" },
] as const;

type Topic = (typeof TOPICS)[number]["value"];

type ControlledProps = Omit<
  React.ComponentProps<typeof MultiSelect<Topic>>,
  "value" | "onChange" | "options"
> & {
  initial?: Topic[];
};

function Controlled({ initial = [], ...props }: ControlledProps) {
  const [selected, setSelected] = useState<Topic[]>(initial);
  return (
    <MultiSelect<Topic> {...props} options={[...TOPICS]} value={selected} onChange={setSelected} />
  );
}

export const Default: Story = {
  render: () => <Controlled />,
};

export const Preselected: Story = {
  render: () => <Controlled initial={["engineering", "product"]} />,
};

export const WithLabel: Story = {
  render: () => <Controlled label="Categories" />,
};

export const WithHelperText: Story = {
  render: () => (
    <Controlled label="Categories" helperText="Tap chips to toggle. Pick as many as you want." />
  ),
};

export const WithErrorText: Story = {
  render: () => <Controlled label="Categories" errorText="Please pick at least one category." />,
};

export const Disabled: Story = {
  render: () => <Controlled initial={["engineering"]} disabled label="Categories (read-only)" />,
};

export const DisabledSubset: Story = {
  render: () => (
    <Controlled initial={["design"]} disabledOptions={["ops"]} label="Categories (Ops disabled)" />
  ),
};

export const CustomColors: Story = {
  render: () => (
    <Controlled
      label="Brand-tinted"
      initial={["design"]}
      multiSelectColors={{
        selectedBackground: "#7C3AED",
        selectedLabel: "#FFFFFF",
        selectedBorder: "#7C3AED",
        unselectedBorder: "#C4B5FD",
      }}
    />
  ),
};

export const DarkTheme: Story = {
  render: () => (
    <Theme name="dark">
      <View style={{ backgroundColor: "#0B0B0F", padding: 24, borderRadius: 12 }}>
        <Controlled label="Categories" initial={["design", "growth"]} />
      </View>
    </Theme>
  ),
};
