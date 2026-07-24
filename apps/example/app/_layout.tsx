import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { TamaguiProvider } from "tamagui";

import { tamaguiConfig } from "../tamagui.config";

const STORYBOOK_ENABLED = process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === "true";

// Pattern from `dannyhw/expo-template-storybook`: pick the initial route
// based on the flag, use `Stack.Protected` to keep the storybook route out
// of the tree when disabled.
export const unstable_settings = {
  initialRouteName: STORYBOOK_ENABLED ? "(storybook)/index" : "(pages)/index",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <TamaguiProvider
      config={tamaguiConfig}
      defaultTheme={colorScheme === "dark" ? "dark" : "light"}
    >
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={STORYBOOK_ENABLED}>
          <Stack.Screen name="(storybook)/index" />
        </Stack.Protected>

        <Stack.Screen name="(pages)/index" />
      </Stack>
    </TamaguiProvider>
  );
}
