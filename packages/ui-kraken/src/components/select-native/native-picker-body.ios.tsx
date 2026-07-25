import { Text as TamaguiText, XStack } from "tamagui";

import { getExpoUIMenuView } from "./expo-ui-probe";
import type { NativePickerBodyProps } from "./native-picker-body-types";
import type { SelectNativeValue } from "./select-native-types";

/**
 * iOS-specific SelectNative body.
 *
 * Uses `MenuView` from `@expo/ui/community/menu` (SwiftUI `Menu`
 * on iOS) — the drop-in native menu that wraps a consumer trigger.
 * This is a genuinely different pattern from the `<Host><Picker>`
 * combo used elsewhere: instead of asking @expo/ui to render both
 * the trigger AND the menu (which triggers the SwiftUI Menu
 * intrinsic-size measurement race causing the "raised" bug), we
 * render OUR own trigger (Tamagui `Text` + chevron) inside
 * `MenuView.children` and let MenuView catch the tap. RN layout
 * is deterministic because the trigger is a plain RN view; no
 * bridge measurement race.
 *
 * Selection is indicated via each action's `state: "on" | "off"`
 * — SwiftUI Menu renders a checkmark next to the matching row,
 * matching the native "sort by" / "filter by" menu affordance in
 * iOS system apps. No placeholder-item injection needed.
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

  // If the consumer passed a fallback (peer-missing state) the
  // shell wants that rendered instead of the menu.
  if (fallback != null) return <>{fallback}</>;

  // Peer dep not installed — render just the trigger row with
  // no MenuView wrapper. The shell shows an install hint via
  // its own `fallback` path.
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
