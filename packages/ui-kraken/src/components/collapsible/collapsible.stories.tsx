import type { Meta, StoryObj } from "@storybook/react-native";
import { useState } from "react";
import { Text, View } from "react-native";
import { Theme } from "tamagui";

import { Collapsible } from "./collapsible";

const meta = {
  title: "UI Kit/Collapsible",
  component: Collapsible,
  args: {
    title: "Advanced options",
    expanded: false,
    onExpandedChange: () => undefined,
  },
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Collapsible>;

export { meta as default };

type Story = StoryObj<typeof meta>;

function Body() {
  return (
    <View style={{ gap: 6 }}>
      <Text>Body content — any ReactNode goes here.</Text>
      <Text>Multiple children stack naturally.</Text>
    </View>
  );
}

function ControlledCollapsible({
  initial = false,
  ...props
}: Omit<React.ComponentProps<typeof Collapsible>, "expanded" | "onExpandedChange"> & {
  initial?: boolean;
}) {
  const [open, setOpen] = useState(initial);
  return (
    <Collapsible {...props} expanded={open} onExpandedChange={setOpen}>
      <Body />
    </Collapsible>
  );
}

export const Collapsed: Story = {
  render: () => <ControlledCollapsible title="Advanced options" />,
};

export const Expanded: Story = {
  render: () => <ControlledCollapsible title="Advanced options" initial={true} />,
};

export const WithIcon: Story = {
  render: () => (
    <ControlledCollapsible
      title="Notifications"
      icon={<Text style={{ fontWeight: "700" }}>◉</Text>}
    />
  ),
};

function CustomChevronDemo() {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible
      title="Details"
      expanded={open}
      onExpandedChange={setOpen}
      chevron={<Text style={{ fontWeight: "700" }}>{open ? "−" : "+"}</Text>}
    >
      <Body />
    </Collapsible>
  );
}

export const CustomChevron: Story = {
  render: () => <CustomChevronDemo />,
};

export const AnimationNone: Story = {
  render: () => <ControlledCollapsible title="Instant toggle" animation="none" />,
};

export const Disabled: Story = {
  render: () => <ControlledCollapsible title="Locked section" disabled />,
};

function AccordionStackDemo() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const items = ["General", "Notifications", "Privacy", "Advanced"];
  return (
    <View style={{ gap: 8 }}>
      {items.map((label, idx) => (
        <Collapsible
          key={label}
          title={label}
          expanded={openIndex === idx}
          onExpandedChange={(next) => setOpenIndex(next ? idx : null)}
        >
          <Body />
        </Collapsible>
      ))}
    </View>
  );
}

export const AccordionStack: Story = {
  render: () => <AccordionStackDemo />,
};

export const CustomColors: Story = {
  render: () => (
    <ControlledCollapsible
      title="Brand-accent section"
      initial={true}
      collapsibleColors={{
        headerBackground: "#F5F3FF",
        title: "#4C1D95",
        chevron: "#7C3AED",
        border: "#DDD6FE",
      }}
    />
  ),
};

export const DarkTheme: Story = {
  render: () => (
    <Theme name="dark">
      <View style={{ backgroundColor: "#0B0B0F", padding: 24, borderRadius: 12 }}>
        <ControlledCollapsible
          title="Dark mode section"
          initial={true}
          icon={<Text style={{ fontWeight: "700" }}>◉</Text>}
        />
      </View>
    </Theme>
  ),
};
