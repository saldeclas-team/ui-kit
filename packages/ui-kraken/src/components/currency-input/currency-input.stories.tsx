import type { Meta, StoryObj } from "@storybook/react-native";
import { useState } from "react";
import { View } from "react-native";
import { Theme } from "tamagui";

import { CurrencyInput } from "./currency-input";

const meta = {
  title: "UI Kit/CurrencyInput",
  component: CurrencyInput,
  args: {
    value: null,
    onChangeValue: () => undefined,
    placeholder: "0",
  },
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof CurrencyInput>;

export { meta as default };

type Story = StoryObj<typeof meta>;

// Stateful wrapper so the Storybook demo actually types + updates.
function ControlledScene({
  initial = null,
  ...args
}: { initial?: number | null } & Parameters<typeof CurrencyInput>[0]) {
  const [value, setValue] = useState<number | null>(initial);
  return <CurrencyInput {...args} value={value} onChangeValue={setValue} />;
}

export const Default: Story = {
  render: (args) => <ControlledScene {...args} />,
};

export const USD: Story = {
  args: { label: "Amount", decimals: 2, locale: "en-US" },
  render: (args) => <ControlledScene {...args} initial={1234.56} />,
};

export const COP: Story = {
  args: { label: "Monto", prefix: "COP $", decimals: 0, locale: "es-CO" },
  render: (args) => <ControlledScene {...args} initial={1234000} />,
};

export const EUR: Story = {
  args: { label: "Importe", prefix: "€", decimals: 2, locale: "es-ES" },
  render: (args) => <ControlledScene {...args} initial={999.99} />,
};

export const WithError: Story = {
  args: { label: "Amount", error: "Enter a positive number" },
  render: (args) => <ControlledScene {...args} initial={0} />,
};

export const Disabled: Story = {
  args: { label: "Locked", disabled: true },
  render: (args) => <ControlledScene {...args} initial={1500} />,
};

export const NoPrefix: Story = {
  args: { label: "Numeric", prefix: "" },
  render: (args) => <ControlledScene {...args} />,
};

export const CustomColors: Story = {
  args: {
    label: "Brand-purple amount",
    prefix: "€",
    currencyInputColors: {
      border: "#7C3AED",
      borderFocused: "#7C3AED",
      background: "#F5F3FF",
      label: "#4C1D95",
      prefix: "#7C3AED",
    },
  },
  render: (args) => <ControlledScene {...args} initial={499} />,
};

export const DarkTheme: Story = {
  args: { label: "Dark", decimals: 2 },
  render: (args) => (
    <Theme name="dark">
      <ControlledScene {...args} initial={1234.56} />
    </Theme>
  ),
};
