import type { Meta, StoryObj } from "@storybook/react-native";
import { useState } from "react";
import { View } from "react-native";
import { Theme } from "tamagui";

import { RadioGroup } from "./radio-group";

const OPTIONS = [
  { value: "yes", label: "Sí" },
  { value: "no", label: "No" },
];

const SIZES = [
  { value: "sm", label: "S" },
  { value: "md", label: "M" },
  { value: "lg", label: "L" },
];

const meta = {
  title: "UI Kit/RadioGroup",
  component: RadioGroup,
  args: { options: OPTIONS, value: null, onChange: () => undefined },
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof RadioGroup>;

export { meta as default };

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSelection: Story = {
  args: { value: "yes" },
};

export const WithLabel: Story = {
  args: { label: "Are you the vehicle owner?" },
};

export const Horizontal: Story = {
  args: { orientation: "horizontal", options: SIZES, value: "md" },
};

export const Disabled: Story = {
  args: { value: "yes", disabled: true },
};

function RadiusPresetsScene(args: Parameters<typeof RadioGroup>[0]) {
  const [value, setValue] = useState<string | null>("yes");
  return (
    <View style={{ gap: 12 }}>
      <RadioGroup {...args} radius="none" value={value} onChange={setValue} />
      <RadioGroup {...args} radius="sm" value={value} onChange={setValue} />
      <RadioGroup {...args} radius="md" value={value} onChange={setValue} />
      <RadioGroup {...args} radius="lg" value={value} onChange={setValue} />
      <RadioGroup {...args} radius="pill" value={value} onChange={setValue} />
    </View>
  );
}

export const RadiusPresets: Story = {
  render: (args) => <RadiusPresetsScene {...args} />,
};

export const CustomColors: Story = {
  args: {
    value: "yes",
    label: "Brand-orange radios",
    radioGroupColors: {
      selectedBorder: "#FF6B00",
      unselectedBorder: "#FFC58F",
      dot: "#FF6B00",
      label: "#3B0A00",
      groupLabel: "#3B0A00",
      selectedBackground: "#FFF7ED",
    },
  },
};

export const DarkTheme: Story = {
  render: (args) => (
    <Theme name="dark">
      <RadioGroup {...args} value="yes" label="Dark mode" />
    </Theme>
  ),
};
