import { act, cleanup, fireEvent, render, screen } from "@testing-library/react-native";

import type { SelectColors } from "../../tokens/tokens-types";

// Mock the RN `Modal` submodule so its children render inline in the
// RTL tree whenever `visible={true}` — the default jest-expo Modal
// stub swallows its children, which would make every open-modal
// assertion fail. Follows the same "mock the sub-module, leave the
// rest of react-native untouched" pattern used by
// `refresh-control.spec.tsx` — wholesale mocking `react-native`
// blows up because RN's index has lazy getters that break when
// spread through a jest mock factory.
jest.mock("react-native/Libraries/Modal/Modal", () => {
  const React = jest.requireActual("react");
  const rn = jest.requireActual("react-native");
  const ModalMock = React.forwardRef(function ModalMock(
    { visible, children, ...rest }: { visible?: boolean; children?: React.ReactNode },
    ref: unknown
  ) {
    if (!visible) return null;
    return React.createElement(rn.View, { ...rest, ref }, children);
  });
  return { __esModule: true, default: ModalMock };
});

// Mock the styled file with rn.View / rn.Text stubs so the component
// logic (palette resolution, open/close, pick, disabled gating,
// testID propagation, a11y) stays testable without booting Tamagui.
jest.mock("./select.styled", () => {
  const rn = jest.requireActual("react-native");
  const forwardRef = jest.requireActual("react").forwardRef;
  const box = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.View ref={ref} {...props} />
  ));
  const text = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.Text ref={ref} {...props} />
  ));
  // Trigger + Option forward to rn.Pressable so `disabled` + `onPress`
  // are real props (rn.View treats `disabled` as a bag-of-props value
  // which breaks RTL between tests).
  const pressable = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.Pressable ref={ref} {...props} />
  ));
  return {
    StyledSelect: box,
    StyledSelectLabel: text,
    StyledSelectTrigger: pressable,
    StyledSelectTriggerText: text,
    StyledSelectChevron: text,
    StyledSelectHelperText: text,
    StyledSelectErrorText: text,
    StyledSelectOverlay: box,
    StyledSelectMenu: box,
    StyledSelectMenuTitle: text,
    StyledSelectOption: pressable,
    StyledSelectOptionLabel: text,
  };
});

const LIGHT_SELECT_COLORS: SelectColors = {
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
  overlayBackground: "rgba(17, 24, 39, 0.55)",
  menuBackground: "#FFFFFF",
  menuTitle: "#111827",
  optionSelectedBackground: "#EEF2FF",
};

const DARK_SELECT_COLORS: SelectColors = {
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
  overlayBackground: "rgba(0, 0, 0, 0.65)",
  menuBackground: "#111827",
  menuTitle: "#F9FAFB",
  optionSelectedBackground: "rgba(96, 165, 250, 0.16)",
};

type MockUIKit = {
  activeTheme: "light" | "dark";
  tokens: { selectColors: SelectColors };
};

const mockUseUIKit = jest.fn<MockUIKit, []>(() => ({
  activeTheme: "light",
  tokens: { selectColors: LIGHT_SELECT_COLORS },
}));

jest.mock("../../provider/use-ui-kit", () => ({
  useUIKit: () => mockUseUIKit(),
}));

import { Select } from "./select";

const OPTIONS = [
  { value: "one", label: "One" },
  { value: "two", label: "Two" },
  { value: "three", label: "Three" },
] as const;

/**
 * Async fireEvent.press wrapped in `act()`. `<Select>` owns an
 * internal `open` state and any press that flips it needs an
 * explicit act flush for React to commit the re-render (RTL v14
 * does not batch async event dispatch for us).
 */
async function pressAct(testId: string) {
  await act(async () => {
    fireEvent.press(screen.getByTestId(testId));
  });
}

/**
 * Open the picker by pressing its trigger.
 */
async function openPicker(triggerTestId = "s-trigger") {
  await pressAct(triggerTestId);
}

describe("Select", () => {
  beforeEach(() => {
    // Some tests leave the Modal mounted; RTL's auto-cleanup doesn't
    // always fire fast enough between tests when the previous test
    // pressed the trigger. Explicit cleanup keeps the tree fresh so
    // testIDs from the previous render don't leak into the next
    // query.
    cleanup();
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: { selectColors: LIGHT_SELECT_COLORS },
    });
  });

  it("renders the trigger with the placeholder when value is null", async () => {
    await render(<Select testID="s" options={[...OPTIONS]} value={null} onChange={jest.fn()} />);
    expect(screen.getByTestId("s-trigger")).toBeTruthy();
    expect(screen.getByTestId("s-trigger-text")).toHaveTextContent("Select…");
  });

  it("uses default testID='select' when none is passed", async () => {
    await render(<Select options={[...OPTIONS]} value={null} onChange={jest.fn()} />);
    expect(screen.getByTestId("select-trigger")).toBeTruthy();
  });

  it("renders custom placeholder copy when passed", async () => {
    await render(
      <Select
        testID="s"
        options={[...OPTIONS]}
        value={null}
        onChange={jest.fn()}
        placeholder="Pick one"
      />
    );
    expect(screen.getByTestId("s-trigger-text")).toHaveTextContent("Pick one");
  });

  it("renders the selected option's label when value is set", async () => {
    await render(<Select testID="s" options={[...OPTIONS]} value="two" onChange={jest.fn()} />);
    expect(screen.getByTestId("s-trigger-text")).toHaveTextContent("Two");
  });

  it("falls back to the placeholder when value doesn't match any option", async () => {
    await render(
      <Select
        testID="s"
        options={[...OPTIONS]}
        value="nonexistent"
        onChange={jest.fn()}
        placeholder="Pick one"
      />
    );
    expect(screen.getByTestId("s-trigger-text")).toHaveTextContent("Pick one");
  });

  it("renders the label when `label` is passed", async () => {
    await render(
      <Select testID="s" options={[...OPTIONS]} value={null} onChange={jest.fn()} label="Country" />
    );
    expect(screen.getByTestId("s-label")).toHaveTextContent("Country");
  });

  it("omits the label when `label` is not passed", async () => {
    await render(<Select testID="s" options={[...OPTIONS]} value={null} onChange={jest.fn()} />);
    expect(screen.queryByTestId("s-label")).toBeNull();
  });

  it("omits the label when it's an empty string", async () => {
    await render(
      <Select testID="s" options={[...OPTIONS]} value={null} onChange={jest.fn()} label="" />
    );
    expect(screen.queryByTestId("s-label")).toBeNull();
  });

  it("renders helperText when passed and no error", async () => {
    await render(
      <Select
        testID="s"
        options={[...OPTIONS]}
        value={null}
        onChange={jest.fn()}
        helperText="Used for billing"
      />
    );
    expect(screen.getByTestId("s-helper-text")).toHaveTextContent("Used for billing");
    expect(screen.queryByTestId("s-error-text")).toBeNull();
  });

  it("errorText overrides helperText when both are set", async () => {
    await render(
      <Select
        testID="s"
        options={[...OPTIONS]}
        value={null}
        onChange={jest.fn()}
        helperText="Used for billing"
        errorText="Please pick a country"
      />
    );
    expect(screen.getByTestId("s-error-text")).toHaveTextContent("Please pick a country");
    expect(screen.queryByTestId("s-helper-text")).toBeNull();
  });

  it("omits helper and error text when both are empty strings", async () => {
    await render(
      <Select
        testID="s"
        options={[...OPTIONS]}
        value={null}
        onChange={jest.fn()}
        helperText=""
        errorText=""
      />
    );
    expect(screen.queryByTestId("s-helper-text")).toBeNull();
    expect(screen.queryByTestId("s-error-text")).toBeNull();
  });

  it("pressing the trigger opens the modal and reveals the option list", async () => {
    await render(<Select testID="s" options={[...OPTIONS]} value={null} onChange={jest.fn()} />);
    await openPicker();
    expect(screen.getByTestId("s-option-one-label")).toHaveTextContent("One");
    expect(screen.getByTestId("s-option-two-label")).toHaveTextContent("Two");
    expect(screen.getByTestId("s-option-three-label")).toHaveTextContent("Three");
  });

  it("chevron flips to the up caret while the modal is open", async () => {
    await render(<Select testID="s" options={[...OPTIONS]} value={null} onChange={jest.fn()} />);
    const trigger = screen.getByTestId("s-trigger");
    expect(trigger.props.accessibilityState.expanded).toBe(false);
    await openPicker();
    expect(screen.getByTestId("s-trigger").props.accessibilityState.expanded).toBe(true);
  });

  it("picking an option fires onChange with the value and closes the modal", async () => {
    const onChange = jest.fn();
    await render(<Select testID="s" options={[...OPTIONS]} value={null} onChange={onChange} />);
    await openPicker();
    await pressAct("s-option-two");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("two");
    expect(screen.getByTestId("s-trigger").props.accessibilityState.expanded).toBe(false);
  });

  it("tapping the backdrop closes the modal without firing onChange", async () => {
    const onChange = jest.fn();
    await render(<Select testID="s" options={[...OPTIONS]} value={null} onChange={onChange} />);
    await openPicker();
    await pressAct("s-modal-overlay");
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByTestId("s-trigger").props.accessibilityState.expanded).toBe(false);
  });

  it("disabled trigger swallows the press and does not open the modal", async () => {
    const onChange = jest.fn();
    await render(
      <Select testID="s" options={[...OPTIONS]} value={null} onChange={onChange} disabled />
    );
    await openPicker();
    expect(screen.queryByTestId("s-option-one")).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("disabledOptions swallows the press only for the listed values", async () => {
    const onChange = jest.fn();
    await render(
      <Select
        testID="s"
        options={[...OPTIONS]}
        value={null}
        onChange={onChange}
        disabledOptions={["two"]}
      />
    );
    await openPicker();
    await pressAct("s-option-two");
    expect(onChange).not.toHaveBeenCalled();
    await pressAct("s-option-one");
    expect(onChange).toHaveBeenCalledWith("one");
  });

  it("option accessibilityState.disabled reflects disabledOptions", async () => {
    await render(
      <Select
        testID="s"
        options={[...OPTIONS]}
        value={null}
        onChange={jest.fn()}
        disabledOptions={["two"]}
      />
    );
    await openPicker();
    expect(screen.getByTestId("s-option-one").props.accessibilityState).toEqual({
      selected: false,
      disabled: false,
    });
    expect(screen.getByTestId("s-option-two").props.accessibilityState).toEqual({
      selected: false,
      disabled: true,
    });
  });

  it("option accessibilityState.selected reflects the current value", async () => {
    await render(<Select testID="s" options={[...OPTIONS]} value="two" onChange={jest.fn()} />);
    await openPicker();
    expect(screen.getByTestId("s-option-two").props.accessibilityState.selected).toBe(true);
    expect(screen.getByTestId("s-option-one").props.accessibilityState.selected).toBe(false);
  });

  it("selected option paints optionSelectedBackground; unselected are transparent", async () => {
    await render(<Select testID="s" options={[...OPTIONS]} value="two" onChange={jest.fn()} />);
    await openPicker();
    expect(screen.getByTestId("s-option-two").props.backgroundColor).toBe(
      LIGHT_SELECT_COLORS.optionSelectedBackground
    );
    expect(screen.getByTestId("s-option-one").props.backgroundColor).toBe("transparent");
  });

  it("paints trigger text with `text` slot when a value is selected", async () => {
    await render(<Select testID="s" options={[...OPTIONS]} value="two" onChange={jest.fn()} />);
    expect(screen.getByTestId("s-trigger-text").props.color).toBe(LIGHT_SELECT_COLORS.text);
  });

  it("paints trigger text with `placeholder` slot when value is null", async () => {
    await render(<Select testID="s" options={[...OPTIONS]} value={null} onChange={jest.fn()} />);
    expect(screen.getByTestId("s-trigger-text").props.color).toBe(LIGHT_SELECT_COLORS.placeholder);
  });

  it("paints trigger text with `textDisabled` slot when disabled", async () => {
    await render(
      <Select testID="s" options={[...OPTIONS]} value="two" onChange={jest.fn()} disabled />
    );
    expect(screen.getByTestId("s-trigger-text").props.color).toBe(LIGHT_SELECT_COLORS.textDisabled);
  });

  it("paints trigger with `backgroundDisabled` slot when disabled", async () => {
    await render(
      <Select testID="s" options={[...OPTIONS]} value="two" onChange={jest.fn()} disabled />
    );
    expect(screen.getByTestId("s-trigger").props.backgroundColor).toBe(
      LIGHT_SELECT_COLORS.backgroundDisabled
    );
  });

  it("trigger border swaps to `borderFocused` while the modal is open", async () => {
    await render(<Select testID="s" options={[...OPTIONS]} value={null} onChange={jest.fn()} />);
    expect(screen.getByTestId("s-trigger").props.borderColor).toBe(LIGHT_SELECT_COLORS.border);
    await openPicker();
    expect(screen.getByTestId("s-trigger").props.borderColor).toBe(
      LIGHT_SELECT_COLORS.borderFocused
    );
  });

  it("trigger border swaps to `borderError` when errorText is set", async () => {
    await render(
      <Select
        testID="s"
        options={[...OPTIONS]}
        value={null}
        onChange={jest.fn()}
        errorText="required"
      />
    );
    expect(screen.getByTestId("s-trigger").props.borderColor).toBe(LIGHT_SELECT_COLORS.borderError);
  });

  it("errorText border wins even while the modal is open", async () => {
    await render(
      <Select
        testID="s"
        options={[...OPTIONS]}
        value={null}
        onChange={jest.fn()}
        errorText="required"
      />
    );
    await openPicker();
    expect(screen.getByTestId("s-trigger").props.borderColor).toBe(LIGHT_SELECT_COLORS.borderError);
  });

  it("paints label + helperText from their correct slots", async () => {
    await render(
      <Select
        testID="s"
        options={[...OPTIONS]}
        value={null}
        onChange={jest.fn()}
        label="Country"
        helperText="help"
      />
    );
    expect(screen.getByTestId("s-label").props.color).toBe(LIGHT_SELECT_COLORS.label);
    expect(screen.getByTestId("s-helper-text").props.color).toBe(LIGHT_SELECT_COLORS.helperText);
  });

  it("paints errorText from the correct slot", async () => {
    await render(
      <Select
        testID="s"
        options={[...OPTIONS]}
        value={null}
        onChange={jest.fn()}
        label="Country"
        errorText="required"
      />
    );
    expect(screen.getByTestId("s-error-text").props.color).toBe(LIGHT_SELECT_COLORS.errorText);
  });

  it("paints chevron from the chevron palette slot", async () => {
    await render(<Select testID="s" options={[...OPTIONS]} value={null} onChange={jest.fn()} />);
    // Chevron isn't testID'd directly (decorative); look up by text content.
    const caret = screen.getByText("▼");
    expect(caret.props.color).toBe(LIGHT_SELECT_COLORS.chevron);
  });

  it("renders the modal title when `modalTitle` is passed", async () => {
    await render(
      <Select
        testID="s"
        options={[...OPTIONS]}
        value={null}
        onChange={jest.fn()}
        modalTitle="Choose a country"
      />
    );
    await openPicker();
    expect(screen.getByTestId("s-modal-title")).toHaveTextContent("Choose a country");
    expect(screen.getByTestId("s-modal-title").props.color).toBe(LIGHT_SELECT_COLORS.menuTitle);
  });

  it("omits the modal title when `modalTitle` is not passed", async () => {
    await render(<Select testID="s" options={[...OPTIONS]} value={null} onChange={jest.fn()} />);
    await openPicker();
    expect(screen.queryByTestId("s-modal-title")).toBeNull();
  });

  it("omits the modal title when it's an empty string", async () => {
    await render(
      <Select testID="s" options={[...OPTIONS]} value={null} onChange={jest.fn()} modalTitle="" />
    );
    await openPicker();
    expect(screen.queryByTestId("s-modal-title")).toBeNull();
  });

  it("per-instance selectColors overrides win on the trigger + modal", async () => {
    await render(
      <Select
        testID="s"
        options={[...OPTIONS]}
        value="two"
        onChange={jest.fn()}
        selectColors={{
          borderFocused: "#7C3AED",
          menuBackground: "#F5F3FF",
          optionSelectedBackground: "#DDD6FE",
        }}
      />
    );
    await openPicker();
    expect(screen.getByTestId("s-trigger").props.borderColor).toBe("#7C3AED");
    expect(screen.getByTestId("s-option-two").props.backgroundColor).toBe("#DDD6FE");
  });

  it("propagates provider palette overrides through useUIKit", async () => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: {
        selectColors: {
          ...LIGHT_SELECT_COLORS,
          borderFocused: "#047857",
        },
      },
    });
    await render(<Select testID="s" options={[...OPTIONS]} value={null} onChange={jest.fn()} />);
    await openPicker();
    expect(screen.getByTestId("s-trigger").props.borderColor).toBe("#047857");
  });

  it("uses the dark palette when activeTheme='dark'", async () => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "dark",
      tokens: { selectColors: DARK_SELECT_COLORS },
    });
    await render(<Select testID="s" options={[...OPTIONS]} value="two" onChange={jest.fn()} />);
    await openPicker();
    expect(screen.getByTestId("s-trigger").props.backgroundColor).toBe(
      DARK_SELECT_COLORS.background
    );
    expect(screen.getByTestId("s-option-two").props.backgroundColor).toBe(
      DARK_SELECT_COLORS.optionSelectedBackground
    );
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
      <Select testID="s" options={[...OPTIONS]} value={null} onChange={jest.fn()} radius={radius} />
    );
    expect(screen.getByTestId("s-trigger").props.borderRadius).toBe(expected);
  });

  it("trigger sets accessibilityRole='combobox' + accessibilityLabel", async () => {
    await render(
      <Select testID="s" options={[...OPTIONS]} value={null} onChange={jest.fn()} label="Country" />
    );
    const trigger = screen.getByTestId("s-trigger");
    expect(trigger.props.accessibilityRole).toBe("combobox");
    expect(trigger.props.accessibilityLabel).toBe("Country");
  });

  it("trigger falls back to placeholder for accessibilityLabel when no label is set", async () => {
    await render(
      <Select
        testID="s"
        options={[...OPTIONS]}
        value={null}
        onChange={jest.fn()}
        placeholder="Pick one"
      />
    );
    expect(screen.getByTestId("s-trigger").props.accessibilityLabel).toBe("Pick one");
  });

  it("option sets accessibilityRole='menuitem' + accessibilityLabel", async () => {
    await render(<Select testID="s" options={[...OPTIONS]} value="one" onChange={jest.fn()} />);
    await openPicker();
    const opt = screen.getByTestId("s-option-two");
    expect(opt.props.accessibilityRole).toBe("menuitem");
    expect(opt.props.accessibilityLabel).toBe("Two");
  });

  it("flows extra YStack props through the spread", async () => {
    await render(
      <Select
        testID="s"
        options={[...OPTIONS]}
        value={null}
        onChange={jest.fn()}
        padding={24}
        width={280}
      />
    );
    const root = screen.getByTestId("s");
    expect(root.props.padding).toBe(24);
    expect(root.props.width).toBe(280);
  });

  describe("snapshots", () => {
    it("default palette + closed", async () => {
      await render(
        <Select options={[...OPTIONS]} value={null} onChange={jest.fn()} label="Country" />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("default + selected + errorText", async () => {
      await render(
        <Select
          options={[...OPTIONS]}
          value="two"
          onChange={jest.fn()}
          label="Country"
          errorText="Please pick a country"
        />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("default palette + open with modal title", async () => {
      await render(
        <Select
          testID="s"
          options={[...OPTIONS]}
          value="one"
          onChange={jest.fn()}
          label="Country"
          modalTitle="Choose a country"
        />
      );
      await openPicker();
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("dark palette + selected", async () => {
      mockUseUIKit.mockReturnValue({
        activeTheme: "dark",
        tokens: { selectColors: DARK_SELECT_COLORS },
      });
      await render(
        <Select options={[...OPTIONS]} value="two" onChange={jest.fn()} label="Country" />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });
  });
});
