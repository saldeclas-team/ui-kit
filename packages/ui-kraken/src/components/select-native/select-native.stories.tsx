import type { Meta, StoryObj } from "@storybook/react-native";
import { useState } from "react";
import { View } from "react-native";
import { Theme } from "tamagui";

import { SelectNative } from "./select-native";

const meta = {
  title: "UI Kit/SelectNative",
  component: SelectNative,
  args: { options: [], value: null, onChange: () => undefined },
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof SelectNative>;

export { meta as default };

type Story = StoryObj<typeof meta>;

const COUNTRIES = [
  { value: "us", label: "United States" },
  { value: "mx", label: "Mexico" },
  { value: "ca", label: "Canada" },
  { value: "br", label: "Brazil" },
  { value: "ar", label: "Argentina" },
  { value: "es", label: "Spain" },
] as const;

type Country = (typeof COUNTRIES)[number]["value"];

type ControlledProps = Omit<
  React.ComponentProps<typeof SelectNative<Country>>,
  "value" | "onChange" | "options"
> & {
  initial?: Country | null;
};

function Controlled({ initial = null, ...props }: ControlledProps) {
  const [selected, setSelected] = useState<Country | null>(initial);
  return (
    <SelectNative<Country>
      {...props}
      options={[...COUNTRIES]}
      value={selected}
      onChange={setSelected}
    />
  );
}

export const Default: Story = {
  render: () => <Controlled />,
};

export const Preselected: Story = {
  render: () => <Controlled initial="mx" />,
};

export const WithLabel: Story = {
  render: () => <Controlled label="Country" />,
};

export const WithHelperText: Story = {
  render: () => <Controlled label="Country" helperText="Uses the platform-native picker." />,
};

export const WithErrorText: Story = {
  render: () => <Controlled label="Country" errorText="Please pick a country." />,
};

export const Disabled: Story = {
  render: () => <Controlled initial="us" disabled label="Country (read-only)" />,
};

export const CustomPlaceholderLabel: Story = {
  render: () => <Controlled label="Country" placeholderLabel="— Pick one —" />,
};

export const BrandTintedFrame: Story = {
  render: () => (
    <Controlled
      label="Brand-tinted frame"
      initial="es"
      selectNativeColors={{
        border: "#7C3AED",
        background: "#F5F3FF",
      }}
    />
  ),
};

export const PillRadius: Story = {
  render: () => <Controlled label="Country" radius="pill" />,
};

export const DarkTheme: Story = {
  render: () => (
    <Theme name="dark">
      <View style={{ backgroundColor: "#0B0B0F", padding: 24, borderRadius: 12 }}>
        <Controlled label="Country" initial="ca" />
      </View>
    </Theme>
  ),
};
