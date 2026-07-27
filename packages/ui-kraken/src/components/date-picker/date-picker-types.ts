import type { GetProps } from "tamagui";

import type { DatePickerColors } from "../../tokens/tokens-types";
import type { RadiusValue } from "../../utils/radius";
import type { StyledDatePicker } from "./date-picker-styled";

/**
 * Radius scale for the trigger corner. Same shape as
 * `SelectRadius` / `SegmentedControlRadius` — accepts a
 * numeric px value or a token key (`"none" | "sm" | "md" | "lg" | "pill"`).
 * Default: `"md"`.
 */
export type DatePickerRadius = RadiusValue;

/**
 * Partial override for a DatePicker's palette. Passed through the
 * `datePickerColors` prop for per-instance theming; unspecified slots
 * fall back to the provider-resolved defaults.
 */
export type DatePickerColorsInput = Partial<DatePickerColors>;

/**
 * Which native picker to invoke.
 *
 * - `"date"` (default) — calendar / spinner date selection.
 * - `"time"` — clock / spinner time selection.
 * - `"datetime"` — combined date + time.
 *
 * Passed through unchanged to `@expo/ui/community/datetime-picker`.
 * Trigger text formatting adjusts to match: date uses `dateStyle`,
 * time uses `timeStyle`, datetime uses both.
 */
export type DatePickerMode = "date" | "time" | "datetime";

/**
 * Preset shorthand for `Intl.DateTimeFormat`'s `dateStyle` and
 * `timeStyle` options. Mirrors the standard API values so consumers
 * who already know `Intl` don't need to learn a second vocabulary.
 */
export type DateTimeStyle = "short" | "medium" | "long" | "full";

/**
 * Public props for `<DatePicker>` — a Tamagui-styled trigger that
 * opens `@expo/ui/community/datetime-picker` on tap. Handles the
 * `date` / `time` / `datetime` modes from v1.
 *
 * Requires the optional peer `@expo/ui`. When missing, the trigger
 * renders a hint pointing consumers to install it (via the shared
 * probe pattern) — the app does not crash.
 */
export interface DatePickerProps extends Omit<
  GetProps<typeof StyledDatePicker>,
  "children" | "onChange" | "onPress" | "disabled"
> {
  /** Currently-selected value, or `null` when unset. Controlled. */
  value: Date | null;
  /** Fires with the picked value. Never receives null. */
  onChange: (date: Date) => void;
  /** Picker mode. Default `"date"`. */
  mode?: DatePickerMode;
  /** Optional bold heading above the trigger. */
  label?: string;
  /** Muted helper copy below the trigger. Overridden by `errorText`. */
  helperText?: string;
  /** Error copy below the trigger. Overrides `helperText` when set. */
  errorText?: string;
  /**
   * Text shown inside the trigger when `value` is `null`. Defaults
   * shift with `mode`: `"Select date…"` / `"Select time…"` /
   * `"Select date & time…"`.
   */
  placeholderLabel?: string;
  /** Disable the trigger — native picker will not open. */
  disabled?: boolean;
  /** Earliest selectable value (passed through to the native picker). */
  minimumDate?: Date;
  /** Latest selectable value. */
  maximumDate?: Date;
  /**
   * BCP-47 locale for the trigger's `Intl.DateTimeFormat` output. When
   * omitted, the runtime uses the system default locale.
   */
  locale?: string;
  /**
   * Preset shorthand for the trigger's date format (used in `date` and
   * `datetime` modes). Default: `"medium"`.
   */
  dateStyle?: DateTimeStyle;
  /**
   * Preset shorthand for the trigger's time format (used in `time` and
   * `datetime` modes). Default: `"short"`.
   */
  timeStyle?: DateTimeStyle;
  /**
   * Full escape hatch — receives the current `Date` and returns the
   * exact trigger text to render. Overrides `dateStyle` / `timeStyle`
   * / `locale`.
   */
  formatValue?: (date: Date) => string;
  /**
   * Use a 24-hour clock (applies to `time` and `datetime` modes).
   * Android-only per `@expo/ui`'s API — iOS follows the device
   * locale's 12h/24h convention.
   */
  is24Hour?: boolean;
  /** Trigger border radius. Default `"md"`. */
  radius?: DatePickerRadius;
  /**
   * Per-instance color overrides. Merged on top of the provider-
   * resolved palette; unspecified slots fall through.
   */
  datePickerColors?: DatePickerColorsInput;
  /**
   * Root testID. Sub-elements derive:
   * `-label`, `-trigger`, `-trigger-text`, `-helper-text`, `-error-text`,
   * `-modal` (iOS), `-modal-overlay` (iOS), `-picker`, `-done` (iOS),
   * `-missing-peer`.
   */
  testID?: string;
}
