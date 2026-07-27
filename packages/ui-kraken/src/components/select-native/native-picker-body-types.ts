import type { ReactNode } from "react";

import type { SelectNativeOption, SelectNativeValue } from "./select-native-types";

/**
 * Props for the platform-specific `<NativePickerBody>`. Kept
 * separate from the top-level `SelectNativeProps` because it's
 * the internal contract between the shared component shell and
 * the platform-split implementations — not a public API surface.
 *
 * The shared shell (`select-native.tsx`) handles palette
 * resolution, frame styling, label / helper / error rendering,
 * peer-missing fallback, and the borderless-vs-chrome decision.
 * Platform-split bodies (`native-picker-body.ios.tsx`,
 * `.android.tsx`, `.web.tsx`) render ONLY the trigger + the
 * native menu itself, in whatever way is native to the platform.
 */
export interface NativePickerBodyProps<Value extends SelectNativeValue = string> {
  /** Options passed straight through to the native menu. */
  options: SelectNativeOption<Value>[];
  /** Currently-selected value, or `null` when none is picked. */
  value: Value | null;
  /** Fires with the picked value when the user selects a menu option. */
  onChange: (value: Value) => void;
  /** Label rendered inside the SwiftUI Menu header on iOS. */
  menuTitle?: string;
  /** Text shown inside the trigger when nothing is selected. */
  placeholderLabel: string;
  /**
   * When true, the native menu will not open on tap. Also
   * propagated to the trigger for a11y state.
   */
  disabled: boolean;
  /**
   * Content-text color for the trigger (varies by disabled /
   * selected / placeholder state — the shell computes it and
   * passes it in so the platform bodies stay palette-agnostic).
   */
  triggerTextColor: string;
  /** Chevron color — same reasoning as `triggerTextColor`. */
  chevronColor: string;
  /**
   * Extra a11y label for the trigger. When the parent has a
   * `label` prop the shell passes it here; otherwise falls back
   * to the placeholder label at the shell layer.
   */
  triggerAccessibilityLabel?: string;
  /** Root testID used to derive `-trigger`, `-trigger-text`, `-menu`. */
  testID: string;
  /**
   * Optional extra content rendered inside the trigger — used
   * only for the peer-missing fallback hint. Platform bodies
   * splice this in place of the picker.
   */
  fallback?: ReactNode;
}
