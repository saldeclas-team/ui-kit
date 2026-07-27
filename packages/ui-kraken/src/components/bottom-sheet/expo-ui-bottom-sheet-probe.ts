import type { ComponentType, ReactNode, Ref } from "react";

/**
 * Peer-dep detection for `@expo/ui/community/bottom-sheet`.
 * Runs at module import time (once). Same shape as the other
 * `@expo/ui` probes in this codebase (SelectNative,
 * SegmentedControl, DatePicker) — try / catch require so
 * consumers who did NOT install `@expo/ui` still import
 * ui-kraken without a Metro error; the BottomSheet shell renders
 * a fallback hint at runtime.
 */

/**
 * Ref API exposed by `@expo/ui/community/bottom-sheet`. Same
 * shape as `@gorhom/bottom-sheet`'s ref (the drop-in target)
 * plus the `expand` / `collapse` / `close` shortcuts.
 */
export interface ExpoUIBottomSheetMethods {
  present: (index?: number) => void;
  dismiss: () => void;
  snapToIndex: (index: number) => void;
  snapToPosition: (position: number | string) => void;
  expand: () => void;
  collapse: () => void;
  close: () => void;
  forceClose: () => void;
}

/**
 * Prop shape of `@expo/ui/community/bottom-sheet`'s default
 * `BottomSheet` export. Kept narrow — only the props our shell
 * forwards. Escape-hatch consumers reach for the raw package.
 */
export interface ExpoUIBottomSheetProps {
  ref?: Ref<ExpoUIBottomSheetMethods>;
  snapPoints?: readonly (string | number)[];
  index?: number;
  onChange?: (index: number) => void;
  onClose?: () => void;
  onDismiss?: () => void;
  enablePanDownToClose?: boolean;
  enableDynamicSizing?: boolean;
  backgroundStyle?: { backgroundColor?: string };
  handleComponent?: ComponentType<unknown> | null;
  children?: ReactNode;
  testID?: string;
}

/**
 * Prop shape of the drop-in's `BottomSheetView` component — a
 * thin container that sits inside the sheet body.
 */
export interface ExpoUIBottomSheetViewProps {
  children?: ReactNode;
  style?: unknown;
  testID?: string;
}

interface BottomSheetModule {
  default: ComponentType<ExpoUIBottomSheetProps>;
  BottomSheetView: ComponentType<ExpoUIBottomSheetViewProps>;
}

let bottomSheetModule: BottomSheetModule | null = null;

try {
  bottomSheetModule = require("@expo/ui/community/bottom-sheet") as BottomSheetModule;
} catch {
  bottomSheetModule = null;
}

/**
 * Whether `@expo/ui/community/bottom-sheet` is available in the
 * current runtime. When `false`, `<BottomSheet>` renders a
 * placeholder hint telling the consumer to install the peer —
 * the app does NOT crash.
 */
export function isBottomSheetAvailable(): boolean {
  return bottomSheetModule != null;
}

/**
 * Return the native `BottomSheet` component from `@expo/ui`, or
 * `null` when the peer isn't installed. Callers must null-check
 * before use.
 */
export function getExpoUIBottomSheet(): ComponentType<ExpoUIBottomSheetProps> | null {
  return bottomSheetModule?.default ?? null;
}

/**
 * Return the `BottomSheetView` container, or `null` when the
 * peer isn't installed.
 */
export function getExpoUIBottomSheetView(): ComponentType<ExpoUIBottomSheetViewProps> | null {
  return bottomSheetModule?.BottomSheetView ?? null;
}
