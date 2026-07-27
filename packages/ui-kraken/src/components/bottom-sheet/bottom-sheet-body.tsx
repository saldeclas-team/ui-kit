import { forwardRef, useImperativeHandle } from "react";

import type { BottomSheetBodyProps, BottomSheetBodyRef } from "./bottom-sheet-body-types";

/**
 * Non-iOS / non-Android / non-web fallback — Metro should always
 * pick one of the platform variants, but Node test harnesses that
 * don't set `Platform.OS` fall here. Renders the fallback when
 * provided, else returns nothing.
 *
 * The ref is still attached (so consumers holding a
 * `useRef<BottomSheetRef>` don't crash) but every method is a
 * no-op — no native sheet exists on this runtime to control.
 */
export const BottomSheetBody = forwardRef<BottomSheetBodyRef, BottomSheetBodyProps>(
  function BottomSheetBody({ fallback }, ref) {
    useImperativeHandle(
      ref,
      () => ({
        present: () => {
          /* no-op — no native sheet on this runtime */
        },
        dismiss: () => {
          /* no-op */
        },
        snapToIndex: () => {
          /* no-op */
        },
        expand: () => {
          /* no-op */
        },
        collapse: () => {
          /* no-op */
        },
      }),
      []
    );
    if (fallback != null) return <>{fallback}</>;
    return null;
  }
);
