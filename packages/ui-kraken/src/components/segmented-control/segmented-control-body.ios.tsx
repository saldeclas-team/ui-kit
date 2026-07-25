import { useCallback } from "react";

import { getExpoUISegmentedControl } from "./expo-ui-segmented-probe";
import type { SegmentedControlBodyProps } from "./segmented-control-body-types";

/**
 * iOS SegmentedControl body — `UISegmentedControl` via
 * `@expo/ui/community/segmented-control`. Native pill-style
 * segmented picker; iOS owns the container background, tint,
 * per-segment text color, selected fill, disabled dim.
 *
 * Split from `.android.tsx` per the platform-split rule ([[
 * native-bridges-platform-split]]) even though both platforms
 * import the same `SegmentedControl` component — future iOS-only
 * tweaks (e.g. haptic feedback, size class handling) can land here
 * without touching Android.
 */
export function SegmentedControlBody<Value extends string = string>({
  options,
  value,
  onChange,
  disabled,
  appearance,
  // `chromeColors` and `radius` are Android-only chrome slots.
  // iOS uses SwiftUI `UISegmentedControl` which owns its own
  // rounded pill shape and colors — we accept the props for the
  // shared body contract and ignore them here.
  testID,
  fallback,
}: SegmentedControlBodyProps<Value>) {
  const NativeSegmentedControl = getExpoUISegmentedControl();

  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value)
  );

  const handleChange = useCallback(
    (event: { nativeEvent: { selectedSegmentIndex: number; value: string } }) => {
      const idx = event.nativeEvent.selectedSegmentIndex;
      const picked = options[idx];
      if (picked) onChange(picked.value);
    },
    [onChange, options]
  );

  if (fallback != null) return <>{fallback}</>;
  if (NativeSegmentedControl == null) return null;

  return (
    <NativeSegmentedControl
      testID={`${testID}-control`}
      values={options.map((o) => o.label)}
      selectedIndex={selectedIndex}
      enabled={!disabled}
      appearance={appearance}
      onChange={handleChange}
    />
  );
}
