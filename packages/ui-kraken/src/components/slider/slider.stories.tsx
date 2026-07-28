import type { Meta, StoryObj } from "@storybook/react-native";
import { useState } from "react";
import { Text as RNText, View } from "react-native";
import { Theme } from "tamagui";

import { Slider } from "./slider";

const meta = {
  title: "UI Kit/Slider",
  component: Slider,
  args: { value: 50, onValueChange: () => undefined },
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, gap: 20 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Slider>;

export { meta as default };

type Story = StoryObj<typeof meta>;

// Each scene is a named PascalCase component so the React Hooks
// linter recognizes `useState` as a component-level hook.

function DefaultScene() {
  const [value, setValue] = useState(50);
  return (
    <View style={{ gap: 8 }}>
      <RNText style={{ fontSize: 14, color: "#374151" }}>value: {value}</RNText>
      <Slider value={value} onValueChange={setValue} />
    </View>
  );
}

function SizesScene() {
  const [sm, setSm] = useState(25);
  const [md, setMd] = useState(50);
  const [lg, setLg] = useState(75);
  return (
    <View style={{ gap: 16 }}>
      <View style={{ gap: 4 }}>
        <RNText style={{ fontSize: 12, color: "#6B7280" }}>sm — {sm}</RNText>
        <Slider size="sm" value={sm} onValueChange={setSm} />
      </View>
      <View style={{ gap: 4 }}>
        <RNText style={{ fontSize: 12, color: "#6B7280" }}>md — {md}</RNText>
        <Slider size="md" value={md} onValueChange={setMd} />
      </View>
      <View style={{ gap: 4 }}>
        <RNText style={{ fontSize: 12, color: "#6B7280" }}>lg — {lg}</RNText>
        <Slider size="lg" value={lg} onValueChange={setLg} />
      </View>
    </View>
  );
}

function SteppedScene() {
  const [rating, setRating] = useState(3);
  return (
    <View style={{ gap: 8 }}>
      <RNText style={{ fontSize: 14, color: "#374151" }}>rating: {rating} of 5</RNText>
      <Slider min={0} max={5} step={1} value={rating} onValueChange={setRating} />
    </View>
  );
}

function ContinuousScene() {
  const [opacity, setOpacity] = useState(0.5);
  return (
    <View style={{ gap: 8 }}>
      <RNText style={{ fontSize: 14, color: "#374151" }}>opacity: {opacity.toFixed(3)}</RNText>
      <Slider min={0} max={1} step={0} value={opacity} onValueChange={setOpacity} />
    </View>
  );
}

function DisabledScene() {
  return (
    <View style={{ gap: 12 }}>
      <Slider value={40} onValueChange={() => undefined} />
      <RNText style={{ fontSize: 12, color: "#6B7280" }}>disabled below:</RNText>
      <Slider value={40} onValueChange={() => undefined} disabled />
    </View>
  );
}

function CustomColorsScene() {
  const [value, setValue] = useState(60);
  return (
    <Slider
      value={value}
      onValueChange={setValue}
      sliderColors={{ track: "#FFF7ED", fill: "#F97316", thumb: "#7C2D12" }}
    />
  );
}

function DarkThemeScene() {
  const [value, setValue] = useState(30);
  return (
    <Theme name="dark">
      <View style={{ backgroundColor: "#0B0B0F", padding: 16, gap: 8 }}>
        <RNText style={{ color: "#D1D5DB" }}>value: {value}</RNText>
        <Slider value={value} onValueChange={setValue} />
      </View>
    </Theme>
  );
}

export const Default: Story = { render: () => <DefaultScene /> };
export const Sizes: Story = { render: () => <SizesScene /> };
export const Stepped: Story = { render: () => <SteppedScene /> };
export const Continuous: Story = { render: () => <ContinuousScene /> };
export const Disabled: Story = { render: () => <DisabledScene /> };
export const CustomColors: Story = { render: () => <CustomColorsScene /> };
export const DarkTheme: Story = { render: () => <DarkThemeScene /> };
