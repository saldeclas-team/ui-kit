import { useState } from "react";
import { Text, View } from "react-native";
import { Collapsible, useUIKit } from "ui-kraken";

import { Screen } from "../../../src/screen";
import { Section } from "../../../src/section";

const ACCORDION_ITEMS = [
  { id: "general", title: "General settings", body: "Language, region, and time zone." },
  {
    id: "notif",
    title: "Notifications",
    body: "Push, email, and in-app notification preferences.",
  },
  { id: "priv", title: "Privacy", body: "Data sharing, analytics, and cookie preferences." },
  { id: "adv", title: "Advanced", body: "Developer options and experimental features." },
];

export default function CollapsibleScreen() {
  const { activeTheme } = useUIKit();
  const isDark = activeTheme === "dark";
  const captionColor = isDark ? "#9CA3AF" : "#6B7280";
  const bodyColor = isDark ? "#F5F5F7" : "#0B0B0F";

  const [basicOpen, setBasicOpen] = useState(false);
  const [iconOpen, setIconOpen] = useState(true);
  const [noneOpen, setNoneOpen] = useState(false);
  const [accordionIndex, setAccordionIndex] = useState<number | null>(0);
  const [brandOpen, setBrandOpen] = useState(true);

  return (
    <Screen
      title="Collapsible"
      subtitle="Animated expand-collapse section. Header tap toggles visibility of the body region — smooth height slide via plain RN Animated."
    >
      <Section title="Basic toggle">
        <Collapsible title="Advanced options" expanded={basicOpen} onExpandedChange={setBasicOpen}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: bodyColor }}>
              Body content lives here. Any ReactNode works — text, form fields, nested Collapsibles.
            </Text>
          </View>
        </Collapsible>
      </Section>

      <Section title="With icon + custom chevron">
        <Collapsible
          title="Notifications"
          expanded={iconOpen}
          onExpandedChange={setIconOpen}
          icon={<Text style={{ fontWeight: "700", color: captionColor }}>◉</Text>}
          chevron={
            <Text style={{ fontWeight: "700", color: captionColor }}>{iconOpen ? "−" : "+"}</Text>
          }
        >
          <View style={{ gap: 6, flex: 1 }}>
            <Text style={{ color: bodyColor }}>Push notifications: on</Text>
            <Text style={{ color: bodyColor }}>Email digest: weekly</Text>
            <Text style={{ color: bodyColor }}>In-app banners: on</Text>
          </View>
        </Collapsible>
      </Section>

      <Section title="Animation opt-out (reduced motion)">
        <Text style={{ color: captionColor, fontSize: 12 }}>
          animation=&quot;none&quot; skips the height slide — body mounts/unmounts instantly.
        </Text>
        <Collapsible
          title="Instant toggle"
          expanded={noneOpen}
          onExpandedChange={setNoneOpen}
          animation="none"
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: bodyColor }}>
              No slide. Good for long lists and reduced-motion users.
            </Text>
          </View>
        </Collapsible>
      </Section>

      <Section title="Accordion (only-one-open)">
        <Text style={{ color: captionColor, fontSize: 12 }}>
          Sibling Collapsibles wired to shared state — tapping one closes the others.
        </Text>
        <View style={{ gap: 8 }}>
          {ACCORDION_ITEMS.map((item, idx) => (
            <Collapsible
              key={item.id}
              title={item.title}
              expanded={accordionIndex === idx}
              onExpandedChange={(next) => setAccordionIndex(next ? idx : null)}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: bodyColor }}>{item.body}</Text>
              </View>
            </Collapsible>
          ))}
        </View>
      </Section>

      <Section title="Per-instance brand palette">
        <Collapsible
          title="Brand-accent section"
          expanded={brandOpen}
          onExpandedChange={setBrandOpen}
          collapsibleColors={{
            headerBackground: "#F5F3FF",
            title: "#4C1D95",
            chevron: "#7C3AED",
            border: "#DDD6FE",
            bodyBackground: "#FAF5FF",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#4C1D95" }}>Custom-tinted section via collapsibleColors.</Text>
          </View>
        </Collapsible>
      </Section>

      <View style={{ height: 40 }} />
    </Screen>
  );
}
