import { Text, View } from "react-native";
import { Avatar, Badge, Card, useUIKit } from "ui-kraken";

import { Screen } from "../../../src/screen";
import { Section } from "../../../src/section";

export default function BadgeScreen() {
  const { activeTheme } = useUIKit();
  const isDark = activeTheme === "dark";
  const bodyColor = isDark ? "#F5F5F7" : "#0B0B0F";
  const captionColor = isDark ? "#9CA3AF" : "#6B7280";

  return (
    <Screen
      title="Badge"
      subtitle="Compact pill for notification counts, status labels, and inline indicators."
    >
      <Section title="Tones">
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <Badge>Neutral</Badge>
            <Badge.Primary>Primary</Badge.Primary>
            <Badge.Success>Success</Badge.Success>
            <Badge.Warning>Warning</Badge.Warning>
            <Badge.Danger>Danger</Badge.Danger>
          </View>
          <Text style={{ color: captionColor, fontSize: 12 }}>All 5 tones, md size</Text>
        </View>
      </Section>

      <Section title="Sizes">
        <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <Badge size="sm">sm</Badge>
            <Badge size="md">md</Badge>
          </View>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <Badge.Danger size="sm" count={5} />
            <Badge.Danger size="md" count={5} />
          </View>
        </View>
      </Section>

      <Section title="Count formatting">
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <Badge.Primary count={0} />
          <Badge.Primary count={5} />
          <Badge.Primary count={42} />
          <Badge.Danger count={120} />
          <Badge.Danger count={12} maxCount={9} />
        </View>
        <Text style={{ color: captionColor, fontSize: 12, marginTop: 4 }}>
          0 renders (no auto-hide) · 120 → &ldquo;99+&rdquo; · maxCount=9 → &ldquo;9+&rdquo;
        </Text>
      </Section>

      <Section title="Dot indicator (with Avatar composition)">
        <View style={{ flexDirection: "row", gap: 24, alignItems: "center" }}>
          <View>
            <Avatar name="Alexis Noriega" size="lg" />
            <View style={{ position: "absolute", bottom: 0, right: 0 }}>
              <Badge dot tone="success" />
            </View>
          </View>
          <View>
            <Avatar name="Marta Reyes" size="lg" />
            <View style={{ position: "absolute", bottom: 0, right: 0 }}>
              <Badge dot tone="danger" />
            </View>
          </View>
          <View>
            <Avatar name="Rafael Gomez" size="lg" />
            <View style={{ position: "absolute", bottom: 0, right: 0 }}>
              <Badge dot tone="warning" />
            </View>
          </View>
        </View>
      </Section>

      <Section title="Inline in a Card (settings row)">
        <Card>
          <Card.Body>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ color: bodyColor, fontWeight: "500" }}>Notifications</Text>
              <Badge.Danger count={12} />
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ color: bodyColor, fontWeight: "500" }}>Subscription</Text>
              <Badge.Success>Active</Badge.Success>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ color: bodyColor, fontWeight: "500" }}>New feature</Text>
              <Badge.Warning>Beta</Badge.Warning>
            </View>
          </Card.Body>
        </Card>
      </Section>
    </Screen>
  );
}
