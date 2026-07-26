import { useCallback, useRef } from "react";
import { Platform } from "react-native";

import type { DatePickerBodyProps } from "./date-picker-body-types";

/**
 * Web DatePicker body — renders a hidden native `<input type=…>`
 * (date / time / datetime-local) and forwards `focus()` /
 * `showPicker()` to it when the styled trigger is tapped. Uses
 * the browser's own date picker — same fluidity as iOS/Android
 * without pulling a JS calendar library into ui-kraken.
 *
 * `showPicker()` is Chromium / Edge / Firefox; on Safari the
 * `.focus()` fallback opens the picker via the input's normal
 * focus handling. If neither is supported the input becomes
 * focused and the user can type — always usable, never blocks.
 *
 * We deliberately do NOT ship a JS calendar UI. Web use in this
 * library is a compat / preview target; production web needs its
 * own design system anyway.
 */
export function DatePickerBody({
  value,
  onChange,
  disabled,
  mode,
  minimumDate,
  maximumDate,
  testID,
  renderTrigger,
  fallback,
}: DatePickerBodyProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleOpen = useCallback(() => {
    if (disabled) return;
    const el = inputRef.current;
    if (el == null) return;
    // showPicker() is not on all browsers' typings yet — cast narrowly.
    const withPicker = el as HTMLInputElement & { showPicker?: () => void };
    if (typeof withPicker.showPicker === "function") {
      withPicker.showPicker();
    } else {
      el.focus();
    }
  }, [disabled]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = event.target.value;
      if (raw === "") return;
      const parsed = new Date(raw);
      if (Number.isFinite(parsed.getTime())) onChange(parsed);
    },
    [onChange]
  );

  if (fallback != null) return <>{fallback}</>;
  if (Platform.OS !== "web") return null;

  const inputType = mode === "time" ? "time" : mode === "datetime" ? "datetime-local" : "date";
  const inputValue = value == null ? "" : toInputValue(value, inputType);

  return (
    <>
      {renderTrigger(handleOpen)}
      <input
        ref={inputRef}
        type={inputType}
        value={inputValue}
        onChange={handleChange}
        disabled={disabled}
        min={minimumDate == null ? undefined : toInputValue(minimumDate, inputType)}
        max={maximumDate == null ? undefined : toInputValue(maximumDate, inputType)}
        data-testid={`${testID}-picker`}
        style={{
          position: "absolute",
          opacity: 0,
          pointerEvents: "none",
          width: 0,
          height: 0,
        }}
      />
    </>
  );
}

/**
 * Format a JS Date into the string shape the given `<input>` type
 * expects (`YYYY-MM-DD` / `HH:MM` / `YYYY-MM-DDTHH:MM`). All
 * values are formatted in the browser's local timezone — mirrors
 * what the user sees in the picker.
 */
function toInputValue(date: Date, type: "date" | "time" | "datetime-local"): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  const min = pad(date.getMinutes());
  if (type === "time") return `${h}:${min}`;
  if (type === "datetime-local") return `${y}-${m}-${d}T${h}:${min}`;
  return `${y}-${m}-${d}`;
}
