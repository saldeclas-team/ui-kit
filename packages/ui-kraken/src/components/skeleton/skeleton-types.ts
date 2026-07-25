import type { ViewProps } from "react-native";

import type { SkeletonColors } from "../../tokens/tokens-types";

/**
 * Border-radius shorthand. Numeric / Tamagui `$` values passed via
 * `style={{ borderRadius }}` win over this prop.
 *
 * - `"none"` → `0`
 * - `"sm"`   → `radius.sm`
 * - `"md"`   → `radius.md` (default)
 * - `"lg"`   → `radius.lg`
 * - `"pill"` → `9999`
 */
export type SkeletonRadius = "none" | "sm" | "md" | "lg" | "pill";

/**
 * Animation mode. `"pulse"` fades between the `base` and `highlight`
 * palette slots on a loop; `"static"` paints a solid `base` fill
 * (use when the user has reduced-motion enabled).
 */
export type SkeletonVariant = "pulse" | "static";

/**
 * Per-instance override input. Partial of the full `SkeletonColors`
 * palette; missing slots fall through to the provider-resolved defaults.
 */
export type SkeletonColorsInput = Partial<SkeletonColors>;

/**
 * `SkeletonProps` re-declares only what is OURS. Every RN `ViewProps`
 * (except `children`, which the primitive owns) flows through the
 * `...rest` spread — `style`, `accessibilityRole`, `accessibilityLabel`,
 * `pointerEvents`, `onLayout`, every accessibility prop, etc.
 *
 * Consumer sets `width` + `height` via `style` (numeric px or percentage
 * string). No `size` prop — width / height cover the two orthogonal
 * dimensions with zero ambiguity.
 */
export interface SkeletonProps extends Omit<ViewProps, "children"> {
  /** Animation mode. Default: `"pulse"`. */
  variant?: SkeletonVariant;
  /**
   * Border-radius shorthand. `md` by default; explicit
   * `style={{ borderRadius }}` wins over this prop.
   */
  radius?: SkeletonRadius;
  /**
   * Per-instance color override. Missing slots fall through to the
   * provider-resolved palette.
   */
  skeletonColors?: SkeletonColorsInput;
  /** Root testID. Default: `"skeleton"`. */
  testID?: string;
}
