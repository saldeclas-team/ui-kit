import type { Meta, StoryObj } from "@storybook/react-native";
import { useState } from "react";
import { View } from "react-native";
import { Theme } from "tamagui";

import { Select } from "./select";

const meta = {
  title: "UI Kit/Select",
  component: Select,
  args: { options: [], value: null, onChange: () => undefined },
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Select>;

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
  React.ComponentProps<typeof Select<Country>>,
  "value" | "onChange" | "options"
> & {
  initial?: Country | null;
};

function Controlled({ initial = null, ...props }: ControlledProps) {
  const [selected, setSelected] = useState<Country | null>(initial);
  return (
    <Select<Country> {...props} options={[...COUNTRIES]} value={selected} onChange={setSelected} />
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

export const WithPlaceholder: Story = {
  render: () => <Controlled label="Country" placeholder="Pick a country" />,
};

export const WithHelperText: Story = {
  render: () => (
    <Controlled label="Country" helperText="Used for billing address auto-completion." />
  ),
};

export const WithErrorText: Story = {
  render: () => <Controlled label="Country" errorText="Please pick a country." />,
};

export const WithModalTitle: Story = {
  render: () => <Controlled label="Country" modalTitle="Choose your country" />,
};

export const Disabled: Story = {
  render: () => <Controlled initial="us" disabled label="Country (read-only)" />,
};

export const DisabledSubset: Story = {
  render: () => <Controlled label="Country (BR + AR disabled)" disabledOptions={["br", "ar"]} />,
};

export const CustomColors: Story = {
  render: () => (
    <Controlled
      label="Brand-tinted"
      initial="es"
      selectColors={{
        borderFocused: "#7C3AED",
        chevron: "#7C3AED",
        optionSelectedBackground: "#F5F3FF",
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
