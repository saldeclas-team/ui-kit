import { useState } from "react";
import { Text, View } from "react-native";
import { Slider, useUIKit } from "ui-kraken";

import { Screen } from "../../../src/screen";
import { Section } from "../../../src/section";

export default function SliderScreen() {
  const { activeTheme } = useUIKit();
  const isDark = activeTheme === "dark";
  const bodyColor = isDark ? "#F5F5F7" : "#0B0B0F";
  const captionColor = isDark ? "#9CA3AF" : "#6B7280";

  const [volume, setVolume] = useState(50);
  const [rating, setRating] = useState(3);
  const [opacity, setOpacity] = useState(0.5);
  const [finalCommit, setFinalCommit] = useState(75);
  const [commitCount, setCommitCount] = useState(0);

  return (
    <Screen
      title="Slider"
      subtitle="Horizontal draggable range input. Pure JS via PanResponder — no native peer."
    >
      <Section title="Volume (0-100, step 1)">
        <View style={{ gap: 8 }}>
          <Text style={{ color: bodyColor }}>Volume: {volume}</Text>
          <Slider
            testID="volume"
            value={volume}
            onValueChange={setVolume}
            accessibilityLabel="Volume"
          />
        </View>
      </Section>

      <Section title="Rating (0-5, step 1)">
        <View style={{ gap: 8 }}>
          <Text style={{ color: bodyColor }}>Rating: {rating} of 5</Text>
          <Slider
            testID="rating"
            min={0}
            max={5}
            step={1}
            value={rating}
            onValueChange={setRating}
            accessibilityLabel="Rating"
          />
        </View>
      </Section>

      <Section title="Opacity (0-1, continuous)">
        <View style={{ gap: 8 }}>
          <Text style={{ color: bodyColor }}>Opacity: {opacity.toFixed(3)}</Text>
          <Slider
            testID="opacity"
            min={0}
            max={1}
            step={0}
            value={opacity}
            onValueChange={setOpacity}
            accessibilityLabel="Opacity"
          />
        </View>
      </Section>

      <Section title="onSlidingComplete only (commit on release)">
        <View style={{ gap: 8 }}>
          <Text style={{ color: bodyColor }}>Draft: {finalCommit}</Text>
          <Text style={{ color: captionColor, fontSize: 12 }}>
            Committed {commitCount}× (drag doesn&apos;t bump the counter, release does)
          </Text>
          <Slider
            testID="committed"
            value={finalCommit}
            onValueChange={setFinalCommit}
            onSlidingComplete={() => setCommitCount((c) => c + 1)}
          />
        </View>
      </Section>

      <Section title="Sizes + disabled">
        <View style={{ gap: 12 }}>
          <View style={{ gap: 4 }}>
            <Text style={{ color: captionColor, fontSize: 12 }}>sm</Text>
            <Slider testID="sm" size="sm" value={25} onValueChange={() => undefined} />
          </View>
          <View style={{ gap: 4 }}>
            <Text style={{ color: captionColor, fontSize: 12 }}>lg</Text>
            <Slider testID="lg" size="lg" value={75} onValueChange={() => undefined} />
          </View>
          <View style={{ gap: 4 }}>
            <Text style={{ color: captionColor, fontSize: 12 }}>disabled</Text>
            <Slider testID="disabled" value={40} onValueChange={() => undefined} disabled />
          </View>
        </View>
      </Section>
    </Screen>
  );
}
