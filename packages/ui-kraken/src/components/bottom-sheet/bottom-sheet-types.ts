import type { ReactNode } from "react";

import type { BottomSheetColors } from "../../tokens/tokens-types";
import type { RadiusValue } from "../../utils/radius";

/**
 * Radius scale for the sheet's top corners. Same shape as
 * `DatePickerRadius` — numeric px or token key. Default `"lg"`.
 *
 * NOTE: only applied on web (via vaul). iOS + Android use the
 * OS-standard corner radius (SwiftUI sheet + Material 3 sheet
 * both own their own shape and don't expose a radius prop).
 */
export type BottomSheetRadius = RadiusValue;

/**
 * Partial override for a BottomSheet's palette. Passed through
 * the `bottomSheetColors` prop for per-instance theming;
 * unspecified slots fall back to the provider-resolved defaults.
 */
export type BottomSheetColorsInput = Partial<BottomSheetColors>;

/**
 * Snap point — either a numeric pixel height or a percentage
 * string (e.g. `"50%"`). Same shape as `@expo/ui/community/bottom-sheet`.
 *
 * Android note: `@expo/ui` reduces >2 snap points to two states
 * (partial ≈ 50%, expanded ≈ 90%+). If you pass three snap
 * points, the middle one is ignored on Android. iOS + web
 * support the full list.
 */
export type BottomSheetSnapPoint = string | number;

/**
 * Imperative ref API exposed by `<BottomSheet ref={...}>`.
 * Mirrors `@expo/ui/community/bottom-sheet`'s ref (which is
 * itself a superset of `@gorhom/bottom-sheet`'s ref for drop-in
 * compatibility).
 */
export interface BottomSheetRef {
  /**
   * Open the sheet. Optional `index` selects a specific snap
   * point (0-based); defaults to `0` (first snap point).
   */
  present: (index?: number) => void;
  /** Close the sheet. Fires `onDismiss` after the animation. */
  dismiss: () => void;
  /** Snap to a specific snap-point index (0-based). */
  snapToIndex: (index: number) => void;
  /** Expand to the last snap point (fully open). */
  expand: () => void;
  /** Collapse to the first snap point. */
  collapse: () => void;
}

/**
 * Public props for `<BottomSheet>` — a modal sheet with snap
 * points, backdrop, and swipe-to-dismiss, wrapping
 * `@expo/ui/community/bottom-sheet`.
 *
 * Ref-controlled (imperative `present() / dismiss()`) — the
 * consumer holds the ref and decides when to open the sheet.
 *
 * Requires the optional peer `@expo/ui` (same as SelectNative /
 * SegmentedControl / DatePicker). Missing peer renders a hint
 * pointing consumers to install; the app does not crash.
 */
export interface BottomSheetProps {
  /**
   * Sheet content. Rendered inside the native sheet body wrapped
   * in an `@expo/ui` `<BottomSheetView>`. Put anything: forms,
   * lists, custom UI.
   */
  children: ReactNode;
  /**
   * Snap point heights, in order from smallest to largest.
   * Default `["50%"]`. Android reduces >2 to partial + expanded.
   */
  snapPoints?: readonly BottomSheetSnapPoint[];
  /**
   * Fires whenever the sheet's snap position changes. `-1` when
   * closed, `0+` when open at that snap index.
   */
  onChange?: (index: number) => void;
  /** Fires after the sheet fully dismisses. */
  onDismiss?: () => void;
  /**
   * Whether the sheet can be dismissed via swipe-down or
   * backdrop tap. Default `true`. iOS ties both to this single
   * flag (SwiftUI limitation).
   */
  enablePanDownToClose?: boolean;
  /**
   * Fit the sheet height to its content (ignore snap points).
   * Cannot combine with explicit `snapPoints`.
   */
  enableDynamicSizing?: boolean;
  /**
   * Corner radius applied to the sheet's top corners. Default
   * `"lg"`. Web-only — iOS + Android use the OS-standard shape.
   */
  radius?: BottomSheetRadius;
  /**
   * Per-instance color overrides. Merged on top of the provider-
   * resolved palette; unspecified slots fall through.
   */
  bottomSheetColors?: BottomSheetColorsInput;
  /**
   * Root testID. Sub-elements derive:
   * `-sheet` (the native sheet), `-view` (the inner container),
   * `-missing-peer` (fallback when `@expo/ui` isn't installed).
   */
  testID?: string;
}
