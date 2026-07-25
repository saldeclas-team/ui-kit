import { useCallback, useEffect } from "react";
import { Pressable, useWindowDimensions } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Text as TamaguiText, XStack, YStack } from "tamagui";

import type { SegmentedControlBodyProps } from "./segmented-control-body-types";
import type { SegmentedControlOption } from "./segmented-control-types";

/**
 * Android SegmentedControl body — Material 3 look implemented in
 * pure JS with `react-native-reanimated`.
 *
 * ### Why not `@expo/ui/community/segmented-control` on Android?
 *
 * The Compose bridge exposes a hit-testing interop bug: taps on
 * the first 1-2 SegmentedButtons of a scrollable Expo Router
 * page pass THROUGH the Compose `Host` and land on RN elements
 * of adjacent stack screens (e.g. a Link on the previous screen
 * kept alive in memory). Manifests as random navigation to
 * unrelated routes when the user taps a segment. Wrapping the
 * Host in `<View collapsable={false}>` +
 * `onStartShouldSetResponder={() => true}` didn't block it.
 * The platform split ([[native-bridges-platform-split]]) is
 * exactly what lets us swap the buggy bridge for a pure-JS impl
 * on Android without touching iOS.
 *
 * ### Material 3 design (all customizable via palette)
 *
 * - Container: rounded pill (radius from `radius` prop —
 *   defaults to `"pill"` = 9999 numeric, matches M3 out of the
 *   box; consumers can pass `"none"` / `"sm"` / `"md"` / numeric
 *   for square / smaller / custom shapes).
 * - Container background + border: `containerBackground` +
 *   `containerBorder` slots from the palette.
 * - Selected segment: absolute-positioned pill that slides via
 *   `withTiming(200ms, easeInOut)` — M3 "medium-1" duration.
 *   Fill from `selectedBackground` slot; text from
 *   `selectedLabel`.
 * - Unselected: transparent, text from `unselectedLabel`.
 * - Ripple: `android_ripple` uses the `ripple` slot color.
 * - Every color slot overridable per-instance via
 *   `segmentedControlColors={{ ... }}` on the SegmentedControl
 *   prop.
 *
 * ### Reanimated only
 *
 * Per repo rule ([[reanimated-only-in-library]]) — RN's built-in
 * `Animated` + `Easing` are banned. `withTiming` on the shared
 * value handles the pill slide.
 */
export function SegmentedControlBody<Value extends string = string>({
  options,
  value,
  onChange,
  disabled,
  chromeColors,
  radius,
  testID,
  fallback,
}: SegmentedControlBodyProps<Value>) {
  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value)
  );

  // Container width tracked via `onLayout` — falls back to
  // window width on first paint so the pill doesn't flash at
  // zero width.
  const { width: windowWidth } = useWindowDimensions();
  const containerWidth = useSharedValue(windowWidth);
  const selectedShared = useSharedValue(selectedIndex);
  const segmentCount = options.length;

  useEffect(() => {
    selectedShared.value = withTiming(selectedIndex, {
      duration: 200,
      easing: Easing.inOut(Easing.ease),
    });
  }, [selectedIndex, selectedShared]);

  const pillStyle = useAnimatedStyle(() => {
    const segmentWidth = containerWidth.value / segmentCount;
    return {
      width: segmentWidth,
      transform: [{ translateX: selectedShared.value * segmentWidth }],
    };
  });

  const handleContainerLayout = useCallback(
    (event: { nativeEvent: { layout: { width: number } } }) => {
      containerWidth.value = event.nativeEvent.layout.width;
    },
    [containerWidth]
  );

  const handlePress = useCallback(
    (opt: SegmentedControlOption<Value>) => {
      if (disabled) return;
      if (opt.value === value) return;
      onChange(opt.value);
    },
    [disabled, onChange, value]
  );

  if (fallback != null) return <YStack>{fallback}</YStack>;

  return (
    <XStack
      testID={`${testID}-control`}
      accessibilityRole="tablist"
      accessibilityState={{ disabled }}
      height={40}
      borderRadius={radius}
      borderWidth={1}
      borderColor={chromeColors.containerBorder}
      backgroundColor={chromeColors.containerBackground}
      overflow="hidden"
      opacity={disabled ? 0.5 : 1}
      onLayout={handleContainerLayout}
    >
      {/* Sliding selection pill — absolute, animated. Placed
          BEFORE segments so it sits behind them in the z-order
          (RN treats later siblings as on top). */}
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            backgroundColor: chromeColors.selectedBackground,
            borderRadius: radius,
          },
          pillStyle,
        ]}
      />
      {options.map((opt, idx) => {
        const isSelected = opt.value === value;
        return (
          <Pressable
            key={String(opt.value)}
            testID={`${testID}-control-segment-${idx}`}
            onPress={() => handlePress(opt)}
            disabled={disabled}
            accessibilityRole="tab"
            accessibilityLabel={opt.label}
            accessibilityState={{ selected: isSelected, disabled }}
            android_ripple={{ color: chromeColors.ripple, borderless: false }}
            style={({ pressed }) => ({
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed && !isSelected ? 0.7 : 1,
            })}
          >
            <TamaguiText
              color={isSelected ? chromeColors.selectedLabel : chromeColors.unselectedLabel}
              fontSize={14}
              lineHeight={20}
              fontWeight={isSelected ? "600" : "500"}
              textAlign="center"
              numberOfLines={1}
            >
              {opt.label}
            </TamaguiText>
          </Pressable>
        );
      })}
    </XStack>
  );
}
