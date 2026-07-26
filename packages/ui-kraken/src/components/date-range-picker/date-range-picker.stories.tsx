import type { Meta, StoryObj } from "@storybook/react-native";
import { useState } from "react";
import { View } from "react-native";
import { Theme } from "tamagui";

import { DateRangePicker } from "./date-range-picker";

const meta = {
  title: "UI Kit/DateRangePicker",
  component: DateRangePicker,
  args: { startDate: null, endDate: null, onChange: () => undefined },
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof DateRangePicker>;

export { meta as default };

type Story = StoryObj<typeof meta>;

type ControlledProps = Omit<
  React.ComponentProps<typeof DateRangePicker>,
  "startDate" | "endDate" | "onChange"
> & {
  initialStart?: Date | null;
  initialEnd?: Date | null;
};

function Controlled({ initialStart = null, initialEnd = null, ...props }: ControlledProps) {
  const [start, setStart] = useState<Date | null>(initialStart);
  const [end, setEnd] = useState<Date | null>(initialEnd);
  return (
    <DateRangePicker
      {...props}
      startDate={start}
      endDate={end}
      onChange={(s, e) => {
        setStart(s);
        setEnd(e);
      }}
    />
  );
}

export const Default: Story = {
  render: () => <Controlled label="Vacation" />,
};

export const Horizontal: Story = {
  render: () => (
    <Controlled label="Vacation" orientation="horizontal" locale="en-US" dateStyle="medium" />
  ),
};

export const PreselectedRange: Story = {
  render: () => (
    <Controlled
      label="Contract term"
      initialStart={new Date(2027, 5, 12)}
      initialEnd={new Date(2027, 5, 26)}
      locale="en-US"
      dateStyle="long"
    />
  ),
};

export const DateTimeMode: Story = {
  render: () => (
    <Controlled
      label="Reservation"
      mode="datetime"
      initialStart={new Date(2027, 5, 12, 15, 0)}
      initialEnd={new Date(2027, 5, 14, 11, 0)}
      locale="en-US"
    />
  ),
};

export const CustomLabels: Story = {
  render: () => (
    <Controlled
      label="Hotel stay"
      startLabel="Check-in"
      endLabel="Check-out"
      startPlaceholder="Pick check-in"
      endPlaceholder="Pick check-out"
    />
  ),
};

export const RangeConstraint: Story = {
  render: () => (
    <Controlled
      label="Departure window"
      minimumDate={new Date()}
      maximumDate={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)}
      helperText="Next 90 days"
    />
  ),
};

export const WithHelperText: Story = {
  render: () => <Controlled label="Vacation" helperText="Pick start and end." />,
};

export const WithErrorText: Story = {
  render: () => <Controlled label="Vacation" errorText="Both dates required." />,
};

export const Disabled: Story = {
  render: () => (
    <Controlled
      label="Locked range"
      initialStart={new Date(2020, 0, 1)}
      initialEnd={new Date(2020, 11, 31)}
      disabled
      helperText="Read-only preview"
      locale="en-US"
    />
  ),
};

export const CustomPalette: Story = {
  render: () => (
    <Controlled
      label="Themed range"
      dateRangePickerColors={{
        border: "#7C3AED",
        borderFocused: "#7C3AED",
        text: "#4C1D95",
        chevron: "#7C3AED",
        accent: "#7C3AED",
        separator: "#7C3AED",
      }}
    />
  ),
};

export const DarkTheme: Story = {
  render: () => (
    <Theme name="dark">
      <View style={{ backgroundColor: "#0B0B0F", padding: 24, borderRadius: 12 }}>
        <Controlled label="Vacation" />
      </View>
    </Theme>
  ),
};
