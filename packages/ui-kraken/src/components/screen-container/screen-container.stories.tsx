import type { Meta, StoryObj } from "@storybook/react-native";
import { Text as RNText, View } from "react-native";
import { Theme } from "tamagui";

import { ScreenContainer } from "./screen-container";

const meta = {
  title: "UI Kit/ScreenContainer",
  component: ScreenContainer,
  args: { children: null },
} satisfies Meta<typeof ScreenContainer>;

export { meta as default };

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ScreenContainer>
      <View style={{ padding: 24 }}>
        <RNText style={{ fontSize: 20, fontWeight: "600" }}>Default</RNText>
        <RNText>Safe-area insets applied on all four edges.</RNText>
      </View>
    </ScreenContainer>
  ),
};

export const NoBottomInset: Story = {
  render: () => (
    <ScreenContainer edges={["top", "left", "right"]}>
      <View style={{ padding: 24, flex: 1 }}>
        <RNText style={{ fontSize: 20, fontWeight: "600" }}>Bottom inset opted out</RNText>
        <RNText>Layouts with a tab bar want the tab bar to own the bottom inset.</RNText>
      </View>
    </ScreenContainer>
  ),
};

export const WithKeyboardAvoiding: Story = {
  render: () => (
    <ScreenContainer keyboardBehavior="padding">
      <View style={{ padding: 24, flex: 1 }}>
        <RNText style={{ fontSize: 20, fontWeight: "600" }}>Keyboard-avoiding form</RNText>
        <RNText>keyboardBehavior='padding' wraps in a KeyboardAvoidingView.</RNText>
      </View>
    </ScreenContainer>
  ),
};

export const ThemedBackground: Story = {
  render: () => (
    <ScreenContainer screenContainerColors={{ background: "#F5F3FF" }}>
      <View style={{ padding: 24 }}>
        <RNText style={{ color: "#4C1D95", fontSize: 20, fontWeight: "600" }}>Themed</RNText>
        <RNText style={{ color: "#4C1D95" }}>Custom background from screenContainerColors.</RNText>
      </View>
    </ScreenContainer>
  ),
};

export const DarkTheme: Story = {
  render: () => (
    <Theme name="dark">
      <ScreenContainer>
        <View style={{ padding: 24 }}>
          <RNText style={{ color: "#F9FAFB", fontSize: 20, fontWeight: "600" }}>Dark theme</RNText>
          <RNText style={{ color: "#F9FAFB" }}>
            Background flips automatically via activeTheme. Status bar auto-flips to light-content.
          </RNText>
        </View>
      </ScreenContainer>
    </Theme>
  ),
};
