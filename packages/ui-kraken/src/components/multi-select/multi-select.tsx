import { useCallback } from "react";

import { useUIKit } from "../../provider/use-ui-kit";
import type { MultiSelectColors } from "../../tokens/tokens-types";
import {
  StyledMultiSelect,
  StyledMultiSelectChip,
  StyledMultiSelectChipLabel,
  StyledMultiSelectChips,
  StyledMultiSelectErrorText,
  StyledMultiSelectGroupLabel,
  StyledMultiSelectHelperText,
} from "./multi-select.styled";
import type {
  MultiSelectColorsInput,
  MultiSelectProps,
  MultiSelectRadius,
} from "./multi-select-types";

/**
 * Multi-choice selector rendered as a wrap of pill chips. Controlled:
 * consumer holds `value: Value[]` in state and updates via `onChange`.
 * Generic in the value type so consumers keep type-safety on `value`,
 * `onChange`, and each `option.value`.
 *
 * ```tsx
 * const [selected, setSelected] = useState<Filter[]>([]);
 * <MultiSelect
 *   options={FILTERS}
 *   value={selected}
 *   onChange={setSelected}
 *   label="Categories"
 * />
 * ```
 *
 * Palette derived from `tokens.multiSelectColors` on the provider,
 * overridable per-instance via the `multiSelectColors?` prop.
 */
export function MultiSelect<Value extends string = string>({
  options,
  value,
  onChange,
  label,
  helperText,
  errorText,
  disabled = false,
  disabledOptions,
  radius = "pill",
  multiSelectColors,
  testID,
  ...rest
}: MultiSelectProps<Value>) {
  const { tokens } = useUIKit();
  const rootId = testID ?? "multi-select";
  const palette = resolvePalette(tokens.multiSelectColors, multiSelectColors);
  const resolvedRadius = resolveRadius(radius);
  const disabledSet = disabledOptions != null ? new Set(disabledOptions) : null;

  // The disabled state is enforced by the Styled chip's
  // `pointerEvents: none` variant + Pressable's `disabled` prop —
  // both block the press before it reaches this handler. No extra
  // guard needed here.
  const handleToggle = useCallback(
    (v: Value) => {
      const next = value.includes(v) ? value.filter((entry) => entry !== v) : [...value, v];
      onChange(next);
    },
    [onChange, value]
  );

  return (
    <StyledMultiSelect
      testID={rootId}
      accessibilityRole="list"
      accessibilityLabel={label}
      {...rest}
    >
      {label != null && label.length > 0 && (
        <StyledMultiSelectGroupLabel testID={`${rootId}-label`} color={palette.groupLabel}>
          {label}
        </StyledMultiSelectGroupLabel>
      )}

      <StyledMultiSelectChips testID={`${rootId}-chips`}>
        {options.map((option) => {
          const isSelected = value.includes(option.value);
          const chipDisabled = disabled || (disabledSet?.has(option.value) ?? false);
          const chipBackground = isSelected
            ? palette.selectedBackground
            : palette.unselectedBackground;
          const chipBorder = isSelected ? palette.selectedBorder : palette.unselectedBorder;
          const chipLabelColor = isSelected ? palette.selectedLabel : palette.unselectedLabel;
          return (
            <StyledMultiSelectChip
              key={option.value}
              testID={`${rootId}-chip-${option.value}`}
              onPress={() => handleToggle(option.value)}
              disabled={chipDisabled}
              backgroundColor={chipBackground}
              borderColor={chipBorder}
              borderRadius={resolvedRadius}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected, disabled: chipDisabled }}
              accessibilityLabel={option.label}
            >
              <StyledMultiSelectChipLabel
                testID={`${rootId}-chip-${option.value}-label`}
                color={chipLabelColor}
              >
                {option.label}
              </StyledMultiSelectChipLabel>
            </StyledMultiSelectChip>
          );
        })}
      </StyledMultiSelectChips>

      {errorText != null && errorText.length > 0 ? (
        <StyledMultiSelectErrorText testID={`${rootId}-error-text`} color={palette.errorText}>
          {errorText}
        </StyledMultiSelectErrorText>
      ) : helperText != null && helperText.length > 0 ? (
        <StyledMultiSelectHelperText testID={`${rootId}-helper-text`} color={palette.helperText}>
          {helperText}
        </StyledMultiSelectHelperText>
      ) : null}
    </StyledMultiSelect>
  );
}

/**
 * Merge the per-instance `multiSelectColors?` override on top of the
 * provider-resolved palette. Missing slots fall through.
 */
function resolvePalette(
  base: MultiSelectColors,
  override: MultiSelectColorsInput | undefined
): MultiSelectColors {
  if (override == null) return base;
  return { ...base, ...override };
}

/**
 * Map the `radius` shorthand onto a `borderRadius` value. Numbers and
 * `"pill"` pass through directly; named preset values map onto the
 * theme's `$uiRadius*` token scale.
 */
function resolveRadius(radius: MultiSelectRadius): number | string {
  if (typeof radius === "number") return radius;
  if (radius === "none") return 0;
  if (radius === "pill") return 9999;
  const map: Record<Exclude<MultiSelectRadius, "none" | "pill" | number>, string> = {
    sm: "$uiRadiusSm",
    md: "$uiRadiusMd",
    lg: "$uiRadiusLg",
  };
  return map[radius];
}

export type {
  MultiSelectColorsInput,
  MultiSelectOption,
  MultiSelectProps,
  MultiSelectRadius,
} from "./multi-select-types";
