import { useCallback, useMemo, useRef, useState } from "react";
import { ScrollView } from "react-native";

import { useUIKit } from "../../provider/use-ui-kit";
import { resolveRadius } from "../../utils/radius";
import { resolvePalette } from "../../utils/resolve-palette";
import { BottomSheet } from "../bottom-sheet";
import type { BottomSheetRef } from "../bottom-sheet";
import { isBottomSheetAvailable } from "../bottom-sheet/expo-ui-bottom-sheet-probe";
import {
  StyledSelectBottomSheet,
  StyledSelectBottomSheetChevron,
  StyledSelectBottomSheetErrorText,
  StyledSelectBottomSheetHelperText,
  StyledSelectBottomSheetLabel,
  StyledSelectBottomSheetMissingPeer,
  StyledSelectBottomSheetOption,
  StyledSelectBottomSheetOptionLabel,
  StyledSelectBottomSheetTitle,
  StyledSelectBottomSheetTrigger,
  StyledSelectBottomSheetTriggerText,
} from "./select-bottom-sheet.styled";
import type { SelectBottomSheetProps } from "./select-bottom-sheet-types";

/**
 * Single-choice picker rendered as a trigger + native bottom
 * sheet. Same controlled shape as [[Select]], but the popup is a
 * native platform sheet (SwiftUI on iOS, Material 3 on Android,
 * vaul on web) via our own [[BottomSheet]] wrapper.
 *
 * ```tsx
 * const [country, setCountry] = useState<Country | null>(null);
 * <SelectBottomSheet
 *   options={COUNTRIES}
 *   value={country}
 *   onChange={setCountry}
 *   label="Country"
 * />
 * ```
 *
 * ### Architecture — dogfoods `<BottomSheet>`
 *
 * As of ui-kraken v0.9.x this component composes our own
 * `<BottomSheet>` (which wraps `@expo/ui/community/bottom-sheet`).
 * That means:
 *
 * - **Native affordances** on every platform (SwiftUI sheet /
 *   Material 3 sheet / vaul drawer).
 * - **Single peer** — `@expo/ui`, the same one every other
 *   Batch 2 native component uses. `@gorhom/bottom-sheet` and
 *   `react-native-gesture-handler` are NO LONGER required at
 *   runtime.
 * - **No provider ceremony** — no `<BottomSheetModalProvider>`
 *   at the app root. `<BottomSheet>` handles context (Tamagui
 *   re-mount) internally.
 *
 * Migrated from raw gorhom in the same PR that shipped the
 * general-purpose `<BottomSheet>` — see the CHANGELOG entry for
 * behavioral changes.
 */
export function SelectBottomSheet<Value extends string = string>({
  options,
  value,
  onChange,
  label,
  helperText,
  errorText,
  placeholder = "Select…",
  sheetTitle,
  disabled = false,
  disabledOptions,
  // Two-state default (`["50%", "90%"]`) instead of single-snap
  // `["50%"]` because Android's Material 3 sheet treats a single
  // snap point as `skipPartiallyExpanded=true` and opens straight
  // to fully expanded. Passing partial + expanded gives Android a
  // real partial state to default to; iOS respects both detents.
  // See BottomSheet's DEFAULT_SNAP_POINTS docstring for detail.
  snapPoints = ["50%", "90%"],
  radius = "md",
  selectBottomSheetColors,
  testID,
  ...rest
}: SelectBottomSheetProps<Value>) {
  const { tokens } = useUIKit();
  const rootId = testID ?? "select-bottom-sheet";
  const palette = resolvePalette(tokens.selectBottomSheetColors, selectBottomSheetColors);
  const resolvedRadius = resolveRadius(radius);
  const disabledSet = disabledOptions != null ? new Set(disabledOptions) : null;
  const isInvalid = errorText != null && errorText.length > 0;

  const peerAvailable = isBottomSheetAvailable();
  const sheetRef = useRef<BottomSheetRef>(null);
  // `open` is trigger-facing state only — controls the chevron
  // (▲ / ▼) and the focused border color. The actual sheet
  // open/close is driven imperatively via sheetRef so we avoid
  // gorhom's old useEffect race conditions.
  const [open, setOpen] = useState(false);

  const openSheet = useCallback(() => {
    if (!peerAvailable || disabled) return;
    setOpen(true);
    sheetRef.current?.present();
  }, [peerAvailable, disabled]);

  const pickOption = useCallback(
    (v: Value) => {
      onChange(v);
      setOpen(false);
      sheetRef.current?.dismiss();
    },
    [onChange]
  );

  const handleDismiss = useCallback(() => setOpen(false), []);

  // Map SelectBottomSheet's palette slots onto the smaller
  // BottomSheet palette. Only `sheetBackground` / `sheetHandle`
  // apply — the rest of the SelectBottomSheet palette paints the
  // trigger + list rows, which we render ourselves inside the
  // sheet body.
  const sheetChromeColors = useMemo(
    () => ({
      background: palette.sheetBackground,
      handle: palette.sheetHandle,
    }),
    [palette.sheetBackground, palette.sheetHandle]
  );

  const selectedOption = value != null ? (options.find((o) => o.value === value) ?? null) : null;
  const triggerText = selectedOption != null ? selectedOption.label : placeholder;
  const triggerTextColor = resolveTriggerTextColor({
    palette,
    disabled,
    hasValue: selectedOption != null,
  });
  const triggerBorder = resolveTriggerBorderColor({
    palette,
    disabled,
    isInvalid,
    open,
  });
  const triggerBackground = disabled ? palette.backgroundDisabled : palette.background;

  return (
    <StyledSelectBottomSheet testID={rootId} {...rest}>
      {label != null && label.length > 0 && (
        <StyledSelectBottomSheetLabel testID={`${rootId}-label`} color={palette.label}>
          {label}
        </StyledSelectBottomSheetLabel>
      )}

      <StyledSelectBottomSheetTrigger
        testID={`${rootId}-trigger`}
        onPress={openSheet}
        disabled={disabled || !peerAvailable}
        backgroundColor={triggerBackground}
        borderColor={triggerBorder}
        borderRadius={resolvedRadius}
        accessibilityRole="combobox"
        accessibilityLabel={label ?? placeholder}
        accessibilityState={{ disabled: disabled || !peerAvailable, expanded: open }}
      >
        {peerAvailable ? (
          <>
            <StyledSelectBottomSheetTriggerText
              testID={`${rootId}-trigger-text`}
              color={triggerTextColor}
            >
              {triggerText}
            </StyledSelectBottomSheetTriggerText>
            <StyledSelectBottomSheetChevron color={palette.chevron}>
              {open ? "▲" : "▼"}
            </StyledSelectBottomSheetChevron>
          </>
        ) : (
          <StyledSelectBottomSheetMissingPeer
            testID={`${rootId}-missing-peer`}
            color={palette.errorText}
          >
            Install `@expo/ui` to enable SelectBottomSheet.
          </StyledSelectBottomSheetMissingPeer>
        )}
      </StyledSelectBottomSheetTrigger>

      {renderFooter({ isInvalid, errorText, helperText, palette, rootId })}

      {peerAvailable && (
        <BottomSheet
          ref={sheetRef}
          testID={`${rootId}-sheet`}
          snapPoints={snapPoints}
          onDismiss={handleDismiss}
          bottomSheetColors={sheetChromeColors}
        >
          {sheetTitle != null && sheetTitle.length > 0 && (
            <StyledSelectBottomSheetTitle testID={`${rootId}-sheet-title`} color={palette.label}>
              {sheetTitle}
            </StyledSelectBottomSheetTitle>
          )}
          {/*
            ScrollView wrap so long option lists (e.g. 50+ countries)
            scroll inside the sheet body instead of overflowing off-
            screen. `BottomSheetView` from @expo/ui is a plain View
            with `flex: 1` — it fills the sheet but doesn't scroll.
            Wrapping in RN's ScrollView lets Android + iOS + web all
            scroll consistently. `nestedScrollEnabled` handles the
            Android case where the sheet itself is also draggable —
            without it, Android hijacks the scroll for drag.
          */}
          <ScrollView
            testID={`${rootId}-sheet-list`}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            {options.map((item) => {
              const isSelected = item.value === value;
              const optionDisabled = disabledSet?.has(item.value) ?? false;
              return (
                <StyledSelectBottomSheetOption
                  key={item.value}
                  testID={`${rootId}-option-${item.value}`}
                  onPress={() => pickOption(item.value)}
                  disabled={optionDisabled}
                  backgroundColor={isSelected ? palette.optionSelectedBackground : "transparent"}
                  accessibilityRole="menuitem"
                  accessibilityState={{ selected: isSelected, disabled: optionDisabled }}
                  accessibilityLabel={item.label}
                >
                  <StyledSelectBottomSheetOptionLabel
                    testID={`${rootId}-option-${item.value}-label`}
                    color={palette.text}
                  >
                    {item.label}
                  </StyledSelectBottomSheetOptionLabel>
                </StyledSelectBottomSheetOption>
              );
            })}
          </ScrollView>
        </BottomSheet>
      )}
    </StyledSelectBottomSheet>
  );
}

/**
 * Trigger text color — disabled > empty > filled. Extracted to
 * avoid nested ternaries in the shell body.
 */
function resolveTriggerTextColor({
  palette,
  disabled,
  hasValue,
}: {
  palette: { textDisabled: string; text: string; placeholder: string };
  disabled: boolean;
  hasValue: boolean;
}): string {
  if (disabled) return palette.textDisabled;
  if (hasValue) return palette.text;
  return palette.placeholder;
}

/**
 * Trigger border color — disabled > invalid > focused > default.
 * Extracted to avoid nested ternaries in the shell body.
 */
function resolveTriggerBorderColor({
  palette,
  disabled,
  isInvalid,
  open,
}: {
  palette: { border: string; borderError: string; borderFocused: string };
  disabled: boolean;
  isInvalid: boolean;
  open: boolean;
}): string {
  if (disabled) return palette.border;
  if (isInvalid) return palette.borderError;
  if (open) return palette.borderFocused;
  return palette.border;
}

/**
 * Footer row — error takes precedence over helper. Extracted to
 * keep the JSX flat.
 */
function renderFooter({
  isInvalid,
  errorText,
  helperText,
  palette,
  rootId,
}: {
  isInvalid: boolean;
  errorText?: string;
  helperText?: string;
  palette: { errorText: string; helperText: string };
  rootId: string;
}) {
  if (isInvalid) {
    return (
      <StyledSelectBottomSheetErrorText testID={`${rootId}-error-text`} color={palette.errorText}>
        {errorText}
      </StyledSelectBottomSheetErrorText>
    );
  }
  if (helperText != null && helperText.length > 0) {
    return (
      <StyledSelectBottomSheetHelperText
        testID={`${rootId}-helper-text`}
        color={palette.helperText}
      >
        {helperText}
      </StyledSelectBottomSheetHelperText>
    );
  }
  return null;
}

export type {
  SelectBottomSheetColorsInput,
  SelectBottomSheetOption,
  SelectBottomSheetProps,
  SelectBottomSheetRadius,
  SelectBottomSheetSnapPoint,
} from "./select-bottom-sheet-types";
