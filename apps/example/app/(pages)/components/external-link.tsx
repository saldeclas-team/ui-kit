import { useState } from "react";
import { Alert as RNAlert, Text, View } from "react-native";
import { ExternalLink, useUIKit } from "ui-kraken";

import { Screen } from "../../../src/screen";
import { Section } from "../../../src/section";

export default function ExternalLinkScreen() {
  const { activeTheme } = useUIKit();
  const isDark = activeTheme === "dark";
  const bodyColor = isDark ? "#F5F5F7" : "#0B0B0F";
  const captionColor = isDark ? "#9CA3AF" : "#6B7280";
  const cardBg = isDark ? "#111827" : "#F9FAFB";

  const [lastTapped, setLastTapped] = useState<string | null>(null);

  return (
    <Screen
      title="ExternalLink"
      subtitle="Tappable link that opens a URL in the platform browser. Router-agnostic. Prefers expo-web-browser (in-app) when installed; falls back to Linking.openURL (system browser) otherwise."
    >
      <Section title="Inline in body copy">
        <View style={{ flex: 1 }}>
          <Text style={{ color: bodyColor, lineHeight: 22 }}>
            For more information, please{" "}
            <ExternalLink url="https://expo.dev/" hideTrailingIcon>
              visit Expo
            </ExternalLink>
            . The link reads as native inline text with an underline affordance.
          </Text>
        </View>
      </Section>

      <Section title="Standalone with icon + trailing arrow">
        <View style={{ flex: 1 }}>
          <ExternalLink
            url="https://reactnative.dev/"
            icon={<Text style={{ fontWeight: "700", color: captionColor }}>i</Text>}
          >
            Visit React Native
          </ExternalLink>
        </View>
      </Section>

      <Section title="With onPress hook (interception)">
        <View style={{ flex: 1, gap: 8 }}>
          <Text style={{ color: captionColor, fontSize: 12 }}>
            The onPress hook runs BEFORE the URL opens. Return `false` to block it.
          </Text>
          <ExternalLink
            url="https://tamagui.dev/"
            onPress={() => {
              setLastTapped("Tamagui");
              RNAlert.alert("Analytics hook", "About to open Tamagui.");
            }}
          >
            Visit Tamagui (with alert first)
          </ExternalLink>
          {lastTapped != null && (
            <Text style={{ color: captionColor, fontSize: 12 }}>Last tapped: {lastTapped}</Text>
          )}
        </View>
      </Section>

      <Section title="Hide trailing icon (inline)">
        <View style={{ flex: 1 }}>
          <Text style={{ color: bodyColor, lineHeight: 22 }}>
            By tapping continue you agree to our{" "}
            <ExternalLink url="https://example.com/terms" hideTrailingIcon>
              Terms of Service
            </ExternalLink>{" "}
            and{" "}
            <ExternalLink url="https://example.com/privacy" hideTrailingIcon>
              Privacy Policy
            </ExternalLink>
            .
          </Text>
        </View>
      </Section>

      <Section title="Per-instance brand palette">
        <View style={{ flex: 1 }}>
          <ExternalLink
            url="https://example.com"
            externalLinkColors={{ label: "#7C3AED", icon: "#7C3AED" }}
          >
            Brand-accent link
          </ExternalLink>
        </View>
      </Section>

      <Section title="Auth-screen card composition">
        <View style={{ padding: 16, borderRadius: 12, backgroundColor: cardBg, gap: 8 }}>
          <Text style={{ color: bodyColor, fontWeight: "600" }}>Create account</Text>
          <Text style={{ color: captionColor, fontSize: 13, lineHeight: 18 }}>
            By continuing, you agree to our{" "}
            <ExternalLink url="https://example.com/terms" hideTrailingIcon>
              Terms
            </ExternalLink>{" "}
            and{" "}
            <ExternalLink url="https://example.com/privacy" hideTrailingIcon>
              Privacy Policy
            </ExternalLink>
            .
          </Text>
        </View>
      </Section>

      <View style={{ height: 40 }} />
    </Screen>
  );
}
