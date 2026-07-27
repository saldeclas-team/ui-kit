import { useCallback } from "react";

import { getExpoUISegmentedControl } from "./expo-ui-segmented-probe";
import type { SegmentedControlBodyProps } from "./segmented-control-body-types";

/**
 * Web SegmentedControl body — `@expo/ui/community/segmented-control`
 * ships its own web fallback (a plain button row). We forward
 * the same props as iOS / Android; the web-fallback renders
 * something usable even if not visually identical to the native
 * platforms.
 *
 * Split from mobile bodies per the platform-split rule so future
 * web-only tweaks (custom keyboard nav, focus-ring styling) don't
 * touch iOS / Android.
 */
export function SegmentedControlBody<Value extends string = string>({
  options,
  value,
  onChange,
  disabled,
  appearance,
  // `chromeColors` and `radius` are used only by the Android
  // pure-JS body. Web falls back to `@expo/ui`'s Host+Picker
  // native web element which owns its own chrome — ignore.
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
