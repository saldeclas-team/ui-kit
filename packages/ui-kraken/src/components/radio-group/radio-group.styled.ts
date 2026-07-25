import { Text as TamaguiText, View as TamaguiView, XStack, YStack, styled } from "tamagui";

/**
 * Root container for the group. Column layout by default; the
 * `orientation` variant flips to row for segmented pickers.
 */
export const StyledRadioGroup = styled(YStack, {
  name: "UIKitRadioGroup",
  gap: "$uiSpacingSm",

  variants: {
    orientation: {
      vertical: { flexDirection: "column" },
      horizontal: { flexDirection: "row", flexWrap: "wrap" },
    },
  } as const,

  defaultVariants: { orientation: "vertical" },
});

/**
 * Bold group heading (rendered when the `label` prop is passed).
 * Coloured from `radio-group.tsx` at runtime so per-instance
 * `radioGroupColors` overrides land here.
 */
export const StyledRadioGroupLabel = styled(TamaguiText, {
  name: "UIKitRadioGroupLabel",
  fontSize: 14,
  lineHeight: 20,
  fontWeight: "600",
  marginBottom: "$uiSpacingXs",
});

/**
 * The tappable option card. Meets the 48 × 48 px minimum touch target
 * on both orientations. Border + background come from
 * `radio-group.tsx` at runtime (variant driven by `selected` state).
 * `pressStyle` animates a subtle scale + fade on press so the tap
 * feels responsive without needing a native ripple.
 */
export const StyledRadioOptionRow = styled(XStack, {
  name: "UIKitRadioOptionRow",
  alignItems: "center",
  gap: "$uiSpacingSm",
  minHeight: 48,
  paddingHorizontal: "$uiSpacingMd",
  paddingVertical: "$uiSpacingSm",
  borderWidth: 1,
  pressStyle: { scale: 0.98, opacity: 0.9 },

  variants: {
    disabled: {
      true: { opacity: 0.5, pointerEvents: "none" },
    },
  } as const,
});

/**
 * Fixed 20 × 20 circular ring around the dot. `borderRadius: 9999` is
 * intentional and non-configurable — the ring stays circular regardless
 * of the row's `radius` prop.
 */
export const StyledRadioOptionCircle = styled(TamaguiView, {
  name: "UIKitRadioOptionCircle",
  width: 20,
  height: 20,
  borderRadius: 9999,
  borderWidth: 2,
  alignItems: "center",
  justifyContent: "center",
});

/**
 * Filled 10 × 10 dot inside the ring; only rendered when the option is
 * the currently-selected `value`. Colour comes from
 * `radio-group.tsx`.
 */
export const StyledRadioOptionDot = styled(TamaguiView, {
  name: "UIKitRadioOptionDot",
  width: 10,
  height: 10,
  borderRadius: 9999,
});

/**
 * Option label text. Colour comes from `radio-group.tsx` at runtime.
 * `flex: 1` on vertical orientation lets long labels wrap; on
 * horizontal orientation the row's natural width takes over.
 */
export const StyledRadioOptionLabel = styled(TamaguiText, {
  name: "UIKitRadioOptionLabel",
  fontSize: 14,
  lineHeight: 20,
  fontWeight: "400",
  flex: 1,
});
