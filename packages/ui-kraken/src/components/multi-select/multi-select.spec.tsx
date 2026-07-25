import { fireEvent, render, screen } from "@testing-library/react-native";

import type { MultiSelectColors } from "../../tokens/tokens-types";

// Mock the styled file with rn.View / rn.Text stubs so the component
// logic (palette resolution, toggle behavior, testID propagation,
// disabled gating, a11y) stays testable without booting Tamagui.
jest.mock("./multi-select.styled", () => {
  const rn = jest.requireActual("react-native");
  const forwardRef = jest.requireActual("react").forwardRef;
  const box = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.View ref={ref} {...props} />
  ));
  const text = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.Text ref={ref} {...props} />
  ));
  // Chip forwards to rn.Pressable so `disabled` + `onPress` are real
  // props (rn.View treats `disabled` as a bag-of-props value which
  // causes RTL cleanup between tests to lose the tree).
  const chip = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.Pressable ref={ref} {...props} />
  ));
  return {
    StyledMultiSelect: box,
    StyledMultiSelectGroupLabel: text,
    StyledMultiSelectChips: box,
    StyledMultiSelectChip: chip,
    StyledMultiSelectChipLabel: text,
    StyledMultiSelectHelperText: text,
    StyledMultiSelectErrorText: text,
  };
});

const LIGHT_MULTI_SELECT_COLORS: MultiSelectColors = {
  selectedBackground: "#2563EB",
  selectedLabel: "#FFFFFF",
  selectedBorder: "#2563EB",
  unselectedBackground: "#FFFFFF",
  unselectedLabel: "#374151",
  unselectedBorder: "#D1D5DB",
  groupLabel: "#0B0B0F",
  helperText: "#6B7280",
  errorText: "#DC2626",
};

const DARK_MULTI_SELECT_COLORS: MultiSelectColors = {
  selectedBackground: "#60A5FA",
  selectedLabel: "#0B0B0F",
  selectedBorder: "#60A5FA",
  unselectedBackground: "transparent",
  unselectedLabel: "#F5F5F7",
  unselectedBorder: "#374151",
  groupLabel: "#F5F5F7",
  helperText: "#9CA3AF",
  errorText: "#F87171",
};

type MockUIKit = {
  activeTheme: "light" | "dark";
  tokens: { multiSelectColors: MultiSelectColors };
};

const mockUseUIKit = jest.fn<MockUIKit, []>(() => ({
  activeTheme: "light",
  tokens: { multiSelectColors: LIGHT_MULTI_SELECT_COLORS },
}));

jest.mock("../../provider/use-ui-kit", () => ({
  useUIKit: () => mockUseUIKit(),
}));

import { MultiSelect } from "./multi-select";

const OPTIONS = [
  { value: "one", label: "One" },
  { value: "two", label: "Two" },
  { value: "three", label: "Three" },
] as const;

describe("MultiSelect", () => {
  beforeEach(() => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: { multiSelectColors: LIGHT_MULTI_SELECT_COLORS },
    });
  });

  it("renders every option as a chip with the derived testIDs", async () => {
    await render(
      <MultiSelect testID="ms" options={[...OPTIONS]} value={[]} onChange={jest.fn()} />
    );
    expect(screen.getByTestId("ms-chip-one-label")).toHaveTextContent("One");
    expect(screen.getByTestId("ms-chip-two-label")).toHaveTextContent("Two");
    expect(screen.getByTestId("ms-chip-three-label")).toHaveTextContent("Three");
    expect(screen.getByTestId("ms-chips")).toBeTruthy();
  });

  it("uses default testID='multi-select' when none is passed", async () => {
    await render(<MultiSelect options={[...OPTIONS]} value={[]} onChange={jest.fn()} />);
    expect(screen.getByTestId("multi-select")).toBeTruthy();
    expect(screen.getByTestId("multi-select-chip-one")).toBeTruthy();
  });

  it("renders the group label when `label` is passed", async () => {
    await render(
      <MultiSelect
        testID="ms"
        options={[...OPTIONS]}
        value={[]}
        onChange={jest.fn()}
        label="Categories"
      />
    );
    expect(screen.getByTestId("ms-label")).toHaveTextContent("Categories");
  });

  it("omits the group label when `label` is not passed", async () => {
    await render(
      <MultiSelect testID="ms" options={[...OPTIONS]} value={[]} onChange={jest.fn()} />
    );
    expect(screen.queryByTestId("ms-label")).toBeNull();
  });

  it("omits the label when it's an empty string", async () => {
    await render(
      <MultiSelect testID="ms" options={[...OPTIONS]} value={[]} onChange={jest.fn()} label="" />
    );
    expect(screen.queryByTestId("ms-label")).toBeNull();
  });

  it("renders helperText when passed and no error", async () => {
    await render(
      <MultiSelect
        testID="ms"
        options={[...OPTIONS]}
        value={[]}
        onChange={jest.fn()}
        helperText="Pick at least one"
      />
    );
    expect(screen.getByTestId("ms-helper-text")).toHaveTextContent("Pick at least one");
    expect(screen.queryByTestId("ms-error-text")).toBeNull();
  });

  it("errorText overrides helperText when both set", async () => {
    await render(
      <MultiSelect
        testID="ms"
        options={[...OPTIONS]}
        value={[]}
        onChange={jest.fn()}
        helperText="Pick at least one"
        errorText="Please pick one"
      />
    );
    expect(screen.getByTestId("ms-error-text")).toHaveTextContent("Please pick one");
    expect(screen.queryByTestId("ms-helper-text")).toBeNull();
  });

  it("omits helper and error text when both are empty strings", async () => {
    await render(
      <MultiSelect
        testID="ms"
        options={[...OPTIONS]}
        value={[]}
        onChange={jest.fn()}
        helperText=""
        errorText=""
      />
    );
    expect(screen.queryByTestId("ms-helper-text")).toBeNull();
    expect(screen.queryByTestId("ms-error-text")).toBeNull();
  });

  it("tapping an unselected chip appends its value via onChange", async () => {
    const onChange = jest.fn();
    await render(
      <MultiSelect testID="ms" options={[...OPTIONS]} value={["one"]} onChange={onChange} />
    );
    fireEvent.press(screen.getByTestId("ms-chip-two"));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(["one", "two"]);
  });

  it("tapping a selected chip removes its value via onChange", async () => {
    const onChange = jest.fn();
    await render(
      <MultiSelect testID="ms" options={[...OPTIONS]} value={["one", "two"]} onChange={onChange} />
    );
    fireEvent.press(screen.getByTestId("ms-chip-one"));
    expect(onChange).toHaveBeenCalledWith(["two"]);
  });

  it("toggle keeps the remaining values in their original order", async () => {
    const onChange = jest.fn();
    await render(
      <MultiSelect
        testID="ms"
        options={[...OPTIONS]}
        value={["one", "two", "three"]}
        onChange={onChange}
      />
    );
    fireEvent.press(screen.getByTestId("ms-chip-two"));
    expect(onChange).toHaveBeenCalledWith(["one", "three"]);
  });

  it("disabled prop suppresses onChange on every chip", async () => {
    const onChange = jest.fn();
    await render(
      <MultiSelect
        testID="ms"
        options={[...OPTIONS]}
        value={["one"]}
        onChange={onChange}
        disabled
      />
    );
    fireEvent.press(screen.getByTestId("ms-chip-one"));
    fireEvent.press(screen.getByTestId("ms-chip-two"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("disabledOptions suppresses onChange only for the listed values", async () => {
    const onChange = jest.fn();
    await render(
      <MultiSelect
        testID="ms"
        options={[...OPTIONS]}
        value={[]}
        onChange={onChange}
        disabledOptions={["two"]}
      />
    );
    fireEvent.press(screen.getByTestId("ms-chip-two"));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.press(screen.getByTestId("ms-chip-one"));
    expect(onChange).toHaveBeenCalledWith(["one"]);
  });

  it("chip accessibilityState.disabled reflects disabled + disabledOptions", async () => {
    await render(
      <MultiSelect
        testID="ms"
        options={[...OPTIONS]}
        value={[]}
        onChange={jest.fn()}
        disabledOptions={["two"]}
      />
    );
    expect(screen.getByTestId("ms-chip-one").props.accessibilityState).toEqual({
      checked: false,
      disabled: false,
    });
    expect(screen.getByTestId("ms-chip-two").props.accessibilityState).toEqual({
      checked: false,
      disabled: true,
    });
  });

  it("selected chip paints selected slots (background / border / label)", async () => {
    await render(
      <MultiSelect testID="ms" options={[...OPTIONS]} value={["one"]} onChange={jest.fn()} />
    );
    const chip = screen.getByTestId("ms-chip-one");
    expect(chip.props.backgroundColor).toBe(LIGHT_MULTI_SELECT_COLORS.selectedBackground);
    expect(chip.props.borderColor).toBe(LIGHT_MULTI_SELECT_COLORS.selectedBorder);
    expect(screen.getByTestId("ms-chip-one-label").props.color).toBe(
      LIGHT_MULTI_SELECT_COLORS.selectedLabel
    );
  });

  it("unselected chip paints unselected slots (background / border / label)", async () => {
    await render(
      <MultiSelect testID="ms" options={[...OPTIONS]} value={[]} onChange={jest.fn()} />
    );
    const chip = screen.getByTestId("ms-chip-one");
    expect(chip.props.backgroundColor).toBe(LIGHT_MULTI_SELECT_COLORS.unselectedBackground);
    expect(chip.props.borderColor).toBe(LIGHT_MULTI_SELECT_COLORS.unselectedBorder);
    expect(screen.getByTestId("ms-chip-one-label").props.color).toBe(
      LIGHT_MULTI_SELECT_COLORS.unselectedLabel
    );
  });

  it("paints groupLabel from the correct palette slot", async () => {
    await render(
      <MultiSelect
        testID="ms"
        options={[...OPTIONS]}
        value={[]}
        onChange={jest.fn()}
        label="Categories"
      />
    );
    expect(screen.getByTestId("ms-label").props.color).toBe(LIGHT_MULTI_SELECT_COLORS.groupLabel);
  });

  it("paints helperText from the correct palette slot", async () => {
    await render(
      <MultiSelect
        testID="ms"
        options={[...OPTIONS]}
        value={[]}
        onChange={jest.fn()}
        helperText="Pick"
      />
    );
    expect(screen.getByTestId("ms-helper-text").props.color).toBe(
      LIGHT_MULTI_SELECT_COLORS.helperText
    );
  });

  it("paints errorText from the correct palette slot", async () => {
    await render(
      <MultiSelect
        testID="ms"
        options={[...OPTIONS]}
        value={[]}
        onChange={jest.fn()}
        errorText="Pick one"
      />
    );
    expect(screen.getByTestId("ms-error-text").props.color).toBe(
      LIGHT_MULTI_SELECT_COLORS.errorText
    );
  });

  it.each([
    ["selectedBackground", "#7C3AED"],
    ["selectedLabel", "#F5F3FF"],
    ["selectedBorder", "#5B21B6"],
    ["unselectedBackground", "#F3F4F6"],
    ["unselectedLabel", "#111827"],
    ["unselectedBorder", "#4B5563"],
  ] as const)(
    "per-instance multiSelectColors.%s override wins on the chip",
    async (slot, color) => {
      const isSelected = slot.startsWith("selected");
      const overrides: Partial<MultiSelectColors> = { [slot]: color };
      await render(
        <MultiSelect
          testID="ms"
          options={[...OPTIONS]}
          value={isSelected ? ["one"] : []}
          onChange={jest.fn()}
          multiSelectColors={overrides}
        />
      );
      const chip = screen.getByTestId("ms-chip-one");
      const label = screen.getByTestId("ms-chip-one-label");
      if (slot === "selectedBackground" || slot === "unselectedBackground") {
        expect(chip.props.backgroundColor).toBe(color);
      } else if (slot === "selectedBorder" || slot === "unselectedBorder") {
        expect(chip.props.borderColor).toBe(color);
      } else {
        expect(label.props.color).toBe(color);
      }
    }
  );

  it.each([
    ["groupLabel", "#312E81", "-label", { label: "Cats" }],
    ["helperText", "#4B5563", "-helper-text", { helperText: "help" }],
    ["errorText", "#7F1D1D", "-error-text", { errorText: "bad" }],
  ] as const)(
    "per-instance multiSelectColors.%s override wins on the surrounding text",
    async (slot, color, suffix, extraProps) => {
      await render(
        <MultiSelect
          testID="ms"
          options={[...OPTIONS]}
          value={[]}
          onChange={jest.fn()}
          multiSelectColors={{ [slot]: color }}
          {...extraProps}
        />
      );
      expect(screen.getByTestId(`ms${suffix}`).props.color).toBe(color);
    }
  );

  it("propagates provider palette overrides through useUIKit", async () => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: {
        multiSelectColors: {
          ...LIGHT_MULTI_SELECT_COLORS,
          selectedBackground: "#047857",
        },
      },
    });
    await render(
      <MultiSelect testID="ms" options={[...OPTIONS]} value={["one"]} onChange={jest.fn()} />
    );
    expect(screen.getByTestId("ms-chip-one").props.backgroundColor).toBe("#047857");
  });

  it("uses the dark palette when activeTheme='dark'", async () => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "dark",
      tokens: { multiSelectColors: DARK_MULTI_SELECT_COLORS },
    });
    await render(
      <MultiSelect testID="ms" options={[...OPTIONS]} value={["one"]} onChange={jest.fn()} />
    );
    expect(screen.getByTestId("ms-chip-one").props.backgroundColor).toBe(
      DARK_MULTI_SELECT_COLORS.selectedBackground
    );
    expect(screen.getByTestId("ms-chip-two").props.backgroundColor).toBe(
      DARK_MULTI_SELECT_COLORS.unselectedBackground
    );
  });

  it.each([
    ["none", 0],
    ["sm", "$uiRadiusSm"],
    ["md", "$uiRadiusMd"],
    ["lg", "$uiRadiusLg"],
    ["pill", 9999],
    [8, 8],
  ] as const)("maps radius=%s to borderRadius=%s", async (radius, expected) => {
    await render(
      <MultiSelect
        testID="ms"
        options={[...OPTIONS]}
        value={[]}
        onChange={jest.fn()}
        radius={radius}
      />
    );
    expect(screen.getByTestId("ms-chip-one").props.borderRadius).toBe(expected);
  });

  it("group root sets accessibilityRole='list' + label", async () => {
    await render(
      <MultiSelect
        testID="ms"
        options={[...OPTIONS]}
        value={[]}
        onChange={jest.fn()}
        label="Categories"
      />
    );
    const root = screen.getByTestId("ms");
    expect(root.props.accessibilityRole).toBe("list");
    expect(root.props.accessibilityLabel).toBe("Categories");
  });

  it("chip sets accessibilityRole='checkbox' + accessibilityState + label", async () => {
    await render(
      <MultiSelect
        testID="ms"
        options={[...OPTIONS]}
        value={["one"]}
        onChange={jest.fn()}
        disabledOptions={["two"]}
      />
    );
    const chipOne = screen.getByTestId("ms-chip-one");
    expect(chipOne.props.accessibilityRole).toBe("checkbox");
    expect(chipOne.props.accessibilityState).toEqual({ checked: true, disabled: false });
    expect(chipOne.props.accessibilityLabel).toBe("One");

    const chipTwo = screen.getByTestId("ms-chip-two");
    expect(chipTwo.props.accessibilityState).toEqual({ checked: false, disabled: true });
  });

  it("flows extra YStack props through the spread", async () => {
    await render(
      <MultiSelect
        testID="ms"
        options={[...OPTIONS]}
        value={[]}
        onChange={jest.fn()}
        padding={24}
        width={280}
      />
    );
    const root = screen.getByTestId("ms");
    expect(root.props.padding).toBe(24);
    expect(root.props.width).toBe(280);
  });

  describe("snapshots", () => {
    it("default palette + 3 options, none selected", async () => {
      await render(
        <MultiSelect options={[...OPTIONS]} value={[]} onChange={jest.fn()} label="Pick" />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("default + 3 options, 2 selected", async () => {
      await render(
        <MultiSelect
          options={[...OPTIONS]}
          value={["one", "three"]}
          onChange={jest.fn()}
          label="Pick"
        />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("default + errorText overrides helperText", async () => {
      await render(
        <MultiSelect
          options={[...OPTIONS]}
          value={[]}
          onChange={jest.fn()}
          label="Pick"
          helperText="Pick at least one"
          errorText="Please pick one"
        />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("dark palette + 3 options, 1 selected", async () => {
      mockUseUIKit.mockReturnValue({
        activeTheme: "dark",
        tokens: { multiSelectColors: DARK_MULTI_SELECT_COLORS },
      });
      await render(
        <MultiSelect options={[...OPTIONS]} value={["two"]} onChange={jest.fn()} label="Pick" />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });
  });
});
