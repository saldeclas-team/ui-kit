import { useState } from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import type { ThemeMode } from "ui-kraken";
import { UIKitProvider } from "ui-kraken";

import { ThemeToggle } from "../src/theme-toggle";

const STORYBOOK_ENABLED = process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === "true";

// Pattern from `dannyhw/expo-template-storybook`: pick the initial route
// based on the flag, use `Stack.Protected` to keep the storybook route out
// of the tree when disabled.
export const unstable_settings = {
  initialRouteName: STORYBOOK_ENABLED ? "(storybook)/index" : "(pages)/index",
};

export default function RootLayout() {
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <UIKitProvider defaultTheme={themeMode}>
          <Stack
            screenOptions={{
              headerShown: !STORYBOOK_ENABLED,
              headerRight: () => <ThemeToggle value={themeMode} onChange={setThemeMode} />,
              headerTitleAlign: "center",
            }}
          >
            <Stack.Protected guard={STORYBOOK_ENABLED}>
              <Stack.Screen name="(storybook)/index" options={{ headerShown: false }} />
            </Stack.Protected>

            <Stack.Screen name="(pages)/index" options={{ title: "ui-kraken components" }} />
            <Stack.Screen
              name="(pages)/components/button"
              options={{ title: "Button", headerBackTitle: "Components" }}
            />
            <Stack.Screen
              name="(pages)/components/text"
              options={{ title: "Text", headerBackTitle: "Components" }}
            />
            <Stack.Screen
              name="(pages)/components/alert"
              options={{ title: "Alert", headerBackTitle: "Components" }}
            />
            <Stack.Screen
              name="(pages)/components/radio-group"
              options={{ title: "RadioGroup", headerBackTitle: "Components" }}
            />
            <Stack.Screen
              name="(pages)/components/input"
              options={{ title: "Input", headerBackTitle: "Components" }}
            />
            <Stack.Screen
              name="(pages)/components/currency-input"
              options={{ title: "CurrencyInput", headerBackTitle: "Components" }}
            />
            <Stack.Screen
              name="(pages)/components/surface"
              options={{ title: "Surface", headerBackTitle: "Components" }}
            />
            <Stack.Screen
              name="(pages)/components/card"
              options={{ title: "Card", headerBackTitle: "Components" }}
            />
            <Stack.Screen
              name="(pages)/components/divider"
              options={{ title: "Divider", headerBackTitle: "Components" }}
            />
            <Stack.Screen
              name="(pages)/components/spinner"
              options={{ title: "Spinner", headerBackTitle: "Components" }}
            />
            <Stack.Screen
              name="(pages)/components/avatar"
              options={{ title: "Avatar", headerBackTitle: "Components" }}
            />
            <Stack.Screen
              name="(pages)/components/badge"
              options={{ title: "Badge", headerBackTitle: "Components" }}
            />
            <Stack.Screen
              name="(pages)/components/refresh-control"
              options={{ title: "RefreshControl", headerBackTitle: "Components" }}
            />
            <Stack.Screen
              name="(pages)/components/skeleton"
              options={{ title: "Skeleton", headerBackTitle: "Components" }}
            />
            <Stack.Screen
              name="(pages)/components/hint"
              options={{ title: "Hint", headerBackTitle: "Components" }}
            />
            <Stack.Screen
              name="(pages)/components/stat-card"
              options={{ title: "StatCard", headerBackTitle: "Components" }}
            />
            <Stack.Screen
              name="(pages)/components/multi-select"
              options={{ title: "MultiSelect", headerBackTitle: "Components" }}
            />
            <Stack.Screen
              name="(pages)/components/social-button"
              options={{ title: "SocialButton", headerBackTitle: "Components" }}
            />
            <Stack.Screen
              name="(pages)/components/collapsible"
              options={{ title: "Collapsible", headerBackTitle: "Components" }}
            />
            <Stack.Screen
              name="(pages)/components/external-link"
              options={{ title: "ExternalLink", headerBackTitle: "Components" }}
            />
            <Stack.Screen
              name="(pages)/components/select"
              options={{ title: "Select", headerBackTitle: "Components" }}
            />
            <Stack.Screen
              name="(pages)/components/select-native"
              options={{ title: "SelectNative", headerBackTitle: "Components" }}
            />
            <Stack.Screen
              name="(pages)/components/select-bottom-sheet"
              options={{ title: "SelectBottomSheet", headerBackTitle: "Components" }}
            />
            <Stack.Screen
              name="(pages)/components/segmented-control"
              options={{ title: "SegmentedControl", headerBackTitle: "Components" }}
            />
            <Stack.Screen
              name="(pages)/components/date-picker"
              options={{ title: "DatePicker", headerBackTitle: "Components" }}
            />
            <Stack.Screen
              name="(pages)/components/date-range-picker"
              options={{ title: "DateRangePicker", headerBackTitle: "Components" }}
            />
            <Stack.Screen
              name="(pages)/components/bottom-sheet"
              options={{ title: "BottomSheet", headerBackTitle: "Components" }}
            />
            <Stack.Screen
              name="(pages)/components/image-picker-sheet"
              options={{ title: "ImagePickerSheet", headerBackTitle: "Components" }}
            />
          </Stack>
        </UIKitProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
