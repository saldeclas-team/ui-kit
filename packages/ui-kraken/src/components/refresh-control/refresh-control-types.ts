import type { RefreshControlProps as RNRefreshControlProps } from "react-native";

import type { RefreshControlColors } from "../../tokens/tokens-types";

/**
 * Per-instance override input. Partial of the full
 * `RefreshControlColors` palette; missing slots fall through to the
 * provider-resolved defaults.
 */
export type RefreshControlColorsInput = Partial<RefreshControlColors>;

/**
 * `RefreshControlProps` re-declares only what is OURS. Every RN
 * `RefreshControlProps` (except the four we own — `tintColor`,
 * `colors`, `progressBackgroundColor`, `titleColor`) flows through
 * `...rest` with types inferred from `Omit<...>`. Consumer passes
 * `title` (iOS), `progressViewOffset`, `size`, every accessibility
 * prop, etc.
 */
export interface RefreshControlProps extends Omit<
  RNRefreshControlProps,
  "tintColor" | "colors" | "progressBackgroundColor" | "titleColor"
> {
  /** `true` while a refresh is in progress. */
  refreshing: boolean;
  /** Fires when the user pulls the scrollable down past the threshold. */
  onRefresh: () => void;
  /**
   * Per-instance color override. Missing slots fall through to the
   * provider-resolved palette.
   */
  refreshControlColors?: RefreshControlColorsInput;
  /** Root testID. Default: `"refresh-control"`. */
  testID?: string;
}
