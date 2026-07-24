import { View } from "react-native";
import { Button } from "ui-kraken";

import { Screen } from "../../../src/screen";
import { Section } from "../../../src/section";

export default function ButtonScreen() {
  return (
    <Screen
      title="Button"
      subtitle="Primary / Secondary / Outline / Ghost / Destructive. Three sizes. Disabled and loading states. Custom radius. Per-instance color overrides."
    >
      <Section title="Variants">
        <View style={rowStyle}>
          <Button.Primary onPress={() => undefined}>Primary</Button.Primary>
          <Button.Secondary onPress={() => undefined}>Secondary</Button.Secondary>
        </View>
        <View style={rowStyle}>
          <Button.Outline onPress={() => undefined}>Outline</Button.Outline>
          <Button.Ghost onPress={() => undefined}>Ghost</Button.Ghost>
        </View>
        <Button.Destructive onPress={() => undefined}>Destructive</Button.Destructive>
      </Section>

      <Section title="Sizes">
        <Button.Primary size="sm" onPress={() => undefined}>
          Small
        </Button.Primary>
        <Button.Primary size="md" onPress={() => undefined}>
          Medium
        </Button.Primary>
        <Button.Primary size="lg" onPress={() => undefined}>
          Large
        </Button.Primary>
      </Section>

      <Section title="States">
        <View style={rowStyle}>
          <Button.Primary disabled>Disabled</Button.Primary>
          <Button.Primary loading>Loading</Button.Primary>
        </View>
      </Section>

      <Section title="Radius">
        <Button.Primary radius="none">radius=none (square)</Button.Primary>
        <Button.Primary radius="sm">radius=sm</Button.Primary>
        <Button.Primary radius="md">radius=md (default)</Button.Primary>
        <Button.Primary radius="lg">radius=lg</Button.Primary>
        <Button.Primary radius="pill">radius=pill (fully round)</Button.Primary>
        <Button.Primary radius={24}>radius=24 (custom px)</Button.Primary>
      </Section>

      <Section title="Per-instance color overrides">
        <Button.Primary
          buttonColors={{ background: "#FF6B00", label: "#FFFFFF" }}
          onPress={() => undefined}
        >
          Custom brand primary
        </Button.Primary>
        <Button.Outline
          buttonColors={{ border: "#FF6B00", label: "#FF6B00" }}
          onPress={() => undefined}
        >
          Custom brand outline
        </Button.Outline>
        <Button.Ghost buttonColors={{ label: "#DC2626" }} onPress={() => undefined}>
          Danger ghost
        </Button.Ghost>
      </Section>
    </Screen>
  );
}

const rowStyle = { flexDirection: "row" as const, gap: 12, flexWrap: "wrap" as const };
