import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TamaguiProvider } from "tamagui";

import { useUIKit } from "../../provider/use-ui-kit";
import { resolveRadius } from "../../utils/radius";
import { resolvePalette } from "../../utils/resolve-palette";
import {
  areBottomSheetPeersAvailable,
  getGorhomModule,
  missingBottomSheetPeers,
} from "./gorhom-probe";
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
 * Single-choice picker rendered as a trigger + draggable bottom
 * sheet. Same controlled shape as [[Select]], but the popup uses
 * `@gorhom/bottom-sheet` — the panel slides up from the bottom
 * of the screen and can be dismissed by dragging down or tapping
 * the backdrop.
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
 * Because `@gorhom/bottom-sheet` + `react-native-gesture-handler`
 * are optional peer deps, ui-kraken doesn't fail to import when
 * consumers omit them. Instead the trigger renders a helpful
 * inline "install X, Y" hint so consumers see the problem and
 * can fix it without a crash.
 *
 * **Provider requirement**: the consumer must mount
 * `<BottomSheetModalProvider>` (from `@gorhom/bottom-sheet`)
 * somewhere above `<SelectBottomSheet>` in the tree — usually at
 * the app root, next to `<UIKitProvider>`. Without it, the sheet
 * fails to present.
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
  snapPoints = ["50%"],
  radius = "md",
  selectBottomSheetColors,
  testID,
  ...rest
}: SelectBottomSheetProps<Value>) {
  const { tokens, tamaguiConfig, activeTheme } = useUIKit();
  const rootId = testID ?? "select-bottom-sheet";
  const palette = resolvePalette(tokens.selectBottomSheetColors, selectBottomSheetColors);
  const resolvedRadius = resolveRadius(radius);
  const disabledSet = disabledOptions != null ? new Set(disabledOptions) : null;
  const isInvalid = errorText != null && errorText.length > 0;

  const peersAvailable = areBottomSheetPeersAvailable();
  const missing = missingBottomSheetPeers();
  const gorhom = getGorhomModule();

  // Ref points at the imperative BottomSheetModal handle. Tracked
  // as `unknown`-ish here to keep the peer-dep types out of our
  // public surface — the module namespace is fully wrapped by the
  // probe.
  const modalRef = useRef<{
    present?: () => void;
    dismiss?: () => void;
  } | null>(null);
  const [open, setOpen] = useState(false);

  // Track whether the sheet is currently presented at the gorhom
  // layer. Kept in sync via the `onChange` callback (-1 = closed,
  // ≥0 = open at snap point). Prevents double-present() / double-
  // dismiss() calls, which put gorhom's imperative handle in a
  // zombie state where subsequent present() calls silently no-op
  // — the exact failure mode users see as "trigger reacts but no
  // sheet". Same guard the reference `BottomSheet` component in
  // duna-app uses.
  const isPresentedRef = useRef(false);

  // Memoize snapPoints — gorhom compares by reference and re-
  // creates its animated node whenever the array identity
  // changes. Passing the default `["50%"]` inline creates a new
  // array on every render, which breaks the sheet's presentation.
  const resolvedSnapPoints = useMemo(() => snapPoints, [snapPoints]);

  const openSheet = useCallback(() => {
    if (!peersAvailable) return;
    setOpen(true);
  }, [peersAvailable]);
  const pickOption = useCallback(
    (v: Value) => {
      onChange(v);
      setOpen(false);
    },
    [onChange]
  );

  useEffect(() => {
    if (!peersAvailable) return;
    if (open && !isPresentedRef.current) {
      modalRef.current?.present?.();
    } else if (!open && isPresentedRef.current) {
      modalRef.current?.dismiss?.();
    }
  }, [open, peersAvailable]);

  // Sheet-position change from gorhom. -1 = closed, ≥0 = open.
  // Keeps `isPresentedRef` truthful so the useEffect can gate
  // its imperative calls correctly.
  const handleChange = useCallback((index: number) => {
    isPresentedRef.current = index >= 0;
  }, []);

  const handleDismiss = useCallback(() => {
    isPresentedRef.current = false;
    setOpen(false);
  }, []);

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
    <StyledSelectBottomSheet testID={rootId} {...rest}>
      {label != null && label.length > 0 && (
        <StyledSelectBottomSheetLabel testID={`${rootId}-label`} color={palette.label}>
          {label}
        </StyledSelectBottomSheetLabel>
      )}

      <StyledSelectBottomSheetTrigger
        testID={`${rootId}-trigger`}
        onPress={openSheet}
        disabled={disabled || !peersAvailable}
        backgroundColor={triggerBackground}
        borderColor={triggerBorder}
        borderRadius={resolvedRadius}
        accessibilityRole="combobox"
        accessibilityLabel={label ?? placeholder}
        accessibilityState={{ disabled: disabled || !peersAvailable, expanded: open }}
      >
        {peersAvailable ? (
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
            {`Install ${missing.map((m) => `\`${m}\``).join(" + ")} to enable SelectBottomSheet.`}
          </StyledSelectBottomSheetMissingPeer>
        )}
      </StyledSelectBottomSheetTrigger>

      {isInvalid ? (
        <StyledSelectBottomSheetErrorText testID={`${rootId}-error-text`} color={palette.errorText}>
          {errorText}
        </StyledSelectBottomSheetErrorText>
      ) : helperText != null && helperText.length > 0 ? (
        <StyledSelectBottomSheetHelperText
          testID={`${rootId}-helper-text`}
          color={palette.helperText}
        >
          {helperText}
        </StyledSelectBottomSheetHelperText>
      ) : null}

      {peersAvailable && gorhom != null && (
        <gorhom.BottomSheetModal
          ref={modalRef}
          testID={`${rootId}-sheet`}
          snapPoints={resolvedSnapPoints}
          enablePanDownToClose
          onChange={handleChange}
          onDismiss={handleDismiss}
          backgroundStyle={{ backgroundColor: palette.sheetBackground }}
          handleIndicatorStyle={{ backgroundColor: palette.sheetHandle }}
          backdropComponent={(props: Record<string, unknown>) => (
            <gorhom.BottomSheetBackdrop
              {...props}
              appearsOnIndex={0}
              disappearsOnIndex={-1}
              opacity={0.5}
              pressBehavior="close"
            />
          )}
        >
          <gorhom.BottomSheetView>
            {/*
              Gorhom mounts the sheet through a native portal that
              does NOT preserve React context — the `TamaguiProvider`
              higher up the tree is invisible to descendants of
              `BottomSheetView`. Re-mount it here (same config +
              active theme) so the styled components below can
              resolve their theme without crashing with "Can't find
              Tamagui configuration".
            */}
            <TamaguiProvider config={tamaguiConfig} defaultTheme={activeTheme}>
              {sheetTitle != null && sheetTitle.length > 0 && (
                <StyledSelectBottomSheetTitle
                  testID={`${rootId}-sheet-title`}
                  color={palette.label}
                >
                  {sheetTitle}
                </StyledSelectBottomSheetTitle>
              )}
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
            </TamaguiProvider>
          </gorhom.BottomSheetView>
        </gorhom.BottomSheetModal>
      )}
    </StyledSelectBottomSheet>
  );
}

export type {
  SelectBottomSheetColorsInput,
  SelectBottomSheetOption,
  SelectBottomSheetProps,
  SelectBottomSheetRadius,
  SelectBottomSheetSnapPoint,
} from "./select-bottom-sheet-types";
