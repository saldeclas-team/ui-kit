import type { Meta, StoryObj } from "@storybook/react-native";
import { useState } from "react";
import { Text as RNText, View } from "react-native";
import { Theme } from "tamagui";

import { Input } from "./input";

const meta = {
  title: "UI Kit/Input",
  component: Input,
  args: {
    value: "",
    onChangeText: () => undefined,
    placeholder: "Type here",
  },
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Input>;

export { meta as default };

type Story = StoryObj<typeof meta>;

// Tiny glyph for the icon-slot stories — real consumers bring their
// own icon library.
function Glyph({ children }: { children: string }) {
  return <RNText style={{ fontSize: 16 }}>{children}</RNText>;
}

// Stateful wrapper so the Storybook demo actually types.
function ControlledScene({
  initial = "",
  ...args
}: { initial?: string } & Parameters<typeof Input>[0]) {
  const [value, setValue] = useState(initial);
  return <Input {...args} value={value} onChangeText={setValue} />;
}

export const Default: Story = {
  render: (args) => <ControlledScene {...args} />,
};

export const WithLabel: Story = {
  args: { label: "Name" },
  render: (args) => <ControlledScene {...args} />,
};

export const WithHelperText: Story = {
  args: { label: "Email", helperText: "We'll never share it." },
  render: (args) => <ControlledScene {...args} />,
};

export const WithError: Story = {
  args: { label: "Email", error: "Enter a valid address" },
  render: (args) => <ControlledScene {...args} initial="not-an-email" />,
};

export const WithIcons: Story = {
  args: {
    label: "Search",
    placeholder: "Search…",
    leftIcon: <Glyph>🔍</Glyph>,
    rightIcon: <Glyph>✕</Glyph>,
  },
  render: (args) => <ControlledScene {...args} />,
};

export const Disabled: Story = {
  args: { label: "Locked", disabled: true },
  render: (args) => <ControlledScene {...args} initial="Read-only value" />,
};

export const Password: Story = {
  args: { label: "Password", placeholder: "Choose one", secureTextEntry: true },
  render: (args) => <ControlledScene {...args} initial="hunter2" />,
};

export const CustomColors: Story = {
  args: {
    label: "Brand-orange input",
    placeholder: "Type here",
    inputColors: {
      border: "#FF6B00",
      borderFocused: "#FF6B00",
      background: "#FFF7ED",
      label: "#3B0A00",
    },
  },
  render: (args) => <ControlledScene {...args} />,
};

export const DarkTheme: Story = {
  args: { label: "Dark mode", placeholder: "Type here" },
  render: (args) => (
    <Theme name="dark">
      <ControlledScene {...args} />
    </Theme>
  ),
};
