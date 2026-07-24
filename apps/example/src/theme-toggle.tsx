import { Pressable, StyleSheet, Text, View } from "react-native";
import type { KrakenThemeMode } from "ui-kraken";
import { useKraken } from "ui-kraken";

export interface ThemeToggleProps {
  value: KrakenThemeMode;
  onChange: (next: KrakenThemeMode) => void;
}

const OPTIONS: Array<{ value: KrakenThemeMode; label: string }> = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

/**
 * Simple segmented toggle for switching between light / dark / system in the
 * example catalog. App-only glue — the toggle state lives in RootLayout so
 * the value it drives is passed as `defaultTheme` back into KrakenProvider.
 */
export function ThemeToggle({ value, onChange }: ThemeToggleProps) {
  const { activeTheme } = useKraken();
  const isDark = activeTheme === "dark";
  const containerBg = isDark ? "#1F2937" : "#F3F4F6";
  const activeBg = isDark ? "#F5F5F7" : "#0B0B0F";
  const activeColor = isDark ? "#0B0B0F" : "#FFFFFF";
  const inactiveColor = isDark ? "#F5F5F7" : "#0B0B0F";

  return (
    <View style={[styles.root, { backgroundColor: containerBg }]}>
      {OPTIONS.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[styles.button, isSelected && { backgroundColor: activeBg }]}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
          >
            <Text style={[styles.label, { color: isSelected ? activeColor : inactiveColor }]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 999,
    gap: 4,
    alignSelf: "flex-start",
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
});
