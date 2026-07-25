import type { ReactElement, ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useUIKit } from "ui-kraken";

export interface ScreenProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  /**
   * Optional `refreshControl` element passed through to the inner
   * `ScrollView`. Used only by the RefreshControl demo so pull-to-refresh
   * works at the screen level; every other page leaves this unset.
   */
  refreshControl?: ReactElement<{ refreshing: boolean; onRefresh: () => void }>;
}

/**
 * Demo screen wrapper for `apps/example`. Reads the current theme from
 * UIKitProvider and forces a black background in dark mode / white in light.
 * The title and subtitle also flip color per theme. This is app-only glue —
 * NOT part of ui-kraken itself.
 */
export function Screen({ children, title, subtitle, refreshControl }: ScreenProps) {
  const { activeTheme } = useUIKit();
  const isDark = activeTheme === "dark";
  const backgroundColor = isDark ? "#000000" : "#FFFFFF";
  const titleColor = isDark ? "#FFFFFF" : "#0B0B0F";
  const subtitleColor = isDark ? "#9CA3AF" : "#5B6472";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor }}
      contentContainerStyle={[styles.content, { backgroundColor }]}
      // Auto-scroll focused inputs into view + drop the keyboard when
      // the user taps outside a text field. Both are app-level concerns
      // (ui-kraken's Input is a leaf primitive with no keyboard chrome);
      // set here so every demo screen behaves like a real app form.
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      refreshControl={refreshControl}
    >
      {title != null && <Text style={[styles.title, { color: titleColor }]}>{title}</Text>}
      {subtitle != null && (
        <Text style={[styles.subtitle, { color: subtitleColor }]}>{subtitle}</Text>
      )}
      <View style={styles.body}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingTop: 60,
    gap: 16,
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
  },
  body: {
    gap: 20,
    marginTop: 8,
  },
});
