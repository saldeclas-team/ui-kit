import type { Meta, StoryObj } from "@storybook/react-native";
import { useState } from "react";
import { View } from "react-native";
import { Theme } from "tamagui";

import { DatePicker } from "./date-picker";

const meta = {
  title: "UI Kit/DatePicker",
  component: DatePicker,
  args: { value: null, onChange: () => undefined },
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof DatePicker>;

export { meta as default };

type Story = StoryObj<typeof meta>;

type ControlledProps = Omit<React.ComponentProps<typeof DatePicker>, "value" | "onChange"> & {
  initial?: Date | null;
};

function Controlled({ initial = null, ...props }: ControlledProps) {
  const [value, setValue] = useState<Date | null>(initial);
  return <DatePicker {...props} value={value} onChange={setValue} />;
}

export const Default: Story = {
  render: () => <Controlled label="Date of birth" />,
};

export const PreselectedValue: Story = {
  render: () => <Controlled label="Date of birth" initial={new Date(1990, 5, 12)} locale="en-US" />,
};

export const TimeMode: Story = {
  render: () => (
    <Controlled label="Meeting time" mode="time" initial={new Date(2027, 0, 1, 14, 30)} />
  ),
};

export const DateTimeMode: Story = {
  render: () => (
    <Controlled
      label="Reservation"
      mode="datetime"
      initial={new Date(2027, 5, 12, 19, 0)}
      locale="en-US"
    />
  ),
};

export const CustomFormat: Story = {
  render: () => (
    <Controlled
      label="Custom formatter"
      initial={new Date(2027, 5, 12)}
      formatValue={(d) => `Fixed: ${d.toISOString().slice(0, 10)}`}
    />
  ),
};

export const WithHelperText: Story = {
  render: () => <Controlled label="Date of birth" helperText="Used only for age verification." />,
};

export const WithErrorText: Story = {
  render: () => <Controlled label="Date of birth" errorText="Required to continue." />,
};

export const MinMaxConstraints: Story = {
  render: () => (
    <Controlled
      label="Departure"
      minimumDate={new Date()}
      maximumDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
      helperText="Next 30 days"
    />
  ),
};

export const Disabled: Story = {
  render: () => (
    <Controlled
      label="Enrollment closed"
      initial={new Date(2020, 0, 1)}
      disabled
      helperText="Read-only preview"
      locale="en-US"
    />
  ),
};

export const CustomPalette: Story = {
  render: () => (
    <Controlled
      label="Themed date"
      datePickerColors={{
        border: "#7C3AED",
        borderFocused: "#7C3AED",
        text: "#4C1D95",
        chevron: "#7C3AED",
        accent: "#7C3AED",
      }}
    />
  ),
};

export const DarkTheme: Story = {
  render: () => (
    <Theme name="dark">
      <View style={{ backgroundColor: "#0B0B0F", padding: 24, borderRadius: 12 }}>
        <Controlled label="Date of birth" />
      </View>
    </Theme>
  ),
};
