import type { Tokens, ResolvedTokens } from "./tokens-types";

/**
 * Resolve the coarse token schema into the shape components consume.
 * Colors pass through unchanged; only the radius / space scales are
 * derived from the two coarse knobs. Pure — safe to call inside a
 * `useMemo`.
 */
export function coarseToFineTokens(tokens: Tokens): ResolvedTokens {
  const {
    buttonColors,
    textColors,
    alertColors,
    radioGroupColors,
    inputColors,
    currencyInputColors,
    surfaceColors,
    refreshControlColors,
    skeletonColors,
    hintColors,
    statCardColors,
    multiSelectColors,
    socialButtonColors,
    collapsibleColors,
    externalLinkColors,
    selectColors,
    selectNativeColors,
    selectBottomSheetColors,
    segmentedControlColors,
    datePickerColors,
    dateRangePickerColors,
    radius,
    spacing,
  } = tokens;
  return {
    buttonColors,
    textColors,
    alertColors,
    radioGroupColors,
    inputColors,
    currencyInputColors,
    surfaceColors,
    refreshControlColors,
    skeletonColors,
    hintColors,
    statCardColors,
    multiSelectColors,
    socialButtonColors,
    collapsibleColors,
    externalLinkColors,
    selectColors,
    selectNativeColors,
    selectBottomSheetColors,
    segmentedControlColors,
    datePickerColors,
    dateRangePickerColors,
    radius: {
      sm: radius * 0.5,
      md: radius,
      lg: radius * 1.5,
      pill: 9999,
    },
    space: {
      xs: spacing * 0.5,
      sm: spacing,
      md: spacing * 2,
      lg: spacing * 3,
      xl: spacing * 4,
    },
  };
}
