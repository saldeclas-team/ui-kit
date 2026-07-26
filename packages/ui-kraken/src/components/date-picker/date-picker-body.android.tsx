import { useCallback, useState } from "react";

import { getExpoUIDateTimePicker } from "./expo-ui-datetime-probe";
import type { DatePickerBodyProps } from "./date-picker-body-types";

/**
 * Android DatePicker body — opens the native Material 3 date /
 * time dialog on tap via `@expo/ui/community/datetime-picker`'s
 * `presentation="dialog"`. Unlike iOS we do NOT wrap in a Modal
 * — Android's picker is a built-in dialog managed by the OS.
 * Consequently there's no Done button and no staged value:
 * tapping OK inside the native dialog fires `onValueChange` with
 * the final selection, tapping Cancel fires `onDismiss` without
 * changing anything.
 *
 * The picker is mounted conditionally (open flag) so a fresh
 * dialog instance is created each time — this avoids the
 * dialog-stuck-open state that happens if you toggle `presentation`
 * on a persistent instance.
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
  const NativeDateTimePicker = getExpoUIDateTimePicker();
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => {
    if (disabled) return;
    setOpen(true);
  }, [disabled]);

  const handleDismiss = useCallback(() => setOpen(false), []);

  const handleValueChange = useCallback(
    (_event: unknown, date: Date | undefined) => {
      if (date != null) onChange(date);
      setOpen(false);
    },
    [onChange]
  );

  if (fallback != null) return <>{fallback}</>;
  if (NativeDateTimePicker == null) return null;

  return (
    <>
      {renderTrigger(handleOpen)}
      {open && (
        <NativeDateTimePicker
          testID={`${testID}-picker`}
          value={value ?? new Date()}
          mode={mode}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          locale={locale}
          is24Hour={is24Hour}
          presentation="dialog"
          accentColor={chromeColors.accent}
          themeVariant={appearance}
          onValueChange={handleValueChange}
          onDismiss={handleDismiss}
        />
      )}
    </>
  );
}
