/**
 * Peer-dep detection for `@expo/ui/community/datetime-picker`.
 * Runs at module import time (once). Same shape as
 * `select-native/expo-ui-probe.ts` and
 * `segmented-control/expo-ui-segmented-probe.ts` — try / catch
 * require so consumers who did NOT install `@expo/ui` still
 * import ui-kraken without a Metro error; the DatePicker shell
 * renders a fallback message at runtime.
 *
 * Scoped to this component's folder rather than shared under
 * `utils/` because each component owns its native imports co-
 * located with the code that uses them. If we hit 4+ components
 * duplicating this pattern (SelectNative, SegmentedControl,
 * DatePicker, then #4), extract a shared `utils/expo-ui.ts` with
 * per-submodule getters.
 */

interface DateTimePickerChangeEvent {
  nativeEvent: {
    timestamp: number;
    utcOffset: number;
  };
}

interface DateTimePickerModule {
  DateTimePicker: React.ComponentType<{
    value: Date;
    onValueChange?: (event: DateTimePickerChangeEvent, date: Date) => void;
    onDismiss?: () => void;
    mode?: "date" | "time" | "datetime";
    minimumDate?: Date;
    maximumDate?: Date;
    display?: "default" | "spinner" | "compact" | "inline" | "calendar" | "clock";
    is24Hour?: boolean;
    accentColor?: string;
    disabled?: boolean;
    locale?: string;
    themeVariant?: "dark" | "light";
    timeZoneName?: string;
    presentation?: "inline" | "dialog";
    positiveButton?: { label?: string };
    negativeButton?: { label?: string };
    style?: unknown;
    testID?: string;
  }>;
}

let datetimeModule: DateTimePickerModule | null = null;

try {
  datetimeModule = require("@expo/ui/community/datetime-picker") as DateTimePickerModule;
} catch {
  datetimeModule = null;
}

/**
 * Whether `@expo/ui/community/datetime-picker` is available in
 * the current runtime. When `false`, `<DatePicker>` renders a
 * placeholder hint at the trigger position telling the consumer
 * to install the peer — the app does NOT crash.
 */
export function isDateTimePickerAvailable(): boolean {
  return datetimeModule != null;
}

/**
 * Return the native `DateTimePicker` component from `@expo/ui`,
 * or `null` when the peer isn't installed. Callers must null-
 * check before use.
 */
export function getExpoUIDateTimePicker(): DateTimePickerModule["DateTimePicker"] | null {
  return datetimeModule?.DateTimePicker ?? null;
}
