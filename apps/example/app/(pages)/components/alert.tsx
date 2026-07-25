import { Text as RNText, View } from "react-native";
import { Alert } from "ui-kraken";

import { Screen } from "../../../src/screen";
import { Section } from "../../../src/section";

// Tiny inline "icon" — a text glyph. Real consumers pass their own
// icon library (Feather, Ionicons, custom SVG). Alert only needs a
// ReactNode.
function Glyph({ children }: { children: string }) {
  return <RNText style={{ fontSize: 16 }}>{children}</RNText>;
}

export default function AlertScreen() {
  return (
    <Screen
      title="Alert"
      subtitle="Contextual feedback surface with 4 semantic variants (info / success / warning / danger). Optional title + body + icon slot. Per-instance color overrides. Uses textColors from KrakenProvider — no new tokens."
    >
      <Section title="Variants (title + body + icon)">
        <View style={{ gap: 12 }}>
          <Alert.Info title="Info" icon={<Glyph>ℹ</Glyph>}>
            Your session will expire in 5 minutes.
          </Alert.Info>
          <Alert.Success title="Success" icon={<Glyph>✓</Glyph>}>
            Your changes have been saved.
          </Alert.Success>
          <Alert.Warning title="Warning" icon={<Glyph>!</Glyph>}>
            Free tier caps at 5 seats.
          </Alert.Warning>
          <Alert.Danger title="Danger" icon={<Glyph>✗</Glyph>}>
            Payment failed. Update your card and retry.
          </Alert.Danger>
        </View>
      </Section>

      <Section title="Body only (no title)">
        <View style={{ gap: 12 }}>
          <Alert.Info>Compact one-line info without a title.</Alert.Info>
          <Alert.Success>Saved.</Alert.Success>
          <Alert.Warning>Watch out.</Alert.Warning>
          <Alert.Danger>Something broke.</Alert.Danger>
        </View>
      </Section>

      <Section title="With vs without icon slot">
        <View style={{ gap: 12 }}>
          <Alert.Info title="Without icon">No icon slot.</Alert.Info>
          <Alert.Info title="With icon" icon={<Glyph>ℹ</Glyph>}>
            Same variant, plus the icon slot rendered on the left.
          </Alert.Info>
        </View>
      </Section>

      <Section title="Radius presets">
        <View style={{ gap: 12 }}>
          <Alert.Info radius="none">radius=&quot;none&quot;</Alert.Info>
          <Alert.Info radius="sm">radius=&quot;sm&quot;</Alert.Info>
          <Alert.Info radius="md">radius=&quot;md&quot; (default)</Alert.Info>
          <Alert.Info radius="lg">radius=&quot;lg&quot;</Alert.Info>
          <Alert.Info radius="pill">radius=&quot;pill&quot;</Alert.Info>
          <Alert.Info radius={24}>radius=&#123;24&#125; (raw px)</Alert.Info>
        </View>
      </Section>

      <Section title="Per-instance alertColors override">
        <View style={{ gap: 12 }}>
          <Alert.Info title="Custom background" alertColors={{ background: "#FFEEDD" }}>
            Override only background — text + icon still use the info palette.
          </Alert.Info>
          <Alert.Danger
            title="Inverted danger"
            icon={<Glyph>✗</Glyph>}
            alertColors={{
              background: "#4A0000",
              text: "#FFFFFF",
              icon: "#FFFFFF",
            }}
          >
            Every slot overridden — dark background with white text.
          </Alert.Danger>
          <Alert.Success
            title="With border"
            alertColors={{
              background: "#F0FDF4",
              border: "#059669",
            }}
          >
            Add a border color to opt into the border stroke.
          </Alert.Success>
        </View>
      </Section>

      <Section title="Long content (wrap behavior)">
        <Alert.Warning title="Free tier limit" icon={<Glyph>!</Glyph>}>
          You have reached the maximum number of seats included in the free tier. To invite
          additional teammates, upgrade to the Pro plan from the billing settings. Existing seats
          will not be affected.
        </Alert.Warning>
      </Section>
    </Screen>
  );
}
