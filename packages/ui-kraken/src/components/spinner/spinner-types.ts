import type { ActivityIndicatorProps } from "react-native";

import type { SpinnerColors } from "../../tokens/tokens-types";

/**
 * Size preset. Maps to a pixel value at render time:
 * `"sm"` → 20, `"md"` → 32, `"lg"` → 48. Consumers who need a
 * specific pixel size pass a `number` directly. RN's original
 * `"small"` / `"large"` string values are also accepted and pass
 * through untouched.
 */
export type SpinnerSize = "sm" | "md" | "lg";

/**
 * Per-instance color override. Partial of the full `SpinnerColors`
 * palette — the only slot today is `color` so the type accepts
 * either `{}` or `{ color: string }`. Kept as a partial to match
 * the shape of every other component's per-instance override API.
 */
export type SpinnerColorsInput = Partial<SpinnerColors>;

/**
 * `SpinnerProps` re-declares only props that are OURS. `color` +
 * `size` are omitted from the RN spread because we own them:
 * `color` comes from the palette (override via `spinnerColors`),
 * `size` accepts our preset union + numbers + RN's string values.
 * Every other RN `ActivityIndicatorProps` flows through.
 */
export interface SpinnerProps extends Omit<ActivityIndicatorProps, "color" | "size"> {
  /**
   * Size preset OR raw number OR RN's string values.
   * `"sm"` → 20px, `"md"` → 32px, `"lg"` → 48px.
   * Default: `"md"`.
   */
  size?: SpinnerSize | number | "small" | "large";
  /**
   * Per-instance color override. Only the `color` slot is read but
   * the input shape accepts the full palette for consistency with
   * other components' override APIs.
   */
  spinnerColors?: SpinnerColorsInput;
  /** Root testID. Default: `"spinner"`. */
  testID?: string;
}
