import type { ReactNode } from "react";

import type { SegmentedControlOption } from "./segmented-control-types";

/**
 * Props for the platform-specific `<SegmentedControlBody>`. The
 * internal contract between the shared shell and per-platform
 * body files — NOT a public API surface.
 *
 * Shell (`segmented-control.tsx`) resolves palette + renders
 * label / helper / error / peer-missing fallback. Bodies
 * (`.ios.tsx` / `.android.tsx` / `.web.tsx`) render ONLY the
 * native control itself.
 */
export interface SegmentedControlBodyProps<Value extends string = string> {
  /** Segments passed through to the native control. */
  options: SegmentedControlOption<Value>[];
  /**
   * Current value. The body computes `selectedIndex` from it +
   * maps native `event.selectedSegmentIndex` back to `value` in
   * `onChange`.
   */
  value: Value;
  /** Fires with the picked value. */
  onChange: (value: Value) => void;
  /** Disables native interaction. */
  disabled: boolean;
  /**
   * `"light" | "dark"` — passed to the native control's
   * `appearance` prop. Shell resolves from `useUIKit().activeTheme`
   * so the picker follows ui-kraken's theme, not `useColorScheme()`.
   */
  appearance: "light" | "dark";
  /**
   * Palette chrome for the Android body. iOS ignores this
   * (SwiftUI owns its own chrome). Shell forwards the resolved
   * `segmentedControlColors` slots so the Android body doesn't
   * need to `useUIKit` itself.
   */
  chromeColors: {
    containerBackground: string;
    containerBorder: string;
    selectedBackground: string;
    selectedLabel: string;
    unselectedLabel: string;
    ripple: string;
  };
  /**
   * Resolved container border-radius. Applied to the Android
   * pill; IGNORED on iOS.
   */
  radius: number;
  /** Root testID used to derive `-control`. */
  testID: string;
  /**
   * Optional fallback content — shell splices the peer-missing
   * hint in here when `@expo/ui/community/segmented-control`
   * isn't available. Bodies render it in place of the native
   * control (bypasses the getter check).
   */
  fallback?: ReactNode;
}
