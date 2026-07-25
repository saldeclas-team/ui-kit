import { Text, View } from "react-native";
import { Skeleton, useUIKit } from "ui-kraken";

import { Screen } from "../../../src/screen";
import { Section } from "../../../src/section";

const RADIUS_SCALE = ["none", "sm", "md", "lg", "pill"] as const;

export default function SkeletonScreen() {
  const { activeTheme } = useUIKit();
  const isDark = activeTheme === "dark";
  const bodyColor = isDark ? "#F5F5F7" : "#0B0B0F";
  const captionColor = isDark ? "#9CA3AF" : "#6B7280";
  const cardBg = isDark ? "#111827" : "#F9FAFB";

  return (
    <Screen
      title="Skeleton"
      subtitle="Animated placeholder for loading states. Compose the shape of the content that will replace it — rectangles for text, pills for avatars, big rectangles for images."
    >
      <Section title="Basic rectangle">
        <Skeleton style={{ width: 240, height: 16 }} />
      </Section>

      <Section title="Radius scale">
        <View style={{ gap: 10 }}>
          {RADIUS_SCALE.map((radius) => (
            <View key={radius} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Text style={{ color: captionColor, fontSize: 12, width: 44 }}>{radius}</Text>
              <Skeleton radius={radius} style={{ width: 160, height: 24 }} />
            </View>
          ))}
        </View>
      </Section>

      <Section title="Avatar (circle)">
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Skeleton radius="pill" style={{ width: 48, height: 48 }} />
          <View style={{ gap: 6, flex: 1 }}>
            <Skeleton style={{ width: 140, height: 14 }} />
            <Skeleton style={{ width: 90, height: 12 }} />
          </View>
        </View>
      </Section>

      <Section title="Card composition (feed placeholder)">
        <View style={{ padding: 16, borderRadius: 12, backgroundColor: cardBg, gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Skeleton radius="pill" style={{ width: 48, height: 48 }} />
            <View style={{ gap: 6, flex: 1 }}>
              <Skeleton style={{ width: 140, height: 14 }} />
              <Skeleton style={{ width: 90, height: 12 }} />
            </View>
          </View>
          <Skeleton radius="lg" style={{ width: "100%", height: 160 }} />
          <View style={{ gap: 6 }}>
            <Skeleton style={{ width: "100%", height: 12 }} />
            <Skeleton style={{ width: "80%", height: 12 }} />
          </View>
        </View>
      </Section>

      <Section title="Pulse vs static">
        <View style={{ gap: 8 }}>
          <Text style={{ color: captionColor, fontSize: 12 }}>
            variant=&quot;static&quot; skips the animation — pair with AccessibilityInfo when the
            user has reduced motion enabled.
          </Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={{ color: bodyColor, fontSize: 12 }}>pulse (default)</Text>
              <Skeleton style={{ width: "100%", height: 20 }} />
            </View>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={{ color: bodyColor, fontSize: 12 }}>static</Text>
              <Skeleton variant="static" style={{ width: "100%", height: 20 }} />
            </View>
          </View>
        </View>
      </Section>

      <Section title="Per-instance colors (brand-tinted)">
        <Skeleton
          style={{ width: 240, height: 16 }}
          skeletonColors={{ base: "#DBEAFE", highlight: "#EFF6FF" }}
        />
      </Section>
    </Screen>
  );
}
