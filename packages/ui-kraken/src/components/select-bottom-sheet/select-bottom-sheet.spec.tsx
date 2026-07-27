import { act, fireEvent, render, screen } from "@testing-library/react-native";

import type { SelectBottomSheetColors } from "../../tokens/tokens-types";

// `tamagui`'s top-level index is ESM-heavy — jest can't parse it out
// of the box. `SelectBottomSheet` no longer re-mounts TamaguiProvider
// itself (our BottomSheet handles that), but we still stub tamagui
// to keep the module graph parseable.
jest.mock("tamagui", () => {
  const rn = jest.requireActual("react-native");
  const React = jest.requireActual("react");
  return {
    Text: (props: Record<string, unknown>) => React.createElement(rn.Text, props),
    YStack: (props: Record<string, unknown>) => React.createElement(rn.View, props),
    styled: () => () => null,
  };
});

// Mock the styled file with rn.View / rn.Text stubs.
jest.mock("./select-bottom-sheet.styled", () => {
  const rn = jest.requireActual("react-native");
  const forwardRef = jest.requireActual("react").forwardRef;
  const box = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.View ref={ref} {...props} />
  ));
  const text = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.Text ref={ref} {...props} />
  ));
  const pressable = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.Pressable ref={ref} {...props} />
  ));
  return {
    StyledSelectBottomSheet: box,
    StyledSelectBottomSheetLabel: text,
    StyledSelectBottomSheetTrigger: pressable,
    StyledSelectBottomSheetTriggerText: text,
    StyledSelectBottomSheetChevron: text,
    StyledSelectBottomSheetHelperText: text,
    StyledSelectBottomSheetErrorText: text,
    StyledSelectBottomSheetTitle: text,
    StyledSelectBottomSheetOption: pressable,
    StyledSelectBottomSheetOptionLabel: text,
    StyledSelectBottomSheetMissingPeer: text,
  };
});

// Toggle-controlled mock of the BottomSheet peer-dep probe (same
// probe our own <BottomSheet> uses — SelectBottomSheet reads it
// directly to decide whether to render the trigger or the
// missing-peer hint).
const mockPeerAvailable = jest.fn(() => true);
jest.mock("../bottom-sheet/expo-ui-bottom-sheet-probe", () => ({
  isBottomSheetAvailable: () => mockPeerAvailable(),
}));

/**
 * Fake BottomSheet — the same shape our real component exposes
 * (ref with present/dismiss/etc.). Records present/dismiss calls
 * for regression tests, and simulates the "sheet opens ⇒
 * onChange(0) fires" cycle so state-dependent behavior on our
 * shell (chevron flip, expanded=true) is exercised end-to-end.
 */
interface FakeBottomSheetSpies {
  present: jest.Mock;
  dismiss: jest.Mock;
  lastSnapPoints: readonly (string | number)[] | undefined;
  lastPalette: Record<string, string> | undefined;
}

// `mock*`-prefixed so jest.mock()'s hoisting allows access. Shared
// across every render in the suite so tests can inspect calls.
const mockSpies: FakeBottomSheetSpies = {
  present: jest.fn(),
  dismiss: jest.fn(),
  lastSnapPoints: undefined,
  lastPalette: undefined,
};

jest.mock("../bottom-sheet", () => {
  const rn = jest.requireActual("react-native");
  const React = jest.requireActual("react");
  const FakeBottomSheet = React.forwardRef(function FakeBottomSheet(
    props: {
      children?: React.ReactNode;
      testID?: string;
      snapPoints?: readonly (string | number)[];
      onChange?: (index: number) => void;
      onDismiss?: () => void;
      bottomSheetColors?: Record<string, string>;
    },
    ref: React.Ref<{
      present: (index?: number) => void;
      dismiss: () => void;
      snapToIndex: (index: number) => void;
      expand: () => void;
      collapse: () => void;
    }>
  ) {
    mockSpies.lastSnapPoints = props.snapPoints;
    mockSpies.lastPalette = props.bottomSheetColors;
    React.useImperativeHandle(
      ref,
      () => ({
        present: (index?: number) => {
          mockSpies.present(index);
          props.onChange?.(0);
        },
        dismiss: () => {
          mockSpies.dismiss();
          props.onChange?.(-1);
          props.onDismiss?.();
        },
        snapToIndex: () => {},
        expand: () => {},
        collapse: () => {},
      }),
      [props]
    );
    // Render children inline so tests can assert on the option list
    // via getByTestId — mirrors the real BottomSheet which mounts
    // children inside a BottomSheetView.
    return React.createElement(rn.View, { testID: props.testID }, props.children);
  });
  return { BottomSheet: FakeBottomSheet };
});

const LIGHT_COLORS: SelectBottomSheetColors = {
  background: "#FFFFFF",
  backgroundDisabled: "#F3F4F6",
  border: "#D1D5DB",
  borderFocused: "#2563EB",
  borderError: "#DC2626",
  text: "#111827",
  textDisabled: "#9CA3AF",
  placeholder: "#9CA3AF",
  chevron: "#6B7280",
  label: "#111827",
  helperText: "#6B7280",
  errorText: "#DC2626",
  sheetBackground: "#FFFFFF",
  sheetHandle: "#D1D5DB",
  optionSelectedBackground: "#EEF2FF",
};

const DARK_COLORS: SelectBottomSheetColors = {
  background: "#111827",
  backgroundDisabled: "#1F2937",
  border: "#374151",
  borderFocused: "#60A5FA",
  borderError: "#F87171",
  text: "#F9FAFB",
  textDisabled: "#6B7280",
  placeholder: "#6B7280",
  chevron: "#9CA3AF",
  label: "#F9FAFB",
  helperText: "#9CA3AF",
  errorText: "#F87171",
  sheetBackground: "#111827",
  sheetHandle: "#374151",
  optionSelectedBackground: "rgba(96, 165, 250, 0.16)",
};

type MockUIKit = {
  activeTheme: "light" | "dark";
  tokens: { selectBottomSheetColors: SelectBottomSheetColors };
};

const mockUseUIKit = jest.fn<MockUIKit, []>(() => ({
  activeTheme: "light",
  tokens: { selectBottomSheetColors: LIGHT_COLORS },
}));

jest.mock("../../provider/use-ui-kit", () => ({
  useUIKit: () => mockUseUIKit(),
}));

import { SelectBottomSheet } from "./select-bottom-sheet";

const OPTIONS = [
  { value: "one", label: "One" },
  { value: "two", label: "Two" },
  { value: "three", label: "Three" },
] as const;

async function openSheet(triggerTestId = "sb-trigger") {
  await act(async () => {
    fireEvent.press(screen.getByTestId(triggerTestId));
  });
}

async function pickOptionAsync(testId: string) {
  await act(async () => {
    fireEvent.press(screen.getByTestId(testId));
  });
}

describe("SelectBottomSheet", () => {
  beforeEach(() => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: { selectBottomSheetColors: LIGHT_COLORS },
    });
    mockPeerAvailable.mockReturnValue(true);
    mockSpies.present.mockClear();
    mockSpies.dismiss.mockClear();
    mockSpies.lastSnapPoints = undefined;
    mockSpies.lastPalette = undefined;
  });

  it("renders the trigger with placeholder when value is null", async () => {
    await render(
      <SelectBottomSheet testID="sb" options={[...OPTIONS]} value={null} onChange={jest.fn()} />
    );
    expect(screen.getByTestId("sb-trigger-text")).toHaveTextContent("Select…");
  });

  it("uses default testID='select-bottom-sheet' when none is passed", async () => {
    await render(<SelectBottomSheet options={[...OPTIONS]} value={null} onChange={jest.fn()} />);
    expect(screen.getByTestId("select-bottom-sheet-trigger")).toBeTruthy();
  });

  it("renders custom placeholder when passed", async () => {
    await render(
      <SelectBottomSheet
        testID="sb"
        options={[...OPTIONS]}
        value={null}
        onChange={jest.fn()}
        placeholder="Pick one"
      />
    );
    expect(screen.getByTestId("sb-trigger-text")).toHaveTextContent("Pick one");
  });

  it("renders the selected option's label when value is set", async () => {
    await render(
      <SelectBottomSheet testID="sb" options={[...OPTIONS]} value="two" onChange={jest.fn()} />
    );
    expect(screen.getByTestId("sb-trigger-text")).toHaveTextContent("Two");
  });

  it("renders the label when `label` is passed", async () => {
    await render(
      <SelectBottomSheet
        testID="sb"
        options={[...OPTIONS]}
        value={null}
        onChange={jest.fn()}
        label="Country"
      />
    );
    expect(screen.getByTestId("sb-label")).toHaveTextContent("Country");
    expect(screen.getByTestId("sb-label").props.color).toBe(LIGHT_COLORS.label);
  });

  it("omits the label when `label` is not passed", async () => {
    await render(
      <SelectBottomSheet testID="sb" options={[...OPTIONS]} value={null} onChange={jest.fn()} />
    );
    expect(screen.queryByTestId("sb-label")).toBeNull();
  });

  it("renders helperText when passed and no error", async () => {
    await render(
      <SelectBottomSheet
        testID="sb"
        options={[...OPTIONS]}
        value={null}
        onChange={jest.fn()}
        helperText="Used for billing"
      />
    );
    expect(screen.getByTestId("sb-helper-text")).toHaveTextContent("Used for billing");
    expect(screen.getByTestId("sb-helper-text").props.color).toBe(LIGHT_COLORS.helperText);
    expect(screen.queryByTestId("sb-error-text")).toBeNull();
  });

  it("errorText overrides helperText when both are set", async () => {
    await render(
      <SelectBottomSheet
        testID="sb"
        options={[...OPTIONS]}
        value={null}
        onChange={jest.fn()}
        helperText="help"
        errorText="required"
      />
    );
    expect(screen.getByTestId("sb-error-text")).toHaveTextContent("required");
    expect(screen.queryByTestId("sb-helper-text")).toBeNull();
  });

  it("omits helper + error text when both are empty strings", async () => {
    await render(
      <SelectBottomSheet
        testID="sb"
        options={[...OPTIONS]}
        value={null}
        onChange={jest.fn()}
        helperText=""
        errorText=""
      />
    );
    expect(screen.queryByTestId("sb-helper-text")).toBeNull();
    expect(screen.queryByTestId("sb-error-text")).toBeNull();
  });

  it("pressing the trigger opens the sheet and reveals the option list", async () => {
    await render(
      <SelectBottomSheet testID="sb" options={[...OPTIONS]} value={null} onChange={jest.fn()} />
    );
    await openSheet();
    expect(screen.getByTestId("sb-option-one-label")).toHaveTextContent("One");
    expect(screen.getByTestId("sb-option-two-label")).toHaveTextContent("Two");
    expect(screen.getByTestId("sb-option-three-label")).toHaveTextContent("Three");
  });

  it("calls BottomSheet ref's present() once when the trigger is pressed", async () => {
    await render(
      <SelectBottomSheet testID="sb" options={[...OPTIONS]} value={null} onChange={jest.fn()} />
    );
    expect(mockSpies.present).not.toHaveBeenCalled();
    await openSheet();
    expect(mockSpies.present).toHaveBeenCalledTimes(1);
  });

  it("passes the resolved snapPoints array to the wrapped BottomSheet", async () => {
    await render(
      <SelectBottomSheet
        testID="sb"
        options={[...OPTIONS]}
        value={null}
        onChange={jest.fn()}
        snapPoints={["30%"]}
      />
    );
    await openSheet();
    expect(mockSpies.lastSnapPoints).toEqual(["30%"]);
  });

  it("defaults snapPoints to ['50%', '90%'] when the prop is omitted (Android partial-state fix)", async () => {
    await render(
      <SelectBottomSheet testID="sb" options={[...OPTIONS]} value={null} onChange={jest.fn()} />
    );
    await openSheet();
    expect(mockSpies.lastSnapPoints).toEqual(["50%", "90%"]);
  });

  it("maps sheetBackground + sheetHandle onto BottomSheet's palette", async () => {
    await render(
      <SelectBottomSheet
        testID="sb"
        options={[...OPTIONS]}
        value={null}
        onChange={jest.fn()}
        selectBottomSheetColors={{
          sheetBackground: "#F5F3FF",
          sheetHandle: "#7C3AED",
        }}
      />
    );
    expect(mockSpies.lastPalette).toEqual({
      background: "#F5F3FF",
      handle: "#7C3AED",
    });
  });

  it("chevron flips to up caret while the sheet is open", async () => {
    await render(
      <SelectBottomSheet testID="sb" options={[...OPTIONS]} value={null} onChange={jest.fn()} />
    );
    expect(screen.getByTestId("sb-trigger").props.accessibilityState.expanded).toBe(false);
    await openSheet();
    expect(screen.getByTestId("sb-trigger").props.accessibilityState.expanded).toBe(true);
  });

  it("picking an option fires onChange and closes the sheet", async () => {
    const onChange = jest.fn();
    await render(
      <SelectBottomSheet testID="sb" options={[...OPTIONS]} value={null} onChange={onChange} />
    );
    await openSheet();
    await pickOptionAsync("sb-option-two");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("two");
    expect(mockSpies.dismiss).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("sb-trigger").props.accessibilityState.expanded).toBe(false);
  });

  it("disabledOptions swallows the press only for the listed values", async () => {
    const onChange = jest.fn();
    await render(
      <SelectBottomSheet
        testID="sb"
        options={[...OPTIONS]}
        value={null}
        onChange={onChange}
        disabledOptions={["two"]}
      />
    );
    await openSheet();
    await pickOptionAsync("sb-option-two");
    expect(onChange).not.toHaveBeenCalled();
    await pickOptionAsync("sb-option-one");
    expect(onChange).toHaveBeenCalledWith("one");
  });

  it("option accessibilityState.disabled reflects disabledOptions", async () => {
    await render(
      <SelectBottomSheet
        testID="sb"
        options={[...OPTIONS]}
        value={null}
        onChange={jest.fn()}
        disabledOptions={["two"]}
      />
    );
    await openSheet();
    expect(screen.getByTestId("sb-option-one").props.accessibilityState).toEqual({
      selected: false,
      disabled: false,
    });
    expect(screen.getByTestId("sb-option-two").props.accessibilityState).toEqual({
      selected: false,
      disabled: true,
    });
  });

  it("selected option paints optionSelectedBackground; others are transparent", async () => {
    await render(
      <SelectBottomSheet testID="sb" options={[...OPTIONS]} value="two" onChange={jest.fn()} />
    );
    await openSheet();
    expect(screen.getByTestId("sb-option-two").props.backgroundColor).toBe(
      LIGHT_COLORS.optionSelectedBackground
    );
    expect(screen.getByTestId("sb-option-one").props.backgroundColor).toBe("transparent");
  });

  it("renders sheet title when passed", async () => {
    await render(
      <SelectBottomSheet
        testID="sb"
        options={[...OPTIONS]}
        value={null}
        onChange={jest.fn()}
        sheetTitle="Pick a country"
      />
    );
    await openSheet();
    expect(screen.getByTestId("sb-sheet-title")).toHaveTextContent("Pick a country");
  });

  it("omits sheet title when not passed", async () => {
    await render(
      <SelectBottomSheet testID="sb" options={[...OPTIONS]} value={null} onChange={jest.fn()} />
    );
    await openSheet();
    expect(screen.queryByTestId("sb-sheet-title")).toBeNull();
  });

  it("trigger border swaps to `borderFocused` while the sheet is open", async () => {
    await render(
      <SelectBottomSheet testID="sb" options={[...OPTIONS]} value={null} onChange={jest.fn()} />
    );
    expect(screen.getByTestId("sb-trigger").props.borderColor).toBe(LIGHT_COLORS.border);
    await openSheet();
    expect(screen.getByTestId("sb-trigger").props.borderColor).toBe(LIGHT_COLORS.borderFocused);
  });

  it("trigger border swaps to `borderError` when errorText is set", async () => {
    await render(
      <SelectBottomSheet
        testID="sb"
        options={[...OPTIONS]}
        value={null}
        onChange={jest.fn()}
        errorText="required"
      />
    );
    expect(screen.getByTestId("sb-trigger").props.borderColor).toBe(LIGHT_COLORS.borderError);
  });

  it("frame background swaps to `backgroundDisabled` when disabled", async () => {
    await render(
      <SelectBottomSheet
        testID="sb"
        options={[...OPTIONS]}
        value="one"
        onChange={jest.fn()}
        disabled
      />
    );
    expect(screen.getByTestId("sb-trigger").props.backgroundColor).toBe(
      LIGHT_COLORS.backgroundDisabled
    );
  });

  it("paints trigger text with `text` slot when value is selected", async () => {
    await render(
      <SelectBottomSheet testID="sb" options={[...OPTIONS]} value="two" onChange={jest.fn()} />
    );
    expect(screen.getByTestId("sb-trigger-text").props.color).toBe(LIGHT_COLORS.text);
  });

  it("paints trigger text with `placeholder` slot when value is null", async () => {
    await render(
      <SelectBottomSheet testID="sb" options={[...OPTIONS]} value={null} onChange={jest.fn()} />
    );
    expect(screen.getByTestId("sb-trigger-text").props.color).toBe(LIGHT_COLORS.placeholder);
  });

  it("paints trigger text with `textDisabled` slot when disabled", async () => {
    await render(
      <SelectBottomSheet
        testID="sb"
        options={[...OPTIONS]}
        value="two"
        onChange={jest.fn()}
        disabled
      />
    );
    expect(screen.getByTestId("sb-trigger-text").props.color).toBe(LIGHT_COLORS.textDisabled);
  });

  it("renders the missing-peer hint when @expo/ui isn't available", async () => {
    mockPeerAvailable.mockReturnValue(false);
    await render(
      <SelectBottomSheet testID="sb" options={[...OPTIONS]} value={null} onChange={jest.fn()} />
    );
    const hint = screen.getByTestId("sb-missing-peer");
    expect(hint).toHaveTextContent(/install .+@expo\/ui/i);
    expect(hint.props.color).toBe(LIGHT_COLORS.errorText);
  });

  it("suppresses the trigger's normal text + chevron when peer is unavailable", async () => {
    mockPeerAvailable.mockReturnValue(false);
    await render(
      <SelectBottomSheet testID="sb" options={[...OPTIONS]} value="one" onChange={jest.fn()} />
    );
    expect(screen.queryByTestId("sb-trigger-text")).toBeNull();
    expect(screen.queryByTestId("sb-sheet")).toBeNull();
  });

  it("does not present the sheet when the trigger is pressed with peer unavailable", async () => {
    mockPeerAvailable.mockReturnValue(false);
    const onChange = jest.fn();
    await render(
      <SelectBottomSheet testID="sb" options={[...OPTIONS]} value={null} onChange={onChange} />
    );
    await openSheet();
    expect(screen.queryByTestId("sb-option-one")).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByTestId("sb-trigger").props.accessibilityState.expanded).toBe(false);
  });

  it("per-instance selectBottomSheetColors overrides win", async () => {
    await render(
      <SelectBottomSheet
        testID="sb"
        options={[...OPTIONS]}
        value={null}
        onChange={jest.fn()}
        selectBottomSheetColors={{
          borderFocused: "#7C3AED",
          sheetBackground: "#F5F3FF",
        }}
      />
    );
    await openSheet();
    expect(screen.getByTestId("sb-trigger").props.borderColor).toBe("#7C3AED");
  });

  it("propagates provider palette overrides through useUIKit", async () => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: {
        selectBottomSheetColors: { ...LIGHT_COLORS, borderFocused: "#047857" },
      },
    });
    await render(
      <SelectBottomSheet testID="sb" options={[...OPTIONS]} value={null} onChange={jest.fn()} />
    );
    await openSheet();
    expect(screen.getByTestId("sb-trigger").props.borderColor).toBe("#047857");
  });

  it("uses the dark palette when activeTheme='dark'", async () => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "dark",
      tokens: { selectBottomSheetColors: DARK_COLORS },
    });
    await render(
      <SelectBottomSheet testID="sb" options={[...OPTIONS]} value="two" onChange={jest.fn()} />
    );
    expect(screen.getByTestId("sb-trigger").props.backgroundColor).toBe(DARK_COLORS.background);
  });

  it.each([
    ["none", 0],
    ["sm", "$uiRadiusSm"],
    ["md", "$uiRadiusMd"],
    ["lg", "$uiRadiusLg"],
    ["pill", 9999],
    [8, 8],
  ] as const)("maps radius=%s to trigger borderRadius=%s", async (radius, expected) => {
    await render(
      <SelectBottomSheet
        testID="sb"
        options={[...OPTIONS]}
        value={null}
        onChange={jest.fn()}
        radius={radius}
      />
    );
    expect(screen.getByTestId("sb-trigger").props.borderRadius).toBe(expected);
  });

  it("trigger sets accessibilityRole='combobox' + accessibilityLabel", async () => {
    await render(
      <SelectBottomSheet
        testID="sb"
        options={[...OPTIONS]}
        value={null}
        onChange={jest.fn()}
        label="Country"
      />
    );
    const trigger = screen.getByTestId("sb-trigger");
    expect(trigger.props.accessibilityRole).toBe("combobox");
    expect(trigger.props.accessibilityLabel).toBe("Country");
  });

  it("options set accessibilityRole='menuitem' + accessibilityLabel", async () => {
    await render(
      <SelectBottomSheet testID="sb" options={[...OPTIONS]} value="one" onChange={jest.fn()} />
    );
    await openSheet();
    const opt = screen.getByTestId("sb-option-two");
    expect(opt.props.accessibilityRole).toBe("menuitem");
    expect(opt.props.accessibilityLabel).toBe("Two");
  });

  it("flows extra YStack props through the spread", async () => {
    await render(
      <SelectBottomSheet
        testID="sb"
        options={[...OPTIONS]}
        value={null}
        onChange={jest.fn()}
        padding={24}
        width={280}
      />
    );
    const root = screen.getByTestId("sb");
    expect(root.props.padding).toBe(24);
    expect(root.props.width).toBe(280);
  });

  describe("snapshots", () => {
    it("default palette + closed", async () => {
      await render(
        <SelectBottomSheet
          options={[...OPTIONS]}
          value={null}
          onChange={jest.fn()}
          label="Country"
        />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("default + selected + errorText", async () => {
      await render(
        <SelectBottomSheet
          options={[...OPTIONS]}
          value="two"
          onChange={jest.fn()}
          label="Country"
          errorText="Please pick a country"
        />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("missing peer dep fallback", async () => {
      mockPeerAvailable.mockReturnValue(false);
      await render(
        <SelectBottomSheet
          options={[...OPTIONS]}
          value={null}
          onChange={jest.fn()}
          label="Country"
        />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("dark palette + selected", async () => {
      mockUseUIKit.mockReturnValue({
        activeTheme: "dark",
        tokens: { selectBottomSheetColors: DARK_COLORS },
      });
      await render(
        <SelectBottomSheet
          options={[...OPTIONS]}
          value="two"
          onChange={jest.fn()}
          label="Country"
        />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });
  });
});
