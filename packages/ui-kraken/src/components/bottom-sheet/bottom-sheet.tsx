import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from "react";

import { UIKitContext } from "../../provider/provider-context";
import { useUIKit } from "../../provider/use-ui-kit";
import { resolvePalette } from "../../utils/resolve-palette";
import { StyledBottomSheetMissingPeer } from "./bottom-sheet-styled";
import type { BottomSheetProps, BottomSheetRef } from "./bottom-sheet-types";
import {
  getExpoUIBottomSheet,
  getExpoUIBottomSheetView,
  isBottomSheetAvailable,
} from "./expo-ui-bottom-sheet-probe";
import type { ExpoUIBottomSheetMethods } from "./expo-ui-bottom-sheet-probe";

const DEFAULT_SNAP_POINTS: readonly (string | number)[] = ["50%"];

/**
 * Modal bottom sheet with snap points, backdrop, and swipe-to-
 * dismiss. Ref-controlled — the consumer holds a `useRef<BottomSheetRef>`
 * and calls `ref.current?.present() / .dismiss()` to open + close.
 *
 * ```tsx
 * const sheetRef = useRef<BottomSheetRef>(null);
 * <Button onPress={() => sheetRef.current?.present()}>Open</Button>
 * <BottomSheet ref={sheetRef} snapPoints={["50%", "90%"]}>
 *   <YourContent />
 * </BottomSheet>
 * ```
 *
 * ### Architecture
 *
 * Wraps `@expo/ui/community/bottom-sheet`, which renders the
 * real native sheet primitive per platform:
 *
 * - iOS: SwiftUI `sheet` with detents
 * - Android: Material 3 `ModalBottomSheet` (Compose)
 * - Web: vaul drawer (bundled inside @expo/ui, no extra peer)
 *
 * No platform-split file needed at THIS shell level because
 * `@expo/ui`'s own package handles the per-platform resolution
 * internally (it exposes a single `BottomSheet` default export
 * that Metro resolves to the right variant). Our shell forwards
 * to that one component and just wraps it with:
 *
 * - Palette resolution (`bottomSheetColors` → forwarded slots)
 * - Ref translation (our `BottomSheetRef` shape → `@expo/ui`'s
 *   internal ref methods)
 * - Peer-missing fallback (renders "install @expo/ui" hint)
 * - `<UIKitContext.Provider>` re-mount inside the sheet body,
 *   defensively — @expo/ui uses `Host + RNHostView` (which
 *   should preserve React context inline), but the ceremony is
 *   cheap and shields us if a future @expo/ui version switches
 *   to a native portal. Same pattern as SelectBottomSheet.
 */
export const BottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(function BottomSheet(
  {
    children,
    snapPoints = DEFAULT_SNAP_POINTS,
    onChange,
    onDismiss,
    enablePanDownToClose = true,
    enableDynamicSizing,
    // `radius` is accepted for API symmetry but only web can honor
    // it via vaul — iOS + Android use the OS-standard sheet shape.
    // Consumers who care about web-specific corner radius can pass
    // it; we don't currently forward it to vaul (would need a
    // separate .web.tsx body). Track as follow-up if a real use
    // case surfaces.
    radius: _radius,
    bottomSheetColors,
    testID,
  },
  ref
) {
  const contextValue = useUIKit();
  const { tokens } = contextValue;
  const rootId = testID ?? "bottom-sheet";
  const palette = resolvePalette(tokens.bottomSheetColors, bottomSheetColors);
  const peerAvailable = isBottomSheetAvailable();
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

  const handleDismiss = useCallback(() => onDismiss?.(), [onDismiss]);

  // Stable background style so consumers changing an unrelated
  // prop don't re-mount the native sheet.
  const backgroundStyle = useMemo(
    () => ({ backgroundColor: palette.background }),
    [palette.background]
  );

  if (!peerAvailable || NativeBottomSheet == null || NativeBottomSheetView == null) {
    return (
      <StyledBottomSheetMissingPeer testID={`${rootId}-missing-peer`} color={palette.missingPeer}>
        Install `@expo/ui` to enable BottomSheet.
      </StyledBottomSheetMissingPeer>
    );
  }

  return (
    <NativeBottomSheet
      ref={nativeRef}
      testID={`${rootId}-sheet`}
      snapPoints={snapPoints}
      index={-1}
      onChange={onChange}
      onDismiss={handleDismiss}
      enablePanDownToClose={enablePanDownToClose}
      enableDynamicSizing={enableDynamicSizing}
      backgroundStyle={backgroundStyle}
    >
      <NativeBottomSheetView testID={`${rootId}-view`} style={{ flex: 1 }}>
        <UIKitContext.Provider value={contextValue}>{children}</UIKitContext.Provider>
      </NativeBottomSheetView>
    </NativeBottomSheet>
  );
});

export type {
  BottomSheetColorsInput,
  BottomSheetProps,
  BottomSheetRadius,
  BottomSheetRef,
  BottomSheetSnapPoint,
} from "./bottom-sheet-types";
