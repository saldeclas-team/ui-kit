import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { LayoutChangeEvent } from "react-native";
import { Text } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { useUIKit } from "../../provider/use-ui-kit";
import type { CollapsibleColors } from "../../tokens/tokens-types";
import {
  StyledCollapsible,
  StyledCollapsibleBody,
  StyledCollapsibleChevronWrapper,
  StyledCollapsibleHeader,
  StyledCollapsibleIconWrapper,
  StyledCollapsibleTitle,
} from "./collapsible.styled";
import type {
  CollapsibleColorsInput,
  CollapsibleProps,
  CollapsibleRadius,
} from "./collapsible-types";

const DEFAULT_DURATION_MS = 200;
const CHEVRON_MAX_DURATION_MS = 150;

/**
 * Animated expand-collapse section. A pressable header toggles
 * visibility of the body region below it. Controlled: consumer
 * holds `expanded` in state and updates via `onExpandedChange`.
 *
 * ```tsx
 * const [open, setOpen] = useState(false);
 * <Collapsible title="Advanced options" expanded={open} onExpandedChange={setOpen}>
 *   {}
 * </Collapsible>
 * ```
 *
 * Palette derived from `tokens.collapsibleColors` on the provider,
 * overridable per-instance via the `collapsibleColors?` prop.
 */
export function Collapsible({
  title,
  expanded,
  onExpandedChange,
  children,
  icon,
  chevron,
  disabled = false,
  animation = "height",
  duration = DEFAULT_DURATION_MS,
  radius = "md",
  collapsibleColors,
  testID,
  ...rest
}: CollapsibleProps) {
  const { tokens } = useUIKit();
  const rootId = testID ?? "collapsible";
  const palette = resolvePalette(tokens.collapsibleColors, collapsibleColors);
  const resolvedBorderRadius = resolveRadius(radius);

  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const heightValue = useSharedValue(0);
  const rotateValue = useSharedValue(expanded ? 1 : 0);

  useEffect(() => {
    if (animation === "height" && contentHeight != null) {
      heightValue.value = withTiming(expanded ? contentHeight : 0, { duration });
    }
    rotateValue.value = withTiming(expanded ? 1 : 0, {
      duration: Math.min(duration, CHEVRON_MAX_DURATION_MS),
    });
  }, [expanded, contentHeight, animation, duration, heightValue, rotateValue]);

  const handleHeaderPress = useCallback(() => {
    onExpandedChange(!expanded);
  }, [expanded, onExpandedChange]);

  const handleBodyLayout = useCallback((event: LayoutChangeEvent) => {
    setContentHeight(event.nativeEvent.layout.height);
  }, []);

  const bodyAnimatedStyle = useAnimatedStyle(() => ({
    height: contentHeight == null ? undefined : heightValue.value,
    overflow: "hidden",
  }));

  const chevronAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateValue.value * 90}deg` }],
  }));

  return (
    <StyledCollapsible
      testID={rootId}
      backgroundColor={palette.bodyBackground}
      borderColor={palette.border}
      borderRadius={resolvedBorderRadius}
      {...rest}
    >
      {/*
        onPress lives on the StyledCollapsibleHeader itself (not a
        wrapping Pressable) because the header is a Tamagui XStack with
        `pressStyle` — Tamagui registers internal press-in/out handlers
        on the styled component, which hijack the touch responder and
        prevent taps from bubbling to any outer Pressable. Putting
        onPress on the styled component wires both the tap AND the
        press feedback into the same node.
      */}
      <StyledCollapsibleHeader
        testID={`${rootId}-header`}
        onPress={handleHeaderPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ expanded, disabled }}
        backgroundColor={palette.headerBackground}
      >
        {icon != null ? (
          <StyledCollapsibleIconWrapper testID={`${rootId}-icon`}>
            <IconTintOverride color={palette.icon}>{icon}</IconTintOverride>
          </StyledCollapsibleIconWrapper>
        ) : null}
        <StyledCollapsibleTitle testID={`${rootId}-title`} color={palette.title}>
          {title}
        </StyledCollapsibleTitle>
        <Animated.View testID={`${rootId}-chevron`} style={chevronAnimatedStyle}>
          <StyledCollapsibleChevronWrapper>
            {chevron ?? <Text style={{ color: palette.chevron, fontWeight: "700" }}>▸</Text>}
          </StyledCollapsibleChevronWrapper>
        </Animated.View>
      </StyledCollapsibleHeader>

      {animation === "none" ? (
        expanded && (
          <StyledCollapsibleBody testID={`${rootId}-body`} backgroundColor={palette.bodyBackground}>
            {children}
          </StyledCollapsibleBody>
        )
      ) : (
        <Animated.View testID={`${rootId}-body`} style={bodyAnimatedStyle}>
          <StyledCollapsibleBody
            testID={`${rootId}-body-content`}
            onLayout={handleBodyLayout}
            backgroundColor={palette.bodyBackground}
          >
            {children}
          </StyledCollapsibleBody>
        </Animated.View>
      )}
    </StyledCollapsible>
  );
}

/**
 * Merge the per-instance `collapsibleColors?` override on top of
 * the provider-resolved palette. Missing slots fall through.
 */
function resolvePalette(
  base: CollapsibleColors,
  override: CollapsibleColorsInput | undefined
): CollapsibleColors {
  if (override == null) return base;
  return { ...base, ...override };
}

/**
 * Map the `radius` shorthand onto a `borderRadius` value. Numbers
 * and `"pill"` pass through directly; named preset values map onto
 * the theme's `$uiRadius*` token scale.
 */
function resolveRadius(radius: CollapsibleRadius): number | string {
  if (typeof radius === "number") return radius;
  if (radius === "none") return 0;
  if (radius === "pill") return 9999;
  const map: Record<Exclude<CollapsibleRadius, "none" | "pill" | number>, string> = {
    sm: "$uiRadiusSm",
    md: "$uiRadiusMd",
    lg: "$uiRadiusLg",
  };
  return map[radius];
}

/**
 * The icon slot is `ReactNode` (consumer brings any icon component)
 * so we cannot style its color from CSS. This wrapper sets a `color`
 * on a plain `<Text>`-like container that MOST icon libraries pick
 * up via their `color` prop or inherited CSS `currentColor`. Falls
 * back gracefully — an icon that ignores color simply renders its
 * intrinsic color.
 */
function IconTintOverride({ color, children }: { color: string; children: ReactNode }): ReactNode {
  return <Text style={{ color }}>{children}</Text>;
}

export type {
  CollapsibleAnimation,
  CollapsibleColorsInput,
  CollapsibleProps,
  CollapsibleRadius,
} from "./collapsible-types";
