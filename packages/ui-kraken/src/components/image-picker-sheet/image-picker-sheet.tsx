import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from "react";
import { Pressable } from "react-native";

import { useUIKit } from "../../provider/use-ui-kit";
import { resolvePalette } from "../../utils/resolve-palette";
import { BottomSheet } from "../bottom-sheet";
import type { BottomSheetRef } from "../bottom-sheet";
import { isBottomSheetAvailable } from "../bottom-sheet/expo-ui-bottom-sheet-probe";
import { isImagePickerAvailable } from "./expo-image-picker-probe";
import { imagePickerBody } from "./image-picker-sheet-body";
import { PermissionDeniedError } from "./image-picker-sheet-body-types";
import {
  StyledImagePickerSheetAction,
  StyledImagePickerSheetActionIcon,
  StyledImagePickerSheetActionLabel,
  StyledImagePickerSheetActionList,
  StyledImagePickerSheetDivider,
  StyledImagePickerSheetMissingPeer,
  StyledImagePickerSheetTitle,
} from "./image-picker-sheet-styled";
import type { ImagePickerSheetProps, ImagePickerSheetRef } from "./image-picker-sheet-types";

/**
 * Bottom-sheet image picker with three action rows (camera /
 * gallery / cancel). Ref-controlled — consumers hold a
 * `useRef<ImagePickerSheetRef>` and call
 * `ref.current?.present() / dismiss()`.
 *
 * ```tsx
 * const pickerRef = useRef<ImagePickerSheetRef>(null);
 * const [photo, setPhoto] = useState<string | null>(null);
 * <Button onPress={() => pickerRef.current?.present()}>Change photo</Button>
 * <ImagePickerSheet
 *   ref={pickerRef}
 *   onPick={(asset) => setPhoto(asset?.uri ?? photo)}
 *   allowsEditing
 *   aspect={[1, 1]}
 * />
 * ```
 *
 * ### Architecture — dogfoods <BottomSheet>
 *
 * Composes our own [[BottomSheet]] internally (which wraps
 * `@expo/ui/community/bottom-sheet`). Same pattern as
 * SelectBottomSheet. That means:
 *
 * - Native sheet affordances on every platform.
 * - Two optional peers: `expo-image-picker` (this component's
 *   own) + `@expo/ui` (BottomSheet's). Missing either → the
 *   sheet body renders a "Install X" hint instead of the action
 *   rows.
 * - No provider ceremony — no `<BottomSheetModalProvider>`, no
 *   permission pre-request. The body handles permission
 *   requests inline (request-then-launch pattern).
 *
 * The image picking itself is split per-platform in
 * `image-picker-sheet-body.{ios,android,web,tsx}` per the
 * `native-bridges-platform-split` rule — so future iOS-only
 * (limited photo library on iOS 17+) or Android-only (Android
 * 14 visual media picker) tweaks can land in one file without
 * regressing the others.
 */
export const ImagePickerSheet = forwardRef<ImagePickerSheetRef, ImagePickerSheetProps>(
  function ImagePickerSheet(
    {
      onPick,
      onPermissionDenied,
      mediaTypes = "images",
      allowsEditing = false,
      aspect,
      quality,
      videoMaxDuration,
      sheetTitle = "Choose photo",
      cameraLabel = "Take photo",
      galleryLabel = "Choose from library",
      cancelLabel = "Cancel",
      cameraIcon,
      galleryIcon,
      radius: _radius,
      imagePickerSheetColors,
      testID,
    },
    ref
  ) {
    const { tokens } = useUIKit();
    const rootId = testID ?? "image-picker-sheet";
    const palette = resolvePalette(tokens.imagePickerSheetColors, imagePickerSheetColors);
    const bottomSheetPeer = isBottomSheetAvailable();
    const imagePickerPeer = isImagePickerAvailable();

    const sheetRef = useRef<BottomSheetRef>(null);

    useImperativeHandle(
      ref,
      () => ({
        present: () => sheetRef.current?.present(),
        dismiss: () => sheetRef.current?.dismiss(),
      }),
      []
    );

    const options = useMemo(
      () => ({ mediaTypes, allowsEditing, aspect, quality, videoMaxDuration }),
      [mediaTypes, allowsEditing, aspect, quality, videoMaxDuration]
    );

    const runPick = useCallback(
      async (source: "camera" | "library") => {
        // Dismiss the sheet BEFORE launching the OS picker so
        // the transition is: our sheet slides down → OS picker
        // slides up. If we didn't dismiss first, the OS picker
        // would open ON TOP of our sheet — the user sees both
        // for a beat which reads as broken.
        sheetRef.current?.dismiss();
        try {
          const asset =
            source === "camera"
              ? await imagePickerBody.pickFromCamera(options)
              : await imagePickerBody.pickFromLibrary(options);
          onPick(asset);
        } catch (err) {
          if (err instanceof PermissionDeniedError) {
            onPermissionDenied?.(err.source);
          } else {
            throw err;
          }
        }
      },
      [options, onPick, onPermissionDenied]
    );

    const handleCameraPress = useCallback(() => runPick("camera"), [runPick]);
    const handleGalleryPress = useCallback(() => runPick("library"), [runPick]);
    const handleCancelPress = useCallback(() => sheetRef.current?.dismiss(), []);

    // Map ImagePickerSheet's palette onto BottomSheet's smaller
    // palette. Only sheetBackground + sheetHandle apply — the
    // action row chrome (background, text, divider) is painted
    // by our own styled components inside the sheet body.
    const sheetChromeColors = useMemo(
      () => ({
        background: palette.sheetBackground,
        handle: palette.sheetHandle,
      }),
      [palette.sheetBackground, palette.sheetHandle]
    );

    // We render the missing-peer hint INSIDE the sheet body when
    // either peer is unavailable — the ref-controlled shape
    // means the consumer's Button already triggered `.present()`
    // before we knew about the peer state.
    const missingPeerLabel = getMissingPeerLabel(bottomSheetPeer, imagePickerPeer);

    return (
      <BottomSheet
        ref={sheetRef}
        testID={`${rootId}-sheet`}
        enableDynamicSizing
        bottomSheetColors={sheetChromeColors}
      >
        {missingPeerLabel != null ? (
          <StyledImagePickerSheetMissingPeer
            testID={`${rootId}-missing-peer`}
            color={palette.cancelText}
          >
            {missingPeerLabel}
          </StyledImagePickerSheetMissingPeer>
        ) : (
          <>
            {sheetTitle.length > 0 && (
              <StyledImagePickerSheetTitle testID={`${rootId}-title`} color={palette.actionText}>
                {sheetTitle}
              </StyledImagePickerSheetTitle>
            )}
            <StyledImagePickerSheetActionList>
              {imagePickerBody.supportsCamera && (
                <>
                  <ActionRow
                    testID={`${rootId}-camera`}
                    label={cameraLabel}
                    icon={cameraIcon}
                    onPress={handleCameraPress}
                    palette={palette}
                    isDestructive={false}
                  />
                  <StyledImagePickerSheetDivider backgroundColor={palette.divider} />
                </>
              )}
              <ActionRow
                testID={`${rootId}-gallery`}
                label={galleryLabel}
                icon={galleryIcon}
                onPress={handleGalleryPress}
                palette={palette}
                isDestructive={false}
              />
              <StyledImagePickerSheetDivider backgroundColor={palette.divider} />
              <ActionRow
                testID={`${rootId}-cancel`}
                label={cancelLabel}
                onPress={handleCancelPress}
                palette={palette}
                isDestructive
              />
            </StyledImagePickerSheetActionList>
          </>
        )}
      </BottomSheet>
    );
  }
);

/**
 * Single action row. Extracted so the shell body stays flat
 * (three near-identical rows, no repetition of the styled
 * incantations).
 */
interface ActionRowProps {
  testID: string;
  label: string;
  icon?: React.ReactNode;
  onPress: () => void;
  palette: {
    actionText: string;
    actionIcon: string;
    actionBackground: string;
    actionBackgroundPressed: string;
    cancelText: string;
  };
  isDestructive: boolean;
}

function ActionRow({ testID, label, icon, onPress, palette, isDestructive }: ActionRowProps) {
  const labelColor = isDestructive ? palette.cancelText : palette.actionText;
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {({ pressed }) => (
        <StyledImagePickerSheetAction
          backgroundColor={pressed ? palette.actionBackgroundPressed : palette.actionBackground}
        >
          {icon != null && (
            <StyledImagePickerSheetActionIcon>{icon}</StyledImagePickerSheetActionIcon>
          )}
          <StyledImagePickerSheetActionLabel color={labelColor}>
            {label}
          </StyledImagePickerSheetActionLabel>
        </StyledImagePickerSheetAction>
      )}
    </Pressable>
  );
}

/**
 * Which peer(s) are missing → user-facing install hint. Returns
 * `null` when both are available (the normal path).
 */
function getMissingPeerLabel(bottomSheetPeer: boolean, imagePickerPeer: boolean): string | null {
  if (bottomSheetPeer && imagePickerPeer) return null;
  const missing: string[] = [];
  if (!bottomSheetPeer) missing.push("`@expo/ui`");
  if (!imagePickerPeer) missing.push("`expo-image-picker`");
  return `Install ${missing.join(" + ")} to enable ImagePickerSheet.`;
}

export type {
  ImagePickerSheetColorsInput,
  ImagePickerSheetProps,
  ImagePickerSheetRadius,
  ImagePickerSheetRef,
  PickedAsset,
} from "./image-picker-sheet-types";
