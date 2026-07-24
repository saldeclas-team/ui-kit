import { StyleSheet, View } from "react-native";
import { Text } from "ui-kraken";

import { Screen } from "../../../src/screen";
import { Section } from "../../../src/section";

export default function TextScreen() {
  return (
    <Screen
      title="Text"
      subtitle="13 HTML-familiar variants (H1-H6 + Subtitle1/2 + Body1/2 + Caption + Overline + Label). 14 semantic color slots. Intensity modulator. Every RN Text prop flows through."
    >
      <Section title="Type scale">
        <Text.H1>H1 · 40 / 48 / 700</Text.H1>
        <Text.H2>H2 · 32 / 40 / 700</Text.H2>
        <Text.H3>H3 · 28 / 36 / 700</Text.H3>
        <Text.H4>H4 · 24 / 32 / 600</Text.H4>
        <Text.H5>H5 · 20 / 28 / 600</Text.H5>
        <Text.H6>H6 · 18 / 24 / 600</Text.H6>
        <Text.Subtitle1>Subtitle1 · 16 / 24 / 500</Text.Subtitle1>
        <Text.Subtitle2>Subtitle2 · 14 / 20 / 500</Text.Subtitle2>
        <Text.Body1>Body1 · 16 / 24 / 400</Text.Body1>
        <Text.Body2>Body2 (default) · 14 / 20 / 400</Text.Body2>
        <Text.Caption>Caption · 12 / 16 / 400</Text.Caption>
        <Text.Overline>Overline · 10 / 16 / 500 uppercase</Text.Overline>
        <Text.Label>Label · 14 / 20 / 500</Text.Label>
      </Section>

      <Section title="Hierarchy colors">
        <Text.Body1 color="primary">primary — main content</Text.Body1>
        <Text.Body1 color="secondary">secondary — supporting content</Text.Body1>
        <Text.Body1 color="tertiary">tertiary — de-emphasized</Text.Body1>
        <Text.Body1 color="disabled">disabled — inactive</Text.Body1>
      </Section>

      <Section title="Semantic colors">
        <Text.Body1 color="interactive">interactive — link / tappable</Text.Body1>
        <Text.Body1 color="success">success — operation succeeded</Text.Body1>
        <Text.Body1 color="warning">warning — needs attention</Text.Body1>
        <Text.Body1 color="danger">danger — destructive / error</Text.Body1>
        <Text.Body1 color="info">info — informational message</Text.Body1>
      </Section>

      <Section title="On-* colors (on colored surfaces)">
        <View style={[styles.surface, { backgroundColor: "#2563EB" }]}>
          <Text.Body1 color="onPrimary">onPrimary on brand primary bg</Text.Body1>
        </View>
        <View style={[styles.surface, { backgroundColor: "#0EA5E9" }]}>
          <Text.Body1 color="onSecondary">onSecondary on brand secondary bg</Text.Body1>
        </View>
        <View style={[styles.surface, { backgroundColor: "#059669" }]}>
          <Text.Body1 color="onSuccess">onSuccess on success bg</Text.Body1>
        </View>
        <View style={[styles.surface, { backgroundColor: "#DC2626" }]}>
          <Text.Body1 color="onDanger">onDanger on danger bg</Text.Body1>
        </View>
      </Section>

      <Section title="Intensity modulator">
        <Text.Body1 intensity="subtle">subtle — opacity 0.65</Text.Body1>
        <Text.Body1 intensity="normal">normal — default</Text.Body1>
        <Text.Body1 intensity="strong">strong — bumped fontWeight</Text.Body1>
      </Section>

      <Section title="Custom color (arbitrary hex / rgb / named)">
        <Text.Body1 color="#FF6B00">color=&quot;#FF6B00&quot;</Text.Body1>
        <Text.Body1 color="rgb(139, 92, 246)">color=&quot;rgb(139, 92, 246)&quot;</Text.Body1>
        <Text.Body1 color="hotpink">color=&quot;hotpink&quot;</Text.Body1>
      </Section>

      <Section title="Truncation (numberOfLines = 2)">
        <Text.Body1 numberOfLines={2}>
          This is a longer paragraph that will be truncated after two lines with an ellipsis, thanks
          to the numberOfLines prop passing straight through from the underlying RN Text. Notice how
          the ui-kraken Text does not need to re-declare numberOfLines to accept it.
        </Text.Body1>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  surface: {
    padding: 12,
    borderRadius: 8,
  },
});
