import { Text, View } from "react-native";
import { Button, Card, useUIKit } from "ui-kraken";

import { Screen } from "../../../src/screen";
import { Section } from "../../../src/section";

export default function CardScreen() {
  const { activeTheme } = useUIKit();
  const isDark = activeTheme === "dark";
  const titleColor = isDark ? "#F5F5F7" : "#0B0B0F";
  const bodyColor = isDark ? "#D1D5DB" : "#374151";
  const captionColor = isDark ? "#9CA3AF" : "#6B7280";

  return (
    <Screen
      title="Card"
      subtitle="Rounded, padded, semantically-elevated container. Sits on top of Surface — Surface owns the color, Card adds layout + compound slots."
    >
      <Section title="Simple card (no slots)">
        <Card testID="simple">
          <Text style={{ color: titleColor, fontSize: 16, fontWeight: "600" }}>Notification</Text>
          <Text style={{ color: bodyColor }}>You have 3 unread messages.</Text>
        </Card>
      </Section>

      <Section title="Compound (Header + Body + Footer)">
        <Card testID="compound">
          <Card.Header>
            <Text style={{ color: titleColor, fontSize: 16, fontWeight: "600" }}>Publish post</Text>
            <Text style={{ color: captionColor, fontSize: 12 }}>Draft</Text>
          </Card.Header>
          <Card.Body>
            <Text style={{ color: bodyColor }}>
              Your post will be visible to your followers as soon as you publish.
            </Text>
          </Card.Body>
          <Card.Footer>
            <Button tone="ghost">Cancel</Button>
            <Button>Publish</Button>
          </Card.Footer>
        </Card>
      </Section>

      <Section title="Level showcase">
        <View style={{ gap: 12 }}>
          <Card level="base" testID="lvl-base">
            <Text style={{ color: titleColor, fontWeight: "600" }}>level=&quot;base&quot;</Text>
            <Text style={{ color: captionColor, fontSize: 12 }}>
              Flat card — reads flush with the screen background.
            </Text>
          </Card>
          <Card level="raised" testID="lvl-raised">
            <Text style={{ color: titleColor, fontWeight: "600" }}>
              level=&quot;raised&quot; (default)
            </Text>
            <Text style={{ color: captionColor, fontSize: 12 }}>
              The card-like affordance. Slightly elevated background.
            </Text>
          </Card>
          <Card level="overlay" testID="lvl-overlay">
            <Text style={{ color: titleColor, fontWeight: "600" }}>level=&quot;overlay&quot;</Text>
            <Text style={{ color: captionColor, fontSize: 12 }}>For cards on top of a modal.</Text>
          </Card>
          <Card level="sunken" testID="lvl-sunken">
            <Text style={{ color: titleColor, fontWeight: "600" }}>level=&quot;sunken&quot;</Text>
            <Text style={{ color: captionColor, fontSize: 12 }}>Inset section, form group.</Text>
          </Card>
        </View>
      </Section>

      <Section title="Card grid — flex: 1">
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Card testID="grid-a" flex={1}>
            <Text style={{ color: titleColor, fontWeight: "600" }}>Left</Text>
            <Text style={{ color: bodyColor, fontSize: 12 }}>flex: 1</Text>
          </Card>
          <Card testID="grid-b" flex={1}>
            <Text style={{ color: titleColor, fontWeight: "600" }}>Right</Text>
            <Text style={{ color: bodyColor, fontSize: 12 }}>flex: 1</Text>
          </Card>
        </View>
      </Section>

      <Section title="Per-instance surfaceColors override">
        <Card
          testID="themed"
          surfaceColors={{ raised: isDark ? "#3B0A00" : "#FFF7ED" }}
          padding={20}
        >
          <Text style={{ color: isDark ? "#FDBA74" : "#7C2D12", fontWeight: "600" }}>
            Brand-tinted card
          </Text>
          <Text style={{ color: isDark ? "#FED7AA" : "#9A3412", fontSize: 12 }}>
            surfaceColors=&#123;&#123; raised: &quot;#FFF7ED&quot; &#125;&#125;
          </Text>
        </Card>
      </Section>
    </Screen>
  );
}
