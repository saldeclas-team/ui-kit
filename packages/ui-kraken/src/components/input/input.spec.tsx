import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

import type { InputColors } from "../../tokens/tokens-types";

// Mock the styled file with rn.View / rn.Text stubs so component logic
// (state-driven border color, testID propagation, RN prop flow-through,
// focus/blur handling) stays testable without booting Tamagui.
jest.mock("./input.styled", () => {
  const rn = jest.requireActual("react-native");
  const forwardRef = jest.requireActual("react").forwardRef;
  const box = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.View ref={ref} {...props} />
  ));
  const text = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.Text ref={ref} {...props} />
  ));
  return {
    StyledInputContainer: box,
    StyledInputLabel: text,
    StyledInputWrapper: box,
    StyledInputIconSlot: box,
    StyledInputHelper: text,
    StyledInputError: text,
  };
});

const LIGHT_INPUT_COLORS: InputColors = {
  background: "#FFFFFF",
  backgroundDisabled: "#F3F4F6",
  border: "#D1D5DB",
  borderFocused: "#2563EB",
  borderError: "#DC2626",
  text: "#0B0B0F",
  textDisabled: "#9CA3AF",
  placeholder: "#9CA3AF",
  label: "#0B0B0F",
  helperText: "#6B7280",
  errorText: "#DC2626",
};

const DARK_INPUT_COLORS: InputColors = {
  background: "#111827",
  backgroundDisabled: "#1F2937",
  border: "#374151",
  borderFocused: "#60A5FA",
  borderError: "#F87171",
  text: "#F5F5F7",
  textDisabled: "#6B7280",
  placeholder: "#6B7280",
  label: "#F5F5F7",
  helperText: "#9CA3AF",
  errorText: "#F87171",
};

type MockUIKit = {
  activeTheme: "light" | "dark";
  tokens: { inputColors: InputColors };
};
const mockUseUIKit = jest.fn<MockUIKit, []>(() => ({
  activeTheme: "light",
  tokens: { inputColors: LIGHT_INPUT_COLORS },
}));
jest.mock("../../provider/use-ui-kit", () => ({
  useUIKit: () => mockUseUIKit(),
}));

import { Input } from "./input";

describe("Input", () => {
  beforeEach(() => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: { inputColors: LIGHT_INPUT_COLORS },
    });
  });

  it("renders the controlled value on the underlying TextInput", async () => {
    await render(<Input testID="in" value="hello" onChangeText={jest.fn()} />);
    expect(screen.getByTestId("in-input").props.value).toBe("hello");
  });

  it("fires onChangeText when the input value changes", async () => {
    const onChangeText = jest.fn();
    await render(<Input testID="in" value="" onChangeText={onChangeText} />);
    fireEvent.changeText(screen.getByTestId("in-input"), "hi");
    expect(onChangeText).toHaveBeenCalledWith("hi");
  });

  it("renders the label when provided", async () => {
    await render(<Input testID="in" value="" onChangeText={jest.fn()} label="Name" />);
    expect(screen.getByTestId("in-label").props.children).toBe("Name");
  });

  it("omits the label when not provided", async () => {
    await render(<Input testID="in" value="" onChangeText={jest.fn()} />);
    expect(screen.queryByTestId("in-label")).toBeNull();
  });

  it("renders helperText below the input when provided and no error", async () => {
    await render(
      <Input testID="in" value="" onChangeText={jest.fn()} helperText="Optional info" />
    );
    expect(screen.getByTestId("in-helper").props.children).toBe("Optional info");
    expect(screen.queryByTestId("in-error")).toBeNull();
  });

  it("renders error below the input when provided", async () => {
    await render(<Input testID="in" value="" onChangeText={jest.fn()} error="Required" />);
    expect(screen.getByTestId("in-error").props.children).toBe("Required");
  });

  it("error hides helperText when both are provided", async () => {
    await render(
      <Input testID="in" value="" onChangeText={jest.fn()} helperText="hint" error="Required" />
    );
    expect(screen.getByTestId("in-error").props.children).toBe("Required");
    expect(screen.queryByTestId("in-helper")).toBeNull();
  });

  it("disabled sets editable=false on the underlying TextInput", async () => {
    await render(<Input testID="in" value="" onChangeText={jest.fn()} disabled />);
    expect(screen.getByTestId("in-input").props.editable).toBe(false);
  });

  it("disabled propagates to wrapper accessibilityState.disabled", async () => {
    await render(<Input testID="in" value="" onChangeText={jest.fn()} disabled />);
    expect(screen.getByTestId("in-wrapper").props.accessibilityState).toEqual({ disabled: true });
  });

  it("disabled uses backgroundDisabled + textDisabled from the palette", async () => {
    await render(<Input testID="in" value="x" onChangeText={jest.fn()} disabled />);
    expect(screen.getByTestId("in-wrapper").props.backgroundColor).toBe("#F3F4F6");
    // Text color lives on the inner TextInput's `style` prop.
    const inputStyle = screen.getByTestId("in-input").props.style as { color?: string };
    expect(inputStyle.color).toBe("#9CA3AF");
  });

  it("leftIcon renders under {testID}-left-icon", async () => {
    await render(
      <Input
        testID="in"
        value=""
        onChangeText={jest.fn()}
        leftIcon={<Text testID="my-left">L</Text>}
      />
    );
    expect(screen.getByTestId("in-left-icon")).toBeTruthy();
    expect(screen.getByTestId("my-left")).toBeTruthy();
  });

  it("rightIcon renders under {testID}-right-icon", async () => {
    await render(
      <Input
        testID="in"
        value=""
        onChangeText={jest.fn()}
        rightIcon={<Text testID="my-right">R</Text>}
      />
    );
    expect(screen.getByTestId("in-right-icon")).toBeTruthy();
    expect(screen.getByTestId("my-right")).toBeTruthy();
  });

  it("omits icon slots when props are not provided", async () => {
    await render(<Input testID="in" value="" onChangeText={jest.fn()} />);
    expect(screen.queryByTestId("in-left-icon")).toBeNull();
    expect(screen.queryByTestId("in-right-icon")).toBeNull();
  });

  it("focus event flips the wrapper border to borderFocused", async () => {
    await render(<Input testID="in" value="" onChangeText={jest.fn()} />);
    await act(async () => {
      screen.getByTestId("in-input").props.onFocus?.({});
    });
    expect(screen.getByTestId("in-wrapper").props.borderColor).toBe("#2563EB");
  });

  it("blur event flips the wrapper border back to border (default)", async () => {
    await render(<Input testID="in" value="" onChangeText={jest.fn()} />);
    await act(async () => {
      screen.getByTestId("in-input").props.onFocus?.({});
    });
    await act(async () => {
      screen.getByTestId("in-input").props.onBlur?.({});
    });
    expect(screen.getByTestId("in-wrapper").props.borderColor).toBe("#D1D5DB");
  });

  it("error state overrides focused border (borderError wins)", async () => {
    await render(<Input testID="in" value="" onChangeText={jest.fn()} error="Bad" />);
    await act(async () => {
      screen.getByTestId("in-input").props.onFocus?.({});
    });
    expect(screen.getByTestId("in-wrapper").props.borderColor).toBe("#DC2626");
  });

  it("per-instance inputColors override applies", async () => {
    const { getByTestId } = await render(
      <Input
        testID="in"
        value=""
        onChangeText={jest.fn()}
        inputColors={{
          border: "#FF6B00",
          borderFocused: "#FF6B00",
          background: "#FFF7ED",
          label: "#3B0A00",
        }}
        label="Brand"
      />
    );
    expect(getByTestId("in-wrapper").props.borderColor).toBe("#FF6B00");
    expect(getByTestId("in-wrapper").props.backgroundColor).toBe("#FFF7ED");
    expect(getByTestId("in-label").props.color).toBe("#3B0A00");
  });

  it("provider-level inputColors override propagates through useUIKit", async () => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: {
        inputColors: { ...LIGHT_INPUT_COLORS, borderFocused: "#7C3AED" },
      },
    });
    await render(<Input testID="in" value="" onChangeText={jest.fn()} />);
    await act(async () => {
      screen.getByTestId("in-input").props.onFocus?.({});
    });
    expect(screen.getByTestId("in-wrapper").props.borderColor).toBe("#7C3AED");
  });

  it("label becomes the wrapper accessibilityLabel", async () => {
    await render(<Input testID="in" value="" onChangeText={jest.fn()} label="Email" />);
    expect(screen.getByTestId("in-wrapper").props.accessibilityLabel).toBe("Email");
  });

  it.each([
    ["pill", 9999],
    ["none", 0],
    ["lg", "$uiRadiusLg"],
    [24, 24],
  ] as const)("resolves radius=%s to %s", async (radius, expected) => {
    await render(<Input testID="in" value="" onChangeText={jest.fn()} radius={radius} />);
    expect(screen.getByTestId("in-wrapper").props.borderRadius).toBe(expected);
  });

  it("passes through TextInputProps like placeholder + secureTextEntry", async () => {
    await render(
      <Input
        testID="in"
        value=""
        onChangeText={jest.fn()}
        placeholder="Type here"
        secureTextEntry
        maxLength={10}
      />
    );
    const input = screen.getByTestId("in-input");
    expect(input.props.placeholder).toBe("Type here");
    expect(input.props.secureTextEntry).toBe(true);
    expect(input.props.maxLength).toBe(10);
  });

  it("InputComponent prop swaps the underlying input", async () => {
    const rn = jest.requireActual("react-native");
    const Custom = jest.fn(function CustomInput(props: unknown) {
      return <rn.TextInput {...(props as object)} />;
    });
    await render(
      <Input testID="in" value="" onChangeText={jest.fn()} InputComponent={Custom as never} />
    );
    expect(Custom).toHaveBeenCalled();
  });

  // Structural snapshots — serialize the rendered RN tree and diff on
  // any structural / prop / inline-style change. Complements the
  // targeted assertions above by catching regressions the specific
  // asserts miss.
  //
  // Intentional snapshot changes: `pnpm --filter ui-kraken test -- -u`,
  // review the .snap diff carefully, commit both.
  describe("snapshots", () => {
    it("default (no label, no icons, empty value)", async () => {
      await render(<Input value="" onChangeText={jest.fn()} />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("with label", async () => {
      await render(<Input value="" onChangeText={jest.fn()} label="Name" />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("with helperText", async () => {
      await render(<Input value="" onChangeText={jest.fn()} helperText="Optional" />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("with error", async () => {
      await render(<Input value="" onChangeText={jest.fn()} error="Required" />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("with value", async () => {
      await render(<Input value="John Doe" onChangeText={jest.fn()} label="Name" />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("with leftIcon", async () => {
      await render(<Input value="" onChangeText={jest.fn()} leftIcon={<Text>L</Text>} />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("with rightIcon", async () => {
      await render(<Input value="" onChangeText={jest.fn()} rightIcon={<Text>R</Text>} />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("with both icons", async () => {
      await render(
        <Input
          value=""
          onChangeText={jest.fn()}
          leftIcon={<Text>L</Text>}
          rightIcon={<Text>R</Text>}
        />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("disabled state", async () => {
      await render(<Input value="Locked" onChangeText={jest.fn()} label="Name" disabled />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("dark theme", async () => {
      mockUseUIKit.mockReturnValue({
        activeTheme: "dark",
        tokens: { inputColors: DARK_INPUT_COLORS },
      });
      await render(<Input value="Dark" onChangeText={jest.fn()} label="Name" />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("radius pill", async () => {
      await render(<Input value="" onChangeText={jest.fn()} radius="pill" />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("per-instance inputColors override", async () => {
      await render(
        <Input
          value=""
          onChangeText={jest.fn()}
          label="Brand"
          inputColors={{
            border: "#FF6B00",
            borderFocused: "#FF6B00",
            background: "#FFF7ED",
            label: "#3B0A00",
          }}
        />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });
  });
});
