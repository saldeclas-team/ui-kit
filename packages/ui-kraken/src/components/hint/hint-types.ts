import type { ReactNode } from "react";
import type { GetProps } from "tamagui";

import type { HintToneColors } from "../../tokens/tokens-types";
import type { StyledHint } from "./hint.styled";

/**
 * Semantic tone. Drives the resolved 3-slot palette (text / icon /
 * background) and the a11y announcement priority: `warning` +
 * `danger` set `accessibilityLiveRegion="polite"` so late-mounted
 * hints get announced without stealing focus.
 */
export type HintTone = "neutral" | "info" | "success" | "warning" | "danger";

/**
 * Visual weight.
 *
 * - `"ghost"` (default) — transparent background, tone-colored text + icon.
 * - `"soft"` — tinted background matched to the tone.
 */
export type HintEmphasis = "ghost" | "soft";

/**
 * Per-instance override input for `<Hint>`. Partial of one tone's
 * slots — the tone is already picked (via the `tone` prop or a
 * compound shortcut like `Hint.Info`), so this only needs the slots
 * inside that tone, all optional. Missing slots fall through to the
 * provider-resolved tone palette.
 */
export type HintColorsInput = Partial<HintToneColors>;

/**
 * `HintProps` re-declares only the props we own. Every Tamagui style
 * prop that `StyledHint` accepts flows through the `...rest` spread
 * (padding, margin, pressStyle, shorthand aliases, etc.) with types
 * inferred from `GetProps<typeof StyledHint>`.
 */
export interface HintProps extends Omit<GetProps<typeof StyledHint>, "children" | "color"> {
  /** Semantic tone. Defaults to `"neutral"`. */
  tone?: HintTone;
  /** Visual weight. Defaults to `"ghost"` (transparent background). */
  emphasis?: HintEmphasis;
  /**
   * Compact spacing mode — padding + gap shrink one step. Use next to
   * Input / CurrencyInput helper-text regions where the parent already
   * provides breathing room.
   */
  dense?: boolean;
  /**
   * Optional leading icon. `Hint` does NOT depend on an icon library
   * — consumer brings their own (`<Hint icon={<InfoIcon />}>`).
   */
  icon?: ReactNode;
  /** Optional bold heading rendered above the body. */
  title?: string;
  /** Body content. Strings are wrapped in `<Text>`; ReactNodes render as-is. */
  children?: ReactNode;
  /**
   * Per-instance color override for THIS hint's resolved tone.
   * Missing slots fall through to the provider-resolved tone palette.
   */
  hintColors?: HintColorsInput;
  /**
   * Root testID. Sub-elements derive:
   * `{testID}-icon`, `{testID}-title`, `{testID}-body`.
   */
  testID?: string;
}
