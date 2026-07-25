import { fireEvent, render, screen } from "@testing-library/react-native";

import type { RadioGroupColors } from "../../tokens/tokens-types";

// Mock the styled file with rn.View / rn.Text stubs so the component
// logic (palette resolution, testID propagation, onChange gating,
// orientation switch, a11y) stays testable without booting Tamagui.
jest.mock("./radio-group.styled", () => {
  const rn = jest.requireActual("react-native");
  const forwardRef = jest.requireActual("react").forwardRef;
  const box = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.View ref={ref} {...props} />
  ));
  const text = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.Text ref={ref} {...props} />
  ));
  return {
    StyledRadioGroup: box,
    StyledRadioGroupLabel: text,
    StyledRadioOptionRow: box,
    StyledRadioOptionCircle: box,
    StyledRadioOptionDot: box,
    StyledRadioOptionLabel: text,
  };
});

const LIGHT_RADIO_GROUP_COLORS: RadioGroupColors = {
  selectedBorder: "#2563EB",
  unselectedBorder: "#9CA3AF",
  dot: "#2563EB",
  label: "#0B0B0F",
  groupLabel: "#0B0B0F",
  selectedBackground: "#EFF6FF",
  unselectedBackground: undefined,
};

const DARK_RADIO_GROUP_COLORS: RadioGroupColors = {
  selectedBorder: "#60A5FA",
  unselectedBorder: "#6B7280",
  dot: "#60A5FA",
  label: "#F5F5F7",
  groupLabel: "#F5F5F7",
  selectedBackground: "#1E3A8A33",
  unselectedBackground: undefined,
};

type MockUIKit = {
  activeTheme: "light" | "dark";
  tokens: { radioGroupColors: RadioGroupColors };
};
const mockUseUIKit = jest.fn<MockUIKit, []>(() => ({
  activeTheme: "light",
  tokens: { radioGroupColors: LIGHT_RADIO_GROUP_COLORS },
}));
jest.mock("../../provider/use-ui-kit", () => ({
  useUIKit: () => mockUseUIKit(),
}));

import { RadioGroup } from "./radio-group";

const OPTIONS = [
  { value: "yes", label: "Sí" },
  { value: "no", label: "No" },
] as const;

describe("RadioGroup", () => {
  beforeEach(() => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: { radioGroupColors: LIGHT_RADIO_GROUP_COLORS },
    });
  });

  it("renders every option label", async () => {
    await render(<RadioGroup value={null} onChange={jest.fn()} options={OPTIONS} testID="rg" />);
    expect(screen.getByTestId("rg-option-yes-label").props.children).toBe("Sí");
    expect(screen.getByTestId("rg-option-no-label").props.children).toBe("No");
  });

  it("renders the group heading when `label` is provided", async () => {
    await render(
      <RadioGroup value={null} onChange={jest.fn()} options={OPTIONS} label="Owner?" testID="rg" />
    );
    expect(screen.getByTestId("rg-label").props.children).toBe("Owner?");
  });

  it("omits the group heading when `label` is not provided", async () => {
    await render(<RadioGroup value={null} onChange={jest.fn()} options={OPTIONS} testID="rg" />);
    expect(screen.queryByTestId("rg-label")).toBeNull();
  });

  it("shows the dot on the selected option only", async () => {
    await render(<RadioGroup value="yes" onChange={jest.fn()} options={OPTIONS} testID="rg" />);
    expect(screen.getByTestId("rg-option-yes-dot")).toBeTruthy();
    expect(screen.queryByTestId("rg-option-no-dot")).toBeNull();
  });

  it("fires onChange with the tapped value when unselected", async () => {
    const onChange = jest.fn();
    await render(<RadioGroup value={null} onChange={onChange} options={OPTIONS} testID="rg" />);
    fireEvent.press(screen.getByTestId("rg-option-yes"));
    expect(onChange).toHaveBeenCalledWith("yes");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("does not fire onChange when tapping the already-selected option", async () => {
    const onChange = jest.fn();
    await render(<RadioGroup value="yes" onChange={onChange} options={OPTIONS} testID="rg" />);
    fireEvent.press(screen.getByTestId("rg-option-yes"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("does not fire onChange when disabled", async () => {
    const onChange = jest.fn();
    await render(
      <RadioGroup value={null} onChange={onChange} options={OPTIONS} disabled testID="rg" />
    );
    fireEvent.press(screen.getByTestId("rg-option-yes"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("propagates `disabled` to accessibilityState on every option", async () => {
    await render(
      <RadioGroup value={null} onChange={jest.fn()} options={OPTIONS} disabled testID="rg" />
    );
    expect(screen.getByTestId("rg-option-yes").props.accessibilityState).toEqual({
      selected: false,
      disabled: true,
    });
    expect(screen.getByTestId("rg-option-no").props.accessibilityState).toEqual({
      selected: false,
      disabled: true,
    });
  });

  it("sets accessibilityRole='radiogroup' on the container", async () => {
    await render(<RadioGroup value={null} onChange={jest.fn()} options={OPTIONS} testID="rg" />);
    expect(screen.getByTestId("rg").props.accessibilityRole).toBe("radiogroup");
  });

  it("sets accessibilityRole='radio' on every option row", async () => {
    await render(<RadioGroup value="yes" onChange={jest.fn()} options={OPTIONS} testID="rg" />);
    expect(screen.getByTestId("rg-option-yes").props.accessibilityRole).toBe("radio");
    expect(screen.getByTestId("rg-option-yes").props.accessibilityState).toEqual({
      selected: true,
      disabled: false,
    });
    expect(screen.getByTestId("rg-option-no").props.accessibilityRole).toBe("radio");
    expect(screen.getByTestId("rg-option-no").props.accessibilityState).toEqual({
      selected: false,
      disabled: false,
    });
  });

  it("uses the group label as the container accessibilityLabel", async () => {
    await render(
      <RadioGroup value={null} onChange={jest.fn()} options={OPTIONS} label="Owner" testID="rg" />
    );
    expect(screen.getByTestId("rg").props.accessibilityLabel).toBe("Owner");
  });

  it("orientation='horizontal' sets the styled variant", async () => {
    await render(
      <RadioGroup
        value={null}
        onChange={jest.fn()}
        options={OPTIONS}
        orientation="horizontal"
        testID="rg"
      />
    );
    expect(screen.getByTestId("rg").props.orientation).toBe("horizontal");
  });

  it("orientation='vertical' (default) sets the styled variant", async () => {
    await render(<RadioGroup value={null} onChange={jest.fn()} options={OPTIONS} testID="rg" />);
    expect(screen.getByTestId("rg").props.orientation).toBe("vertical");
  });

  it.each([
    ["pill", 9999],
    ["none", 0],
    ["lg", "$uiRadiusLg"],
    [24, 24],
  ] as const)("resolves radius=%s to %s", async (radius, expected) => {
    await render(
      <RadioGroup value={null} onChange={jest.fn()} options={OPTIONS} radius={radius} testID="rg" />
    );
    expect(screen.getByTestId("rg-option-yes").props.borderRadius).toBe(expected);
  });

  it("selected option row uses selectedBorder + selectedBackground", async () => {
    await render(<RadioGroup value="yes" onChange={jest.fn()} options={OPTIONS} testID="rg" />);
    const yesRow = screen.getByTestId("rg-option-yes");
    expect(yesRow.props.borderColor).toBe("#2563EB");
    expect(yesRow.props.backgroundColor).toBe("#EFF6FF");
  });

  it("unselected option row uses unselectedBorder + no background", async () => {
    await render(<RadioGroup value="yes" onChange={jest.fn()} options={OPTIONS} testID="rg" />);
    const noRow = screen.getByTestId("rg-option-no");
    expect(noRow.props.borderColor).toBe("#9CA3AF");
    expect(noRow.props.backgroundColor).toBeUndefined();
  });

  it("dot on selected option uses the dot color", async () => {
    await render(<RadioGroup value="yes" onChange={jest.fn()} options={OPTIONS} testID="rg" />);
    expect(screen.getByTestId("rg-option-yes-dot").props.backgroundColor).toBe("#2563EB");
  });

  it("per-instance radioGroupColors override applies across every slot", async () => {
    await render(
      <RadioGroup
        value="yes"
        onChange={jest.fn()}
        options={OPTIONS}
        testID="rg"
        label="Custom"
        radioGroupColors={{
          selectedBorder: "#FF6B00",
          unselectedBorder: "#FFC58F",
          dot: "#FF6B00",
          label: "#3B0A00",
          groupLabel: "#3B0A00",
          selectedBackground: "#FFF7ED",
        }}
      />
    );
    expect(screen.getByTestId("rg-label").props.color).toBe("#3B0A00");
    expect(screen.getByTestId("rg-option-yes").props.borderColor).toBe("#FF6B00");
    expect(screen.getByTestId("rg-option-yes").props.backgroundColor).toBe("#FFF7ED");
    expect(screen.getByTestId("rg-option-no").props.borderColor).toBe("#FFC58F");
    expect(screen.getByTestId("rg-option-yes-dot").props.backgroundColor).toBe("#FF6B00");
    expect(screen.getByTestId("rg-option-yes-label").props.color).toBe("#3B0A00");
  });

  it("provider-level radioGroupColors override propagates through useUIKit", async () => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: {
        radioGroupColors: {
          ...LIGHT_RADIO_GROUP_COLORS,
          selectedBorder: "#7C3AED",
          dot: "#7C3AED",
        },
      },
    });
    await render(<RadioGroup value="yes" onChange={jest.fn()} options={OPTIONS} testID="rg" />);
    expect(screen.getByTestId("rg-option-yes").props.borderColor).toBe("#7C3AED");
    expect(screen.getByTestId("rg-option-yes-dot").props.backgroundColor).toBe("#7C3AED");
  });

  // Structural snapshots — serialize the rendered RN tree and diff on
  // any structural / prop / inline-style change. Complements the
  // targeted assertions above by catching regressions the specific
  // asserts miss.
  //
  // Intentional snapshot changes: `pnpm --filter ui-kraken test -- -u`,
  // review the .snap diff carefully, commit both.
  describe("snapshots", () => {
    // --- Orientation × default 2-option group (2) ---
    it("vertical group, nothing selected", async () => {
      await render(<RadioGroup value={null} onChange={jest.fn()} options={OPTIONS} testID="rg" />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("horizontal group, nothing selected", async () => {
      await render(
        <RadioGroup
          value={null}
          onChange={jest.fn()}
          options={OPTIONS}
          orientation="horizontal"
          testID="rg"
        />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    // --- Selection state (2) ---
    it("with 'yes' selected", async () => {
      await render(<RadioGroup value="yes" onChange={jest.fn()} options={OPTIONS} testID="rg" />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("with nothing selected", async () => {
      await render(<RadioGroup value={null} onChange={jest.fn()} options={OPTIONS} testID="rg" />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    // --- Group heading (2) ---
    it("with label", async () => {
      await render(
        <RadioGroup value={null} onChange={jest.fn()} options={OPTIONS} label="Owner" testID="rg" />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("without label", async () => {
      await render(<RadioGroup value={null} onChange={jest.fn()} options={OPTIONS} testID="rg" />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    // --- Disabled (1) ---
    it("disabled group", async () => {
      await render(
        <RadioGroup value="yes" onChange={jest.fn()} options={OPTIONS} disabled testID="rg" />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    // --- Dark theme (1) ---
    it("dark theme, one selected", async () => {
      mockUseUIKit.mockReturnValue({
        activeTheme: "dark",
        tokens: { radioGroupColors: DARK_RADIO_GROUP_COLORS },
      });
      await render(<RadioGroup value="yes" onChange={jest.fn()} options={OPTIONS} testID="rg" />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    // --- Radius presets on pill (1) ---
    it("pill radius", async () => {
      await render(
        <RadioGroup value="yes" onChange={jest.fn()} options={OPTIONS} radius="pill" testID="rg" />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    // --- Horizontal 3-option (1) ---
    it("horizontal S/M/L", async () => {
      await render(
        <RadioGroup
          value="md"
          onChange={jest.fn()}
          options={[
            { value: "sm", label: "S" },
            { value: "md", label: "M" },
            { value: "lg", label: "L" },
          ]}
          orientation="horizontal"
          testID="rg"
        />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    // --- Per-instance override (1) ---
    it("per-instance radioGroupColors override, all slots set", async () => {
      await render(
        <RadioGroup
          value="yes"
          onChange={jest.fn()}
          options={OPTIONS}
          label="Custom"
          radioGroupColors={{
            selectedBorder: "#FF6B00",
            unselectedBorder: "#FFC58F",
            dot: "#FF6B00",
            label: "#3B0A00",
            groupLabel: "#3B0A00",
            selectedBackground: "#FFF7ED",
          }}
          testID="rg"
        />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });
  });
});
