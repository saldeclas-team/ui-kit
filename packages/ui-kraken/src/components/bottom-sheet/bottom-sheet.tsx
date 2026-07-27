import { forwardRef } from "react";

import { useUIKit } from "../../provider/use-ui-kit";
import { resolvePalette } from "../../utils/resolve-palette";
import { BottomSheetBody } from "./bottom-sheet-body";
import { StyledBottomSheetMissingPeer } from "./bottom-sheet-styled";
import type { BottomSheetProps, BottomSheetRef } from "./bottom-sheet-types";
import { isBottomSheetAvailable } from "./expo-ui-bottom-sheet-probe";

/**
 * Default snap points — partial (50%) + expanded (90%). We ship
 * TWO snap points as the default (rather than a single `["50%"]`)
 * because Android's Material 3 `ModalBottomSheet` treats
 * single-snap-point sheets as `skipPartiallyExpanded=true`, which
 * makes the sheet jump straight to fully expanded (~90%+) on
 * open and never respect the requested partial height. Passing
 * both explicitly gives Android a real partial state to open at
 * (50%) and lets the user drag up to 90%. iOS respects both
 * detents natively and defaults to the first one.
 *
 * See `@expo/ui/src/community/bottom-sheet/BottomSheet.android.tsx`
 * line 72: `skipPartially = fitToContents || !hasMultipleSnapPoints`.
 */
const DEFAULT_SNAP_POINTS: readonly (string | number)[] = ["50%", "90%"];

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
 * ### Architecture — platform-split rendering
 *
 * This top-level file is the SHARED shell: palette resolution,
 * ref forwarding, peer detection + missing-peer fallback. The
 * actual native sheet render lives in
 * `./bottom-sheet-body.{ios,android,web,tsx}` — Metro picks the
 * right variant at bundle time. `@expo/ui`'s community bottom-
 * sheet already resolves per-platform internally, so today the
 * three bodies are functionally identical — but the split is
 * mandatory per the `native-bridges-platform-split` rule so
 * future per-platform tweaks (iOS haptic feedback, Android
 * predictive back, web CSS overrides for vaul) can land in one
 * file without regressing the others.
 *
 * Consumer-side: everything happens through the shell's
 * imperative ref API, so the split is invisible.
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
    // it; we don't currently forward it to vaul (would need
    // web-body wiring). Track as follow-up if a real use case
    // surfaces.
    radius: _radius,
    bottomSheetColors,
    testID,
  },
  ref
) {
  const { tokens } = useUIKit();
  const rootId = testID ?? "bottom-sheet";
  const palette = resolvePalette(tokens.bottomSheetColors, bottomSheetColors);
  const peerAvailable = isBottomSheetAvailable();

  // When the peer isn't installed, render a plain hint instead of
  // the sheet. The body receives it as `fallback` so it can render
  // consistently across platforms (and the .tsx fallback body
  // returns it when Metro can't resolve a platform variant).
  const fallback = !peerAvailable ? (
    <StyledBottomSheetMissingPeer testID={`${rootId}-missing-peer`} color={palette.missingPeer}>
      Install `@expo/ui` to enable BottomSheet.
    </StyledBottomSheetMissingPeer>
  ) : undefined;

  return (
    <BottomSheetBody
      ref={ref}
      testID={rootId}
      snapPoints={snapPoints}
      onChange={onChange}
      onDismiss={onDismiss}
      enablePanDownToClose={enablePanDownToClose}
      enableDynamicSizing={enableDynamicSizing}
      chromeColors={{ background: palette.background }}
      fallback={fallback}
    >
      {children}
    </BottomSheetBody>
  );
});

export type {
  BottomSheetColorsInput,
  BottomSheetProps,
  BottomSheetRadius,
  BottomSheetRef,
  BottomSheetSnapPoint,
} from "./bottom-sheet-types";
