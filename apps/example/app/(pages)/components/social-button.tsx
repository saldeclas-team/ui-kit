import { useState } from "react";
import { Text, View } from "react-native";
import { SocialButton, useUIKit } from "ui-kraken";

import { Screen } from "../../../src/screen";
import { Section } from "../../../src/section";

export default function SocialButtonScreen() {
  const { activeTheme } = useUIKit();
  const isDark = activeTheme === "dark";
  const cardBg = isDark ? "#111827" : "#F9FAFB";
  const captionColor = isDark ? "#9CA3AF" : "#6B7280";
  const bodyColor = isDark ? "#F5F5F7" : "#0B0B0F";

  const [loading, setLoading] = useState(false);
  const [lastProvider, setLastProvider] = useState<string | null>(null);

  const fakeSignIn = (provider: string) => async () => {
    setLoading(true);
    setLastProvider(provider);
    await new Promise<void>((resolve) => setTimeout(resolve, 1200));
    setLoading(false);
  };

  return (
    <Screen
      title="SocialButton"
      subtitle="OAuth-provider button. Six presets (Google, Apple, Facebook, GitHub, Microsoft, generic). Icon is consumer-supplied — ui-kraken does not ship logos."
    >
      <Section title="All providers">
        <View style={{ gap: 8 }}>
          <SocialButton.Google
            label="Continue with Google"
            icon={<Glyph>G</Glyph>}
            onPress={() => setLastProvider("google")}
          />
          <SocialButton.Apple
            label="Sign in with Apple"
            icon={<Glyph>A</Glyph>}
            onPress={() => setLastProvider("apple")}
          />
          <SocialButton.Facebook
            label="Continue with Facebook"
            icon={<Glyph>f</Glyph>}
            onPress={() => setLastProvider("facebook")}
          />
          <SocialButton.Github
            label="Sign in with GitHub"
            icon={<Glyph>⏻</Glyph>}
            onPress={() => setLastProvider("github")}
          />
          <SocialButton.Microsoft
            label="Continue with Microsoft"
            icon={<Glyph>▦</Glyph>}
            onPress={() => setLastProvider("microsoft")}
          />
          <SocialButton.Generic
            label="Continue with SSO"
            icon={<Glyph>◇</Glyph>}
            onPress={() => setLastProvider("generic")}
          />
        </View>
        <Text style={{ color: captionColor, fontSize: 12 }}>
          Last tapped: {lastProvider ?? "—"}
        </Text>
      </Section>

      <Section title="Size scale (sm / md / lg)">
        <View style={{ gap: 8 }}>
          <SocialButton.Google
            size="sm"
            label="Continue with Google (sm)"
            icon={<Glyph>G</Glyph>}
            onPress={() => undefined}
          />
          <SocialButton.Google
            size="md"
            label="Continue with Google (md)"
            icon={<Glyph>G</Glyph>}
            onPress={() => undefined}
          />
          <SocialButton.Google
            size="lg"
            label="Continue with Google (lg)"
            icon={<Glyph>G</Glyph>}
            onPress={() => undefined}
          />
        </View>
      </Section>

      <Section title="Loading + disabled">
        <View style={{ gap: 8 }}>
          <Text style={{ color: captionColor, fontSize: 12 }}>
            Tap Google — it flips to loading for 1.2 s (real apps guard against double-submits).
          </Text>
          <SocialButton.Google
            label="Continue with Google"
            icon={<Glyph>G</Glyph>}
            loading={loading}
            onPress={fakeSignIn("google")}
          />
          <SocialButton.Apple
            label="Sign in with Apple (disabled)"
            icon={<Glyph>A</Glyph>}
            disabled
            onPress={() => undefined}
          />
        </View>
      </Section>

      <Section title="Per-instance brand palette">
        <SocialButton.Generic
          label="Continue with X"
          icon={<Glyph>◇</Glyph>}
          socialButtonColors={{
            background: "#4C1D95",
            label: "#F5F3FF",
            border: "#4C1D95",
          }}
          onPress={() => setLastProvider("brand")}
        />
      </Section>

      <Section title="Auth-screen composition">
        <View style={{ padding: 16, borderRadius: 12, backgroundColor: cardBg, gap: 12 }}>
          <Text style={{ color: bodyColor, fontWeight: "600", fontSize: 16 }}>Sign in</Text>
          <Text style={{ color: captionColor, fontSize: 13 }}>Pick a provider to continue.</Text>
          <View style={{ gap: 8 }}>
            <SocialButton.Google
              width="100%"
              label="Continue with Google"
              icon={<Glyph>G</Glyph>}
              onPress={() => undefined}
            />
            <SocialButton.Apple
              width="100%"
              label="Sign in with Apple"
              icon={<Glyph>A</Glyph>}
              onPress={() => undefined}
            />
            <SocialButton.Generic
              width="100%"
              label="Continue with SSO"
              icon={<Glyph>◇</Glyph>}
              onPress={() => undefined}
            />
          </View>
        </View>
      </Section>

      <View style={{ height: 40 }} />
    </Screen>
  );
}

function Glyph({ children }: { children: string }) {
  return <Text style={{ fontWeight: "700", fontSize: 16 }}>{children}</Text>;
}
