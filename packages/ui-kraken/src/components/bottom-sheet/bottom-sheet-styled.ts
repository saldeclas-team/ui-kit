import { Text as TamaguiText, styled } from "tamagui";

/**
 * Fallback text rendered when the peer dep isn't installed.
 * Communicates the missing package without crashing the app.
 * The BottomSheet's native chrome is entirely OS-managed on iOS
 * + Android — there's no Tamagui-styled shell wrapping it, so
 * this styled component is the only styled export from the
 * BottomSheet folder.
 */
export const StyledBottomSheetMissingPeer = styled(TamaguiText, {
  name: "UIKitBottomSheetMissingPeer",
  fontSize: 13,
  lineHeight: 18,
  fontWeight: "500",
});
