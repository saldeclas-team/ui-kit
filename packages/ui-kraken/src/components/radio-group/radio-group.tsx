import { useCallback } from "react";

import { useUIKit } from "../../provider/use-ui-kit";
import type { RadioGroupColors } from "../../tokens/tokens-types";
import { resolveRadius } from "../../utils/radius";
import {
  StyledRadioGroup,
  StyledRadioGroupLabel,
  StyledRadioOptionCircle,
  StyledRadioOptionDot,
  StyledRadioOptionLabel,
  StyledRadioOptionRow,
} from "./radio-group.styled";
import type { RadioGroupColorsInput, RadioGroupProps } from "./radio-group-types";

/**
 * Group of mutually-exclusive selectable options (single-choice
 * picker). Controlled: consumer holds the selected `value` in state
 * and updates via `onChange`. Generic in the value type so consumers
 * keep type-safety on `value`, `onChange`, and each `option.value`.
 *
 * Palette derived from `tokens.radioGroupColors` on the provider,
 * overridable per-instance via the `radioGroupColors?` prop.
 */
export function RadioGroup<T extends string = string>({
  value,
  onChange,
  options,
  label,
  disabled = false,
  orientation = "vertical",
  radius = "md",
  radioGroupColors,
  testID,
  ...rest
}: RadioGroupProps<T>) {
  const { tokens } = useUIKit();
  const rootId = testID ?? "radio-group";
  const palette = resolvePalette(tokens.radioGroupColors, radioGroupColors);
  const resolvedRadius = resolveRadius(radius);

  const handleSelect = useCallback(
    (v: T) => {
      if (disabled) return;
      if (v === value) return;
      onChange(v);
    },
    [disabled, onChange, value]
  );

  return (
    <StyledRadioGroup
      testID={rootId}
      orientation={orientation}
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      {...rest}
    >
      {label != null && label.length > 0 && (
        <StyledRadioGroupLabel testID={`${rootId}-label`} color={palette.groupLabel}>
          {label}
        </StyledRadioGroupLabel>
      )}
      {options.map((option) => {
        const isSelected = value === option.value;
        const rowBorder = isSelected ? palette.selectedBorder : palette.unselectedBorder;
        const rowBackground = isSelected
          ? palette.selectedBackground
          : palette.unselectedBackground;
        return (
          <StyledRadioOptionRow
            key={option.value}
            testID={`${rootId}-option-${option.value}`}
            onPress={() => handleSelect(option.value)}
            disabled={disabled}
            borderColor={rowBorder}
            backgroundColor={rowBackground}
            borderRadius={resolvedRadius}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected, disabled }}
          >
            <StyledRadioOptionCircle
              testID={`${rootId}-option-${option.value}-circle`}
              borderColor={rowBorder}
            >
              {isSelected && (
                <StyledRadioOptionDot
                  testID={`${rootId}-option-${option.value}-dot`}
                  backgroundColor={palette.dot}
                />
              )}
            </StyledRadioOptionCircle>
            <StyledRadioOptionLabel
              testID={`${rootId}-option-${option.value}-label`}
              color={palette.label}
            >
              {option.label}
            </StyledRadioOptionLabel>
          </StyledRadioOptionRow>
        );
      })}
    </StyledRadioGroup>
  );
}

/**
 * Merge the per-instance `radioGroupColors?` override on top of the
 * provider-resolved palette. Missing slots fall through. Optional
 * background slots stay `undefined` when neither the override nor the
 * provider palette sets them (renders as transparent row).
 */
function resolvePalette(
  base: RadioGroupColors,
  override: RadioGroupColorsInput | undefined
): RadioGroupColors {
  if (override == null) return base;
  return {
    selectedBorder: override.selectedBorder ?? base.selectedBorder,
    unselectedBorder: override.unselectedBorder ?? base.unselectedBorder,
    dot: override.dot ?? base.dot,
    label: override.label ?? base.label,
    groupLabel: override.groupLabel ?? base.groupLabel,
    selectedBackground: override.selectedBackground ?? base.selectedBackground,
    unselectedBackground: override.unselectedBackground ?? base.unselectedBackground,
  };
}

export type {
  RadioGroupColorsInput,
  RadioGroupProps,
  RadioOption,
  RadioOrientation,
  RadioRadius,
} from "./radio-group-types";
