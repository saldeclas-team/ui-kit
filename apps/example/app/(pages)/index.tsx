import { ScrollView } from "react-native";
import { H2, H4, Paragraph, XStack, YStack } from "tamagui";
import { Button } from "ui-kraken";

export default function Home() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 60, gap: 24 }}>
      <YStack gap="$2">
        <H2>ui-kraken example</H2>
        <Paragraph>
          Tap through the Button variants below. Set{" "}
          <Paragraph fontWeight="600">EXPO_PUBLIC_STORYBOOK_ENABLED=true</Paragraph> and reload to
          boot into Storybook instead.
        </Paragraph>
      </YStack>

      <Section title="Variants (default primary color)">
        <XStack flexWrap="wrap" gap="$3">
          <Button.Primary onPress={() => undefined}>Primary</Button.Primary>
          <Button.Secondary onPress={() => undefined}>Secondary</Button.Secondary>
          <Button.Ghost onPress={() => undefined}>Ghost</Button.Ghost>
          <Button.Destructive onPress={() => undefined}>Destructive</Button.Destructive>
        </XStack>
      </Section>

      <Section title="Sizes">
        <YStack gap="$3">
          <Button.Primary size="sm" onPress={() => undefined}>
            Small
          </Button.Primary>
          <Button.Primary size="md" onPress={() => undefined}>
            Medium
          </Button.Primary>
          <Button.Primary size="lg" onPress={() => undefined}>
            Large
          </Button.Primary>
        </YStack>
      </Section>

      <Section title="States">
        <XStack gap="$3" flexWrap="wrap">
          <Button.Primary disabled>Disabled</Button.Primary>
          <Button.Primary loading>Loading</Button.Primary>
        </XStack>
      </Section>

      <Section title="Per-instance overrides">
        <YStack gap="$3">
          <Button.Primary
            buttonColors={{ primary: "#FF6B00", disabled: "#FFB380" }}
            textColors={{ primary: "#FFFFFF", disabled: "#FFF3E0" }}
            onPress={() => undefined}
          >
            Custom brand
          </Button.Primary>
          <Button.Ghost
            buttonColors={{ primary: "#DC2626" }}
            textColors={{ primary: "#DC2626" }}
            onPress={() => undefined}
          >
            Danger ghost
          </Button.Ghost>
        </YStack>
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <YStack gap="$3">
      <H4>{title}</H4>
      {children}
    </YStack>
  );
}
