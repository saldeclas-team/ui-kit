import type { ReactElement, ReactNode } from "react";

import type { DatePickerMode } from "./date-picker-types";

/**
 * Palette slice consumed by the platform-specific body. The shell
 * (`date-picker.tsx`) resolves the full palette and passes only
 * the slots the body renders (native picker accent + iOS modal
 * chrome fallbacks + trigger). Keeping this narrow means the body
 * can change chrome without the shell knowing.
 */
export interface DatePickerBodyPalette {
  accent: string;
  background: string;
  border: string;
  borderFocused: string;
}

/**
 * Contract every platform's `<DatePickerBody>` file must
 * implement. The shell owns state resolution; the body owns
 * "open the picker" and "render it wherever native wants it."
 *
 * Non-obvious: `trigger` is a render-prop — the shell passes the
 * Tamagui trigger element wired to an `onPress` handler owned by
 * the body. This lets the body decide when tapping the trigger
 * should invoke the picker (iOS: opens Modal locally; Android:
 * shows the native dialog directly). The shell doesn't know or
 * care.
 */
export interface DatePickerBodyProps {
  /** Currently-selected value, or `null` when unset. */
  value: Date | null;
  /** Fires when the user picks a value. */
  onChange: (date: Date) => void;
  /** Whether the trigger is disabled — no picker opens on tap. */
  disabled: boolean;
  /** Native picker mode (passed through to `@expo/ui`). */
  mode: DatePickerMode;
  /** Earliest selectable value. */
  minimumDate?: Date;
  /** Latest selectable value. */
  maximumDate?: Date;
  /** BCP-47 locale for the native picker's own display. */
  locale?: string;
  /** Use 24-hour clock (Android only per `@expo/ui`). */
  is24Hour?: boolean;
  /** Whether the app is currently in dark mode. */
  appearance: "light" | "dark";
  /** Palette slice for native picker chrome. */
  chromeColors: DatePickerBodyPalette;
  /** Root testID (the body appends its own `-picker`, `-modal`, `-done` suffixes). */
  testID: string;
  /**
   * Render prop for the trigger. Receives `open` — the callback
   * that opens the native picker. The shell renders the styled
   * frame around whatever this returns.
   */
  renderTrigger: (open: () => void) => ReactElement;
  /**
   * Rendered instead of the trigger when the peer dep is missing
   * (iOS / Android only — web always renders the trigger). Keeps
   * the peer-detection layer in the shell.
   */
  fallback?: ReactNode;
}
