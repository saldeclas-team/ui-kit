import type { ReactNode } from "react";
import type { GetProps } from "tamagui";

import type { StyledButton } from "./button.styled";

export interface ButtonColors {
  primary?: string;
  secondary?: string;
  disabled?: string;
  loading?: string;
}

export interface TextColors {
  primary?: string;
  secondary?: string;
  disabled?: string;
}

export interface IconColors {
  primary?: string;
  secondary?: string;
  disabled?: string;
}

export type ButtonTone = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

/**
 * All Tamagui style props the underlying `StyledButton` accepts flow through
 * for free (`onPress`, `paddingHorizontal`, `animation`, `pressStyle`, …).
 * Consumers rarely need them thanks to the variant system, but they exist.
 */
type StyledButtonProps = GetProps<typeof StyledButton>;

export interface ButtonProps extends Omit<StyledButtonProps, "children" | "size"> {
  children?: ReactNode;
  /** Explicit tone. Usually driven by the subcomponent (Button.Primary sets `tone="primary"`). */
  tone?: ButtonTone;
  /** Vertical size. Defaults to `"md"`. */
  size?: ButtonSize;
  /** Disables press interaction and dims the surface. */
  disabled?: boolean;
  /** Replaces the left icon with a loading spinner and disables interaction. */
  loading?: boolean;
  /** Slot rendered before the label. Hidden while `loading`. */
  leftIcon?: ReactNode;
  /** Slot rendered after the label. */
  rightIcon?: ReactNode;
  /** Per-instance overrides for the button surface color, keyed by tone. */
  buttonColors?: ButtonColors;
  /** Per-instance overrides for the label color, keyed by tone. */
  textColors?: TextColors;
  /** Per-instance overrides for icon slot tint, keyed by tone. */
  iconColors?: IconColors;
  /** Root testID. Subelements derive: `{testID}-label`, `{testID}-left-icon`, `{testID}-right-icon`, `{testID}-loader`. */
  testID?: string;
}
