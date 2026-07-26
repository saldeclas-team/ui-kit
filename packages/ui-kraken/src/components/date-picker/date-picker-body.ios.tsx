import { useCallback, useState } from "react";
import { Modal, Pressable, Text as RNText, View } from "react-native";

import { UIKitContext } from "../../provider/provider-context";
import { useUIKit } from "../../provider/use-ui-kit";
import { getExpoUIDateTimePicker } from "./expo-ui-datetime-probe";
import type { DatePickerBodyProps } from "./date-picker-body-types";

/**
 * iOS DatePicker body — opens a modal on tap and renders
 * `@expo/ui/community/datetime-picker` (`display="inline"` per
 * mode) with a Done button that commits the selection. Pattern
 * mirrors `select-native.ios.tsx`'s modal chrome — sheet slides
 * up from the bottom, tapping the backdrop closes without
 * changing the value.
 *
 * We keep a `staged` copy of the value while the picker is open
 * so cancel-by-tapping-backdrop discards partial edits; Done
 * commits `staged` to `onChange`. Without this, the picker's
 * incremental spinner scrolls would fire `onChange` on every
 * tick and there'd be no way to cancel.
 *
 * Non-obvious: the modal's `<UIKitContext.Provider>` re-mount is
 * required — RN's `<Modal>` renders in a separate view hierarchy
 * that doesn't inherit Tamagui / provider context. Same fix as
 * `select-bottom-sheet` and `select-native.ios`.
 */
export function DatePickerBody({
  value,
  onChange,
  disabled,
  mode,
  minimumDate,
  maximumDate,
  locale,
  is24Hour,
  appearance,
  chromeColors,
  testID,
  renderTrigger,
  fallback,
}: DatePickerBodyProps) {
  const contextValue = useUIKit();
  const NativeDateTimePicker = getExpoUIDateTimePicker();
  const [open, setOpen] = useState(false);
  const [staged, setStaged] = useState<Date>(value ?? new Date());

  const handleOpen = useCallback(() => {
    if (disabled) return;
    setStaged(value ?? new Date());
    setOpen(true);
  }, [disabled, value]);

  const handleClose = useCallback(() => setOpen(false), []);

  const handleDone = useCallback(() => {
    onChange(staged);
    setOpen(false);
  }, [onChange, staged]);

  const handleValueChange = useCallback((_event: unknown, date: Date | undefined) => {
    if (date != null) setStaged(date);
  }, []);

  if (fallback != null) return <>{fallback}</>;
  if (NativeDateTimePicker == null) return null;

  const sheetBackground = appearance === "dark" ? "#1C1C1E" : "#FFFFFF";
  const doneBackground = chromeColors.accent;

  return (
    <>
      {renderTrigger(handleOpen)}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
        testID={`${testID}-modal`}
      >
        <Pressable
          testID={`${testID}-modal-overlay`}
          onPress={handleClose}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "flex-end",
          }}
        >
          <Pressable
            onPress={() => {
              /* swallow — inner content shouldn't dismiss */
            }}
          >
            <View
              style={{
                backgroundColor: sheetBackground,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                paddingHorizontal: 16,
                paddingTop: 16,
                paddingBottom: 32,
              }}
            >
              <UIKitContext.Provider value={contextValue}>
                <NativeDateTimePicker
                  testID={`${testID}-picker`}
                  value={staged}
                  mode={mode}
                  minimumDate={minimumDate}
                  maximumDate={maximumDate}
                  locale={locale}
                  is24Hour={is24Hour}
                  display="inline"
                  accentColor={chromeColors.accent}
                  themeVariant={appearance}
                  onValueChange={handleValueChange}
                />
                <Pressable
                  testID={`${testID}-done`}
                  onPress={handleDone}
                  style={{
                    marginTop: 16,
                    backgroundColor: doneBackground,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    alignItems: "center",
                  }}
                >
                  <RNText style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "600" }}>
                    Done
                  </RNText>
                </Pressable>
              </UIKitContext.Provider>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
