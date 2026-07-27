import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";

import { UIKitContext } from "../../provider/provider-context";
import { useUIKit } from "../../provider/use-ui-kit";
import type { BottomSheetBodyProps, BottomSheetBodyRef } from "./bottom-sheet-body-types";
import { getExpoUIBottomSheet, getExpoUIBottomSheetView } from "./expo-ui-bottom-sheet-probe";
import type { ExpoUIBottomSheetMethods } from "./expo-ui-bottom-sheet-probe";

/**
 * Android BottomSheet body — renders `@expo/ui/community/bottom-sheet`'s
 * Material 3 `ModalBottomSheet`. Same source as the iOS body
 * because `@expo/ui`'s community/bottom-sheet handles the per-
 * platform resolution internally; we still split the file per the
 * `native-bridges-platform-split` rule so future Android-only
 * tweaks (Material 3 shape overrides, edge-to-edge display,
 * predictive back gesture handling) can land here without
 * regressing iOS.
 *
 * ### Android-specific quirks to remember
 *
 * - Material 3 `ModalBottomSheet` supports only 2 snap states
 *   (partial ~50%, expanded ~90%+). If the shell forwards >2
 *   snap points, `@expo/ui` maps index 0 → partial, last index →
 *   expanded; middle indices are ignored.
 * - With a single snap point (e.g. `["50%"]`), `@expo/ui` passes
 *   `skipPartiallyExpanded=true` to Compose, which makes the
 *   sheet jump straight to fully expanded. Our shell's default
 *   is `["50%", "90%"]` for exactly this reason — see
 *   `bottom-sheet.tsx`'s `DEFAULT_SNAP_POINTS`.
 */
export const BottomSheetBody = forwardRef<BottomSheetBodyRef, BottomSheetBodyProps>(
  function BottomSheetBody(
    {
      children,
      snapPoints,
      enablePanDownToClose,
      enableDynamicSizing,
      onChange,
      onDismiss,
      chromeColors,
      testID,
      fallback,
    },
    ref
  ) {
    const contextValue = useUIKit();
    const NativeBottomSheet = getExpoUIBottomSheet();
    const NativeBottomSheetView = getExpoUIBottomSheetView();

    const nativeRef = useRef<ExpoUIBottomSheetMethods>(null);

    useImperativeHandle(
      ref,
      () => ({
        present: (index) => nativeRef.current?.present(index),
        dismiss: () => nativeRef.current?.dismiss(),
        snapToIndex: (index) => nativeRef.current?.snapToIndex(index),
        expand: () => nativeRef.current?.expand(),
        collapse: () => nativeRef.current?.collapse(),
      }),
      []
    );

    const backgroundStyle = useMemo(
      () => ({ backgroundColor: chromeColors.background }),
      [chromeColors.background]
    );

    if (fallback != null) return <>{fallback}</>;
    if (NativeBottomSheet == null || NativeBottomSheetView == null) return null;

    return (
      <NativeBottomSheet
        ref={nativeRef}
        testID={`${testID}-sheet`}
        snapPoints={snapPoints}
        index={-1}
        onChange={onChange}
        onDismiss={onDismiss}
        enablePanDownToClose={enablePanDownToClose}
        enableDynamicSizing={enableDynamicSizing}
        backgroundStyle={backgroundStyle}
      >
        <NativeBottomSheetView testID={`${testID}-view`} style={{ flex: 1 }}>
          <UIKitContext.Provider value={contextValue}>{children}</UIKitContext.Provider>
        </NativeBottomSheetView>
      </NativeBottomSheet>
    );
  }
);
