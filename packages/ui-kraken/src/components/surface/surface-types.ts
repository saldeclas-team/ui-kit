import type { YStackProps } from "tamagui";

import type { SurfaceColors } from "../../tokens/tokens-types";

/**
 * Semantic elevation level. Each value maps to one slot on
 * `surfaceColors` at render time.
 *
 * - `"base"`    — standard app background (default).
 * - `"raised"`  — cards, list items on top of the base surface.
 * - `"overlay"` — modals, sheets, dropdowns (highest visual layer).
 * - `"sunken"`  — inset areas (form sections, code blocks, muted panels).
 */
export type SurfaceLevel = "base" | "raised" | "overlay" | "sunken";

/**
 * Per-instance override input. Partial of the full `SurfaceColors`
 * palette — every slot optional; missing slots fall through to the
 * provider-resolved defaults. Only the slot for the resolved `level`
 * is actually read at render time, but the type accepts the full
 * palette so provider-level and per-instance overrides use the same
 * shape.
 */
export type SurfaceColorsInput = Partial<SurfaceColors>;

/**
 * `SurfaceProps` re-declares only props that are OURS. Every Tamagui
 * `YStackProps` flows through the `...rest` spread — `padding`,
 * `paddingHorizontal`, `margin`, `gap`, `flex`, `borderRadius`,
 * `borderWidth`, `borderColor`, `pressStyle`, shorthand aliases
 * (`px`, `py`, `mx`, `br`), etc. `backgroundColor` is intentionally
 * omitted from the spread because the resolved level palette controls
 * it — if a consumer needs a totally custom background they should
 * pass it via `surfaceColors={{ [level]: "#..." }}` instead.
 */
export interface SurfaceProps extends Omit<YStackProps, "backgroundColor"> {
  /** Semantic elevation level. Default: `"base"`. */
  level?: SurfaceLevel;
  /**
   * Per-instance color override. Missing slots fall through to the
   * provider-resolved palette.
   */
  surfaceColors?: SurfaceColorsInput;
  /** Root testID. Default: `"surface"`. */
  testID?: string;
}
