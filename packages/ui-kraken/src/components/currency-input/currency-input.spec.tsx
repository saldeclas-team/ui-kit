import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

import type { CurrencyInputColors } from "../../tokens/tokens-types";

// Mock the styled file so the component logic (formatting, parsing,
// state-driven border, testID propagation, prefix, RN prop flow-through,
// focus/blur) stays testable without booting Tamagui.
jest.mock("./currency-input.styled", () => {
  const rn = jest.requireActual("react-native");
  const forwardRef = jest.requireActual("react").forwardRef;
  const box = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.View ref={ref} {...props} />
  ));
  const text = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.Text ref={ref} {...props} />
  ));
  return {
    StyledCurrencyInputContainer: box,
    StyledCurrencyInputLabel: text,
    StyledCurrencyInputWrapper: box,
    StyledCurrencyInputPrefix: text,
    StyledCurrencyInputIconSlot: box,
    StyledCurrencyInputHelper: text,
    StyledCurrencyInputError: text,
  };
});

const LIGHT_CURRENCY_INPUT_COLORS: CurrencyInputColors = {
  background: "#FFFFFF",
  backgroundDisabled: "#F3F4F6",
  border: "#D1D5DB",
  borderFocused: "#2563EB",
  borderError: "#DC2626",
  text: "#0B0B0F",
  textDisabled: "#9CA3AF",
  placeholder: "#9CA3AF",
  prefix: "#6B7280",
  label: "#0B0B0F",
  helperText: "#6B7280",
  errorText: "#DC2626",
};

const DARK_CURRENCY_INPUT_COLORS: CurrencyInputColors = {
  background: "#111827",
  backgroundDisabled: "#1F2937",
  border: "#374151",
  borderFocused: "#60A5FA",
  borderError: "#F87171",
  text: "#F5F5F7",
  textDisabled: "#6B7280",
  placeholder: "#6B7280",
  prefix: "#9CA3AF",
  label: "#F5F5F7",
  helperText: "#9CA3AF",
  errorText: "#F87171",
};

type MockUIKit = {
  activeTheme: "light" | "dark";
  tokens: { currencyInputColors: CurrencyInputColors };
};
const mockUseUIKit = jest.fn<MockUIKit, []>(() => ({
  activeTheme: "light",
  tokens: { currencyInputColors: LIGHT_CURRENCY_INPUT_COLORS },
}));
jest.mock("../../provider/use-ui-kit", () => ({
  useUIKit: () => mockUseUIKit(),
}));

import { CurrencyInput } from "./currency-input";

describe("CurrencyInput", () => {
  beforeEach(() => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: { currencyInputColors: LIGHT_CURRENCY_INPUT_COLORS },
    });
  });

  it("renders the formatted value on the underlying TextInput", async () => {
    await render(<CurrencyInput testID="c" value={1234} onChangeValue={jest.fn()} />);
    expect(screen.getByTestId("c-input").props.value).toBe("1,234");
  });

  it('renders "" for a null value', async () => {
    await render(<CurrencyInput testID="c" value={null} onChangeValue={jest.fn()} />);
    expect(screen.getByTestId("c-input").props.value).toBe("");
  });

  it("fires onChangeValue with the parsed numeric value on text change", async () => {
    const onChangeValue = jest.fn();
    await render(<CurrencyInput testID="c" value={null} onChangeValue={onChangeValue} />);
    fireEvent.changeText(screen.getByTestId("c-input"), "1234");
    expect(onChangeValue).toHaveBeenCalledWith(1234);
  });

  it("fires onChangeValue(null) when the input is cleared", async () => {
    const onChangeValue = jest.fn();
    await render(<CurrencyInput testID="c" value={1234} onChangeValue={onChangeValue} />);
    fireEvent.changeText(screen.getByTestId("c-input"), "");
    expect(onChangeValue).toHaveBeenCalledWith(null);
  });

  it("renders the label when provided", async () => {
    await render(
      <CurrencyInput testID="c" value={null} onChangeValue={jest.fn()} label="Amount" />
    );
    expect(screen.getByTestId("c-label").props.children).toBe("Amount");
  });

  it("omits the label when not provided", async () => {
    await render(<CurrencyInput testID="c" value={null} onChangeValue={jest.fn()} />);
    expect(screen.queryByTestId("c-label")).toBeNull();
  });

  it('renders the default "$" prefix', async () => {
    await render(<CurrencyInput testID="c" value={null} onChangeValue={jest.fn()} />);
    expect(screen.getByTestId("c-prefix").props.children).toBe("$");
  });

  it("renders a custom prefix", async () => {
    await render(
      <CurrencyInput testID="c" value={null} onChangeValue={jest.fn()} prefix="COP $" />
    );
    expect(screen.getByTestId("c-prefix").props.children).toBe("COP $");
  });

  it('omits the prefix when prefix=""', async () => {
    await render(<CurrencyInput testID="c" value={null} onChangeValue={jest.fn()} prefix="" />);
    expect(screen.queryByTestId("c-prefix")).toBeNull();
  });

  it("renders helperText when no error", async () => {
    await render(
      <CurrencyInput testID="c" value={null} onChangeValue={jest.fn()} helperText="Enter USD" />
    );
    expect(screen.getByTestId("c-helper").props.children).toBe("Enter USD");
    expect(screen.queryByTestId("c-error")).toBeNull();
  });

  it("renders error, hides helperText when both are set", async () => {
    await render(
      <CurrencyInput
        testID="c"
        value={null}
        onChangeValue={jest.fn()}
        helperText="hint"
        error="Required"
      />
    );
    expect(screen.getByTestId("c-error").props.children).toBe("Required");
    expect(screen.queryByTestId("c-helper")).toBeNull();
  });

  it("disabled sets editable=false on the underlying TextInput", async () => {
    await render(<CurrencyInput testID="c" value={null} onChangeValue={jest.fn()} disabled />);
    expect(screen.getByTestId("c-input").props.editable).toBe(false);
  });

  it("disabled propagates to wrapper accessibilityState.disabled", async () => {
    await render(<CurrencyInput testID="c" value={null} onChangeValue={jest.fn()} disabled />);
    expect(screen.getByTestId("c-wrapper").props.accessibilityState).toEqual({ disabled: true });
  });

  it("leftIcon renders under {testID}-left-icon", async () => {
    await render(
      <CurrencyInput
        testID="c"
        value={null}
        onChangeValue={jest.fn()}
        leftIcon={<Text testID="my-left">L</Text>}
      />
    );
    expect(screen.getByTestId("c-left-icon")).toBeTruthy();
    expect(screen.getByTestId("my-left")).toBeTruthy();
  });

  it("rightIcon renders under {testID}-right-icon", async () => {
    await render(
      <CurrencyInput
        testID="c"
        value={null}
        onChangeValue={jest.fn()}
        rightIcon={<Text testID="my-right">R</Text>}
      />
    );
    expect(screen.getByTestId("c-right-icon")).toBeTruthy();
    expect(screen.getByTestId("my-right")).toBeTruthy();
  });

  it("omits icon slots when not provided", async () => {
    await render(<CurrencyInput testID="c" value={null} onChangeValue={jest.fn()} />);
    expect(screen.queryByTestId("c-left-icon")).toBeNull();
    expect(screen.queryByTestId("c-right-icon")).toBeNull();
  });

  it("focus event flips wrapper border to borderFocused", async () => {
    await render(<CurrencyInput testID="c" value={null} onChangeValue={jest.fn()} />);
    await act(async () => {
      screen.getByTestId("c-input").props.onFocus?.({});
    });
    expect(screen.getByTestId("c-wrapper").props.borderColor).toBe("#2563EB");
  });

  it("blur event flips wrapper border back to default", async () => {
    await render(<CurrencyInput testID="c" value={null} onChangeValue={jest.fn()} />);
    await act(async () => {
      screen.getByTestId("c-input").props.onFocus?.({});
    });
    await act(async () => {
      screen.getByTestId("c-input").props.onBlur?.({});
    });
    expect(screen.getByTestId("c-wrapper").props.borderColor).toBe("#D1D5DB");
  });

  it("error state overrides focused border", async () => {
    await render(<CurrencyInput testID="c" value={null} onChangeValue={jest.fn()} error="Bad" />);
    await act(async () => {
      screen.getByTestId("c-input").props.onFocus?.({});
    });
    expect(screen.getByTestId("c-wrapper").props.borderColor).toBe("#DC2626");
  });

  it("per-instance currencyInputColors override applies", async () => {
    await render(
      <CurrencyInput
        testID="c"
        value={null}
        onChangeValue={jest.fn()}
        currencyInputColors={{
          border: "#FF6B00",
          borderFocused: "#FF6B00",
          background: "#FFF7ED",
          label: "#3B0A00",
          prefix: "#FF6B00",
        }}
        label="Brand"
      />
    );
    expect(screen.getByTestId("c-wrapper").props.borderColor).toBe("#FF6B00");
    expect(screen.getByTestId("c-wrapper").props.backgroundColor).toBe("#FFF7ED");
    expect(screen.getByTestId("c-label").props.color).toBe("#3B0A00");
    expect(screen.getByTestId("c-prefix").props.color).toBe("#FF6B00");
  });

  it("provider-level currencyInputColors override propagates through useUIKit", async () => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: {
        currencyInputColors: { ...LIGHT_CURRENCY_INPUT_COLORS, borderFocused: "#7C3AED" },
      },
    });
    await render(<CurrencyInput testID="c" value={null} onChangeValue={jest.fn()} />);
    await act(async () => {
      screen.getByTestId("c-input").props.onFocus?.({});
    });
    expect(screen.getByTestId("c-wrapper").props.borderColor).toBe("#7C3AED");
  });

  it.each([
    ["pill", 9999],
    ["none", 0],
    ["lg", "$uiRadiusLg"],
    [24, 24],
  ] as const)("resolves radius=%s to %s", async (radius, expected) => {
    await render(
      <CurrencyInput testID="c" value={null} onChangeValue={jest.fn()} radius={radius} />
    );
    expect(screen.getByTestId("c-wrapper").props.borderRadius).toBe(expected);
  });

  it("uses number-pad keyboardType when decimals=0", async () => {
    await render(<CurrencyInput testID="c" value={null} onChangeValue={jest.fn()} decimals={0} />);
    expect(screen.getByTestId("c-input").props.keyboardType).toBe("number-pad");
  });

  it("uses decimal-pad keyboardType when decimals > 0", async () => {
    await render(<CurrencyInput testID="c" value={null} onChangeValue={jest.fn()} decimals={2} />);
    expect(screen.getByTestId("c-input").props.keyboardType).toBe("decimal-pad");
  });

  it("respects the locale prop when formatting", async () => {
    await render(
      <CurrencyInput testID="c" value={1234} onChangeValue={jest.fn()} locale="es-CO" />
    );
    expect(screen.getByTestId("c-input").props.value).toBe("1.234");
  });

  it("formats decimals when decimals > 0", async () => {
    await render(
      <CurrencyInput testID="c" value={1234.56} onChangeValue={jest.fn()} decimals={2} />
    );
    expect(screen.getByTestId("c-input").props.value).toBe("1,234.56");
  });

  it("exposes accessibilityValue.text matching the display", async () => {
    await render(<CurrencyInput testID="c" value={1234} onChangeValue={jest.fn()} />);
    expect(screen.getByTestId("c-input").props.accessibilityValue).toEqual({ text: "1,234" });
  });

  it("label becomes wrapper accessibilityLabel", async () => {
    await render(<CurrencyInput testID="c" value={null} onChangeValue={jest.fn()} label="Total" />);
    expect(screen.getByTestId("c-wrapper").props.accessibilityLabel).toBe("Total");
  });

  it("passes through TextInputProps like placeholder + maxLength", async () => {
    await render(
      <CurrencyInput
        testID="c"
        value={null}
        onChangeValue={jest.fn()}
        placeholder="Enter amount"
        maxLength={12}
      />
    );
    const input = screen.getByTestId("c-input");
    expect(input.props.placeholder).toBe("Enter amount");
    expect(input.props.maxLength).toBe(12);
  });

  it("InputComponent prop swaps the underlying input", async () => {
    const rn = jest.requireActual("react-native");
    const Custom = jest.fn(function CustomInput(props: unknown) {
      return <rn.TextInput {...(props as object)} />;
    });
    await render(
      <CurrencyInput
        testID="c"
        value={null}
        onChangeValue={jest.fn()}
        InputComponent={Custom as never}
      />
    );
    expect(Custom).toHaveBeenCalled();
  });

  // Structural snapshots
  describe("snapshots", () => {
    it("default (empty, $ prefix)", async () => {
      await render(<CurrencyInput value={null} onChangeValue={jest.fn()} />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("with label + value", async () => {
      await render(<CurrencyInput value={1234} onChangeValue={jest.fn()} label="Amount" />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("without prefix", async () => {
      await render(<CurrencyInput value={1234} onChangeValue={jest.fn()} prefix="" />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("with helperText", async () => {
      await render(<CurrencyInput value={null} onChangeValue={jest.fn()} helperText="Enter USD" />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("with error", async () => {
      await render(<CurrencyInput value={null} onChangeValue={jest.fn()} error="Required" />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("with both icons", async () => {
      await render(
        <CurrencyInput
          value={null}
          onChangeValue={jest.fn()}
          leftIcon={<Text>L</Text>}
          rightIcon={<Text>R</Text>}
        />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("disabled state", async () => {
      await render(<CurrencyInput value={100} onChangeValue={jest.fn()} label="Locked" disabled />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("dark theme", async () => {
      mockUseUIKit.mockReturnValue({
        activeTheme: "dark",
        tokens: { currencyInputColors: DARK_CURRENCY_INPUT_COLORS },
      });
      await render(<CurrencyInput value={1234} onChangeValue={jest.fn()} label="Dark" />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("es-CO locale with decimals=2", async () => {
      await render(
        <CurrencyInput value={1234.56} onChangeValue={jest.fn()} locale="es-CO" decimals={2} />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("radius pill", async () => {
      await render(<CurrencyInput value={null} onChangeValue={jest.fn()} radius="pill" />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("per-instance currencyInputColors override", async () => {
      await render(
        <CurrencyInput
          value={null}
          onChangeValue={jest.fn()}
          label="Brand"
          currencyInputColors={{
            border: "#FF6B00",
            borderFocused: "#FF6B00",
            background: "#FFF7ED",
            label: "#3B0A00",
            prefix: "#FF6B00",
          }}
        />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("COP prefix + es-CO locale", async () => {
      await render(
        <CurrencyInput
          value={1234000}
          onChangeValue={jest.fn()}
          prefix="COP $"
          locale="es-CO"
          label="Monto"
        />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });
  });

  // External-value re-sync tests use `rerender` which under RTL v14 +
  // jest-expo leaves a subtle cleanup residue that breaks subsequent
  // `getByTestId` lookups in this file. Kept at the very end of the
  // describe so no other tests run after them (snapshots above are
  // structural — they use `screen.toJSON()`, not `getByTestId`, so
  // the residue does not affect them).
  describe("external value sync (rerender)", () => {
    it("re-syncs the display when the external `value` changes", async () => {
      const onChangeValue = jest.fn();
      const { rerender } = await render(
        <CurrencyInput testID="c" value={100} onChangeValue={onChangeValue} />
      );
      expect(screen.getByTestId("c-input").props.value).toBe("100");
      await act(async () => {
        rerender(<CurrencyInput testID="c" value={5000} onChangeValue={onChangeValue} />);
      });
      expect(screen.getByTestId("c-input").props.value).toBe("5,000");
    });

    it("does NOT re-sync when the emit came from our own onChangeText", async () => {
      // Simulates a controlled parent that mirrors what the user typed
      // back into `value` — without the ref-guard this would ping-pong.
      let currentValue: number | null = null;
      const onChangeValue = jest.fn((v: number | null) => {
        currentValue = v;
      });
      const { rerender } = await render(
        <CurrencyInput testID="c" value={currentValue} onChangeValue={onChangeValue} />
      );
      fireEvent.changeText(screen.getByTestId("c-input"), "1234");
      await act(async () => {
        rerender(<CurrencyInput testID="c" value={currentValue} onChangeValue={onChangeValue} />);
      });
      expect(screen.getByTestId("c-input").props.value).toBe("1,234");
    });
  });
});
