import { fireEvent, render, screen } from "@testing-library/react-native";

import type { SegmentedControlColors } from "../../tokens/tokens-types";

// Stub `tamagui` so jest can parse the shell's imports.
jest.mock("tamagui", () => {
  const rn = jest.requireActual("react-native");
  const React = jest.requireActual("react");
  return {
    Text: (props: Record<string, unknown>) => React.createElement(rn.Text, props),
    XStack: (props: Record<string, unknown>) => React.createElement(rn.View, props),
    YStack: (props: Record<string, unknown>) => React.createElement(rn.View, props),
    styled: () => () => null,
  };
});

// Mock the styled file with rn.View / rn.Text stubs.
jest.mock("./segmented-control.styled", () => {
  const rn = jest.requireActual("react-native");
  const forwardRef = jest.requireActual("react").forwardRef;
  const box = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.View ref={ref} {...props} />
  ));
  const text = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.Text ref={ref} {...props} />
  ));
  return {
    StyledSegmentedControl: box,
    StyledSegmentedControlLabel: text,
    StyledSegmentedControlHelperText: text,
    StyledSegmentedControlErrorText: text,
    StyledSegmentedControlMissingPeer: text,
  };
});

// Toggle-controlled probe mock.
const mockPeerAvailable = jest.fn(() => true);
const mockNativeControl = jest.fn();

jest.mock("./expo-ui-segmented-probe", () => ({
  isSegmentedControlAvailable: () => mockPeerAvailable(),
  getExpoUISegmentedControl: () => mockNativeControl(),
}));

// Fake `@expo/ui` SegmentedControl. Exposes each segment as a
// Pressable so tests can simulate a tap without going through the
// real native control.
function makeFakeNativeControl() {
  const rn = jest.requireActual("react-native");
  const React = jest.requireActual("react");
  return function FakeSegmented(props: {
    values?: string[];
    selectedIndex?: number;
    enabled?: boolean;
    appearance?: "light" | "dark";
    onChange?: (event: { nativeEvent: { selectedSegmentIndex: number; value: string } }) => void;
    testID?: string;
  }) {
    return React.createElement(
      rn.View,
      {
        testID: props.testID,
        accessibilityRole: "tablist",
        "data-selected-index": props.selectedIndex,
        "data-appearance": props.appearance,
        "data-enabled": props.enabled !== false,
      },
      (props.values ?? []).map((label, idx) =>
        React.createElement(rn.Pressable, {
          key: `${idx}-${label}`,
          testID: `${props.testID}-segment-${idx}`,
          accessibilityRole: "tab",
          accessibilityLabel: label,
          accessibilityState: { selected: idx === props.selectedIndex },
          onPress: () => {
            if (props.enabled === false) return;
            props.onChange?.({
              nativeEvent: { selectedSegmentIndex: idx, value: label },
            });
          },
        })
      )
    );
  };
}

const LIGHT_COLORS: SegmentedControlColors = {
  label: "#111827",
  helperText: "#6B7280",
  errorText: "#DC2626",
  containerBackground: "#FEF7FF",
  containerBorder: "#79747E",
  selectedBackground: "#E8DEF8",
  selectedLabel: "#1D192B",
  unselectedLabel: "#1C1B1F",
  ripple: "#D0BCFF33",
};

const DARK_COLORS: SegmentedControlColors = {
  label: "#F9FAFB",
  helperText: "#9CA3AF",
  errorText: "#F87171",
  containerBackground: "#1D1B20",
  containerBorder: "#938F99",
  selectedBackground: "#4A4458",
  selectedLabel: "#E8DEF8",
  unselectedLabel: "#E6E1E5",
  ripple: "#38313F",
};

type MockUIKit = {
  activeTheme: "light" | "dark";
  tokens: { segmentedControlColors: SegmentedControlColors };
};

const mockUseUIKit = jest.fn<MockUIKit, []>(() => ({
  activeTheme: "light",
  tokens: { segmentedControlColors: LIGHT_COLORS },
}));

jest.mock("../../provider/use-ui-kit", () => ({
  useUIKit: () => mockUseUIKit(),
}));

import { SegmentedControl } from "./segmented-control";

const OPTIONS = [
  { value: "list", label: "List" },
  { value: "grid", label: "Grid" },
  { value: "map", label: "Map" },
] as const;

describe("SegmentedControl", () => {
  beforeEach(() => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: { segmentedControlColors: LIGHT_COLORS },
    });
    mockPeerAvailable.mockReturnValue(true);
    mockNativeControl.mockReturnValue(makeFakeNativeControl());
  });

  it("renders the native control with default testID='segmented-control' when none passed", async () => {
    await render(<SegmentedControl options={[...OPTIONS]} value="list" onChange={jest.fn()} />);
    expect(screen.getByTestId("segmented-control-control")).toBeTruthy();
  });

  it("renders the label above the control when `label` is passed", async () => {
    await render(
      <SegmentedControl
        testID="sc"
        options={[...OPTIONS]}
        value="list"
        onChange={jest.fn()}
        label="View"
      />
    );
    expect(screen.getByTestId("sc-label")).toHaveTextContent("View");
    expect(screen.getByTestId("sc-label").props.color).toBe(LIGHT_COLORS.label);
  });

  it("omits the label when not passed", async () => {
    await render(
      <SegmentedControl testID="sc" options={[...OPTIONS]} value="list" onChange={jest.fn()} />
    );
    expect(screen.queryByTestId("sc-label")).toBeNull();
  });

  it("omits the label when passed an empty string", async () => {
    await render(
      <SegmentedControl
        testID="sc"
        options={[...OPTIONS]}
        value="list"
        onChange={jest.fn()}
        label=""
      />
    );
    expect(screen.queryByTestId("sc-label")).toBeNull();
  });

  it("passes options' labels to the native `values` prop", async () => {
    await render(
      <SegmentedControl testID="sc" options={[...OPTIONS]} value="list" onChange={jest.fn()} />
    );
    // Fake control renders one Pressable per label at
    // `sc-control-segment-<idx>`.
    expect(screen.getByTestId("sc-control-segment-0").props.accessibilityLabel).toBe("List");
    expect(screen.getByTestId("sc-control-segment-1").props.accessibilityLabel).toBe("Grid");
    expect(screen.getByTestId("sc-control-segment-2").props.accessibilityLabel).toBe("Map");
  });

  it("passes correct selectedIndex for a matched value", async () => {
    await render(
      <SegmentedControl testID="sc" options={[...OPTIONS]} value="grid" onChange={jest.fn()} />
    );
    expect(screen.getByTestId("sc-control").props["data-selected-index"]).toBe(1);
    expect(screen.getByTestId("sc-control-segment-1").props.accessibilityState.selected).toBe(true);
  });

  it("falls back to selectedIndex 0 when value doesn't match any option", async () => {
    await render(
      <SegmentedControl
        testID="sc"
        options={[...OPTIONS]}
        value="nonexistent"
        onChange={jest.fn()}
      />
    );
    expect(screen.getByTestId("sc-control").props["data-selected-index"]).toBe(0);
  });

  it("tapping a segment fires onChange with that option's value", async () => {
    const onChange = jest.fn();
    await render(
      <SegmentedControl testID="sc" options={[...OPTIONS]} value="list" onChange={onChange} />
    );
    fireEvent.press(screen.getByTestId("sc-control-segment-2"));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("map");
  });

  it("disabled prop propagates `enabled: false` and swallows taps", async () => {
    const onChange = jest.fn();
    await render(
      <SegmentedControl
        testID="sc"
        options={[...OPTIONS]}
        value="list"
        onChange={onChange}
        disabled
      />
    );
    expect(screen.getByTestId("sc-control").props["data-enabled"]).toBe(false);
    fireEvent.press(screen.getByTestId("sc-control-segment-1"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("appearance mirrors useUIKit().activeTheme = 'light'", async () => {
    await render(
      <SegmentedControl testID="sc" options={[...OPTIONS]} value="list" onChange={jest.fn()} />
    );
    expect(screen.getByTestId("sc-control").props["data-appearance"]).toBe("light");
  });

  it("appearance mirrors useUIKit().activeTheme = 'dark'", async () => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "dark",
      tokens: { segmentedControlColors: DARK_COLORS },
    });
    await render(
      <SegmentedControl testID="sc" options={[...OPTIONS]} value="list" onChange={jest.fn()} />
    );
    expect(screen.getByTestId("sc-control").props["data-appearance"]).toBe("dark");
  });

  it("renders helperText when passed and no error", async () => {
    await render(
      <SegmentedControl
        testID="sc"
        options={[...OPTIONS]}
        value="list"
        onChange={jest.fn()}
        helperText="Choose your view"
      />
    );
    expect(screen.getByTestId("sc-helper-text")).toHaveTextContent("Choose your view");
    expect(screen.getByTestId("sc-helper-text").props.color).toBe(LIGHT_COLORS.helperText);
    expect(screen.queryByTestId("sc-error-text")).toBeNull();
  });

  it("errorText overrides helperText when both set", async () => {
    await render(
      <SegmentedControl
        testID="sc"
        options={[...OPTIONS]}
        value="list"
        onChange={jest.fn()}
        helperText="Choose your view"
        errorText="Please pick one"
      />
    );
    expect(screen.getByTestId("sc-error-text")).toHaveTextContent("Please pick one");
    expect(screen.getByTestId("sc-error-text").props.color).toBe(LIGHT_COLORS.errorText);
    expect(screen.queryByTestId("sc-helper-text")).toBeNull();
  });

  it("omits helper + error text when both are empty strings", async () => {
    await render(
      <SegmentedControl
        testID="sc"
        options={[...OPTIONS]}
        value="list"
        onChange={jest.fn()}
        helperText=""
        errorText=""
      />
    );
    expect(screen.queryByTestId("sc-helper-text")).toBeNull();
    expect(screen.queryByTestId("sc-error-text")).toBeNull();
  });

  it("renders the missing-peer hint when @expo/ui isn't available", async () => {
    mockPeerAvailable.mockReturnValue(false);
    mockNativeControl.mockReturnValue(null);
    await render(
      <SegmentedControl testID="sc" options={[...OPTIONS]} value="list" onChange={jest.fn()} />
    );
    const hint = screen.getByTestId("sc-missing-peer");
    expect(hint).toHaveTextContent(/install .+@expo\/ui/i);
    expect(hint.props.color).toBe(LIGHT_COLORS.errorText);
    expect(screen.queryByTestId("sc-control")).toBeNull();
  });

  it("per-instance segmentedControlColors overrides win", async () => {
    await render(
      <SegmentedControl
        testID="sc"
        options={[...OPTIONS]}
        value="list"
        onChange={jest.fn()}
        label="View"
        helperText="Choose"
        segmentedControlColors={{ label: "#7C3AED", helperText: "#A78BFA" }}
      />
    );
    expect(screen.getByTestId("sc-label").props.color).toBe("#7C3AED");
    expect(screen.getByTestId("sc-helper-text").props.color).toBe("#A78BFA");
  });

  it("propagates provider palette overrides through useUIKit", async () => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: {
        segmentedControlColors: { ...LIGHT_COLORS, label: "#047857" },
      },
    });
    await render(
      <SegmentedControl
        testID="sc"
        options={[...OPTIONS]}
        value="list"
        onChange={jest.fn()}
        label="View"
      />
    );
    expect(screen.getByTestId("sc-label").props.color).toBe("#047857");
  });

  it("uses the dark palette when activeTheme='dark'", async () => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "dark",
      tokens: { segmentedControlColors: DARK_COLORS },
    });
    await render(
      <SegmentedControl
        testID="sc"
        options={[...OPTIONS]}
        value="list"
        onChange={jest.fn()}
        label="View"
      />
    );
    expect(screen.getByTestId("sc-label").props.color).toBe(DARK_COLORS.label);
  });

  it("flows extra YStack props through the spread", async () => {
    await render(
      <SegmentedControl
        testID="sc"
        options={[...OPTIONS]}
        value="list"
        onChange={jest.fn()}
        padding={24}
        width={280}
      />
    );
    const root = screen.getByTestId("sc");
    expect(root.props.padding).toBe(24);
    expect(root.props.width).toBe(280);
  });

  it("supports numeric-string values that round-trip through native onChange", async () => {
    const NUM_OPTS = [
      { value: "1", label: "Uno" },
      { value: "2", label: "Dos" },
    ] as const;
    const onChange = jest.fn<void, [string]>();
    await render(
      <SegmentedControl testID="sc" options={[...NUM_OPTS]} value="1" onChange={onChange} />
    );
    fireEvent.press(screen.getByTestId("sc-control-segment-1"));
    expect(onChange).toHaveBeenCalledWith("2");
  });

  it("guards against out-of-range native selectedSegmentIndex (defensive)", async () => {
    // The native side reports `selectedSegmentIndex` — if for
    // any reason the index is out of the options range, the
    // shell must not crash and must not call onChange with
    // undefined. Guard: `if (picked) onChange(picked.value)`.
    // We can't reach this branch via the fake MenuView press
    // (idx always in-range) — synthesize by firing onChange
    // directly on the mocked native control via a spy.
    const onChange = jest.fn();
    const captured: {
      current?: (event: { nativeEvent: { selectedSegmentIndex: number; value: string } }) => void;
    } = {};
    mockNativeControl.mockReturnValue((props: Record<string, unknown>) => {
      const rn = jest.requireActual("react-native");
      const React = jest.requireActual("react");
      captured.current = props.onChange as typeof captured.current;
      return React.createElement(rn.View, { testID: props.testID });
    });
    await render(
      <SegmentedControl testID="sc" options={[...OPTIONS]} value="list" onChange={onChange} />
    );
    // Fire native onChange with an out-of-range index (999).
    captured.current?.({ nativeEvent: { selectedSegmentIndex: 999, value: "ghost" } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("body renders nothing when the peer is missing but no fallback is provided", async () => {
    // Path: `getExpoUISegmentedControl()` returns null AND
    // fallback is undefined → body returns `null` (shell
    // doesn't render the missing-peer hint when
    // `isSegmentedControlAvailable()` also returns null).
    // Exercises the `if (NativeSegmentedControl == null) return null;`
    // branch in the body.
    mockPeerAvailable.mockReturnValue(true);
    mockNativeControl.mockReturnValue(null);
    await render(
      <SegmentedControl testID="sc" options={[...OPTIONS]} value="list" onChange={jest.fn()} />
    );
    // Shell renders normally; body renders nothing where the
    // native control would go. No crash.
    expect(screen.getByTestId("sc")).toBeTruthy();
    expect(screen.queryByTestId("sc-control")).toBeNull();
  });

  describe("snapshots", () => {
    it("default + peer available + label + helper", async () => {
      await render(
        <SegmentedControl
          options={[...OPTIONS]}
          value="list"
          onChange={jest.fn()}
          label="View"
          helperText="Choose your view"
        />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("missing peer dep fallback", async () => {
      mockPeerAvailable.mockReturnValue(false);
      mockNativeControl.mockReturnValue(null);
      await render(
        <SegmentedControl options={[...OPTIONS]} value="list" onChange={jest.fn()} label="View" />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("errorText state", async () => {
      await render(
        <SegmentedControl
          options={[...OPTIONS]}
          value="list"
          onChange={jest.fn()}
          label="View"
          errorText="Please pick one"
        />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("dark palette + selected", async () => {
      mockUseUIKit.mockReturnValue({
        activeTheme: "dark",
        tokens: { segmentedControlColors: DARK_COLORS },
      });
      await render(
        <SegmentedControl options={[...OPTIONS]} value="grid" onChange={jest.fn()} label="View" />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });
  });
});
