import { useMemo } from "react";
import { Platform } from "react-native";

import { useUIKit } from "../../provider/use-ui-kit";
import { resolveRadius } from "../../utils/radius";
import { resolvePalette } from "../../utils/resolve-palette";
import { getExpoUIHost, getExpoUIPicker, isExpoUIAvailable } from "./expo-ui-probe";
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
 * Single-choice picker rendered with the fully-native
 * `@expo/ui` `Picker`. SwiftUI `Menu` on iOS + Jetpack Compose
 * `DropdownMenu` on Android — the trigger and the option list
 * are painted by the platform, not by us.
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
 * fail to import when the consumer omits it. Instead the frame
 * renders a helpful "install @expo/ui" hint inline so consumers
 * see the problem and can fix it without a crash.
 *
 * Palette is `tokens.selectNativeColors` on the provider,
 * overridable per-instance via `selectNativeColors?`. Only the
 * wrapper chrome is themed — the interior of the picker (button
 * text, chevron, menu row highlight) is painted by the platform.
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

  // Chrome visibility gates per-platform. Both flags default to
  // `false` so the picker reads as 100% native — SwiftUI `Menu` /
  // Compose `DropdownMenu` are borderless AND transparent by
  // default; the frame outline + background + padding + minHeight
  // were a form-field-parity choice for consumers who prefer
  // "input-shaped" pickers. Opt in when you want it.
  //
  // "Chrome" is all-or-nothing per platform — background, border,
  // padding, and minHeight travel together so the frame either
  // fully wraps the picker like an Input OR disappears entirely
  // and lets the native picker render at its intrinsic size.
  //
  // Two states force the chrome on regardless of the flags,
  // because both need visual framing to read as invalid:
  // - `errorText` set (invalid state).
  // - peer dep missing (fallback "install X" hint needs a box).
  const showChromeForPlatform = Platform.select({
    ios: showBorderIOS,
    android: showBorderAndroid,
    default: showBorderIOS || showBorderAndroid,
  });
  const showChrome = Boolean(showChromeForPlatform) || isInvalid || !isExpoUIAvailable();

  const frameBackground = showChrome
    ? disabled
      ? palette.backgroundDisabled
      : palette.background
    : "transparent";
  const frameBorder = isInvalid ? palette.borderError : palette.border;
  const frameBorderWidth = showChrome ? 1 : 0;
  const framePaddingHorizontal = showChrome ? "$uiSpacingMd" : 0;
  const framePaddingVertical = showChrome ? "$uiSpacingSm" : 0;
  // Keep the frame at the iOS/Android minimum touch target (44 px)
  // even when the chrome is off, so the native picker gets vertical
  // breathing room and the surrounding label + helper text sit at
  // the same rhythm as the framed variant. Without this the frame
  // collapses to the picker's intrinsic ~25 px and the label reads
  // as "glued" to the trigger. When chrome is on, bump to 48 px to
  // match Input / CurrencyInput for form-field parity.
  const frameMinHeight = showChrome ? 48 : 44;

  // If `value` doesn't match any option (typical null / initial state),
  // synthesize a placeholder item so the native Picker has a matching
  // selectedValue on both iOS + Android. Without this the Android
  // Compose picker silently drops taps because it can't resolve
  // `selectedValue` to a `Picker.Item`.
  const { displayOptions, effectiveValue } = useMemo(() => {
    const hasMatch = value != null && options.some((o) => o.value === value);
    if (hasMatch) {
      return { displayOptions: options, effectiveValue: value as Value };
    }
    const synthetic: Value = (value ?? ("" as unknown as Value)) as Value;
    return {
      displayOptions: [{ value: synthetic, label: placeholderLabel }, ...options],
      effectiveValue: synthetic,
    };
  }, [options, value, placeholderLabel]);

  const Host = getExpoUIHost();
  const Picker = getExpoUIPicker();
  const peerAvailable = isExpoUIAvailable();

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
        {peerAvailable && Host != null && Picker != null ? (
          <Host matchContents>
            <Picker
              testID={`${rootId}-picker`}
              selectedValue={effectiveValue as string | number}
              onValueChange={(next: string | number) => onChange(next as Value)}
              appearance="menu"
              enabled={!disabled}
            >
              {displayOptions.map((opt) => (
                <Picker.Item
                  key={String(opt.value)}
                  value={opt.value as string | number}
                  label={opt.label}
                />
              ))}
            </Picker>
          </Host>
        ) : (
          <StyledSelectNativeMissingPeer
            testID={`${rootId}-missing-peer`}
            color={palette.errorText}
          >
            Install `@expo/ui` to enable SelectNative.
          </StyledSelectNativeMissingPeer>
        )}
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
