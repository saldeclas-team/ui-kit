import { useCallback } from "react";

import { useUIKit } from "../../provider/use-ui-kit";
import { resolvePalette } from "../../utils/resolve-palette";
import { DatePicker } from "../date-picker";
import type { DatePickerColorsInput } from "../date-picker";
import {
  StyledDateRangePicker,
  StyledDateRangePickerErrorText,
  StyledDateRangePickerHelperText,
  StyledDateRangePickerHorizontalRow,
  StyledDateRangePickerLabel,
  StyledDateRangePickerSeparator,
  StyledDateRangePickerVerticalStack,
} from "./date-range-picker-styled";
import type { DateRangePickerProps } from "./date-range-picker-types";

/**
 * Controlled start/end date range picker. Composes two
 * `<DatePicker>` triggers with auto-clamping (end always ≥
 * start) and shared formatting / palette / disabled state.
 *
 * ```tsx
 * const [start, setStart] = useState<Date | null>(null);
 * const [end, setEnd] = useState<Date | null>(null);
 * <DateRangePicker
 *   label="Vacation"
 *   startDate={start}
 *   endDate={end}
 *   onChange={(s, e) => { setStart(s); setEnd(e); }}
 * />
 * ```
 *
 * ### Architecture
 *
 * No platform-split needed at this level — both internal
 * `<DatePicker>` instances handle the native bridge themselves
 * (they own the `.ios.tsx` / `.android.tsx` / `.web.tsx` split
 * and the `@expo/ui` probe). DateRangePicker is a pure
 * composition wrapper: it maps its palette to the DatePicker
 * palette shape (dropping the range-only `separator` slot),
 * forwards every relevant prop, and manages the auto-clamp
 * behavior on top.
 *
 * ### Auto-clamp
 *
 * When `startDate` moves past `endDate`, `onChange` fires with
 * `(newStart, null)` — the end clears rather than jumping to
 * match the new start (which would surprise the user more).
 * The end picker's `minimumDate` is `startDate ?? minimumDate`
 * so the native picker won't offer invalid values in the first
 * place.
 */
export function DateRangePicker({
  startDate,
  endDate,
  onChange,
  mode = "date",
  orientation = "vertical",
  label,
  helperText,
  errorText,
  startLabel = "Start",
  endLabel = "End",
  startPlaceholder,
  endPlaceholder,
  disabled = false,
  minimumDate,
  maximumDate,
  locale,
  dateStyle,
  timeStyle,
  formatValue,
  is24Hour,
  radius = "md",
  dateRangePickerColors,
  testID,
  ...rest
}: DateRangePickerProps) {
  const { tokens } = useUIKit();
  const rootId = testID ?? "date-range-picker";
  const palette = resolvePalette(tokens.dateRangePickerColors, dateRangePickerColors);
  const isInvalid = errorText != null && errorText.length > 0;

  // Map the DateRangePicker palette to the DatePicker palette
  // shape — same 13 slots, minus the range-only `separator`.
  // Both internal pickers get the identical palette. When
  // `errorText` is set, we also want both trigger borders to go
  // red, which DatePicker does natively when it receives an
  // `errorText` prop — but we don't want to render the child
  // error copy under each trigger (the shell renders one shared
  // error line). Solution: pass a per-instance override that
  // paints `border` = `borderError` when the range is invalid,
  // and leave the child `errorText` unset.
  const childColors: DatePickerColorsInput = isInvalid
    ? { ...toDatePickerPalette(palette), border: palette.borderError }
    : toDatePickerPalette(palette);

  const handleStartChange = useCallback(
    (nextStart: Date) => {
      // Clear the end when the new start is later than it.
      // Native pickers already enforce this via `minimumDate` on
      // the end picker (see below), but if the current end was
      // set BEFORE the new start was picked, we still need to
      // reconcile.
      const shouldClearEnd = endDate != null && nextStart.getTime() > endDate.getTime();
      onChange(nextStart, shouldClearEnd ? null : endDate);
    },
    [endDate, onChange]
  );

  const handleEndChange = useCallback(
    (nextEnd: Date) => {
      onChange(startDate, nextEnd);
    },
    [startDate, onChange]
  );

  const StartPicker = (
    <DatePicker
      testID={`${rootId}-start`}
      value={startDate}
      onChange={handleStartChange}
      mode={mode}
      label={startLabel}
      placeholderLabel={startPlaceholder}
      disabled={disabled}
      minimumDate={minimumDate}
      maximumDate={maximumDate}
      locale={locale}
      dateStyle={dateStyle}
      timeStyle={timeStyle}
      formatValue={formatValue}
      is24Hour={is24Hour}
      radius={radius}
      datePickerColors={childColors}
      flex={orientation === "horizontal" ? 1 : undefined}
    />
  );

  const EndPicker = (
    <DatePicker
      testID={`${rootId}-end`}
      value={endDate}
      onChange={handleEndChange}
      mode={mode}
      label={endLabel}
      placeholderLabel={endPlaceholder}
      disabled={disabled}
      // Constrain the native picker so the user can't pick an
      // end before the current start (belt AND suspenders with
      // the shell-level clamp).
      minimumDate={startDate ?? minimumDate}
      maximumDate={maximumDate}
      locale={locale}
      dateStyle={dateStyle}
      timeStyle={timeStyle}
      formatValue={formatValue}
      is24Hour={is24Hour}
      radius={radius}
      datePickerColors={childColors}
      flex={orientation === "horizontal" ? 1 : undefined}
    />
  );

  return (
    <StyledDateRangePicker testID={rootId} accessibilityLabel={label} {...rest}>
      {label != null && label.length > 0 && (
        <StyledDateRangePickerLabel testID={`${rootId}-label`} color={palette.label}>
          {label}
        </StyledDateRangePickerLabel>
      )}

      {orientation === "horizontal" ? (
        <StyledDateRangePickerHorizontalRow>
          {StartPicker}
          <StyledDateRangePickerSeparator testID={`${rootId}-separator`} color={palette.separator}>
            →
          </StyledDateRangePickerSeparator>
          {EndPicker}
        </StyledDateRangePickerHorizontalRow>
      ) : (
        <StyledDateRangePickerVerticalStack>
          {StartPicker}
          {EndPicker}
        </StyledDateRangePickerVerticalStack>
      )}

      {renderFooter({ isInvalid, errorText, helperText, palette, rootId })}
    </StyledDateRangePicker>
  );
}

/**
 * Strip the range-only `separator` slot from a DateRangePicker
 * palette so it can be passed to `<DatePicker>` as its own
 * palette override. Type shape matches `DatePickerColorsInput`.
 */
function toDatePickerPalette(palette: {
  background: string;
  backgroundDisabled: string;
  border: string;
  borderFocused: string;
  borderError: string;
  text: string;
  textDisabled: string;
  placeholder: string;
  chevron: string;
  label: string;
  helperText: string;
  errorText: string;
  accent: string;
}): DatePickerColorsInput {
  return {
    background: palette.background,
    backgroundDisabled: palette.backgroundDisabled,
    border: palette.border,
    borderFocused: palette.borderFocused,
    borderError: palette.borderError,
    text: palette.text,
    textDisabled: palette.textDisabled,
    placeholder: palette.placeholder,
    chevron: palette.chevron,
    label: palette.label,
    helperText: palette.helperText,
    errorText: palette.errorText,
    accent: palette.accent,
  };
}

/**
 * Footer row — error takes precedence over helper. Extracted to
 * keep the JSX flat (no in-JSX ternary chain).
 */
function renderFooter({
  isInvalid,
  errorText,
  helperText,
  palette,
  rootId,
}: {
  isInvalid: boolean;
  errorText?: string;
  helperText?: string;
  palette: { errorText: string; helperText: string };
  rootId: string;
}) {
  if (isInvalid) {
    return (
      <StyledDateRangePickerErrorText testID={`${rootId}-error-text`} color={palette.errorText}>
        {errorText}
      </StyledDateRangePickerErrorText>
    );
  }
  if (helperText != null && helperText.length > 0) {
    return (
      <StyledDateRangePickerHelperText testID={`${rootId}-helper-text`} color={palette.helperText}>
        {helperText}
      </StyledDateRangePickerHelperText>
    );
  }
  return null;
}

export type {
  DateRangePickerColorsInput,
  DateRangePickerMode,
  DateRangePickerOrientation,
  DateRangePickerProps,
  DateRangePickerRadius,
  DateTimeStyle,
} from "./date-range-picker-types";
