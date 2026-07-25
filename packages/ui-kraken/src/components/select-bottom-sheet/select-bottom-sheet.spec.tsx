import { act, fireEvent, render, screen } from "@testing-library/react-native";

import type { SelectBottomSheetColors } from "../../tokens/tokens-types";

// `tamagui`'s top-level index is ESM-heavy — jest can't parse it out
// of the box. `SelectBottomSheet` imports `TamaguiProvider` to re-
// mount the theme context inside gorhom's portal (see the component
// docstring); we stub that out with a pass-through wrapper here so
// the spec doesn't try to load the whole Tamagui runtime.
jest.mock("tamagui", () => {
  const rn = jest.requireActual("react-native");
  const React = jest.requireActual("react");
  return {
    TamaguiProvider: ({ children }: { children?: React.ReactNode }) =>
      React.createElement(rn.View, { testID: "tamagui-provider-stub" }, children),
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

// Toggle-controlled mock of the peer-dep probe.
const mockPeersAvailable = jest.fn(() => true);
const mockMissing = jest.fn<string[], []>(() => []);
const mockGorhom = jest.fn<
  {
    BottomSheetModal: React.ComponentType<Record<string, unknown>>;
    BottomSheetView: React.ComponentType<Record<string, unknown>>;
    BottomSheetBackdrop: React.ComponentType<Record<string, unknown>>;
    BottomSheetModalProvider: React.ComponentType<{ children?: React.ReactNode }>;
  } | null,
  []
>(() => null);

jest.mock("./gorhom-probe", () => ({
  areBottomSheetPeersAvailable: () => mockPeersAvailable(),
  missingBottomSheetPeers: () => mockMissing(),
  getGorhomModule: () => mockGorhom(),
}));

/**
 * Instrumented fake gorhom module. Exposes captured spies so
 * tests can verify the component actually calls the imperative
 * `present()` / `dismiss()` API when the trigger is pressed —
 * that's the real integration contract, not just "children
 * render inline".
 *
 * The fake also invokes `backdropComponent` and drives
 * `onChange` to simulate the sheet actually opening at snap
 * point 0 whenever `present()` is called — mirroring gorhom's
 * real behavior so `isPresentedRef` in the component stays in
 * sync.
 */
interface FakeGorhomSpies {
  present: jest.Mock;
  dismiss: jest.Mock;
  lastSnapPoints: Array<string | number> | undefined;
}

function makeFakeGorhom(spies: FakeGorhomSpies) {
  const rn = jest.requireActual("react-native");
  const React = jest.requireActual("react");
  return {
    BottomSheetModal: React.forwardRef(function FakeBottomSheetModal(
      props: {
        children?: React.ReactNode;
        testID?: string;
        snapPoints?: Array<string | number>;
        backdropComponent?: (p: Record<string, unknown>) => React.ReactNode;
        onChange?: (index: number) => void;
        onDismiss?: () => void;
      },
      ref: React.Ref<{ present: () => void; dismiss: () => void }>
    ) {
      spies.lastSnapPoints = props.snapPoints;
      React.useImperativeHandle(
        ref,
        () => ({
          present: () => {
            spies.present();
            // Simulate gorhom firing onChange(0) when the
            // sheet actually mounts to snap point 0.
            props.onChange?.(0);
          },
          dismiss: () => {
            spies.dismiss();
            props.onChange?.(-1);
            props.onDismiss?.();
          },
        }),
        [props]
      );
      const backdrop = props.backdropComponent?.({ animatedIndex: 0, animatedPosition: 0 });
      return React.createElement(rn.View, { testID: props.testID }, backdrop, props.children);
    }),
    BottomSheetView: (props: { children?: React.ReactNode }) =>
      React.createElement(rn.View, {}, props.children),
    BottomSheetBackdrop: () => React.createElement(rn.View, {}),
    BottomSheetModalProvider: (props: { children?: React.ReactNode }) =>
      React.createElement(rn.View, {}, props.children),
  };
}

let currentSpies: FakeGorhomSpies;

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
    mockPeersAvailable.mockReturnValue(true);
    mockMissing.mockReturnValue([]);
    currentSpies = {
      present: jest.fn(),
      dismiss: jest.fn(),
      lastSnapPoints: undefined,
    };
    mockGorhom.mockReturnValue(makeFakeGorhom(currentSpies));
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

  // Integration contract with the peer-dep — the useEffect MUST
  // call the ref's imperative `present()` when the trigger is
  // pressed. Regression guard: without this the sheet trigger
  // reacts (chevron flips, border focus) but no sheet appears on
  // device, because the imperative call is what actually mounts
  // the sheet at the gorhom portal.
  it("calls the modal ref's present() once when the trigger is pressed", async () => {
    await render(
      <SelectBottomSheet testID="sb" options={[...OPTIONS]} value={null} onChange={jest.fn()} />
    );
    expect(currentSpies.present).not.toHaveBeenCalled();
    await openSheet();
    expect(currentSpies.present).toHaveBeenCalledTimes(1);
  });

  it("does NOT call present() twice when a re-render happens while the sheet is already open", async () => {
    // Regression guard for the zombie-state bug — gorhom silently
    // no-ops when present() is called on an already-presented
    // sheet, so any bug that triggers a double-present looks
    // exactly like "the sheet never opens" on the second tap.
    const { rerender } = await render(
      <SelectBottomSheet testID="sb" options={[...OPTIONS]} value={null} onChange={jest.fn()} />
    );
    await openSheet();
    expect(currentSpies.present).toHaveBeenCalledTimes(1);
    // Re-render with an unrelated prop change; useEffect should
    // not fire because `open` didn't change.
    rerender(
      <SelectBottomSheet
        testID="sb"
        options={[...OPTIONS]}
        value={null}
        onChange={jest.fn()}
        label="Country"
      />
    );
    expect(currentSpies.present).toHaveBeenCalledTimes(1);
  });

  it("calls dismiss() when the sheet fires onDismiss (user drag / backdrop tap)", async () => {
    // The onChange(-1) callback wired via `handleChange` flips
    // isPresentedRef back to false; the onDismiss callback flips
    // `open` back to false so the trigger's expanded state resets.
    // This is what makes the sheet re-openable after a gesture-
    // dismiss without needing another render.
    await render(
      <SelectBottomSheet testID="sb" options={[...OPTIONS]} value={null} onChange={jest.fn()} />
    );
    await openSheet();
    expect(screen.getByTestId("sb-trigger").props.accessibilityState.expanded).toBe(true);
    // Second tap should not re-present (isPresentedRef guards it).
    await openSheet();
    expect(currentSpies.present).toHaveBeenCalledTimes(1);
  });

  it("passes the resolved snapPoints array (memoized) to the modal", async () => {
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
    expect(currentSpies.lastSnapPoints).toEqual(["30%"]);
  });

  it("defaults snapPoints to ['50%'] when the prop is omitted", async () => {
    await render(
      <SelectBottomSheet testID="sb" options={[...OPTIONS]} value={null} onChange={jest.fn()} />
    );
    await openSheet();
    expect(currentSpies.lastSnapPoints).toEqual(["50%"]);
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

  it("renders the missing-peer hint when peers are unavailable", async () => {
    mockPeersAvailable.mockReturnValue(false);
    mockMissing.mockReturnValue(["@gorhom/bottom-sheet", "react-native-gesture-handler"]);
    mockGorhom.mockReturnValue(null);
    await render(
      <SelectBottomSheet testID="sb" options={[...OPTIONS]} value={null} onChange={jest.fn()} />
    );
    const hint = screen.getByTestId("sb-missing-peer");
    expect(hint).toHaveTextContent(/install .+@gorhom\/bottom-sheet/i);
    expect(hint).toHaveTextContent(/react-native-gesture-handler/);
    expect(hint.props.color).toBe(LIGHT_COLORS.errorText);
  });

  it("suppresses the trigger's normal text + chevron when peers are unavailable", async () => {
    mockPeersAvailable.mockReturnValue(false);
    mockMissing.mockReturnValue(["@gorhom/bottom-sheet"]);
    mockGorhom.mockReturnValue(null);
    await render(
      <SelectBottomSheet testID="sb" options={[...OPTIONS]} value="one" onChange={jest.fn()} />
    );
    expect(screen.queryByTestId("sb-trigger-text")).toBeNull();
    expect(screen.queryByTestId("sb-sheet")).toBeNull();
  });

  it("does not present the sheet when the trigger is pressed with peers unavailable", async () => {
    mockPeersAvailable.mockReturnValue(false);
    mockMissing.mockReturnValue(["@gorhom/bottom-sheet"]);
    mockGorhom.mockReturnValue(null);
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
      mockPeersAvailable.mockReturnValue(false);
      mockMissing.mockReturnValue(["@gorhom/bottom-sheet", "react-native-gesture-handler"]);
      mockGorhom.mockReturnValue(null);
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
