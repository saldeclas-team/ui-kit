import { useMemo } from "react";

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

  const frameBackground = disabled ? palette.backgroundDisabled : palette.background;
  const frameBorder = isInvalid ? palette.borderError : palette.border;

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
        borderRadius={resolvedRadius}
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
