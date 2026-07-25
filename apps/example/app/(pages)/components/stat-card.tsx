import { Text, View } from "react-native";
import { StatCard, useUIKit } from "ui-kraken";

import { Screen } from "../../../src/screen";
import { Section } from "../../../src/section";

export default function StatCardScreen() {
  const { activeTheme } = useUIKit();
  const isDark = activeTheme === "dark";
  const captionColor = isDark ? "#9CA3AF" : "#6B7280";

  return (
    <Screen
      title="StatCard"
      subtitle="Compact metric card — title + value + optional trend indicator + optional icon + optional description. Fits horizontal dashboard rows or vertical stacks."
    >
      <Section title="Minimal">
        <StatCard title="Active users" value={1240} />
      </Section>

      <Section title="Trend variants">
        <View style={{ gap: 10 }}>
          <StatCard title="Revenue" value="$12,340" trend="up" delta="+8.2%" />
          <StatCard title="Bounce rate" value="42.3%" trend="down" delta="-2.1%" />
          <StatCard title="Signups" value="1,024" trend="neutral" delta="0" />
        </View>
      </Section>

      <Section title="Full card (title + icon + value + trend + delta + description)">
        <StatCard
          title="Revenue"
          value="$12,340"
          icon={<Glyph>◉</Glyph>}
          trend="up"
          delta="+8.2%"
          description="vs last week"
        />
      </Section>

      <Section title="Dashboard row (3-up)">
        <Text style={{ color: captionColor, fontSize: 12 }}>
          Wrap StatCards in a horizontal stack to get a dashboard grid.
        </Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <StatCard title="Users" value={1240} trend="up" delta="+8%" />
          </View>
          <View style={{ flex: 1 }}>
            <StatCard title="Revenue" value="$12k" trend="up" delta="+12%" />
          </View>
          <View style={{ flex: 1 }}>
            <StatCard title="Bounce" value="42%" trend="down" delta="-2%" />
          </View>
        </View>
      </Section>

      <Section title="Per-instance brand palette">
        <StatCard
          title="Sales"
          value="$4,120"
          trend="up"
          delta="+12%"
          icon={<Glyph>★</Glyph>}
          statCardColors={{
            background: "#F5F3FF",
            title: "#4C1D95",
            value: "#312E81",
            trendUp: "#7C3AED",
            icon: "#7C3AED",
          }}
        />
      </Section>
    </Screen>
  );
}

function Glyph({ children }: { children: string }) {
  return <Text style={{ fontWeight: "700", fontSize: 16 }}>{children}</Text>;
}
