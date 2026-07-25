import type { Meta, StoryObj } from "@storybook/react-native";
import { Text as RNText, View } from "react-native";
import { Theme } from "tamagui";

import { SocialButton } from "./social-button";

const meta = {
  title: "UI Kit/SocialButton",
  component: SocialButton,
  args: { provider: "google", label: "Continue with Google" },
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, gap: 12 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof SocialButton>;

export { meta as default };

type Story = StoryObj<typeof meta>;

function Glyph({ children }: { children: string }) {
  return <RNText style={{ fontWeight: "700" }}>{children}</RNText>;
}

export const Google: Story = {
  render: (args) => (
    <SocialButton.Google label={args.label} icon={<Glyph>G</Glyph>} onPress={() => undefined} />
  ),
};

export const Apple: Story = {
  render: () => (
    <SocialButton.Apple
      label="Sign in with Apple"
      icon={<Glyph>A</Glyph>}
      onPress={() => undefined}
    />
  ),
};

export const Facebook: Story = {
  render: () => (
    <SocialButton.Facebook
      label="Continue with Facebook"
      icon={<Glyph>f</Glyph>}
      onPress={() => undefined}
    />
  ),
};

export const Github: Story = {
  render: () => (
    <SocialButton.Github
      label="Sign in with GitHub"
      icon={<Glyph>⏻</Glyph>}
      onPress={() => undefined}
    />
  ),
};

export const Microsoft: Story = {
  render: () => (
    <SocialButton.Microsoft
      label="Continue with Microsoft"
      icon={<Glyph>▦</Glyph>}
      onPress={() => undefined}
    />
  ),
};

export const Generic: Story = {
  render: () => (
    <SocialButton.Generic
      label="Continue with SSO"
      icon={<Glyph>◇</Glyph>}
      onPress={() => undefined}
    />
  ),
};

export const Loading: Story = {
  render: () => (
    <SocialButton.Google
      label="Continue with Google"
      icon={<Glyph>G</Glyph>}
      loading
      onPress={() => undefined}
    />
  ),
};

export const DisabledStack: Story = {
  render: () => (
    <View style={{ gap: 8 }}>
      <SocialButton.Google
        label="Continue with Google"
        icon={<Glyph>G</Glyph>}
        disabled
        onPress={() => undefined}
      />
      <SocialButton.Apple
        label="Sign in with Apple"
        icon={<Glyph>A</Glyph>}
        disabled
        onPress={() => undefined}
      />
    </View>
  ),
};

export const SizeScale: Story = {
  render: () => (
    <View style={{ gap: 8 }}>
      <SocialButton.Google
        size="sm"
        label="Continue with Google (sm)"
        icon={<Glyph>G</Glyph>}
        onPress={() => undefined}
      />
      <SocialButton.Google
        size="md"
        label="Continue with Google (md)"
        icon={<Glyph>G</Glyph>}
        onPress={() => undefined}
      />
      <SocialButton.Google
        size="lg"
        label="Continue with Google (lg)"
        icon={<Glyph>G</Glyph>}
        onPress={() => undefined}
      />
    </View>
  ),
};

export const CustomColors: Story = {
  render: () => (
    <SocialButton.Generic
      label="Continue with X"
      icon={<Glyph>◇</Glyph>}
      socialButtonColors={{
        background: "#4C1D95",
        label: "#F5F3FF",
        border: "#4C1D95",
      }}
      onPress={() => undefined}
    />
  ),
};

export const DarkTheme: Story = {
  render: () => (
    <Theme name="dark">
      <View style={{ backgroundColor: "#0B0B0F", padding: 24, gap: 8, borderRadius: 12 }}>
        <SocialButton.Google
          label="Continue with Google"
          icon={<Glyph>G</Glyph>}
          onPress={() => undefined}
        />
        <SocialButton.Apple
          label="Sign in with Apple"
          icon={<Glyph>A</Glyph>}
          onPress={() => undefined}
        />
        <SocialButton.Github
          label="Sign in with GitHub"
          icon={<Glyph>⏻</Glyph>}
          onPress={() => undefined}
        />
      </View>
    </Theme>
  ),
};
