import { forwardRef, useCallback, useMemo, useRef, useState } from "react";
import type { ComponentRef } from "react";
import { PanResponder, View } from "react-native";
import type { AccessibilityActionEvent, LayoutChangeEvent } from "react-native";
import { YStack } from "tamagui";

import { useUIKit } from "../../provider/use-ui-kit";
import { resolvePalette } from "../../utils/resolve-palette";
import type { SliderProps, SliderSize } from "./slider-types";

type SliderRef = ComponentRef<typeof YStack>;

const TRACK_HEIGHT: Record<SliderSize, number> = { sm: 4, md: 6, lg: 8 };
const THUMB_SIZE: Record<SliderSize, number> = { sm: 16, md: 20, lg: 24 };

/**
 * Horizontal draggable range input. Thumb slides along a track
 * from `min` to `max`; value snaps to `step` increments (or floats
 * freely with `step={0}`). Pure JS via `PanResponder` + `onLayout`
 * — no native peer.
 *
 * ```tsx
 * const [volume, setVolume] = useState(50);
 * <Slider value={volume} onValueChange={setVolume} />
 * <Slider value={rating} onValueChange={setRating} min={1} max={5} step={1} />
 * <Slider value={opacity} onValueChange={setOpacity} min={0} max={1} step={0} />
 * ```
 */
export const Slider = forwardRef<SliderRef, SliderProps>(function Slider(
  {
    value,
    onValueChange,
    onSlidingComplete,
    min = 0,
    max = 100,
    step = 1,
    size = "md",
    disabled = false,
    sliderColors,
    testID = "slider",
    accessibilityRole = "adjustable",
    accessibilityLabel,
    ...rest
  },
  ref
) {
  const { tokens } = useUIKit();
  const palette = resolvePalette(tokens.sliderColors, sliderColors);
  const trackHeight = TRACK_HEIGHT[size];
  const thumbSize = THUMB_SIZE[size];
  const [trackWidth, setTrackWidth] = useState(0);
  const trackWidthRef = useRef(0);
  // Captured on gesture grant so `moveX` deltas are computed from
  // the tap point (not from `pageX=0`). Avoids the "thumb jumps to
  // the finger's page position on first drag frame" bug.
  const grantLocationXRef = useRef(0);

  const clamped = clampValue(value, min, max);
  const percent = computePercent(clamped, min, max);
  const filledWidth = (percent / 100) * trackWidth;
  const thumbLeft = filledWidth - thumbSize / 2;

  const onTrackLayout = useCallback((event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    trackWidthRef.current = width;
    setTrackWidth(width);
  }, []);

  // PanResponder is re-created when props change; cheap (it's just
  // a config object) and avoids stale-closure bugs where an
  // in-flight drag would use last-render's `onValueChange`.
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: () => !disabled,
        onPanResponderGrant: (event) => {
          if (disabled) return;
          // `locationX` is the tap's X within the track view. Store
          // it so `move` frames can compute `location + dx`.
          const locationX = event.nativeEvent.locationX;
          grantLocationXRef.current = locationX;
          onValueChange(locationToValue(locationX, trackWidthRef.current, min, max, step, value));
        },
        onPanResponderMove: (_event, gesture) => {
          if (disabled) return;
          onValueChange(
            locationToValue(
              grantLocationXRef.current + gesture.dx,
              trackWidthRef.current,
              min,
              max,
              step,
              value
            )
          );
        },
        onPanResponderRelease: (_event, gesture) => {
          if (disabled) return;
          const finalValue = locationToValue(
            grantLocationXRef.current + gesture.dx,
            trackWidthRef.current,
            min,
            max,
            step,
            value
          );
          onSlidingComplete?.(finalValue);
        },
      }),
    [disabled, onValueChange, onSlidingComplete, min, max, step, value]
  );

  const handleAccessibilityAction = useCallback(
    (event: AccessibilityActionEvent) => {
      if (disabled) return;
      const bump = step === 0 ? 1 : step;
      if (event.nativeEvent.actionName === "increment") {
        onValueChange(snapToStep(clampValue(value + bump, min, max), min, step));
      } else if (event.nativeEvent.actionName === "decrement") {
        onValueChange(snapToStep(clampValue(value - bump, min, max), min, step));
      }
    },
    [disabled, onValueChange, value, min, max, step]
  );

  return (
    <YStack
      ref={ref}
      testID={testID}
      justifyContent="center"
      height={Math.max(thumbSize, trackHeight)}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel ?? "Slider"}
      accessibilityValue={{ min, max, now: clamped }}
      accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
      onAccessibilityAction={handleAccessibilityAction}
      accessibilityState={{ disabled }}
      opacity={disabled ? 0.5 : 1}
      {...rest}
    >
      <View
        testID={`${testID}-track`}
        onLayout={onTrackLayout}
        {...panResponder.panHandlers}
        style={{
          height: trackHeight,
          borderRadius: trackHeight / 2,
          backgroundColor: palette.track,
        }}
      >
        <View
          testID={`${testID}-fill`}
          style={{
            height: trackHeight,
            width: filledWidth,
            borderRadius: trackHeight / 2,
            backgroundColor: palette.fill,
          }}
        />
      </View>
      <View
        testID={`${testID}-thumb`}
        pointerEvents="none"
        style={{
          position: "absolute",
          left: thumbLeft,
          width: thumbSize,
          height: thumbSize,
          borderRadius: thumbSize / 2,
          backgroundColor: palette.thumb,
          borderWidth: 1,
          borderColor: palette.track,
        }}
      />
    </YStack>
  );
});

/**
 * Clamp a value into `[min, max]`. Guards `NaN` (returns `min` as
 * a defensive fallback) and inverted ranges (`min > max` returns
 * `min`). Extracted for direct pure-function tests.
 */
export function clampValue(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  if (min > max) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/**
 * Compute the percent (0-100) of a clamped value within its
 * range. Zero-width range (`min === max`) returns 0 defensively.
 */
export function computePercent(clamped: number, min: number, max: number): number {
  const range = max - min;
  if (range <= 0) return 0;
  return ((clamped - min) / range) * 100;
}

/**
 * Snap a value to the nearest `step` increment relative to `min`.
 * `step === 0` returns the value untouched (continuous). Negative
 * or non-finite steps also fall through untouched (defensive — a
 * broken step shouldn't crash layout).
 */
export function snapToStep(value: number, min: number, step: number): number {
  if (!Number.isFinite(step) || step <= 0) return value;
  const relative = value - min;
  const steps = Math.round(relative / step);
  return min + steps * step;
}

/**
 * Convert a gesture X coordinate (within the track view) to a
 * clamped + snapped slider value. When the track hasn't been laid
 * out yet (`trackWidth <= 0`), returns the current value clamped
 * — defensive fallback so a first drag frame before layout doesn't
 * emit a garbage value. Extracted from the PanResponder handlers
 * so it can be tested directly (PanResponder itself is difficult
 * to simulate via jest / RTL).
 */
export function locationToValue(
  locationX: number,
  trackWidth: number,
  min: number,
  max: number,
  step: number,
  currentValue: number
): number {
  if (trackWidth <= 0) return clampValue(currentValue, min, max);
  const rawPercent = Math.max(0, Math.min(1, locationX / trackWidth));
  const raw = min + rawPercent * (max - min);
  return snapToStep(clampValue(raw, min, max), min, step);
}

export type { SliderColorsInput, SliderProps, SliderSize } from "./slider-types";
