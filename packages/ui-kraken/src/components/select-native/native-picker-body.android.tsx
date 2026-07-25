import { Text as TamaguiText, XStack } from "tamagui";

import { getExpoUIMenuView } from "./expo-ui-probe";
import type { NativePickerBodyProps } from "./native-picker-body-types";
import type { SelectNativeValue } from "./select-native-types";

/**
 * Android-specific SelectNative body.
 *
 * Same `MenuView` pattern as iOS — Jetpack Compose `DropdownMenu`
 * anchored to our own trigger. Kept as a separate platform file
 * (mirror of `.ios.tsx`) so future Android-only tweaks land here
 * without risking the iOS impl.
 *
 * Notes vs. iOS:
 *
 * - Android's `DropdownMenu` fires `onOpenMenu` / `onCloseMenu`
 *   (SwiftUI does not) — currently unused in this shell, but
 *   they're the extension point for a future controlled-open
 *   API without touching iOS.
 * - `state: "on"` renders a leading checkmark in Compose as well
 *   as SwiftUI, so the selection UX is identical.
 */
export function NativePickerBody<Value extends SelectNativeValue = string>({
  options,
  value,
  onChange,
  menuTitle,
  placeholderLabel,
  disabled,
  triggerTextColor,
  chevronColor,
  triggerAccessibilityLabel,
  testID,
  fallback,
}: NativePickerBodyProps<Value>) {
  const MenuView = getExpoUIMenuView();

  const selectedOption = value != null ? (options.find((o) => o.value === value) ?? null) : null;
  const triggerText = selectedOption != null ? selectedOption.label : placeholderLabel;

  if (fallback != null) return <>{fallback}</>;

  if (MenuView == null) {
    return (
      <XStack alignItems="center" flex={1}>
        <TamaguiText testID={`${testID}-trigger-text`} color={triggerTextColor} flexShrink={1}>
          {triggerText}
        </TamaguiText>
      </XStack>
    );
  }

  return (
    <MenuView
      testID={`${testID}-menu`}
      title={menuTitle}
      shouldOpenOnLongPress={false}
      actions={options.map((opt) => ({
        id: String(opt.value),
        title: opt.label,
        state: opt.value === value ? "on" : "off",
        attributes: disabled ? { disabled: true } : undefined,
      }))}
      onPressAction={(event) => {
        if (disabled) return;
        const picked = options.find((o) => String(o.value) === event.nativeEvent.event);
        if (picked) onChange(picked.value);
      }}
    >
      <XStack
        testID={`${testID}-trigger`}
        alignItems="center"
        justifyContent="space-between"
        flex={1}
        accessibilityRole="combobox"
        accessibilityLabel={triggerAccessibilityLabel ?? placeholderLabel}
        accessibilityState={{ disabled }}
      >
        <TamaguiText
          testID={`${testID}-trigger-text`}
          color={triggerTextColor}
          fontSize={15}
          lineHeight={20}
          fontWeight="500"
          flexShrink={1}
        >
          {triggerText}
        </TamaguiText>
        <TamaguiText
          color={chevronColor}
          fontSize={12}
          lineHeight={16}
          fontWeight="700"
          marginLeft={8}
        >
          ▼
        </TamaguiText>
      </XStack>
    </MenuView>
  );
}
