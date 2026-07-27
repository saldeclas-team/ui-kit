import { useUIKit } from "../../provider/use-ui-kit";
import { resolveRadiusNumeric } from "../../utils/radius";
import { resolvePalette } from "../../utils/resolve-palette";
import { isSegmentedControlAvailable } from "./expo-ui-segmented-probe";
import { SegmentedControlBody } from "./segmented-control-body";
import {
  StyledSegmentedControl,
  StyledSegmentedControlErrorText,
  StyledSegmentedControlHelperText,
  StyledSegmentedControlLabel,
  StyledSegmentedControlMissingPeer,
} from "./segmented-control.styled";
import type { SegmentedControlProps } from "./segmented-control-types";

/**
 * Horizontal segmented picker — `UISegmentedControl` on iOS,
 * Material 3 `SegmentedButton` on Android, both via
 * `@expo/ui/community/segmented-control`. Best for 2-5 short
 * options where showing them all inline is the point (filter
 * tabs, sort direction, view mode).
 *
 * ```tsx
 * const [view, setView] = useState<"list" | "grid">("list");
 * <SegmentedControl
 *   options={[
 *     { value: "list", label: "List" },
 *     { value: "grid", label: "Grid" },
 *   ]}
 *   value={view}
 *   onChange={setView}
 *   label="View"
 * />
 * ```
 *
 * ### Architecture — platform-split rendering
 *
 * This top-level file is the SHARED shell (palette resolution,
 * label / helper / error rendering, peer-missing fallback). The
 * native control render lives in
 * `./segmented-control-body.{ios,android,web,tsx}` — Metro
 * picks the right variant at bundle time. iOS-only tweaks can't
 * regress Android and vice versa.
 *
 * ### Native theming — no `tintColor`
 *
 * We deliberately do NOT expose or pass `tintColor` to the
 * native control. Material 3 on Android maps `tintColor` only
 * to the active container background, leaving text in
 * `onSecondaryContainer` (light gray) which reads illegibly on
 * dark tints. iOS ignores `tintColor` entirely. Each platform's
 * native theming is what users expect — see
 * `docs/SEGMENTED-CONTROL-PLAN.md` for the full rationale.
 */
export function SegmentedControl<Value extends string = string>({
  options,
  value,
  onChange,
  label,
  helperText,
  errorText,
  disabled = false,
  androidRadius = "pill",
  segmentedControlColors,
  testID,
  ...rest
}: SegmentedControlProps<Value>) {
  const { tokens, activeTheme } = useUIKit();
  const rootId = testID ?? "segmented-control";
  const palette = resolvePalette(tokens.segmentedControlColors, segmentedControlColors);
  // The Android body renders the sliding pill with an
  // `Animated.View` which needs a numeric `borderRadius` — the
  // regular `resolveRadius` returns a Tamagui theme-token string
  // (`"$uiRadiusMd"`) for named presets, so we use the numeric
  // variant that reads straight from the resolved token scale.
  // Shared with Skeleton; see `utils/radius.ts`.
  const resolvedRadius = resolveRadiusNumeric(androidRadius, tokens.radius);
  const isInvalid = errorText != null && errorText.length > 0;
  const peerAvailable = isSegmentedControlAvailable();

  const fallback = !peerAvailable ? (
    <StyledSegmentedControlMissingPeer testID={`${rootId}-missing-peer`} color={palette.errorText}>
      Install `@expo/ui` to enable SegmentedControl.
    </StyledSegmentedControlMissingPeer>
  ) : undefined;

  return (
    <StyledSegmentedControl testID={rootId} accessibilityLabel={label} {...rest}>
      {label != null && label.length > 0 && (
        <StyledSegmentedControlLabel testID={`${rootId}-label`} color={palette.label}>
          {label}
        </StyledSegmentedControlLabel>
      )}

      <SegmentedControlBody<Value>
        options={options}
        value={value}
        onChange={onChange}
        disabled={disabled}
        appearance={activeTheme}
        chromeColors={{
          containerBackground: palette.containerBackground,
          containerBorder: palette.containerBorder,
          selectedBackground: palette.selectedBackground,
          selectedLabel: palette.selectedLabel,
          unselectedLabel: palette.unselectedLabel,
          ripple: palette.ripple,
        }}
        radius={resolvedRadius}
        testID={rootId}
        fallback={fallback}
      />

      {isInvalid ? (
        <StyledSegmentedControlErrorText testID={`${rootId}-error-text`} color={palette.errorText}>
          {errorText}
        </StyledSegmentedControlErrorText>
      ) : helperText != null && helperText.length > 0 ? (
        <StyledSegmentedControlHelperText
          testID={`${rootId}-helper-text`}
          color={palette.helperText}
        >
          {helperText}
        </StyledSegmentedControlHelperText>
      ) : null}
    </StyledSegmentedControl>
  );
}

export type {
  SegmentedControlColorsInput,
  SegmentedControlOption,
  SegmentedControlProps,
} from "./segmented-control-types";
