import type { GetProps } from "tamagui";

import type { DateRangePickerColors } from "../../tokens/tokens-types";
import type { RadiusValue } from "../../utils/radius";
import type { StyledDateRangePicker } from "./date-range-picker-styled";

/**
 * Radius scale for both trigger corners. Same shape as
 * `DatePickerRadius` — numeric px or token key. Default `"md"`.
 */
export type DateRangePickerRadius = RadiusValue;

/**
 * Partial override for a DateRangePicker's palette. Applied to
 * BOTH the start and end triggers; unspecified slots fall back
 * to the provider-resolved defaults.
 */
export type DateRangePickerColorsInput = Partial<DateRangePickerColors>;

/**
 * Picker mode applied to both bounds. `"time"` is intentionally
 * excluded — a "time range" is a rare use case and not what
 * "date range" implies to consumers. Add in a follow-up if a
 * real need surfaces.
 */
export type DateRangePickerMode = "date" | "datetime";

/**
 * Layout direction for the two triggers.
 *
 * - `"vertical"` (default) — Start above End in a YStack. Best
 *   on mobile: full-width triggers, room for readable labels.
 * - `"horizontal"` — side-by-side in an XStack with `flex: 1`
 *   each and an optional separator glyph between them. Best on
 *   tablet / wide surfaces.
 */
export type DateRangePickerOrientation = "vertical" | "horizontal";

/**
 * Preset shorthand for `Intl.DateTimeFormat`'s `dateStyle` /
 * `timeStyle` options. Mirrors DatePicker's `DateTimeStyle`.
 */
export type DateTimeStyle = "short" | "medium" | "long" | "full";

/**
 * Public props for `<DateRangePicker>` — composes two
 * `<DatePicker>` triggers as a controlled start/end range with
 * auto-clamping (end always ≥ start).
 *
 * Requires the optional peer `@expo/ui` (same as DatePicker /
 * SelectNative / SegmentedControl). Missing peer renders the
 * install-hint fallback per trigger; the app does not crash.
 */
export interface DateRangePickerProps extends Omit<
  GetProps<typeof StyledDateRangePicker>,
  "children" | "onChange" | "onPress" | "disabled"
> {
  /** Range start, or `null` when unset. Controlled. */
  startDate: Date | null;
  /** Range end, or `null` when unset. Controlled. */
  endDate: Date | null;
  /**
   * Fires when either bound changes. Called with the FULL new
   * range so consumers have one state update site. When picking
   * a new start that violates the current end, the callback
   * fires once with `(newStart, null)` — no separate clamp
   * event.
   */
  onChange: (startDate: Date | null, endDate: Date | null) => void;
  /** Picker mode for both bounds. Default `"date"`. */
  mode?: DateRangePickerMode;
  /** Layout direction. Default `"vertical"`. */
  orientation?: DateRangePickerOrientation;
  /** Optional bold heading above both triggers (single, spans the group). */
  label?: string;
  /** Muted helper copy below the range. Overridden by `errorText`. */
  helperText?: string;
  /**
   * Error copy below the range. Overrides `helperText` and
   * paints BOTH trigger borders red so the invalid state is
   * unambiguous.
   */
  errorText?: string;
  /** Label above the start trigger. Default `"Start"`. */
  startLabel?: string;
  /** Label above the end trigger. Default `"End"`. */
  endLabel?: string;
  /**
   * Placeholder for the start trigger when `startDate=null`.
   * Falls back to DatePicker's mode-aware default when omitted.
   */
  startPlaceholder?: string;
  /**
   * Placeholder for the end trigger when `endDate=null`.
   * Falls back to DatePicker's mode-aware default when omitted.
   */
  endPlaceholder?: string;
  /** Disable BOTH triggers — no picker opens. */
  disabled?: boolean;
  /** Earliest selectable start value. */
  minimumDate?: Date;
  /** Latest selectable end value. */
  maximumDate?: Date;
  /**
   * BCP-47 locale for both triggers' `Intl.DateTimeFormat`
   * output. When omitted, the runtime uses the system default.
   */
  locale?: string;
  /**
   * Preset shorthand for both triggers' date format. Default:
   * `"medium"`.
   */
  dateStyle?: DateTimeStyle;
  /**
   * Preset shorthand for both triggers' time format (datetime
   * mode). Default: `"short"`.
   */
  timeStyle?: DateTimeStyle;
  /**
   * Full escape hatch — receives the current `Date` and returns
   * the exact trigger text. Applied to BOTH bounds.
   */
  formatValue?: (date: Date) => string;
  /** Use 24-hour clock. Android-only per `@expo/ui`. */
  is24Hour?: boolean;
  /** Border radius applied to both triggers. Default `"md"`. */
  radius?: DateRangePickerRadius;
  /**
   * Per-instance color overrides. 14 slots — same 13 as
   * DatePicker plus `separator` for the horizontal-layout glyph.
   */
  dateRangePickerColors?: DateRangePickerColorsInput;
  /**
   * Root testID. Sub-elements derive:
   * `-label`, `-helper-text`, `-error-text`, `-separator`
   * (horizontal only). Internal DatePickers use `-start` and
   * `-end` root testIDs so their standard suffixes (`-trigger`,
   * `-trigger-text`, etc.) become `-start-trigger`, `-end-trigger`,
   * and so on.
   */
  testID?: string;
}
