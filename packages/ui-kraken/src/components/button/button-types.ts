import type { ReactNode } from "react";
import type { GetProps } from "tamagui";

import type { ButtonVariantColors } from "../../tokens/tokens-types";
import type { RadiusValue } from "../../utils/radius";
import type { StyledButton } from "./button.styled";

/**
 * Visual tone of the button.
 *
 * - `primary` — solid surface, `buttonColors.primary` palette.
 * - `secondary` — solid surface, `buttonColors.secondary` palette.
 * - `outline` — transparent surface with a border, `buttonColors.outline` palette.
 * - `ghost` — no surface, no border, `buttonColors.ghost` palette (text-only).
 * - `destructive` — solid surface, `buttonColors.destructive` palette.
 */
export type ButtonTone = "primary" | "secondary" | "outline" | "ghost" | "destructive";

export type ButtonSize = "sm" | "md" | "lg";

/**
 * Border radius selector. Alias for the shared `RadiusValue` union —
 * every component-with-radius primitive in ui-kraken shares the same
 * shape and the `resolveRadius` helper from `utils/radius`. Button
 * additionally supports `undefined` at the prop level so the size
 * variant's default radius wins when unset.
 */
export type ButtonRadius = RadiusValue;

/**
 * Shadow / elevation preset. Values are hardcoded in v0.2 — no theme knob.
 * `"none"` is the default (flat). `"sm"` / `"md"` / `"lg"` map to progressively
 * stronger shadows. On iOS this uses `shadow*` style props; on Android it uses
 * `elevation`. `outline` and `ghost` tones render shadows against a transparent
 * background, which iOS clips — set `elevation` on solid tones for best results.
 */
export type ButtonElevation = "none" | "sm" | "md" | "lg";

/**
 * Per-instance color override. Same shape as `ButtonVariantColors` at
 * the provider level, but partial — missing fields fall through to the theme
 * palette for the current variant. The variant itself is implicit because you
 * already picked it (`Button.Primary`, `Button.Ghost`, etc.).
 */
export type ButtonVariantColorsInput = Partial<ButtonVariantColors>;

/**
 * All Tamagui style props the underlying `StyledButton` accepts flow through
 * for free (`onPress`, `paddingHorizontal`, `animation`, `pressStyle`, …).
 */
type StyledButtonProps = GetProps<typeof StyledButton>;

export interface ButtonProps extends Omit<StyledButtonProps, "children" | "size" | "borderRadius"> {
  children?: ReactNode;
  /** Explicit tone. Usually driven by the subcomponent (`Button.Ghost` sets `tone="ghost"`). */
  tone?: ButtonTone;
  /** Vertical size. Defaults to `"md"`. */
  size?: ButtonSize;
  /**
   * Border radius. Preset name (`"sm" | "md" | "lg" | "pill" | "none"`) or an
   * explicit px number. `"pill"` produces a fully rounded button. When
   * omitted, the radius is derived from `size` (each size has a default).
   */
  radius?: ButtonRadius;
  /**
   * Shadow / elevation level. Defaults to `"none"` (flat). `"sm"` / `"md"` /
   * `"lg"` apply progressively stronger shadows. Values are shipped defaults;
   * no theme customization in v0.2.
   */
  elevation?: ButtonElevation;
  /** Disables press interaction and dims the surface (opacity 0.45). */
  disabled?: boolean;
  /** Replaces the left icon with a loading spinner and disables interaction. */
  loading?: boolean;
  /** Slot rendered before the label. Hidden while `loading`. */
  leftIcon?: ReactNode;
  /** Slot rendered after the label. */
  rightIcon?: ReactNode;
  /**
   * Per-instance color override for THIS button's variant. Same shape as the
   * corresponding variant slot at the provider (`{ background?, label, border? }`)
   * but every field is optional — missing slots fall through to the theme.
   */
  buttonColors?: ButtonVariantColorsInput;
  /** Root testID. Subelements derive: `{testID}-label`, `{testID}-left-icon`, `{testID}-right-icon`, `{testID}-loader`. */
  testID?: string;
}
