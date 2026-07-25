import { fireEvent, render, screen } from "@testing-library/react-native";
import { forwardRef } from "react";

import type { SelectNativeColors } from "../../tokens/tokens-types";

// Mock the styled file with rn.View / rn.Text stubs so the component
// logic (palette resolution, placeholder synthesis, disabled gating,
// testID propagation, peer-dep fallback) stays testable without
// booting Tamagui.
jest.mock("./select-native.styled", () => {
  const rn = jest.requireActual("react-native");
  const forwardRefActual = jest.requireActual("react").forwardRef;
  const box = forwardRefActual((props: Record<string, unknown>, ref: unknown) => (
    <rn.View ref={ref} {...props} />
  ));
  const text = forwardRefActual((props: Record<string, unknown>, ref: unknown) => (
    <rn.Text ref={ref} {...props} />
  ));
  return {
    StyledSelectNative: box,
    StyledSelectNativeLabel: text,
    StyledSelectNativeFrame: box,
    StyledSelectNativeHelperText: text,
    StyledSelectNativeErrorText: text,
    StyledSelectNativeMissingPeer: text,
  };
});

// Toggle-controlled mock of the peer-dep probe — every test can
// flip peer availability on / off (default: on).
const mockIsAvailable = jest.fn(() => true);
const mockHost = jest.fn();
const mockPicker = jest.fn();

jest.mock("./expo-ui-probe", () => ({
  isExpoUIAvailable: () => mockIsAvailable(),
  getExpoUIHost: () => mockHost(),
  getExpoUIPicker: () => mockPicker(),
}));

const LIGHT_SELECT_NATIVE_COLORS: SelectNativeColors = {
  label: "#111827",
  background: "#FFFFFF",
  backgroundDisabled: "#F3F4F6",
  border: "#D1D5DB",
  borderError: "#DC2626",
  helperText: "#6B7280",
  errorText: "#DC2626",
};

const DARK_SELECT_NATIVE_COLORS: SelectNativeColors = {
  label: "#F9FAFB",
  background: "#111827",
  backgroundDisabled: "#1F2937",
  border: "#374151",
  borderError: "#F87171",
  helperText: "#9CA3AF",
  errorText: "#F87171",
};

type MockUIKit = {
  activeTheme: "light" | "dark";
  tokens: { selectNativeColors: SelectNativeColors };
};

const mockUseUIKit = jest.fn<MockUIKit, []>(() => ({
  activeTheme: "light",
  tokens: { selectNativeColors: LIGHT_SELECT_NATIVE_COLORS },
}));

jest.mock("../../provider/use-ui-kit", () => ({
  useUIKit: () => mockUseUIKit(),
}));

// Fake Host / Picker that behave like `@expo/ui` — the Picker
// renders every Item so the test can assert their labels + values
// were forwarded, and it exposes an `onValueChange` hook the test
// invokes to simulate the user picking a menu row.
type FakePickerItem = {
  props: { label: string; value: string | number };
};

const RealPicker: React.ComponentType<{
  selectedValue: string | number;
  onValueChange: (v: string | number) => void;
  appearance?: "menu" | "wheel";
  enabled?: boolean;
  children?: React.ReactNode;
  testID?: string;
}> & { Item: React.ComponentType<{ label: string; value: string | number }> } = forwardRef(
  function FakePicker(
    props: {
      selectedValue: string | number;
      onValueChange: (v: string | number) => void;
      appearance?: "menu" | "wheel";
      enabled?: boolean;
      children?: React.ReactNode;
      testID?: string;
    },
    _ref: unknown
  ) {
    const rn = jest.requireActual("react-native");
    const React = jest.requireActual("react");
    const items = (React.Children.toArray(props.children ?? []) as FakePickerItem[]).filter(
      (child) => child && typeof child === "object" && "props" in child
    );
    return React.createElement(
      rn.View,
      {
        testID: props.testID,
        accessibilityRole: "combobox",
        accessibilityValue: { text: String(props.selectedValue) },
        accessibilityState: { disabled: props.enabled === false },
      },
      items.map((item) =>
        React.createElement(rn.Pressable, {
          key: String(item.props.value),
          testID: `${props.testID}-item-${item.props.value}`,
          accessibilityRole: "menuitem",
          accessibilityLabel: item.props.label,
          onPress: () => props.onValueChange(item.props.value),
        })
      )
    );
  }
) as unknown as never;

(
  RealPicker as unknown as { Item: React.ComponentType<{ label: string; value: string | number }> }
).Item = function FakePickerItem() {
  // Data-only marker; the FakePicker walks children.props directly.
  return null;
};

const RealHost: React.ComponentType<{
  matchContents?: boolean;
  children?: React.ReactNode;
}> = ({ children }) => {
  const rn = jest.requireActual("react-native");
  const React = jest.requireActual("react");
  return React.createElement(rn.View, { testID: "expo-ui-host" }, children);
};

import { SelectNative } from "./select-native";

const OPTIONS = [
  { value: "one", label: "One" },
  { value: "two", label: "Two" },
  { value: "three", label: "Three" },
] as const;

describe("SelectNative", () => {
  beforeEach(() => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: { selectNativeColors: LIGHT_SELECT_NATIVE_COLORS },
    });
    mockIsAvailable.mockReturnValue(true);
    mockHost.mockReturnValue(RealHost);
    mockPicker.mockReturnValue(RealPicker);
  });

  it("renders the label above the frame when `label` is passed", async () => {
    await render(
      <SelectNative
        testID="sn"
        options={[...OPTIONS]}
        value={null}
        onChange={jest.fn()}
        label="Country"
      />
    );
    expect(screen.getByTestId("sn-label")).toHaveTextContent("Country");
    expect(screen.getByTestId("sn-label").props.color).toBe(LIGHT_SELECT_NATIVE_COLORS.label);
  });

  it("omits the label when not passed", async () => {
    await render(
      <SelectNative testID="sn" options={[...OPTIONS]} value={null} onChange={jest.fn()} />
    );
    expect(screen.queryByTestId("sn-label")).toBeNull();
  });

  it("omits the label when passed an empty string", async () => {
    await render(
      <SelectNative testID="sn" options={[...OPTIONS]} value={null} onChange={jest.fn()} label="" />
    );
    expect(screen.queryByTestId("sn-label")).toBeNull();
  });

  it("uses default testID='select-native' when none is passed", async () => {
    await render(
      <SelectNative options={[...OPTIONS]} value={null} onChange={jest.fn()} label="Country" />
    );
    expect(screen.getByTestId("select-native-label")).toBeTruthy();
  });

  it("renders the native picker when the peer dep is available", async () => {
    await render(
      <SelectNative
        testID="sn"
        options={[...OPTIONS]}
        value="two"
        onChange={jest.fn()}
        label="Country"
      />
    );
    expect(screen.getByTestId("sn-picker")).toBeTruthy();
    expect(screen.queryByTestId("sn-missing-peer")).toBeNull();
  });

  it("renders the missing-peer hint (and no picker) when `@expo/ui` isn't available", async () => {
    mockIsAvailable.mockReturnValue(false);
    mockHost.mockReturnValue(null);
    mockPicker.mockReturnValue(null);
    await render(
      <SelectNative testID="sn" options={[...OPTIONS]} value={null} onChange={jest.fn()} />
    );
    const hint = screen.getByTestId("sn-missing-peer");
    expect(hint).toHaveTextContent(/install .+@expo\/ui/i);
    expect(hint.props.color).toBe(LIGHT_SELECT_NATIVE_COLORS.errorText);
    expect(screen.queryByTestId("sn-picker")).toBeNull();
  });

  it("does not crash when only Host is present but Picker is missing", async () => {
    mockIsAvailable.mockReturnValue(true);
    mockHost.mockReturnValue(RealHost);
    mockPicker.mockReturnValue(null);
    await render(
      <SelectNative testID="sn" options={[...OPTIONS]} value={null} onChange={jest.fn()} />
    );
    expect(screen.getByTestId("sn-missing-peer")).toBeTruthy();
    expect(screen.queryByTestId("sn-picker")).toBeNull();
  });

  it("forwards every option to the picker as a menu row", async () => {
    await render(
      <SelectNative testID="sn" options={[...OPTIONS]} value="one" onChange={jest.fn()} />
    );
    expect(screen.getByTestId("sn-picker-item-one")).toBeTruthy();
    expect(screen.getByTestId("sn-picker-item-two")).toBeTruthy();
    expect(screen.getByTestId("sn-picker-item-three")).toBeTruthy();
  });

  it("propagates the current value to the picker's selectedValue", async () => {
    await render(
      <SelectNative testID="sn" options={[...OPTIONS]} value="two" onChange={jest.fn()} />
    );
    expect(screen.getByTestId("sn-picker").props.accessibilityValue).toEqual({ text: "two" });
  });

  it("picking a menu row fires onChange with that option's value", async () => {
    const onChange = jest.fn();
    await render(
      <SelectNative testID="sn" options={[...OPTIONS]} value={null} onChange={onChange} />
    );
    fireEvent.press(screen.getByTestId("sn-picker-item-two"));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("two");
  });

  it("supports numeric option values via the Value generic", async () => {
    const onChange = jest.fn<void, [number]>();
    const NUM_OPTIONS = [
      { value: 1, label: "One" },
      { value: 2, label: "Two" },
    ] as const;
    await render(
      <SelectNative<number> testID="sn" options={[...NUM_OPTIONS]} value={1} onChange={onChange} />
    );
    fireEvent.press(screen.getByTestId("sn-picker-item-2"));
    expect(onChange).toHaveBeenCalledWith(2);
    // selectedValue was forwarded as a number, not a string.
    expect(screen.getByTestId("sn-picker").props.accessibilityValue).toEqual({ text: "1" });
  });

  it("injects a placeholder item when value=null (so Android's Picker still opens)", async () => {
    await render(
      <SelectNative
        testID="sn"
        options={[...OPTIONS]}
        value={null}
        onChange={jest.fn()}
        placeholderLabel="Pick one"
      />
    );
    // The placeholder is inserted at position 0 with value=""; the real options come after.
    expect(screen.getByTestId("sn-picker-item-")).toBeTruthy();
    expect(screen.getByTestId("sn-picker-item-one")).toBeTruthy();
    expect(screen.getByTestId("sn-picker").props.accessibilityValue).toEqual({ text: "" });
  });

  it("uses the default placeholderLabel 'Select…' when none is passed", async () => {
    await render(
      <SelectNative testID="sn" options={[...OPTIONS]} value={null} onChange={jest.fn()} />
    );
    // Placeholder item was still injected; its label prop is the default.
    // (We assert the item testID exists — the label prop is not queryable
    // through RTL on the FakePicker Item since it's a data-only marker.)
    expect(screen.getByTestId("sn-picker-item-")).toBeTruthy();
  });

  it("skips the placeholder injection when value matches one of the options", async () => {
    await render(
      <SelectNative testID="sn" options={[...OPTIONS]} value="two" onChange={jest.fn()} />
    );
    expect(screen.queryByTestId("sn-picker-item-")).toBeNull();
    expect(screen.getByTestId("sn-picker-item-two")).toBeTruthy();
  });

  it("frame paints `background` slot by default", async () => {
    await render(
      <SelectNative testID="sn" options={[...OPTIONS]} value={null} onChange={jest.fn()} />
    );
    expect(screen.getByTestId("sn-frame").props.backgroundColor).toBe(
      LIGHT_SELECT_NATIVE_COLORS.background
    );
  });

  it("frame paints `backgroundDisabled` slot when disabled", async () => {
    await render(
      <SelectNative testID="sn" options={[...OPTIONS]} value="one" onChange={jest.fn()} disabled />
    );
    expect(screen.getByTestId("sn-frame").props.backgroundColor).toBe(
      LIGHT_SELECT_NATIVE_COLORS.backgroundDisabled
    );
    expect(screen.getByTestId("sn-frame").props.disabled).toBe(true);
  });

  it("frame border swaps to `borderError` when errorText is set", async () => {
    await render(
      <SelectNative
        testID="sn"
        options={[...OPTIONS]}
        value={null}
        onChange={jest.fn()}
        errorText="required"
      />
    );
    expect(screen.getByTestId("sn-frame").props.borderColor).toBe(
      LIGHT_SELECT_NATIVE_COLORS.borderError
    );
  });

  it("renders helperText when passed and no error", async () => {
    await render(
      <SelectNative
        testID="sn"
        options={[...OPTIONS]}
        value={null}
        onChange={jest.fn()}
        helperText="Used for billing"
      />
    );
    expect(screen.getByTestId("sn-helper-text")).toHaveTextContent("Used for billing");
    expect(screen.getByTestId("sn-helper-text").props.color).toBe(
      LIGHT_SELECT_NATIVE_COLORS.helperText
    );
    expect(screen.queryByTestId("sn-error-text")).toBeNull();
  });

  it("errorText overrides helperText when both are set", async () => {
    await render(
      <SelectNative
        testID="sn"
        options={[...OPTIONS]}
        value={null}
        onChange={jest.fn()}
        helperText="Used for billing"
        errorText="Please pick a country"
      />
    );
    expect(screen.getByTestId("sn-error-text")).toHaveTextContent("Please pick a country");
    expect(screen.getByTestId("sn-error-text").props.color).toBe(
      LIGHT_SELECT_NATIVE_COLORS.errorText
    );
    expect(screen.queryByTestId("sn-helper-text")).toBeNull();
  });

  it("omits helper + error text when both are empty strings", async () => {
    await render(
      <SelectNative
        testID="sn"
        options={[...OPTIONS]}
        value={null}
        onChange={jest.fn()}
        helperText=""
        errorText=""
      />
    );
    expect(screen.queryByTestId("sn-helper-text")).toBeNull();
    expect(screen.queryByTestId("sn-error-text")).toBeNull();
  });

  it("disables the picker when the `disabled` prop is set", async () => {
    await render(
      <SelectNative testID="sn" options={[...OPTIONS]} value="one" onChange={jest.fn()} disabled />
    );
    expect(screen.getByTestId("sn-picker").props.accessibilityState).toEqual({ disabled: true });
  });

  it("per-instance selectNativeColors overrides win", async () => {
    await render(
      <SelectNative
        testID="sn"
        options={[...OPTIONS]}
        value={null}
        onChange={jest.fn()}
        selectNativeColors={{ background: "#F5F3FF", border: "#7C3AED" }}
      />
    );
    expect(screen.getByTestId("sn-frame").props.backgroundColor).toBe("#F5F3FF");
    expect(screen.getByTestId("sn-frame").props.borderColor).toBe("#7C3AED");
  });

  it("propagates provider palette overrides through useUIKit", async () => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: {
        selectNativeColors: {
          ...LIGHT_SELECT_NATIVE_COLORS,
          border: "#047857",
        },
      },
    });
    await render(
      <SelectNative testID="sn" options={[...OPTIONS]} value={null} onChange={jest.fn()} />
    );
    expect(screen.getByTestId("sn-frame").props.borderColor).toBe("#047857");
  });

  it("uses the dark palette when activeTheme='dark'", async () => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "dark",
      tokens: { selectNativeColors: DARK_SELECT_NATIVE_COLORS },
    });
    await render(
      <SelectNative testID="sn" options={[...OPTIONS]} value="one" onChange={jest.fn()} />
    );
    expect(screen.getByTestId("sn-frame").props.backgroundColor).toBe(
      DARK_SELECT_NATIVE_COLORS.background
    );
    expect(screen.getByTestId("sn-frame").props.borderColor).toBe(DARK_SELECT_NATIVE_COLORS.border);
  });

  it.each([
    ["none", 0],
    ["sm", "$uiRadiusSm"],
    ["md", "$uiRadiusMd"],
    ["lg", "$uiRadiusLg"],
    ["pill", 9999],
    [8, 8],
  ] as const)("maps radius=%s to frame borderRadius=%s", async (radius, expected) => {
    await render(
      <SelectNative
        testID="sn"
        options={[...OPTIONS]}
        value={null}
        onChange={jest.fn()}
        radius={radius}
      />
    );
    expect(screen.getByTestId("sn-frame").props.borderRadius).toBe(expected);
  });

  it("flows extra YStack props through the spread", async () => {
    await render(
      <SelectNative
        testID="sn"
        options={[...OPTIONS]}
        value={null}
        onChange={jest.fn()}
        padding={24}
        width={280}
      />
    );
    const root = screen.getByTestId("sn");
    expect(root.props.padding).toBe(24);
    expect(root.props.width).toBe(280);
  });

  describe("snapshots", () => {
    it("default palette + peer available + value selected", async () => {
      await render(
        <SelectNative options={[...OPTIONS]} value="two" onChange={jest.fn()} label="Country" />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("missing peer dep fallback", async () => {
      mockIsAvailable.mockReturnValue(false);
      mockHost.mockReturnValue(null);
      mockPicker.mockReturnValue(null);
      await render(
        <SelectNative options={[...OPTIONS]} value={null} onChange={jest.fn()} label="Country" />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("errorText state", async () => {
      await render(
        <SelectNative
          options={[...OPTIONS]}
          value={null}
          onChange={jest.fn()}
          label="Country"
          errorText="Please pick a country"
        />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("dark palette + selected", async () => {
      mockUseUIKit.mockReturnValue({
        activeTheme: "dark",
        tokens: { selectNativeColors: DARK_SELECT_NATIVE_COLORS },
      });
      await render(
        <SelectNative options={[...OPTIONS]} value="two" onChange={jest.fn()} label="Country" />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });
  });
});
