import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { ProgressBar, useUIKit } from "ui-kraken";

import { Screen } from "../../../src/screen";
import { Section } from "../../../src/section";

export default function ProgressBarScreen() {
  const { activeTheme } = useUIKit();
  const isDark = activeTheme === "dark";
  const bodyColor = isDark ? "#F5F5F7" : "#0B0B0F";
  const captionColor = isDark ? "#9CA3AF" : "#6B7280";
  const btnBg = isDark ? "#1F2937" : "#F3F4F6";

  const [interactive, setInteractive] = useState(30);
  const clamp = (n: number) => Math.max(0, Math.min(100, n));

  return (
    <Screen
      title="ProgressBar"
      subtitle="Determinate progress indicator. Complements Spinner (indeterminate) for known-progress cases."
    >
      <Section title="Sizes (all at 50%)">
        <View style={{ gap: 12 }}>
          <View style={{ gap: 4 }}>
            <ProgressBar testID="sm" value={50} size="sm" />
            <Text style={{ color: captionColor, fontSize: 12 }}>sm (track 4)</Text>
          </View>
          <View style={{ gap: 4 }}>
            <ProgressBar testID="md" value={50} size="md" />
            <Text style={{ color: captionColor, fontSize: 12 }}>md (track 8, default)</Text>
          </View>
          <View style={{ gap: 4 }}>
            <ProgressBar testID="lg" value={50} size="lg" />
            <Text style={{ color: captionColor, fontSize: 12 }}>lg (track 12)</Text>
          </View>
        </View>
      </Section>

      <Section title="Interactive — bump ±10">
        <View style={{ gap: 12 }}>
          <ProgressBar testID="interactive" value={interactive} showValueLabel size="lg" />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable
              testID="btn-minus"
              onPress={() => setInteractive((v) => clamp(v - 10))}
              style={{
                backgroundColor: btnBg,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: bodyColor, fontWeight: "600" }}>−10</Text>
            </Pressable>
            <Pressable
              testID="btn-plus"
              onPress={() => setInteractive((v) => clamp(v + 10))}
              style={{
                backgroundColor: btnBg,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: bodyColor, fontWeight: "600" }}>+10</Text>
            </Pressable>
            <Pressable
              testID="btn-reset"
              onPress={() => setInteractive(30)}
              style={{
                backgroundColor: btnBg,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: bodyColor, fontWeight: "600" }}>Reset</Text>
            </Pressable>
          </View>
        </View>
      </Section>

      <Section title="Custom range (file upload)">
        <View style={{ gap: 8 }}>
          <ProgressBar
            testID="upload"
            value={650000}
            min={0}
            max={1024000}
            showValueLabel
            size="lg"
          />
          <Text style={{ color: captionColor, fontSize: 12 }}>650 KB of 1 MB → 63%</Text>
        </View>
      </Section>

      <Section title="Custom label + colors">
        <View style={{ gap: 12 }}>
          <ProgressBar testID="labeled" value={40} label="Uploading photo…" size="md" />
          <ProgressBar
            testID="branded"
            value={75}
            showValueLabel
            progressBarColors={{
              track: isDark ? "#3B0A00" : "#FFF7ED",
              fill: isDark ? "#F97316" : "#F97316",
              label: isDark ? "#FDBA74" : "#7C2D12",
            }}
          />
        </View>
      </Section>
    </Screen>
  );
}
