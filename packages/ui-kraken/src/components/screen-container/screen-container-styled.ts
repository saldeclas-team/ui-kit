import { View, styled } from "tamagui";

/**
 * Root safe-area container. A plain `<View>` styled with a
 * background from the palette. Insets are applied inline as
 * padding from the shell (they're runtime values from the
 * `useSafeAreaInsets` hook — can't be hoisted into a styled
 * variant).
 */
export const StyledScreenContainer = styled(View, {
  name: "UIKitScreenContainer",
  flex: 1,
});

/**
 * Inner flex-1 wrapper that sits inside the `<KeyboardAvoidingView>`
 * (when present) so children get the full available height even
 * after the keyboard adjusts the outer wrap.
 */
export const StyledScreenContainerInner = styled(View, {
  name: "UIKitScreenContainerInner",
  flex: 1,
});
