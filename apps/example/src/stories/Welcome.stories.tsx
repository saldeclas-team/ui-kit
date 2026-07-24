import type { Meta, StoryObj } from "@storybook/react-native";
import { H2, Paragraph, YStack } from "tamagui";

// Placeholder story — proves the Storybook on-device loop works end to end
// (Metro monorepo config + withStorybook wrapper + Tamagui decorator).
// Delete this file once ui-kraken exposes real components with their own
// stories co-located under packages/ui-kraken/src/**.
function Welcome() {
  return (
    <YStack p="$4" gap="$3">
      <H2>ui-kraken</H2>
      <Paragraph>
        Storybook is up. Add stories under `packages/ui-kraken/src/**` or `apps/example/src/**` and
        they will show up here.
      </Paragraph>
    </YStack>
  );
}

const meta: Meta<typeof Welcome> = {
  title: "Welcome",
  component: Welcome,
};

export default meta;

export const Default: StoryObj<typeof Welcome> = {};
