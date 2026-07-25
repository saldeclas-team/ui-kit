import { Text, View } from "react-native";
import { Hint, useUIKit } from "ui-kraken";

import { Screen } from "../../../src/screen";
import { Section } from "../../../src/section";

const TONES = ["neutral", "info", "success", "warning", "danger"] as const;
const TONE_GLYPH: Record<(typeof TONES)[number], string> = {
  neutral: "•",
  info: "i",
  success: "✓",
  warning: "!",
  danger: "×",
};

export default function HintScreen() {
  const { activeTheme } = useUIKit();
  const isDark = activeTheme === "dark";
  const bodyColor = isDark ? "#F5F5F7" : "#0B0B0F";
  const captionColor = isDark ? "#9CA3AF" : "#6B7280";
  const borderColor = isDark ? "#1F2937" : "#E5E7EB";

  return (
    <Screen
      title="Hint"
      subtitle="Inline contextual tip. Quieter than Alert — sits next to form fields, at the bottom of sections, or embedded in a paragraph."
    >
      <Section title="All tones (ghost emphasis)">
        <View style={{ gap: 4 }}>
          {TONES.map((tone) => (
            <Hint key={tone} tone={tone} icon={<Glyph>{TONE_GLYPH[tone]}</Glyph>}>
              {tone} — inline advisory copy for this tone.
            </Hint>
          ))}
        </View>
      </Section>

      <Section title="Ghost vs soft emphasis">
        <View style={{ gap: 8 }}>
          <Hint tone="info" icon={<Glyph>i</Glyph>}>
            Ghost — transparent background.
          </Hint>
          <Hint tone="info" emphasis="soft" icon={<Glyph>i</Glyph>}>
            Soft — tinted background matched to the tone.
          </Hint>
        </View>
      </Section>

      <Section title="With title + icon">
        <Hint.Success emphasis="soft" icon={<Glyph>✓</Glyph>} title="Saved">
          Your changes are safe. You can leave this screen.
        </Hint.Success>
      </Section>

      <Section title="Dense mode (below an Input)">
        <View style={{ gap: 6 }}>
          <Text style={{ color: bodyColor, fontWeight: "600" }}>Password</Text>
          <View style={{ padding: 12, borderRadius: 8, borderWidth: 1, borderColor }}>
            <Text style={{ color: captionColor }}>••••••••</Text>
          </View>
          <Hint.Info dense icon={<Glyph>i</Glyph>}>
            Minimum 8 characters, one uppercase, one number.
          </Hint.Info>
        </View>
      </Section>

      <Section title="Per-instance brand palette">
        <Hint
          tone="info"
          emphasis="soft"
          icon={<Glyph>★</Glyph>}
          title="Try our new feed"
          hintColors={{ text: "#4C1D95", icon: "#7C3AED", background: "#F5F3FF" }}
        >
          Custom text, icon, and background via the hintColors override.
        </Hint>
      </Section>
    </Screen>
  );
}

function Glyph({ children }: { children: string }) {
  return <Text style={{ fontWeight: "700" }}>{children}</Text>;
}
