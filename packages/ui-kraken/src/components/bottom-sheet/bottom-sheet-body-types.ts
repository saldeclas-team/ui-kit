import type { ReactNode } from "react";

import type { BottomSheetSnapPoint } from "./bottom-sheet-types";

/**
 * Palette slice consumed by the platform-specific body. The shell
 * (`bottom-sheet.tsx`) resolves the full palette and passes only
 * the slots the body forwards to the native bridge. Keeping this
 * narrow means the body can change chrome without the shell
 * knowing — and lets future per-platform bodies pick different
 * slots without touching the shell (e.g. web can honor
 * `handle` / `backdrop`; iOS + Android can't).
 */
export interface BottomSheetBodyPalette {
  background: string;
}

/**
 * Imperative ref API exposed by the platform body. Same shape as
 * the shell's public `BottomSheetRef` — the shell just passes its
 * own ref straight through via `useImperativeHandle`.
 */
export interface BottomSheetBodyRef {
  present: (index?: number) => void;
  dismiss: () => void;
  snapToIndex: (index: number) => void;
  expand: () => void;
  collapse: () => void;
}

/**
 * Contract every platform's `<BottomSheetBody>` file must
 * implement. The shell owns palette resolution + peer detection;
 * the body owns "render the native sheet with these props."
 */
export interface BottomSheetBodyProps {
  /** Sheet content (children of `<BottomSheet>`). */
  children: ReactNode;
  /**
   * Snap points, in order from smallest to largest. The shell has
   * already applied the two-point default (`["50%", "90%"]`) if
   * the consumer omitted the prop, so the body sees a resolved
   * array.
   */
  snapPoints: readonly BottomSheetSnapPoint[];
  /** Whether swipe / backdrop-tap dismiss the sheet. */
  enablePanDownToClose: boolean;
  /** Fit height to content (ignore snap points). */
  enableDynamicSizing?: boolean;
  /** Fires when the sheet snap index changes. */
  onChange?: (index: number) => void;
  /** Fires after the sheet fully dismisses. */
  onDismiss?: () => void;
  /** Palette slice — currently only `background`. */
  chromeColors: BottomSheetBodyPalette;
  /**
   * Root testID (the body appends its own `-sheet` / `-view`
   * suffixes to match the public testID contract on the shell).
   */
  testID: string;
  /**
   * Rendered instead of the sheet when the peer dep is missing.
   * Passed pre-computed by the shell so the body doesn't need to
   * know about styled components or palette slots.
   */
  fallback?: ReactNode;
}
