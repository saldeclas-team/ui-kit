import { fireEvent, render, screen } from "@testing-library/react-native";
import { Platform } from "react-native";

import type { SelectNativeColors } from "../../tokens/tokens-types";

// `tamagui`'s ESM entry point can't be parsed by jest out of the
// box — the `.ios.tsx` picker body pulls `Text` + `XStack`
// directly from tamagui. Stub the two symbols we use with plain
// RN equivalents so the spec doesn't try to load the Tamagui
// runtime.
jest.mock("tamagui", () => {
  const rn = jest.requireActual("react-native");
  const React = jest.requireActual("react");
  return {
    Text: (props: Record<string, unknown>) => React.createElement(rn.Text, props),
    XStack: (props: Record<string, unknown>) => React.createElement(rn.View, props),
    styled: () => () => null,
  };
});

// Mock the styled file with rn.View / rn.Text stubs so the shell
// (palette resolution, disabled gating, testID propagation,
// peer-dep fallback) stays testable without booting Tamagui.
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

// Toggle-controlled mocks of the peer-dep probe.
const mockIsAvailable = jest.fn(() => true);
const mockHost = jest.fn();
const mockPicker = jest.fn();
const mockMenuView = jest.fn();

jest.mock("./expo-ui-probe", () => ({
  isExpoUIAvailable: () => mockIsAvailable(),
  getExpoUIHost: () => mockHost(),
  getExpoUIPicker: () => mockPicker(),
  getExpoUIMenuView: () => mockMenuView(),
}));

/**
 * Fake `MenuView` from `@expo/ui/community/menu`. Records the
 * actions array + onPressAction callback so tests can verify
 * what the shell forwarded, and exposes a `-menu` testID +
 * `-action-<id>` testIDs so tests can simulate action taps
 * without going through the real native menu.
 */
type FakeMenuActions = Array<{
  id?: string;
  title: string;
  state?: "on" | "off";
  attributes?: { destructive?: boolean; disabled?: boolean; hidden?: boolean };
}>;

function makeFakeMenuView() {
  const rn = jest.requireActual("react-native");
  const React = jest.requireActual("react");
  return function FakeMenuView(props: {
    title?: string;
    actions: FakeMenuActions;
    onPressAction?: (event: { nativeEvent: { event: string } }) => void;
    shouldOpenOnLongPress?: boolean;
    testID?: string;
    children?: React.ReactNode;
  }) {
    return React.createElement(
      rn.View,
      { testID: props.testID, "data-menu-title": props.title },
      props.children,
      props.actions.map((action) =>
        React.createElement(rn.Pressable, {
          key: action.id ?? action.title,
          testID: `${props.testID}-action-${action.id ?? action.title}`,
          accessibilityRole: "menuitem",
          accessibilityLabel: action.title,
          accessibilityState: {
            selected: action.state === "on",
            disabled: action.attributes?.disabled === true,
          },
          onPress: () => {
            props.onPressAction?.({
              nativeEvent: { event: action.id ?? action.title },
            });
          },
        })
      )
    );
  };
}

const LIGHT_SELECT_NATIVE_COLORS: SelectNativeColors = {
  label: "#111827",
  background: "#FFFFFF",
  backgroundDisabled: "#F3F4F6",
  border: "#D1D5DB",
  borderError: "#DC2626",
  text: "#007AFF",
  textDisabled: "#9CA3AF",
  placeholder: "#007AFF",
  chevron: "#007AFF",
  helperText: "#6B7280",
  errorText: "#DC2626",
};

const DARK_SELECT_NATIVE_COLORS: SelectNativeColors = {
  label: "#F9FAFB",
  background: "#111827",
  backgroundDisabled: "#1F2937",
  border: "#374151",
  borderError: "#F87171",
  text: "#0A84FF",
  textDisabled: "#6B7280",
  placeholder: "#0A84FF",
  chevron: "#0A84FF",
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
    mockHost.mockReturnValue(null);
    mockPicker.mockReturnValue(null);
    mockMenuView.mockReturnValue(makeFakeMenuView());
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

  it("renders the MenuView trigger + trigger text when peer is available", async () => {
    await render(
      <SelectNative testID="sn" options={[...OPTIONS]} value="two" onChange={jest.fn()} />
    );
    expect(screen.getByTestId("sn-menu")).toBeTruthy();
    expect(screen.getByTestId("sn-trigger")).toBeTruthy();
    expect(screen.getByTestId("sn-trigger-text")).toHaveTextContent("Two");
    expect(screen.queryByTestId("sn-missing-peer")).toBeNull();
  });

  it("trigger shows the placeholderLabel when value is null", async () => {
    await render(
      <SelectNative
        testID="sn"
        options={[...OPTIONS]}
        value={null}
        onChange={jest.fn()}
        placeholderLabel="— Pick one —"
      />
    );
    expect(screen.getByTestId("sn-trigger-text")).toHaveTextContent("— Pick one —");
  });

  it("uses the default placeholderLabel 'Select…' when none is passed", async () => {
    await render(
      <SelectNative testID="sn" options={[...OPTIONS]} value={null} onChange={jest.fn()} />
    );
    expect(screen.getByTestId("sn-trigger-text")).toHaveTextContent("Select…");
  });

  it("renders one MenuView action per option", async () => {
    await render(
      <SelectNative testID="sn" options={[...OPTIONS]} value={null} onChange={jest.fn()} />
    );
    expect(screen.getByTestId("sn-menu-action-one")).toBeTruthy();
    expect(screen.getByTestId("sn-menu-action-two")).toBeTruthy();
    expect(screen.getByTestId("sn-menu-action-three")).toBeTruthy();
  });

  it("marks the selected option's action with `state: 'on'` (checkmark)", async () => {
    await render(
      <SelectNative testID="sn" options={[...OPTIONS]} value="two" onChange={jest.fn()} />
    );
    // Checkmark surfaces via accessibilityState.selected on the
    // fake MenuView action. `state: "on"` at the shell layer →
    // `accessibilityState.selected: true` on the mocked action.
    expect(screen.getByTestId("sn-menu-action-two").props.accessibilityState.selected).toBe(true);
    expect(screen.getByTestId("sn-menu-action-one").props.accessibilityState.selected).toBe(false);
  });

  it("picking a menu action fires onChange with the option's value", async () => {
    const onChange = jest.fn();
    await render(
      <SelectNative testID="sn" options={[...OPTIONS]} value={null} onChange={onChange} />
    );
    fireEvent.press(screen.getByTestId("sn-menu-action-two"));
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
    // Numeric ids stringified to build the testID.
    fireEvent.press(screen.getByTestId("sn-menu-action-2"));
    expect(onChange).toHaveBeenCalledWith(2);
    expect(screen.getByTestId("sn-menu-action-1").props.accessibilityState.selected).toBe(true);
  });

  it("disabled prop marks every action as disabled and swallows presses", async () => {
    const onChange = jest.fn();
    await render(
      <SelectNative testID="sn" options={[...OPTIONS]} value="one" onChange={onChange} disabled />
    );
    expect(screen.getByTestId("sn-menu-action-two").props.accessibilityState.disabled).toBe(true);
    fireEvent.press(screen.getByTestId("sn-menu-action-two"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders the missing-peer hint when @expo/ui is not available", async () => {
    mockIsAvailable.mockReturnValue(false);
    mockMenuView.mockReturnValue(null);
    await render(
      <SelectNative testID="sn" options={[...OPTIONS]} value={null} onChange={jest.fn()} />
    );
    const hint = screen.getByTestId("sn-missing-peer");
    expect(hint).toHaveTextContent(/install .+@expo\/ui/i);
    expect(hint.props.color).toBe(LIGHT_SELECT_NATIVE_COLORS.errorText);
    expect(screen.queryByTestId("sn-menu")).toBeNull();
  });

  it("frame is transparent by default (no chrome — pure native look)", async () => {
    await render(
      <SelectNative testID="sn" options={[...OPTIONS]} value={null} onChange={jest.fn()} />
    );
    const frame = screen.getByTestId("sn-frame");
    expect(frame.props.backgroundColor).toBe("transparent");
    expect(frame.props.borderWidth).toBe(0);
    expect(frame.props.paddingHorizontal).toBe(0);
    expect(frame.props.paddingVertical).toBe(0);
    expect(frame.props.minHeight).toBe(0);
  });

  it("frame paints `background` slot when the border is opted in", async () => {
    await render(
      <SelectNative
        testID="sn"
        options={[...OPTIONS]}
        value={null}
        onChange={jest.fn()}
        showBorderIOS
        showBorderAndroid
      />
    );
    expect(screen.getByTestId("sn-frame").props.backgroundColor).toBe(
      LIGHT_SELECT_NATIVE_COLORS.background
    );
  });

  it("frame paints `backgroundDisabled` slot when disabled + chrome on", async () => {
    await render(
      <SelectNative
        testID="sn"
        options={[...OPTIONS]}
        value="one"
        onChange={jest.fn()}
        disabled
        showBorderIOS
        showBorderAndroid
      />
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
    // Errors force the chrome on regardless of the per-platform
    // flags — the invalid state has to stay legible.
    expect(screen.getByTestId("sn-frame").props.borderWidth).toBe(1);
  });

  describe("per-platform border toggles", () => {
    const originalOS = Platform.OS;
    const originalSelect = Platform.select;

    afterEach(() => {
      Object.defineProperty(Platform, "OS", { value: originalOS, configurable: true });
      Platform.select = originalSelect;
    });

    function setPlatform(os: "ios" | "android" | "web") {
      Object.defineProperty(Platform, "OS", { value: os, configurable: true });
      Platform.select = ((obj: Record<string, unknown>) => {
        if (os === "ios" && "ios" in obj) return obj.ios;
        if (os === "android" && "android" in obj) return obj.android;
        return obj.default;
      }) as typeof Platform.select;
    }

    it("shows the border on iOS when `showBorderIOS` is true", async () => {
      setPlatform("ios");
      await render(
        <SelectNative
          testID="sn"
          options={[...OPTIONS]}
          value={null}
          onChange={jest.fn()}
          showBorderIOS
        />
      );
      expect(screen.getByTestId("sn-frame").props.borderWidth).toBe(1);
    });

    it("keeps the border off on iOS when only `showBorderAndroid` is true", async () => {
      setPlatform("ios");
      await render(
        <SelectNative
          testID="sn"
          options={[...OPTIONS]}
          value={null}
          onChange={jest.fn()}
          showBorderAndroid
        />
      );
      expect(screen.getByTestId("sn-frame").props.borderWidth).toBe(0);
    });

    it("shows the border on Android when `showBorderAndroid` is true", async () => {
      setPlatform("android");
      await render(
        <SelectNative
          testID="sn"
          options={[...OPTIONS]}
          value={null}
          onChange={jest.fn()}
          showBorderAndroid
        />
      );
      expect(screen.getByTestId("sn-frame").props.borderWidth).toBe(1);
    });

    it("keeps the border off on Android when only `showBorderIOS` is true", async () => {
      setPlatform("android");
      await render(
        <SelectNative
          testID="sn"
          options={[...OPTIONS]}
          value={null}
          onChange={jest.fn()}
          showBorderIOS
        />
      );
      expect(screen.getByTestId("sn-frame").props.borderWidth).toBe(0);
    });

    it("falls back to (showBorderIOS || showBorderAndroid) on web", async () => {
      setPlatform("web");
      await render(
        <SelectNative
          testID="sn"
          options={[...OPTIONS]}
          value={null}
          onChange={jest.fn()}
          showBorderIOS
        />
      );
      expect(screen.getByTestId("sn-frame").props.borderWidth).toBe(1);
    });
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

  it("per-instance selectNativeColors overrides win when chrome is opted in", async () => {
    await render(
      <SelectNative
        testID="sn"
        options={[...OPTIONS]}
        value={null}
        onChange={jest.fn()}
        selectNativeColors={{ background: "#F5F3FF", border: "#7C3AED" }}
        showBorderIOS
        showBorderAndroid
      />
    );
    expect(screen.getByTestId("sn-frame").props.backgroundColor).toBe("#F5F3FF");
    expect(screen.getByTestId("sn-frame").props.borderColor).toBe("#7C3AED");
  });

  it("per-instance trigger `text` color overrides the palette default when a value is selected", async () => {
    // Consumers can retint the trigger away from the iOS-
    // system-blue default without opting into the frame chrome
    // — the trigger text is a Tamagui Text painted from the
    // palette, so overriding `text` flows through.
    await render(
      <SelectNative
        testID="sn"
        options={[...OPTIONS]}
        value="one"
        onChange={jest.fn()}
        selectNativeColors={{ text: "#7C3AED" }}
      />
    );
    expect(screen.getByTestId("sn-trigger-text").props.color).toBe("#7C3AED");
  });

  it("per-instance trigger `placeholder` color overrides the palette default when value is null", async () => {
    await render(
      <SelectNative
        testID="sn"
        options={[...OPTIONS]}
        value={null}
        onChange={jest.fn()}
        selectNativeColors={{ placeholder: "#A78BFA" }}
      />
    );
    expect(screen.getByTestId("sn-trigger-text").props.color).toBe("#A78BFA");
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

  it("uses the dark palette when activeTheme='dark' + chrome opted in", async () => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "dark",
      tokens: { selectNativeColors: DARK_SELECT_NATIVE_COLORS },
    });
    await render(
      <SelectNative
        testID="sn"
        options={[...OPTIONS]}
        value="one"
        onChange={jest.fn()}
        showBorderIOS
        showBorderAndroid
      />
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
      mockMenuView.mockReturnValue(null);
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
