import { forwardRef } from "react";
import type { ComponentRef } from "react";
import { Text as TamaguiText, XStack, YStack } from "tamagui";

import { useUIKit } from "../../provider/use-ui-kit";
import { resolvePalette } from "../../utils/resolve-palette";
import type { ProgressBarProps, ProgressBarRadius, ProgressBarSize } from "./progress-bar-types";

type ProgressBarRef = ComponentRef<typeof YStack>;

/**
 * Determinate progress indicator. Horizontal bar that fills from
 * left to right as `value` progresses from `min` to `max`
 * (0–100 by default). Complements `<Spinner />` (indeterminate)
 * for cases where completion percentage is known.
 *
 * ```tsx
 * <ProgressBar value={50} />                    // 50% of default 0-100
 * <ProgressBar value={73} showValueLabel />     // "73%" above bar
 * <ProgressBar min={0} max={200} value={120} label="Uploading..." size="lg" />
 * ```
 *
 * ### A11y
 *
 * `accessibilityRole="progressbar"` + `accessibilityValue` so screen
 * readers announce native progress (iOS: "50 percent"; Android: "50
 * of 100"). Consumers override `accessibilityLabel` for domain copy.
 */
export const ProgressBar = forwardRef<ProgressBarRef, ProgressBarProps>(function ProgressBar(
  {
    value = 0,
    min = 0,
    max = 100,
    size = "md",
    radius = "full",
    showValueLabel = false,
    label,
    progressBarColors,
    testID = "progress-bar",
    accessibilityRole = "progressbar",
    accessibilityLabel,
    ...rest
  },
  ref
) {
  const { tokens } = useUIKit();
  const palette = resolvePalette(tokens.progressBarColors, progressBarColors);
  const clamped = clampValue(value, min, max);
  const percent = computePercent(clamped, min, max);
  const trackHeight = resolveTrackHeight(size);
  const barRadius = radius === "full" ? trackHeight / 2 : 0;
  const displayLabel = label ?? (showValueLabel ? `${Math.round(percent)}%` : null);
  const a11yLabel = accessibilityLabel ?? label ?? "Progress";

  return (
    <YStack
      ref={ref}
      testID={testID}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={a11yLabel}
      accessibilityValue={{ min, max, now: clamped }}
      {...rest}
    >
      {displayLabel != null ? (
        <XStack justifyContent="flex-end" marginBottom={4}>
          <TamaguiText
            testID={`${testID}-label`}
            color={palette.label}
            fontSize={12}
            fontWeight="500"
          >
            {displayLabel}
          </TamaguiText>
        </XStack>
      ) : null}
      <YStack
        testID={`${testID}-track`}
        height={trackHeight}
        borderRadius={barRadius}
        backgroundColor={palette.track}
        overflow="hidden"
      >
        <YStack
          testID={`${testID}-fill`}
          height={trackHeight}
          width={`${percent}%`}
          backgroundColor={palette.fill}
          borderRadius={barRadius}
        />
      </YStack>
    </YStack>
  );
});

/**
 * Clamp a value into `[min, max]`. Guards `NaN` (defensive: renders
 * as `min` — 0% fill with the default range). Also guards an
 * inverted range (`min > max`) by returning `min` (0%). Extracted
 * for direct pure-function tests.
 */
export function clampValue(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  if (min > max) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/**
 * Compute the percent (0-100) of a clamped value within its range.
 * Zero-width range (`min === max`) returns 0 (defensive — a
 * zero-length bar can't have "progress"). Extracted for direct
 * pure-function tests.
 */
export function computePercent(clamped: number, min: number, max: number): number {
  const range = max - min;
  if (range <= 0) return 0;
  return ((clamped - min) / range) * 100;
}

/**
 * Map a `size` prop value to a track height in pixels. Presets
 * resolve to fixed heights; raw numbers pass through untouched.
 */
export function resolveTrackHeight(size: ProgressBarSize | number): number {
  if (typeof size === "number") return size;
  if (size === "sm") return 4;
  if (size === "md") return 8;
  return 12; // "lg"
}

// Explicit re-exports so the barrel picks them up + type-only exports
// aren't emitted as runtime values. Keeps `progressBarColors` typed
// externally.
export type { ProgressBarRadius };

export type {
  ProgressBarColorsInput,
  ProgressBarProps,
  ProgressBarSize,
} from "./progress-bar-types";
