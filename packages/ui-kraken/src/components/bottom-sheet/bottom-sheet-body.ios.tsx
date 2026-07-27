import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";

import { UIKitContext } from "../../provider/provider-context";
import { useUIKit } from "../../provider/use-ui-kit";
import type { BottomSheetBodyProps, BottomSheetBodyRef } from "./bottom-sheet-body-types";
import { getExpoUIBottomSheet, getExpoUIBottomSheetView } from "./expo-ui-bottom-sheet-probe";
import type { ExpoUIBottomSheetMethods } from "./expo-ui-bottom-sheet-probe";

/**
 * iOS BottomSheet body — renders `@expo/ui/community/bottom-sheet`'s
 * SwiftUI sheet with detents. Currently identical to the Android
 * body because `@expo/ui`'s community/bottom-sheet resolves its
 * own per-platform variant internally; we still split the file per
 * the `native-bridges-platform-split` rule so future iOS-only
 * tweaks (haptic feedback on snap, safe-area insets, size-class
 * handling) can land here without regressing Android.
 *
 * Re-mounts `<UIKitContext.Provider>` inside the sheet body
 * defensively — @expo/ui uses `Host + RNHostView` which should
 * preserve React context inline, but if a future version switches
 * to a native portal, our Tamagui-in-portal fix is already in
 * place. Same pattern as SelectBottomSheet.
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
