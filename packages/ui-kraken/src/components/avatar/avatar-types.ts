import type { ImageSourcePropType } from "react-native";
import type { YStackProps } from "tamagui";

import type { AvatarColors } from "../../tokens/tokens-types";

/**
 * Size preset. Maps to a pixel value at render time:
 * `"sm"` → 24, `"md"` → 40 (default), `"lg"` → 56, `"xl"` → 80.
 * Consumers who need a specific pixel size pass a `number`.
 */
export type AvatarSize = "sm" | "md" | "lg" | "xl";

/**
 * Corner shape. `"circle"` → borderRadius = size/2 (perfectly round);
 * `"rounded"` → 8px (softer chrome); `"square"` → 0.
 */
export type AvatarShape = "circle" | "rounded" | "square";

/**
 * Per-instance color override. Partial of the full `AvatarColors`
 * palette — missing slots fall through to the provider palette.
 * Only read when the Avatar isn't rendering an actual image.
 */
export type AvatarColorsInput = Partial<AvatarColors>;

/**
 * `AvatarProps` re-declares only props that are OURS. Every
 * Tamagui `YStackProps` flows through the `...rest` spread —
 * `margin`, `flex`, `borderWidth`, `pressStyle`, etc.
 * `backgroundColor` is intentionally omitted from the spread
 * because the palette-resolved `background` slot controls it.
 */
export interface AvatarProps extends Omit<YStackProps, "backgroundColor"> {
  /**
   * Image source. When provided AND the image loads successfully,
   * the Avatar renders it. On error (or absent), falls back to
   * initials.
   */
  source?: ImageSourcePropType;
  /**
   * Full name — used to compute initials automatically when no
   * explicit `initials` is passed. First + last word initial;
   * single-word names yield just the first letter.
   */
  name?: string;
  /**
   * Explicit initials override. Wins over the computed value from
   * `name`. Use for placeholder strings (`"?"`) or emoji.
   */
  initials?: string;
  /**
   * Size preset OR raw number.
   * `"sm"` → 24, `"md"` → 40 (default), `"lg"` → 56, `"xl"` → 80.
   */
  size?: AvatarSize | number;
  /**
   * Corner shape. `"circle"` → perfectly round; `"rounded"` → 8px
   * radius; `"square"` → 0. Default: `"circle"`.
   */
  shape?: AvatarShape;
  /** Per-instance color override. */
  avatarColors?: AvatarColorsInput;
  /** Root testID. Default: `"avatar"`. */
  testID?: string;
}
