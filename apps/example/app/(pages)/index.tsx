import { Link } from "expo-router";
import type { Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useUIKit } from "ui-kraken";

import { Screen } from "../../src/screen";

interface ComponentItem {
  title: string;
  description: string;
  href: Href;
  status: "shipped" | "planned";
}

const COMPONENTS: ComponentItem[] = [
  {
    title: "Button",
    description: "Interactive button — primary / secondary / outline / ghost / destructive.",
    href: "/components/button",
    status: "shipped",
  },
  {
    title: "Text",
    description:
      "13 HTML-familiar variants (H1-H6, subtitle, body, caption, overline, label) with 14 color slots.",
    href: "/components/text",
    status: "shipped",
  },
  {
    title: "Alert",
    description:
      "Contextual feedback — info / success / warning / danger with optional title + icon slot.",
    href: "/components/alert",
    status: "shipped",
  },
  {
    title: "Card",
    description: "Surface primitive with layered background variants.",
    href: "/components/button",
    status: "planned",
  },
  {
    title: "Input",
    description: "Text input with label, helper text, and validation slots.",
    href: "/components/button",
    status: "planned",
  },
];

export default function ComponentsHome() {
  return (
    <Screen
      title="ui-kraken components"
      subtitle="Tap a component to open its live demo. Use the theme toggle in the header to flip between light, dark, and system."
    >
      <View style={styles.list}>
        {COMPONENTS.map((item) => (
          <ComponentRow key={item.title} item={item} />
        ))}
      </View>
    </Screen>
  );
}

function ComponentRow({ item }: { item: ComponentItem }) {
  const { activeTheme } = useUIKit();
  const isDark = activeTheme === "dark";
  const shipped = item.status === "shipped";
  const cardBg = isDark ? "#111827" : "#F9FAFB";
  const borderColor = isDark ? "#1F2937" : "#E5E7EB";
  const titleColor = shipped ? (isDark ? "#F5F5F7" : "#0B0B0F") : isDark ? "#4B5563" : "#9CA3AF";
  const descriptionColor = isDark ? "#9CA3AF" : "#6B7280";

  const content = (
    <View style={[styles.row, { backgroundColor: cardBg, borderColor }]}>
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, { color: titleColor }]}>{item.title}</Text>
        <Text style={[styles.rowDescription, { color: descriptionColor }]}>{item.description}</Text>
      </View>
      <Text style={[styles.rowStatus, { color: shipped ? "#10B981" : descriptionColor }]}>
        {shipped ? "Ready" : "Planned"}
      </Text>
    </View>
  );

  if (!shipped) {
    return <View style={styles.rowWrapper}>{content}</View>;
  }

  return (
    <Link href={item.href} asChild>
      <Pressable style={styles.rowWrapper} accessibilityRole="button">
        {content}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  rowWrapper: {
    borderRadius: 12,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  rowText: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  rowDescription: {
    fontSize: 13,
  },
  rowStatus: {
    fontSize: 12,
    fontWeight: "600",
  },
});
