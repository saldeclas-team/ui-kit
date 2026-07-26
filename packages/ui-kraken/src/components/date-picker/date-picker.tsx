import { useMemo } from "react";
import { Pressable } from "react-native";

import { useUIKit } from "../../provider/use-ui-kit";
import { resolveRadiusNumeric } from "../../utils/radius";
import { resolvePalette } from "../../utils/resolve-palette";
import { DatePickerBody } from "./date-picker-body";
import {
  StyledDatePicker,
  StyledDatePickerChevron,
  StyledDatePickerErrorText,
  StyledDatePickerHelperText,
  StyledDatePickerLabel,
  StyledDatePickerMissingPeer,
  StyledDatePickerTrigger,
  StyledDatePickerTriggerText,
} from "./date-picker-styled";
import { isDateTimePickerAvailable } from "./expo-ui-datetime-probe";
import type { DatePickerMode, DatePickerProps, DateTimeStyle } from "./date-picker-types";

/**
 * Native date / time / datetime picker with a Tamagui-styled
 * trigger. Wraps `@expo/ui/community/datetime-picker` — iOS opens
 * an inline picker in a modal with a Done button; Android opens
 * the OS's Material 3 dialog directly.
 *
 * ```tsx
 * const [date, setDate] = useState<Date | null>(null);
 * <DatePicker
 *   label="Date of birth"
 *   value={date}
 *   onChange={setDate}
 *   maximumDate={new Date()}
 * />
 * ```
 *
 * Set `mode="time"` for a clock picker or `mode="datetime"` for
 * combined date + time.
 *
 * ### Architecture — platform-split rendering
 *
 * This top-level file is the SHARED shell (palette resolution,
 * trigger chrome, label / helper / error rendering, peer-missing
 * fallback, `Intl.DateTimeFormat` trigger text). The native
 * picker call lives in `./date-picker-body.{ios,android,web,tsx}`
 * so platform-specific chrome (iOS modal, Android dialog, web
 * `<input>`) can evolve independently without regressing the
 * others. See `native-bridges-platform-split` memory + the SKILL
 * § 3.5 rule.
 */
export function DatePicker({
  value,
  onChange,
  mode = "date",
  label,
  helperText,
  errorText,
  placeholderLabel,
  disabled = false,
  minimumDate,
  maximumDate,
  locale,
  dateStyle = "medium",
  timeStyle = "short",
  formatValue,
  is24Hour,
  radius = "md",
  datePickerColors,
  testID,
  ...rest
}: DatePickerProps) {
  const { tokens, activeTheme } = useUIKit();
  const rootId = testID ?? "date-picker";
  const palette = resolvePalette(tokens.datePickerColors, datePickerColors);
  const resolvedRadius = resolveRadiusNumeric(radius, tokens.radius);
  const isInvalid = errorText != null && errorText.length > 0;
  const peerAvailable = isDateTimePickerAvailable();

  const triggerText = useMemo(
    () =>
      resolveTriggerText({
        value,
        mode,
        dateStyle,
        timeStyle,
        locale,
        formatValue,
        placeholderLabel,
      }),
    [value, mode, dateStyle, timeStyle, locale, formatValue, placeholderLabel]
  );

  const isEmpty = value == null;
  const triggerTextColor = resolveTriggerTextColor({ palette, disabled, isEmpty });
  const triggerBackground = disabled ? palette.backgroundDisabled : palette.background;
  const triggerBorderColor = resolveTriggerBorderColor({ palette, isInvalid });

  const fallback = !peerAvailable ? (
    <StyledDatePickerMissingPeer testID={`${rootId}-missing-peer`} color={palette.errorText}>
      Install `@expo/ui` to enable DatePicker.
    </StyledDatePickerMissingPeer>
  ) : undefined;

  const renderTrigger = (open: () => void) => (
    <Pressable
      testID={`${rootId}-trigger`}
      onPress={open}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <StyledDatePickerTrigger
        backgroundColor={triggerBackground}
        borderColor={triggerBorderColor}
        borderRadius={resolvedRadius}
      >
        <StyledDatePickerTriggerText
          testID={`${rootId}-trigger-text`}
          color={triggerTextColor}
          numberOfLines={1}
        >
          {triggerText}
        </StyledDatePickerTriggerText>
        <StyledDatePickerChevron color={palette.chevron}>▼</StyledDatePickerChevron>
      </StyledDatePickerTrigger>
    </Pressable>
  );

  return (
    <StyledDatePicker testID={rootId} accessibilityLabel={label} {...rest}>
      {label != null && label.length > 0 && (
        <StyledDatePickerLabel testID={`${rootId}-label`} color={palette.label}>
          {label}
        </StyledDatePickerLabel>
      )}

      <DatePickerBody
        value={value}
        onChange={onChange}
        disabled={disabled}
        mode={mode}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        locale={locale}
        is24Hour={is24Hour}
        appearance={activeTheme}
        chromeColors={{
          accent: palette.accent,
          background: palette.background,
          border: palette.border,
          borderFocused: palette.borderFocused,
        }}
        testID={rootId}
        renderTrigger={renderTrigger}
        fallback={fallback}
      />

      {renderFooter({ isInvalid, errorText, helperText, palette, rootId })}
    </StyledDatePicker>
  );
}

/**
 * Format a value for the trigger. Precedence: caller's
 * `formatValue` (full escape hatch) > mode-appropriate
 * `Intl.DateTimeFormat` presets > mode-appropriate placeholder.
 * Extracted so the shell body reads flat instead of nested
 * ternaries — one branch per source-of-truth.
 */
function resolveTriggerText({
  value,
  mode,
  dateStyle,
  timeStyle,
  locale,
  formatValue,
  placeholderLabel,
}: {
  value: Date | null;
  mode: DatePickerMode;
  dateStyle: DateTimeStyle;
  timeStyle: DateTimeStyle;
  locale?: string;
  formatValue?: (date: Date) => string;
  placeholderLabel?: string;
}): string {
  if (value == null) return placeholderLabel ?? defaultPlaceholder(mode);
  if (formatValue != null) return formatValue(value);
  return new Intl.DateTimeFormat(locale, buildIntlOptions(mode, dateStyle, timeStyle)).format(
    value
  );
}

/**
 * Mode-appropriate placeholder copy. Keeps default UX legible
 * per mode without forcing consumers to override for basic use.
 */
function defaultPlaceholder(mode: DatePickerMode): string {
  if (mode === "time") return "Select time…";
  if (mode === "datetime") return "Select date & time…";
  return "Select date…";
}

/**
 * Build `Intl.DateTimeFormat` options from mode + styles. Keeps
 * the resolveTriggerText body single-expression.
 */
function buildIntlOptions(
  mode: DatePickerMode,
  dateStyle: DateTimeStyle,
  timeStyle: DateTimeStyle
): Intl.DateTimeFormatOptions {
  if (mode === "time") return { timeStyle };
  if (mode === "datetime") return { dateStyle, timeStyle };
  return { dateStyle };
}

/**
 * Trigger text color depends on disabled first, then empty state.
 * Extracted to avoid nested ternaries — 3 branches, 3 lines.
 */
function resolveTriggerTextColor({
  palette,
  disabled,
  isEmpty,
}: {
  palette: { text: string; textDisabled: string; placeholder: string };
  disabled: boolean;
  isEmpty: boolean;
}): string {
  if (disabled) return palette.textDisabled;
  if (isEmpty) return palette.placeholder;
  return palette.text;
}

/**
 * Trigger border color — error state overrides the regular
 * palette border. Extracted for symmetry with the text-color
 * helper above and to keep the shell body flat.
 */
function resolveTriggerBorderColor({
  palette,
  isInvalid,
}: {
  palette: { border: string; borderError: string };
  isInvalid: boolean;
}): string {
  return isInvalid ? palette.borderError : palette.border;
}

/**
 * Footer row — error takes precedence over helper. Extracted to
 * a helper to keep the JSX flat (no in-JSX ternary chain).
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
      <StyledDatePickerErrorText testID={`${rootId}-error-text`} color={palette.errorText}>
        {errorText}
      </StyledDatePickerErrorText>
    );
  }
  if (helperText != null && helperText.length > 0) {
    return (
      <StyledDatePickerHelperText testID={`${rootId}-helper-text`} color={palette.helperText}>
        {helperText}
      </StyledDatePickerHelperText>
    );
  }
  return null;
}

export type {
  DatePickerColorsInput,
  DatePickerMode,
  DatePickerProps,
  DatePickerRadius,
  DateTimeStyle,
} from "./date-picker-types";
