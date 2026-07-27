import { useState } from "react";
import { Platform, Text, TextInput, View } from "react-native";
import { Button, ScreenContainer, useUIKit } from "ui-kraken";

/**
 * ScreenContainer is a screen-level wrapper, not a component you
 * embed. So the example page renders a "preview" of what a
 * ScreenContainer-based screen looks like at nested scale +
 * links to the source of THIS FILE (which uses ScreenContainer
 * itself at the outermost layer).
 *
 * NOTE: this example DOES wrap its own content with a
 * ScreenContainer (unlike other example pages, which delegate to
 * the shared <Screen> helper). Consumers looking at the source
 * see the real integration pattern.
 */
export default function ScreenContainerScreen() {
  const { activeTheme } = useUIKit();
  const isDark = activeTheme === "dark";
  const captionColor = isDark ? "#9CA3AF" : "#6B7280";
  const bodyColor = isDark ? "#F5F5F7" : "#0B0B0F";
  const sectionBg = isDark ? "#111827" : "#F9FAFB";

  const [name, setName] = useState("");

  return (
    <ScreenContainer
      scrollable
      keyboardBehavior={Platform.OS === "ios" ? "padding" : "height"}
      scrollProps={{ keyboardShouldPersistTaps: "handled" }}
    >
      <View style={{ padding: 24, gap: 20 }}>
        <View>
          <Text style={{ color: bodyColor, fontSize: 24, fontWeight: "700" }}>ScreenContainer</Text>
          <Text style={{ color: captionColor, marginTop: 4 }}>
            Safe-area-aware screen wrapper. This screen itself uses ScreenContainer at the top level
            — the source is the demo.
          </Text>
        </View>

        <View style={{ backgroundColor: sectionBg, padding: 16, borderRadius: 12 }}>
          <Text style={{ color: bodyColor, fontWeight: "600", marginBottom: 8 }}>
            Try the keyboard-avoiding form
          </Text>
          <Text style={{ color: captionColor, fontSize: 12, marginBottom: 12 }}>
            keyboardBehavior=&apos;padding&apos; on iOS, &apos;height&apos; on Android. Tap the
            input — the layout should adjust for the keyboard.
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={captionColor}
            style={{
              borderWidth: 1,
              borderColor: isDark ? "#374151" : "#D1D5DB",
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              color: bodyColor,
              backgroundColor: isDark ? "#0B0B0F" : "#FFFFFF",
            }}
          />
          <Button style={{ marginTop: 12 }} onPress={() => undefined}>
            Save
          </Button>
        </View>

        <View style={{ backgroundColor: sectionBg, padding: 16, borderRadius: 12 }}>
          <Text style={{ color: bodyColor, fontWeight: "600", marginBottom: 8 }}>
            What this component does for you
          </Text>
          <Text style={{ color: bodyColor, fontSize: 14, lineHeight: 20 }}>
            • Safe-area padding (via useSafeAreaInsets — falls back to 44/34 iOS or 24/0 Android
            when the peer isn&apos;t installed).
            {"\n"}• Background from screenContainerColors, flips with activeTheme.
            {"\n"}• Auto status bar content style (dark theme → light content).
            {"\n"}• Optional KeyboardAvoidingView wrap via the keyboardBehavior prop.
            {"\n"}• Optional ScrollView wrap via the scrollable prop (this screen uses it — try
            adding enough sections to make it scroll).
          </Text>
        </View>

        <View style={{ backgroundColor: sectionBg, padding: 16, borderRadius: 12 }}>
          <Text style={{ color: bodyColor, fontWeight: "600", marginBottom: 8 }}>
            Scroll opt-in (this screen)
          </Text>
          <Text style={{ color: bodyColor, fontSize: 14, lineHeight: 20 }}>
            This screen passes scrollable + scrollProps=&#123;&#123; keyboardShouldPersistTaps:
            &quot;handled&quot; &#125;&#125; — the whole page scrolls, and tapping a button while
            the keyboard is open doesn&apos;t dismiss the tap.
            {"\n\n"}
            For pull-to-refresh, pass scrollProps=&#123;&#123; refreshControl: &lt;RefreshControl
            ... /&gt; &#125;&#125; using ui-kraken&apos;s RefreshControl from Batch 1.
            {"\n\n"}
            For virtualized lists (FlashList / FlatList), leave scrollable=false — the list scrolls
            itself.
          </Text>
        </View>

        <View style={{ backgroundColor: sectionBg, padding: 16, borderRadius: 12 }}>
          <Text style={{ color: bodyColor, fontWeight: "600", marginBottom: 8 }}>
            Long content to test scroll
          </Text>
          <Text style={{ color: bodyColor, fontSize: 14, lineHeight: 20 }}>
            {Array.from({ length: 20 })
              .map(
                (_, i) =>
                  `Line ${i + 1}: sample content so this screen actually needs to scroll to reach the bottom.`
              )
              .join("\n")}
          </Text>
        </View>

        <View style={{ backgroundColor: sectionBg, padding: 16, borderRadius: 12 }}>
          <Text style={{ color: bodyColor, fontWeight: "600", marginBottom: 8 }}>
            Common patterns
          </Text>
          <Text style={{ color: bodyColor, fontSize: 14, lineHeight: 20 }}>
            • Bottom tab bar layouts: pass edges=[&quot;top&quot;, &quot;left&quot;,
            &quot;right&quot;] so the tab bar owns the bottom inset.
            {"\n"}• Full-bleed video/image screen: statusBarStyle=&quot;light&quot; +
            screenContainerColors=&#123;&#123; background: &quot;#000&quot; &#125;&#125;.
            {"\n"}• Screen with nav header: keyboardVerticalOffset=&#123;88&#125; matches the
            typical header height.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </View>
    </ScreenContainer>
  );
}
