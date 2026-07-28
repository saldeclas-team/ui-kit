import { Text, View } from "react-native";
import { Card, Spinner, useUIKit } from "ui-kraken";

import { Screen } from "../../../src/screen";
import { Section } from "../../../src/section";

export default function SpinnerScreen() {
  const { activeTheme } = useUIKit();
  const isDark = activeTheme === "dark";
  const bodyColor = isDark ? "#F5F5F7" : "#0B0B0F";
  const captionColor = isDark ? "#9CA3AF" : "#6B7280";

  return (
    <Screen
      title="Spinner"
      subtitle="Themed activity indicator. Wraps RN ActivityIndicator with palette + size presets."
    >
      <Section title="Sizes">
        <View style={{ flexDirection: "row", gap: 24, alignItems: "flex-end" }}>
          <View style={{ alignItems: "center", gap: 8 }}>
            <Spinner testID="sm" size="sm" />
            <Text style={{ color: captionColor, fontSize: 12 }}>sm (20)</Text>
          </View>
          <View style={{ alignItems: "center", gap: 8 }}>
            <Spinner testID="md" size="md" />
            <Text style={{ color: captionColor, fontSize: 12 }}>md (32)</Text>
          </View>
          <View style={{ alignItems: "center", gap: 8 }}>
            <Spinner testID="lg" size="lg" />
            <Text style={{ color: captionColor, fontSize: 12 }}>lg (48)</Text>
          </View>
          <View style={{ alignItems: "center", gap: 8 }}>
            <Spinner testID="raw" size={64} />
            <Text style={{ color: captionColor, fontSize: 12 }}>64px</Text>
          </View>
        </View>
      </Section>

      <Section title="Loading row composition">
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          <Spinner testID="row" size="sm" />
          <Text style={{ color: bodyColor }}>Loading messages…</Text>
        </View>
      </Section>

      <Section title="Inside a Card (loading placeholder)">
        <Card>
          <View style={{ alignItems: "center", gap: 12, paddingVertical: 16 }}>
            <Spinner testID="card-spinner" size="lg" accessibilityLabel="Loading dashboard" />
            <Text style={{ color: captionColor, fontSize: 12 }}>Loading dashboard…</Text>
          </View>
        </Card>
      </Section>

      <Section title="Custom color + static state">
        <View style={{ flexDirection: "row", gap: 24, alignItems: "center" }}>
          <View style={{ alignItems: "center", gap: 8 }}>
            <Spinner
              testID="branded"
              size="md"
              spinnerColors={{ color: isDark ? "#A78BFA" : "#7C3AED" }}
            />
            <Text style={{ color: captionColor, fontSize: 12 }}>Brand tint</Text>
          </View>
          <View style={{ alignItems: "center", gap: 8 }}>
            <Spinner testID="static" size="md" animating={false} />
            <Text style={{ color: captionColor, fontSize: 12 }}>animating=false</Text>
          </View>
        </View>
      </Section>
    </Screen>
  );
}
