import { Text, View } from "react-native";
import { Avatar, Card, useUIKit } from "ui-kraken";

import { Screen } from "../../../src/screen";
import { Section } from "../../../src/section";

const MOCK_SOURCE = { uri: "https://i.pravatar.cc/150?img=13" };
const BAD_SOURCE = { uri: "https://this-url-does-not-exist.example/x.jpg" };

export default function AvatarScreen() {
  const { activeTheme } = useUIKit();
  const isDark = activeTheme === "dark";
  const bodyColor = isDark ? "#F5F5F7" : "#0B0B0F";
  const captionColor = isDark ? "#9CA3AF" : "#6B7280";

  return (
    <Screen
      title="Avatar"
      subtitle="Image + initials fallback. Two rendering modes coexist; onError swaps to initials automatically."
    >
      <Section title="Sizes">
        <View style={{ flexDirection: "row", gap: 16, alignItems: "flex-end" }}>
          <View style={{ alignItems: "center", gap: 6 }}>
            <Avatar testID="sm" name="AN" size="sm" />
            <Text style={{ color: captionColor, fontSize: 12 }}>sm (24)</Text>
          </View>
          <View style={{ alignItems: "center", gap: 6 }}>
            <Avatar testID="md" name="AN" size="md" />
            <Text style={{ color: captionColor, fontSize: 12 }}>md (40)</Text>
          </View>
          <View style={{ alignItems: "center", gap: 6 }}>
            <Avatar testID="lg" name="AN" size="lg" />
            <Text style={{ color: captionColor, fontSize: 12 }}>lg (56)</Text>
          </View>
          <View style={{ alignItems: "center", gap: 6 }}>
            <Avatar testID="xl" name="AN" size="xl" />
            <Text style={{ color: captionColor, fontSize: 12 }}>xl (80)</Text>
          </View>
        </View>
      </Section>

      <Section title="Shapes">
        <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
          <View style={{ alignItems: "center", gap: 6 }}>
            <Avatar testID="circle" name="AN" size="lg" shape="circle" />
            <Text style={{ color: captionColor, fontSize: 12 }}>circle</Text>
          </View>
          <View style={{ alignItems: "center", gap: 6 }}>
            <Avatar testID="rounded" name="AN" size="lg" shape="rounded" />
            <Text style={{ color: captionColor, fontSize: 12 }}>rounded</Text>
          </View>
          <View style={{ alignItems: "center", gap: 6 }}>
            <Avatar testID="square" name="AN" size="lg" shape="square" />
            <Text style={{ color: captionColor, fontSize: 12 }}>square</Text>
          </View>
        </View>
      </Section>

      <Section title="Image vs initials">
        <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
          <View style={{ alignItems: "center", gap: 6 }}>
            <Avatar testID="image" source={MOCK_SOURCE} name="Alexis Noriega" size="lg" />
            <Text style={{ color: captionColor, fontSize: 12 }}>real image</Text>
          </View>
          <View style={{ alignItems: "center", gap: 6 }}>
            <Avatar testID="initials-only" name="Alexis Noriega" size="lg" />
            <Text style={{ color: captionColor, fontSize: 12 }}>initials</Text>
          </View>
          <View style={{ alignItems: "center", gap: 6 }}>
            <Avatar testID="fallback" source={BAD_SOURCE} name="Alexis Noriega" size="lg" />
            <Text style={{ color: captionColor, fontSize: 12 }}>bad URL → initials</Text>
          </View>
        </View>
      </Section>

      <Section title="Explicit initials">
        <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
          <Avatar testID="qmark" initials="?" size="lg" />
          <Avatar testID="emoji" initials="🙂" size="lg" />
        </View>
      </Section>

      <Section title="Custom colors + inside Card composition">
        <Card>
          <Card.Body>
            <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
              <Avatar
                testID="brand"
                name="Alexis Noriega"
                avatarColors={{
                  background: isDark ? "#4C1D95" : "#7C3AED",
                  text: isDark ? "#F5F3FF" : "#FFFFFF",
                }}
              />
              <View style={{ gap: 2 }}>
                <Text style={{ color: bodyColor, fontWeight: "600" }}>Alexis Noriega</Text>
                <Text style={{ color: captionColor, fontSize: 12 }}>alexis@duna.app</Text>
              </View>
            </View>
          </Card.Body>
        </Card>
      </Section>
    </Screen>
  );
}
