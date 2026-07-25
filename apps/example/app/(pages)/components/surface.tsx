import { Text, View } from "react-native";
import { Surface, useUIKit } from "ui-kraken";

import { Screen } from "../../../src/screen";
import { Section } from "../../../src/section";

export default function SurfaceScreen() {
  const { activeTheme } = useUIKit();
  const isDark = activeTheme === "dark";
  const bodyColor = isDark ? "#F5F5F7" : "#0B0B0F";
  const captionColor = isDark ? "#9CA3AF" : "#6B7280";

  return (
    <Screen
      title="Surface"
      subtitle="Theme-bound background container with 4 elevation levels. Extends YStack — every Tamagui prop flows through."
    >
      <Section title="All levels">
        <View style={{ gap: 12 }}>
          <Surface level="base" padding={16} borderRadius={8} testID="base">
            <Text style={{ color: bodyColor, fontWeight: "600" }}>level=&quot;base&quot;</Text>
            <Text style={{ color: captionColor, fontSize: 12 }}>Standard app background</Text>
          </Surface>
          <Surface level="raised" padding={16} borderRadius={8} testID="raised">
            <Text style={{ color: bodyColor, fontWeight: "600" }}>level=&quot;raised&quot;</Text>
            <Text style={{ color: captionColor, fontSize: 12 }}>
              Cards, list items on top of the base surface
            </Text>
          </Surface>
          <Surface level="overlay" padding={16} borderRadius={8} testID="overlay">
            <Text style={{ color: bodyColor, fontWeight: "600" }}>level=&quot;overlay&quot;</Text>
            <Text style={{ color: captionColor, fontSize: 12 }}>Modals, sheets, dropdowns</Text>
          </Surface>
          <Surface level="sunken" padding={16} borderRadius={8} testID="sunken">
            <Text style={{ color: bodyColor, fontWeight: "600" }}>level=&quot;sunken&quot;</Text>
            <Text style={{ color: captionColor, fontSize: 12 }}>
              Form sections, inset panels, muted regions
            </Text>
          </Surface>
        </View>
      </Section>

      <Section title="Card composition">
        <Surface level="raised" padding={20} borderRadius={12} gap={8} testID="card">
          <Text style={{ color: bodyColor, fontSize: 18, fontWeight: "700" }}>Weekly summary</Text>
          <Text style={{ color: captionColor, fontSize: 14 }}>
            Your activity in the past 7 days.
          </Text>
        </Surface>
      </Section>

      <Section title="Nested surfaces (raised → sunken)">
        <Surface level="raised" padding={16} borderRadius={12} gap={12} testID="nested-outer">
          <Text style={{ color: bodyColor, fontWeight: "600" }}>Trip details</Text>
          <Surface level="sunken" padding={12} borderRadius={8} testID="nested-inner">
            <Text style={{ color: captionColor, fontSize: 12 }}>Distance · Duration · Cost</Text>
          </Surface>
        </Surface>
      </Section>

      <Section title="Per-instance color override">
        <Surface
          level="raised"
          padding={16}
          borderRadius={12}
          surfaceColors={{ raised: "#FFF7ED" }}
          testID="brand"
        >
          <Text style={{ color: "#3B0A00", fontWeight: "600" }}>Brand-tinted raised</Text>
          <Text style={{ color: "#78350F", fontSize: 12 }}>
            Override via the surfaceColors prop without touching the provider.
          </Text>
        </Surface>
      </Section>
    </Screen>
  );
}
