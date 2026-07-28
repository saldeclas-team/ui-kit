import { Text, View } from "react-native";
import { Divider, useUIKit } from "ui-kraken";

import { Screen } from "../../../src/screen";
import { Section } from "../../../src/section";

export default function DividerScreen() {
  const { activeTheme } = useUIKit();
  const isDark = activeTheme === "dark";
  const bodyColor = isDark ? "#F5F5F7" : "#0B0B0F";
  const rowBg = isDark ? "#111827" : "#F3F4F6";

  return (
    <Screen
      title="Divider"
      subtitle="Thin line for visual separation. Horizontal by default; vertical variant for inline separators."
    >
      <Section title="Horizontal default">
        <View style={{ gap: 12 }}>
          <Text style={{ color: bodyColor }}>Row above the divider</Text>
          <Divider testID="horizontal" />
          <Text style={{ color: bodyColor }}>Row below the divider</Text>
        </View>
      </Section>

      <Section title="Vertical inline">
        <View
          style={{
            flexDirection: "row",
            gap: 12,
            alignItems: "center",
            height: 24,
          }}
        >
          <Text style={{ color: bodyColor }}>Left</Text>
          <Divider testID="vertical-1" orientation="vertical" />
          <Text style={{ color: bodyColor }}>Middle</Text>
          <Divider testID="vertical-2" orientation="vertical" />
          <Text style={{ color: bodyColor }}>Right</Text>
        </View>
      </Section>

      <Section title="Inset — iOS grouped-list look">
        <View style={{ backgroundColor: rowBg, padding: 12, borderRadius: 8, gap: 8 }}>
          <Text style={{ color: bodyColor }}>Settings row 1</Text>
          <Divider testID="inset-1" inset={16} />
          <Text style={{ color: bodyColor }}>Settings row 2</Text>
          <Divider testID="inset-2" inset={16} />
          <Text style={{ color: bodyColor }}>Settings row 3</Text>
        </View>
      </Section>

      <Section title="Thick — section separator">
        <View style={{ gap: 12 }}>
          <Text style={{ color: bodyColor }}>Section A</Text>
          <Divider testID="thick" thickness={4} />
          <Text style={{ color: bodyColor }}>Section B</Text>
        </View>
      </Section>

      <Section title="Custom color">
        <View style={{ gap: 12 }}>
          <Text style={{ color: bodyColor }}>Brand-tinted divider</Text>
          <Divider testID="branded" dividerColors={{ line: "#7C3AED" }} thickness={2} />
          <Text style={{ color: bodyColor }}>Below</Text>
        </View>
      </Section>
    </Screen>
  );
}
