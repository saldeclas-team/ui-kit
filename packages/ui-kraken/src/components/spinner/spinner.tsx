import { forwardRef } from "react";
import { ActivityIndicator } from "react-native";
import type {
  ActivityIndicator as ActivityIndicatorRef,
  ActivityIndicatorProps,
} from "react-native";

import { useUIKit } from "../../provider/use-ui-kit";
import { resolvePalette } from "../../utils/resolve-palette";
import type { SpinnerProps, SpinnerSize } from "./spinner-types";

/**
 * Themed activity indicator. Wraps RN's built-in
 * `ActivityIndicator` with palette-resolved color + size presets
 * that read naturally at the callsite (`size="md"` vs raw px).
 *
 * ```tsx
 * <Spinner />                     // md, provider color
 * <Spinner size="sm" />           // 20px
 * <Spinner spinnerColors={{ color: "#7C3AED" }} />
 * ```
 *
 * ### Composition
 *
 * Every RN `ActivityIndicatorProps` (except `color` + `size` which
 * we own) flows through the spread. Consumers who need the raw RN
 * API (`animating`, `hidesWhenStopped`) pass them at the callsite.
 */
export const Spinner = forwardRef<ActivityIndicatorRef, SpinnerProps>(function Spinner(
  {
    size = "md",
    spinnerColors,
    testID = "spinner",
    accessibilityRole = "progressbar",
    accessibilityLabel = "Loading",
    animating = true,
    ...rest
  },
  ref
) {
  const { tokens } = useUIKit();
  const palette = resolvePalette(tokens.spinnerColors, spinnerColors);
  const resolvedSize = resolveSpinnerSize(size);
  return (
    <ActivityIndicator
      ref={ref}
      testID={testID}
      color={palette.color}
      size={resolvedSize as ActivityIndicatorProps["size"]}
      animating={animating}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ busy: animating }}
      {...rest}
    />
  );
});

/**
 * Map a `SpinnerProps.size` value to what RN's `ActivityIndicator`
 * accepts. Our presets resolve to numbers; RN's own string values
 * (`"small"` / `"large"`) + raw numbers pass through untouched.
 * Extracted for direct pure-function tests.
 */
export function resolveSpinnerSize(
  size: SpinnerSize | number | "small" | "large"
): number | "small" | "large" {
  if (typeof size === "number") return size;
  if (size === "sm") return 20;
  if (size === "md") return 32;
  if (size === "lg") return 48;
  return size;
}

export type { SpinnerColorsInput, SpinnerProps, SpinnerSize } from "./spinner-types";
