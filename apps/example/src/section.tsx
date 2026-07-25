import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useUIKit } from "ui-kraken";

export interface SectionProps {
  title: string;
  children: ReactNode;
}

/**
 * Titled section wrapper used inside component demo screens. Theme-aware
 * heading color so labels stay readable in both light and dark. App-only.
 */
export function Section({ title, children }: SectionProps) {
  const { activeTheme } = useUIKit();
  const color = activeTheme === "dark" ? "#F5F5F7" : "#0B0B0F";

  return (
    <View style={styles.root}>
      <Text style={[styles.title, { color }]}>{title}</Text>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  body: {
    gap: 12,
  },
});
