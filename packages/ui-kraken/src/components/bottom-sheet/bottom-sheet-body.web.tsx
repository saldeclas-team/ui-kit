import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";

import { UIKitContext } from "../../provider/provider-context";
import { useUIKit } from "../../provider/use-ui-kit";
import type { BottomSheetBodyProps, BottomSheetBodyRef } from "./bottom-sheet-body-types";
import { getExpoUIBottomSheet, getExpoUIBottomSheetView } from "./expo-ui-bottom-sheet-probe";
import type { ExpoUIBottomSheetMethods } from "./expo-ui-bottom-sheet-probe";

/**
 * Web BottomSheet body — renders `@expo/ui/community/bottom-sheet`'s
 * `vaul` drawer. Same source as iOS + Android bodies because
 * `@expo/ui`'s community/bottom-sheet resolves its own per-
 * platform variant internally; split per the
 * `native-bridges-platform-split` rule so future web-only tweaks
 * (custom backdrop opacity, corner radius forwarded to vaul,
 * custom handle color) can land here without touching native.
 *
 * ### Web-specific opportunities (not yet wired)
 *
 * - `backdrop` / `handle` palette slots exist on `BottomSheetColors`
 *   and could be forwarded to vaul's CSS custom properties here
 *   (vaul supports full theming; iOS + Android use OS-standard
 *   scrim/handle which aren't themable).
 * - Consumer-provided `radius` prop could be applied here as a
 *   CSS `border-radius` on the drawer container.
 *
 * Both are documented as follow-ups in the plan doc.
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
