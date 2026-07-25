import type { ComponentType, ReactNode, Ref } from "react";
import type { TextInput, TextInputProps } from "react-native";

import type { CurrencyInputColors } from "../../tokens/tokens-types";
import type { RadiusValue } from "../../utils/radius";

/**
 * Border radius selector. Alias for the shared `RadiusValue` union —
 * every component-with-radius primitive in ui-kraken shares the same
 * shape and the `resolveRadius` helper from `utils/radius`.
 */
export type CurrencyInputRadius = RadiusValue;

/**
 * Per-instance override input. Partial of the full `CurrencyInputColors`
 * palette; missing slots fall through to the provider-resolved defaults.
 */
export type CurrencyInputColorsInput = Partial<CurrencyInputColors>;

/**
 * `CurrencyInputProps` re-declares only props that are OURS. Every RN
 * `TextInputProps` (except the four we manage — `value`, `onChangeText`,
 * `keyboardType`, `style`) flows through `...rest`.
 */
export interface CurrencyInputProps extends Omit<
  TextInputProps,
  "value" | "onChangeText" | "keyboardType" | "style"
> {
  /** Controlled numeric value. `null` = empty. */
  value: number | null;
  /** Fires on every keystroke with the parsed numeric value (or `null`). */
  onChangeValue: (value: number | null) => void;
  /**
   * Optional bold label rendered above the input. Also becomes the
   * wrapper `accessibilityLabel` when provided.
   */
  label?: string;
  /**
   * Optional muted helper text rendered below the input. Hidden when
   * `error` is set (error message takes over that row).
   */
  helperText?: string;
  /**
   * Error message. When set (non-empty), activates the error border
   * style and replaces `helperText` in the row below the input.
   */
  error?: string;
  /**
   * Currency prefix rendered inside the input wrapper. Default: `"$"`.
   * Set to `""` to hide the prefix entirely; set to `"€"` / `"₡"` /
   * `"COP $"` / etc. for other currencies.
   */
  prefix?: string;
  /**
   * Maximum decimal places. Default: `0` (integer-only). Set to `2`
   * for USD / EUR; keep at `0` for currencies with no fractional
   * units like COP / JPY.
   */
  decimals?: number;
  /**
   * BCP 47 locale for thousands + decimal separators. Default:
   * `"en-US"`. Examples: `"en-US"` → `1,234.56`, `"es-CO"` →
   * `1.234,56`, `"de-DE"` → `1.234,56`, `"ja-JP"` → `1,234`.
   */
  locale?: string;
  /**
   * Optional leading icon slot (rendered before the prefix). Rare for
   * currency inputs — usually the prefix fills that space.
   */
  leftIcon?: ReactNode;
  /** Optional trailing icon slot (e.g., clear button). */
  rightIcon?: ReactNode;
  /** Disables editing + focus and dims the surface. */
  disabled?: boolean;
  /** Border radius on the input wrapper. Default: `"md"`. */
  radius?: CurrencyInputRadius;
  /**
   * Alternate `TextInput` implementation. Defaults to RN `TextInput`.
   * Pass `BottomSheetTextInput` from `@gorhom/bottom-sheet` when the
   * input renders inside a bottom sheet.
   */
  InputComponent?: ComponentType<TextInputProps & { ref?: Ref<TextInput> }>;
  /**
   * Per-instance color override. Missing slots fall through to the
   * provider-resolved palette.
   */
  currencyInputColors?: CurrencyInputColorsInput;
  /**
   * Root testID. Sub-elements derive:
   * `{testID}-label`, `{testID}-wrapper`, `{testID}-prefix`,
   * `{testID}-input`, `{testID}-left-icon`, `{testID}-right-icon`,
   * `{testID}-helper`, `{testID}-error`.
   */
  testID?: string;
}
