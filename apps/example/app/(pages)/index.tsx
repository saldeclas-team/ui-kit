import { StyleSheet, Text, View } from "react-native";

export default function Home() {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>ui-kraken example</Text>
      <Text style={styles.body}>
        Set EXPO_PUBLIC_STORYBOOK_ENABLED=true and reload to boot into Storybook.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  title: { fontSize: 22, fontWeight: "600" },
  body: { textAlign: "center", opacity: 0.7 },
});
