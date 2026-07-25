import { Platform } from "react-native";

import { useUIKit } from "../../provider/use-ui-kit";
import { resolveRadius } from "../../utils/radius";
import { resolvePalette } from "../../utils/resolve-palette";
import { isExpoUIAvailable } from "./expo-ui-probe";
import { NativePickerBody } from "./native-picker-body";
import {
  StyledSelectNative,
  StyledSelectNativeErrorText,
  StyledSelectNativeFrame,
  StyledSelectNativeHelperText,
  StyledSelectNativeLabel,
  StyledSelectNativeMissingPeer,
} from "./select-native.styled";
import type { SelectNativeProps, SelectNativeValue } from "./select-native-types";

/**
 * Single-choice picker rendered with a fully-native menu — SwiftUI
 * `Menu` on iOS (via `@expo/ui/community/menu`'s `MenuView`),
 * Jetpack Compose `DropdownMenu` on Android (same `MenuView`), and
 * `@expo/ui`'s `<Host><Picker>` HTML-select on web.
 *
 * ```tsx
 * const [country, setCountry] = useState<Country | null>(null);
 * <SelectNative
 *   options={COUNTRIES}
 *   value={country}
 *   onChange={setCountry}
 *   label="Country"
 * />
 * ```
 *
 * Because `@expo/ui` is an optional peer dep, ui-kraken doesn't
 * fail to import when the consumer omits it — the frame renders a
 * helpful "install @expo/ui" hint inline instead.
 *
 * ### Architecture — platform-split rendering
 *
 * This top-level file is the SHARED shell — palette resolution,
 * frame styling, chrome opt-in, label / helper / error rendering,
 * peer-missing fallback. The actual menu rendering lives in
 * `./native-picker-body.{ios,android,web,tsx}` — Metro picks the
 * right variant at bundle time. That way an iOS-only tweak to the
 * SwiftUI Menu integration can't regress Android, and vice versa.
 *
 * ### Chrome opt-in per platform
 *
 * Both `showBorderIOS` and `showBorderAndroid` default to `false`
 * — the picker renders as the fully-native native menu affordance
 * with no wrapper background / border / padding. Opt into the
 * framed look with either flag; each platform is independent.
 */
export function SelectNative<Value extends SelectNativeValue = string>({
  options,
  value,
  onChange,
  label,
  helperText,
  errorText,
  placeholderLabel = "Select…",
  disabled = false,
  showBorderIOS = false,
  showBorderAndroid = false,
  radius = "md",
  selectNativeColors,
  testID,
  ...rest
}: SelectNativeProps<Value>) {
  const { tokens } = useUIKit();
  const rootId = testID ?? "select-native";
  const palette = resolvePalette(tokens.selectNativeColors, selectNativeColors);
  const resolvedRadius = resolveRadius(radius);
  const isInvalid = errorText != null && errorText.length > 0;

  // Chrome visibility per platform. See `select-native-types.ts`
  // for the full rationale; short version: default off (100%
  // native look), errorText or missing-peer force it on so the
  // invalid / fallback state has visual framing.
  const showChromeForPlatform = Platform.select({
    ios: showBorderIOS,
    android: showBorderAndroid,
    default: showBorderIOS || showBorderAndroid,
  });
  const peerAvailable = isExpoUIAvailable();
  const showChrome = Boolean(showChromeForPlatform) || isInvalid || !peerAvailable;

  const frameBackground = showChrome
    ? disabled
      ? palette.backgroundDisabled
      : palette.background
    : "transparent";
  const frameBorder = isInvalid ? palette.borderError : palette.border;
  const frameBorderWidth = showChrome ? 1 : 0;
  const framePaddingHorizontal = showChrome ? "$uiSpacingMd" : 0;
  const framePaddingVertical = showChrome ? "$uiSpacingSm" : 0;
  const frameMinHeight = showChrome ? 48 : 0;

  const selectedOption = value != null ? (options.find((o) => o.value === value) ?? null) : null;
  const triggerTextColor = disabled
    ? palette.textDisabled
    : selectedOption != null
      ? palette.text
      : palette.placeholder;
  const chevronColor = disabled ? palette.textDisabled : palette.chevron;

  const fallback = !peerAvailable ? (
    <StyledSelectNativeMissingPeer testID={`${rootId}-missing-peer`} color={palette.errorText}>
      Install `@expo/ui` to enable SelectNative.
    </StyledSelectNativeMissingPeer>
  ) : undefined;

  return (
    <StyledSelectNative testID={rootId} {...rest}>
      {label != null && label.length > 0 && (
        <StyledSelectNativeLabel testID={`${rootId}-label`} color={palette.label}>
          {label}
        </StyledSelectNativeLabel>
      )}

      <StyledSelectNativeFrame
        testID={`${rootId}-frame`}
        disabled={disabled}
        backgroundColor={frameBackground}
        borderColor={frameBorder}
        borderWidth={frameBorderWidth}
        borderRadius={resolvedRadius}
        paddingHorizontal={framePaddingHorizontal}
        paddingVertical={framePaddingVertical}
        minHeight={frameMinHeight}
      >
        <NativePickerBody<Value>
          options={options}
          value={value}
          onChange={onChange}
          menuTitle={label}
          placeholderLabel={placeholderLabel}
          disabled={disabled}
          triggerTextColor={triggerTextColor}
          chevronColor={chevronColor}
          triggerAccessibilityLabel={label}
          testID={rootId}
          fallback={fallback}
        />
      </StyledSelectNativeFrame>

      {isInvalid ? (
        <StyledSelectNativeErrorText testID={`${rootId}-error-text`} color={palette.errorText}>
          {errorText}
        </StyledSelectNativeErrorText>
      ) : helperText != null && helperText.length > 0 ? (
        <StyledSelectNativeHelperText testID={`${rootId}-helper-text`} color={palette.helperText}>
          {helperText}
        </StyledSelectNativeHelperText>
      ) : null}
    </StyledSelectNative>
  );
}

export type {
  SelectNativeColorsInput,
  SelectNativeOption,
  SelectNativeProps,
  SelectNativeRadius,
  SelectNativeValue,
} from "./select-native-types";
