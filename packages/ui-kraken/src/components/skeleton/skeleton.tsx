import { useEffect, useMemo, useRef } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { Animated, Easing, View } from "react-native";

import { useUIKit } from "../../provider/use-ui-kit";
import type { SkeletonColors } from "../../tokens/tokens-types";
import type { SkeletonColorsInput, SkeletonProps, SkeletonRadius } from "./skeleton-types";

const PULSE_DURATION_MS = 600;

const ABSOLUTE_FILL: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

/**
 * Animated placeholder for loading states. Stamp Skeletons in the shape
 * of the content that will replace them — a rounded rectangle where a
 * `Text.H4` will render, a pill-shaped circle where an avatar will
 * render, a stack of narrow rectangles where a paragraph will render.
 *
 * The pulse animation gives the user a visual signal that something is
 * coming, without committing to a specific content shape.
 *
 * ```tsx
 * <Skeleton style={{ width: 240, height: 16 }} />           // text line
 * <Skeleton style={{ width: 48,  height: 48 }} radius="pill" />  // avatar
 * <Skeleton style={{ width: "100%", height: 120 }} radius="lg" /> // image
 * ```
 *
 * Palette derived from `tokens.skeletonColors` on the provider, overridable
 * per-instance via the `skeletonColors?` prop.
 */
export function Skeleton({
  variant = "pulse",
  radius = "md",
  skeletonColors,
  testID = "skeleton",
  style,
  accessibilityRole = "progressbar",
  accessibilityLabel = "Loading",
  ...rest
}: SkeletonProps) {
  const { tokens } = useUIKit();
  const palette = resolvePalette(tokens.skeletonColors, skeletonColors);
  const borderRadius = resolveRadius(radius, tokens.radius);

  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (variant !== "pulse") return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: PULSE_DURATION_MS,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: PULSE_DURATION_MS,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity, variant]);

  const wrapperStyle: StyleProp<ViewStyle> = useMemo(
    () => [{ borderRadius, backgroundColor: palette.base, overflow: "hidden" }, style],
    [borderRadius, palette.base, style]
  );

  return (
    <View
      {...rest}
      testID={testID}
      style={wrapperStyle}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
    >
      {variant === "pulse" && (
        <Animated.View
          testID={`${testID}-highlight`}
          pointerEvents="none"
          style={[ABSOLUTE_FILL, { backgroundColor: palette.highlight, opacity }]}
        />
      )}
    </View>
  );
}

/**
 * Merge the per-instance `skeletonColors?` override on top of the
 * provider-resolved palette. Missing slots fall through.
 */
function resolvePalette(
  base: SkeletonColors,
  override: SkeletonColorsInput | undefined
): SkeletonColors {
  if (override == null) return base;
  return { ...base, ...override };
}

/**
 * Map the `radius` shorthand onto a numeric `borderRadius`. `"pill"`
 * is a fixed 9999 (RN clamps to `min(width, height) / 2`); the other
 * three values pull from the resolved token scale.
 */
function resolveRadius(
  radius: SkeletonRadius,
  scale: { sm: number; md: number; lg: number; pill: number }
): number {
  switch (radius) {
    case "none":
      return 0;
    case "sm":
      return scale.sm;
    case "md":
      return scale.md;
    case "lg":
      return scale.lg;
    case "pill":
      return scale.pill;
  }
}

export type {
  SkeletonColorsInput,
  SkeletonProps,
  SkeletonRadius,
  SkeletonVariant,
} from "./skeleton-types";
