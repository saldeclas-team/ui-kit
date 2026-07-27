import { useMemo } from "react";

import { getExpoUIHost, getExpoUIPicker } from "./expo-ui-probe";
import type { NativePickerBodyProps } from "./native-picker-body-types";
import type { SelectNativeOption, SelectNativeValue } from "./select-native-types";

/**
 * Web SelectNative body.
 *
 * `MenuView` from `@expo/ui/community/menu` explicitly does NOT
 * fire actions on web (docs: "the trigger renders but actions do
 * not fire; a one-time `console.warn` is emitted"). So on web we
 * fall back to the original `<Host><Picker>` combo, which
 * `@expo/ui` maps to a native HTML `<select>`-like element.
 *
 * The iOS SwiftUI Menu intrinsic-size measurement bug that
 * pushed us off of `Host + Picker` on the mobile platforms does
 * not exist on web (there's no SwiftUI at all), so this fallback
 * is genuinely native and rhythm-correct.
 */
export function NativePickerBody<Value extends SelectNativeValue = string>({
  options,
  value,
  onChange,
  placeholderLabel,
  disabled,
  testID,
  fallback,
}: NativePickerBodyProps<Value>) {
  const Host = getExpoUIHost();
  const Picker = getExpoUIPicker();

  const { displayOptions, effectiveValue } = useMemo(() => {
    const hasMatch = value != null && options.some((o) => o.value === value);
    if (hasMatch) {
      return { displayOptions: options as SelectNativeOption<Value>[], effectiveValue: value };
    }
    const synthetic = (value ?? "") as Value;
    return {
      displayOptions: [
        { value: synthetic, label: placeholderLabel } as SelectNativeOption<Value>,
        ...options,
      ],
      effectiveValue: synthetic,
    };
  }, [options, value, placeholderLabel]);

  if (fallback != null) return <>{fallback}</>;
  if (Host == null || Picker == null) return null;

  return (
    <Host matchContents>
      <Picker
        testID={`${testID}-picker`}
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
  );
}
