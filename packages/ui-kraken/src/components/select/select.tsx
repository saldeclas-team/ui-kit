import { useCallback, useState } from "react";
import { Modal, Pressable, ScrollView } from "react-native";

import { useUIKit } from "../../provider/use-ui-kit";
import { resolveRadius } from "../../utils/radius";
import { resolvePalette } from "../../utils/resolve-palette";
import {
  StyledSelect,
  StyledSelectChevron,
  StyledSelectErrorText,
  StyledSelectHelperText,
  StyledSelectLabel,
  StyledSelectMenu,
  StyledSelectMenuTitle,
  StyledSelectOption,
  StyledSelectOptionLabel,
  StyledSelectOverlay,
  StyledSelectTrigger,
  StyledSelectTriggerText,
} from "./select.styled";
import type { SelectProps } from "./select-types";

/**
 * Single-choice picker rendered as a trigger + centered modal card
 * list. Controlled: consumer holds `value: Value | null` in state
 * and updates via `onChange`. Generic in the value type so consumers
 * keep type-safety on `value`, `onChange`, and each `option.value`.
 *
 * ```tsx
 * const [country, setCountry] = useState<Country | null>(null);
 * <Select
 *   options={COUNTRIES}
 *   value={country}
 *   onChange={setCountry}
 *   label="Country"
 *   placeholder="Choose a country"
 * />
 * ```
 *
 * Palette derived from `tokens.selectColors` on the provider,
 * overridable per-instance via the `selectColors?` prop.
 *
 * Backend is pure JS + `<Modal>` from `react-native` — no peer dep.
 * Modal card animates in with the RN-native `"fade"` animation and
 * blocks touches on the underlying screen until dismissed via
 * backdrop tap or option pick.
 */
export function Select<Value extends string = string>({
  options,
  value,
  onChange,
  label,
  helperText,
  errorText,
  placeholder = "Select…",
  modalTitle,
  disabled = false,
  disabledOptions,
  radius = "md",
  selectColors,
  testID,
  ...rest
}: SelectProps<Value>) {
  const { tokens } = useUIKit();
  const rootId = testID ?? "select";
  const palette = resolvePalette(tokens.selectColors, selectColors);
  const resolvedRadius = resolveRadius(radius);
  const disabledSet = disabledOptions != null ? new Set(disabledOptions) : null;

  const [open, setOpen] = useState(false);
  const isInvalid = errorText != null && errorText.length > 0;

  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);
  const pickOption = useCallback(
    (v: Value) => {
      onChange(v);
      setOpen(false);
    },
    [onChange]
  );

  const selectedOption = value != null ? (options.find((o) => o.value === value) ?? null) : null;
  const triggerText = selectedOption != null ? selectedOption.label : placeholder;
  const triggerTextColor = disabled
    ? palette.textDisabled
    : selectedOption != null
      ? palette.text
      : palette.placeholder;

  const triggerBorder = disabled
    ? palette.border
    : isInvalid
      ? palette.borderError
      : open
        ? palette.borderFocused
        : palette.border;
  const triggerBackground = disabled ? palette.backgroundDisabled : palette.background;

  return (
    <StyledSelect testID={rootId} {...rest}>
      {label != null && label.length > 0 && (
        <StyledSelectLabel testID={`${rootId}-label`} color={palette.label}>
          {label}
        </StyledSelectLabel>
      )}

      <StyledSelectTrigger
        testID={`${rootId}-trigger`}
        onPress={openModal}
        disabled={disabled}
        backgroundColor={triggerBackground}
        borderColor={triggerBorder}
        borderRadius={resolvedRadius}
        accessibilityRole="combobox"
        accessibilityLabel={label ?? placeholder}
        accessibilityState={{ disabled, expanded: open }}
      >
        <StyledSelectTriggerText testID={`${rootId}-trigger-text`} color={triggerTextColor}>
          {triggerText}
        </StyledSelectTriggerText>
        <StyledSelectChevron color={palette.chevron}>{open ? "▲" : "▼"}</StyledSelectChevron>
      </StyledSelectTrigger>

      {isInvalid ? (
        <StyledSelectErrorText testID={`${rootId}-error-text`} color={palette.errorText}>
          {errorText}
        </StyledSelectErrorText>
      ) : helperText != null && helperText.length > 0 ? (
        <StyledSelectHelperText testID={`${rootId}-helper-text`} color={palette.helperText}>
          {helperText}
        </StyledSelectHelperText>
      ) : null}

      <Modal
        testID={`${rootId}-modal`}
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <Pressable
          testID={`${rootId}-modal-overlay`}
          onPress={closeModal}
          accessibilityRole="button"
          accessibilityLabel="Close"
          style={{ flex: 1 }}
        >
          <StyledSelectOverlay backgroundColor={palette.overlayBackground}>
            <Pressable onPress={(e) => e.stopPropagation()} style={{ width: "100%" }}>
              <StyledSelectMenu backgroundColor={palette.menuBackground}>
                {modalTitle != null && modalTitle.length > 0 && (
                  <StyledSelectMenuTitle testID={`${rootId}-modal-title`} color={palette.menuTitle}>
                    {modalTitle}
                  </StyledSelectMenuTitle>
                )}
                <ScrollView testID={`${rootId}-modal-list`}>
                  {options.map((item) => {
                    const isSelected = item.value === value;
                    const optionDisabled = disabledSet?.has(item.value) ?? false;
                    return (
                      <StyledSelectOption
                        key={item.value}
                        testID={`${rootId}-option-${item.value}`}
                        onPress={() => pickOption(item.value)}
                        disabled={optionDisabled}
                        backgroundColor={
                          isSelected ? palette.optionSelectedBackground : "transparent"
                        }
                        accessibilityRole="menuitem"
                        accessibilityState={{
                          selected: isSelected,
                          disabled: optionDisabled,
                        }}
                        accessibilityLabel={item.label}
                      >
                        <StyledSelectOptionLabel
                          testID={`${rootId}-option-${item.value}-label`}
                          color={palette.text}
                        >
                          {item.label}
                        </StyledSelectOptionLabel>
                      </StyledSelectOption>
                    );
                  })}
                </ScrollView>
              </StyledSelectMenu>
            </Pressable>
          </StyledSelectOverlay>
        </Pressable>
      </Modal>
    </StyledSelect>
  );
}

export type { SelectColorsInput, SelectOption, SelectProps, SelectRadius } from "./select-types";
