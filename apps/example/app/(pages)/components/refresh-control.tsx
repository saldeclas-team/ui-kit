import { useCallback, useState } from "react";
import { Text, View } from "react-native";
import { RefreshControl, useUIKit } from "ui-kraken";

import { Screen } from "../../../src/screen";
import { Section } from "../../../src/section";

export default function RefreshControlScreen() {
  const { activeTheme } = useUIKit();
  const isDark = activeTheme === "dark";
  const rowBackground = isDark ? "#111827" : "#F9FAFB";
  const rowText = isDark ? "#F5F5F7" : "#0B0B0F";
  const captionColor = isDark ? "#9CA3AF" : "#6B7280";
  const codeColor = isDark ? "#F5F3FF" : "#4C1D95";

  const [refreshing, setRefreshing] = useState(false);
  const [pullCount, setPullCount] = useState(0);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setPullCount((n) => n + 1);
      setRefreshing(false);
    }, 1200);
  }, []);

  return (
    <Screen
      title="RefreshControl"
      subtitle="Pull the screen down to trigger a themed refresh spinner. Wraps RN's native RefreshControl and threads the ui-kraken palette through iOS + Android props."
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          title="Pulling to refresh…"
          testID="refresh-control"
        />
      }
    >
      <Section title="Live status">
        <View style={{ padding: 16, borderRadius: 8, backgroundColor: rowBackground, gap: 4 }}>
          <Text style={{ color: rowText, fontWeight: "600" }}>
            {refreshing ? "Refreshing…" : "Idle"}
          </Text>
          <Text style={{ color: captionColor, fontSize: 12 }}>Pulls completed: {pullCount}</Text>
        </View>
      </Section>

      <Section title="How it works">
        <Text style={{ color: captionColor, fontSize: 13, lineHeight: 18 }}>
          The pull-to-refresh gesture is native — iOS shows a spinning arrow with the optional title
          text; Android shows a circular badge with the background color behind the spinner. Both
          platforms fire the same onRefresh callback.
        </Text>
      </Section>

      <Section title="Default palette (this screen)">
        <View style={{ padding: 16, borderRadius: 8, backgroundColor: rowBackground }}>
          <Text style={{ color: rowText, fontWeight: "600" }}>Pull down anywhere above</Text>
          <Text style={{ color: captionColor, fontSize: 12, marginTop: 4 }}>
            spinner: brand blue · background: gray-50 · title: gray-500
          </Text>
        </View>
      </Section>

      <Section title="Per-instance override recipe">
        <View style={{ gap: 8 }}>
          <Text style={{ color: captionColor, fontSize: 12 }}>
            For a purple-accented RefreshControl on a single screen, pass refreshControlColors:
          </Text>
          <Text style={{ color: codeColor, fontFamily: "Menlo", fontSize: 12 }}>
            {`<RefreshControl\n  refreshing={refreshing}\n  onRefresh={onRefresh}\n  refreshControlColors={{\n    spinner: "#7C3AED",\n    background: "#F5F3FF",\n    title: "#4C1D95",\n  }}\n/>`}
          </Text>
        </View>
      </Section>
    </Screen>
  );
}
