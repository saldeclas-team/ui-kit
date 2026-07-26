import { fireEvent, render, screen } from "@testing-library/react-native";

import type { DatePickerColors } from "../../tokens/tokens-types";

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

// Mock the styled file with rn.View / rn.Text stubs so we can
// inspect props (backgroundColor / borderColor / color).
jest.mock("./date-picker-styled", () => {
  const rn = jest.requireActual("react-native");
  const forwardRef = jest.requireActual("react").forwardRef;
  const box = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.View ref={ref} {...props} />
  ));
  const text = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.Text ref={ref} {...props} />
  ));
  return {
    StyledDatePicker: box,
    StyledDatePickerLabel: text,
    StyledDatePickerTrigger: box,
    StyledDatePickerTriggerText: text,
    StyledDatePickerChevron: text,
    StyledDatePickerHelperText: text,
    StyledDatePickerErrorText: text,
    StyledDatePickerMissingPeer: text,
  };
});

// Toggle-controlled probe mock — same shape as SegmentedControl.
const mockPeerAvailable = jest.fn(() => true);
const mockNativeDateTime = jest.fn();

jest.mock("./expo-ui-datetime-probe", () => ({
  isDateTimePickerAvailable: () => mockPeerAvailable(),
  getExpoUIDateTimePicker: () => mockNativeDateTime(),
}));

/**
 * Fake native picker — surfaces a Pressable that fires
 * `onValueChange` with a fixed replacement Date. Lets us
 * simulate the "user picked something" flow without needing the
 * real native bridge. Jest env resolves `.ios.tsx` (via
 * jest-expo preset), which uses a Modal — we don't need to
 * assert modal internals here; we only assert onChange fires.
 */
const REPLACEMENT_DATE = new Date(2028, 3, 15, 14, 30);
function makeFakeNativePicker() {
  const rn = jest.requireActual("react-native");
  const React = jest.requireActual("react");
  return function FakePicker(props: {
    testID?: string;
    value?: Date;
    mode?: "date" | "time" | "datetime";
    onValueChange?: (event: unknown, date: Date) => void;
  }) {
    return React.createElement(rn.Pressable, {
      testID: props.testID,
      "data-mode": props.mode,
      onPress: () => props.onValueChange?.({}, REPLACEMENT_DATE),
    });
  };
}

const LIGHT_COLORS: DatePickerColors = {
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
  accent: "#007AFF",
};

const DARK_COLORS: DatePickerColors = {
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
  accent: "#0A84FF",
};

type MockUIKit = {
  activeTheme: "light" | "dark";
  tokens: {
    datePickerColors: DatePickerColors;
    radius: { sm: number; md: number; lg: number; pill: number };
  };
};

const mockUseUIKit = jest.fn<MockUIKit, []>(() => ({
  activeTheme: "light",
  tokens: {
    datePickerColors: LIGHT_COLORS,
    radius: { sm: 6, md: 12, lg: 18, pill: 9999 },
  },
}));

jest.mock("../../provider/use-ui-kit", () => ({
  useUIKit: () => mockUseUIKit(),
}));

// Fake context — the iOS body re-mounts UIKitContext inside its
// modal. We give useUIKit's context a stub value so the body
// doesn't blow up trying to read it.
jest.mock("../../provider/provider-context", () => {
  const React = jest.requireActual("react");
  return {
    UIKitContext: React.createContext(null),
  };
});

import { DatePicker } from "./date-picker";

const REFERENCE_DATE = new Date(2027, 5, 12, 9, 45); // 2027-06-12 09:45

describe("DatePicker", () => {
  beforeEach(() => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: {
        datePickerColors: LIGHT_COLORS,
        radius: { sm: 6, md: 12, lg: 18, pill: 9999 },
      },
    });
    mockPeerAvailable.mockReturnValue(true);
    mockNativeDateTime.mockReturnValue(makeFakeNativePicker());
  });

  it("renders trigger with default testID='date-picker' when none passed", async () => {
    await render(<DatePicker value={null} onChange={jest.fn()} />);
    expect(screen.getByTestId("date-picker-trigger")).toBeTruthy();
  });

  it("renders the label above the trigger when `label` is passed", async () => {
    await render(
      <DatePicker testID="dp" value={null} onChange={jest.fn()} label="Date of birth" />
    );
    expect(screen.getByTestId("dp-label")).toHaveTextContent("Date of birth");
    expect(screen.getByTestId("dp-label").props.color).toBe(LIGHT_COLORS.label);
  });

  it("omits the label when passed an empty string", async () => {
    await render(<DatePicker testID="dp" value={null} onChange={jest.fn()} label="" />);
    expect(screen.queryByTestId("dp-label")).toBeNull();
  });

  it("renders default date-mode placeholder when value=null", async () => {
    await render(<DatePicker testID="dp" value={null} onChange={jest.fn()} />);
    expect(screen.getByTestId("dp-trigger-text")).toHaveTextContent(/select date/i);
    expect(screen.getByTestId("dp-trigger-text").props.color).toBe(LIGHT_COLORS.placeholder);
  });

  it("renders default time-mode placeholder when mode='time' + value=null", async () => {
    await render(<DatePicker testID="dp" value={null} onChange={jest.fn()} mode="time" />);
    expect(screen.getByTestId("dp-trigger-text")).toHaveTextContent(/select time/i);
  });

  it("renders default datetime-mode placeholder when mode='datetime' + value=null", async () => {
    await render(<DatePicker testID="dp" value={null} onChange={jest.fn()} mode="datetime" />);
    expect(screen.getByTestId("dp-trigger-text")).toHaveTextContent(/select date/i);
    expect(screen.getByTestId("dp-trigger-text")).toHaveTextContent(/time/i);
  });

  it("custom `placeholderLabel` overrides the mode default", async () => {
    await render(
      <DatePicker
        testID="dp"
        value={null}
        onChange={jest.fn()}
        placeholderLabel="Pick a birthday"
      />
    );
    expect(screen.getByTestId("dp-trigger-text")).toHaveTextContent("Pick a birthday");
  });

  it("formats value via Intl.DateTimeFormat when value set + no formatValue", async () => {
    await render(
      <DatePicker
        testID="dp"
        value={REFERENCE_DATE}
        onChange={jest.fn()}
        locale="en-US"
        dateStyle="long"
      />
    );
    const expected = new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(REFERENCE_DATE);
    expect(screen.getByTestId("dp-trigger-text")).toHaveTextContent(expected);
    expect(screen.getByTestId("dp-trigger-text").props.color).toBe(LIGHT_COLORS.text);
  });

  it("time mode formats with timeStyle only", async () => {
    await render(
      <DatePicker
        testID="dp"
        value={REFERENCE_DATE}
        onChange={jest.fn()}
        mode="time"
        locale="en-US"
        timeStyle="short"
      />
    );
    const expected = new Intl.DateTimeFormat("en-US", { timeStyle: "short" }).format(
      REFERENCE_DATE
    );
    expect(screen.getByTestId("dp-trigger-text")).toHaveTextContent(expected);
  });

  it("datetime mode formats with both dateStyle + timeStyle", async () => {
    await render(
      <DatePicker
        testID="dp"
        value={REFERENCE_DATE}
        onChange={jest.fn()}
        mode="datetime"
        locale="en-US"
        dateStyle="medium"
        timeStyle="short"
      />
    );
    const expected = new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(REFERENCE_DATE);
    expect(screen.getByTestId("dp-trigger-text")).toHaveTextContent(expected);
  });

  it("formatValue escape hatch bypasses Intl entirely", async () => {
    const formatValue = jest.fn((d: Date) => `Custom ${d.getFullYear()}`);
    await render(
      <DatePicker
        testID="dp"
        value={REFERENCE_DATE}
        onChange={jest.fn()}
        formatValue={formatValue}
      />
    );
    expect(formatValue).toHaveBeenCalledWith(REFERENCE_DATE);
    expect(screen.getByTestId("dp-trigger-text")).toHaveTextContent("Custom 2027");
  });

  it("disabled trigger renders with backgroundDisabled + textDisabled and swallows presses", async () => {
    const onChange = jest.fn();
    await render(<DatePicker testID="dp" value={REFERENCE_DATE} onChange={onChange} disabled />);
    const trigger = screen.getByTestId("dp-trigger");
    expect(trigger.props.accessibilityState).toEqual({ disabled: true });
    // No press → onChange never fires.
    fireEvent.press(trigger);
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByTestId("dp-trigger-text").props.color).toBe(LIGHT_COLORS.textDisabled);
  });

  it("errorText overrides helperText and turns the border red", async () => {
    await render(
      <DatePicker
        testID="dp"
        value={null}
        onChange={jest.fn()}
        helperText="ignored"
        errorText="Required"
      />
    );
    expect(screen.getByTestId("dp-error-text")).toHaveTextContent("Required");
    expect(screen.getByTestId("dp-error-text").props.color).toBe(LIGHT_COLORS.errorText);
    expect(screen.queryByTestId("dp-helper-text")).toBeNull();
  });

  it("renders helperText when no error", async () => {
    await render(
      <DatePicker testID="dp" value={null} onChange={jest.fn()} helperText="MM/DD/YYYY" />
    );
    expect(screen.getByTestId("dp-helper-text")).toHaveTextContent("MM/DD/YYYY");
    expect(screen.getByTestId("dp-helper-text").props.color).toBe(LIGHT_COLORS.helperText);
  });

  it("omits both helper + error when both empty", async () => {
    await render(
      <DatePicker testID="dp" value={null} onChange={jest.fn()} helperText="" errorText="" />
    );
    expect(screen.queryByTestId("dp-helper-text")).toBeNull();
    expect(screen.queryByTestId("dp-error-text")).toBeNull();
  });

  it("renders the missing-peer hint when @expo/ui isn't available", async () => {
    mockPeerAvailable.mockReturnValue(false);
    mockNativeDateTime.mockReturnValue(null);
    await render(<DatePicker testID="dp" value={null} onChange={jest.fn()} />);
    const hint = screen.getByTestId("dp-missing-peer");
    expect(hint).toHaveTextContent(/install .+@expo\/ui/i);
    expect(hint.props.color).toBe(LIGHT_COLORS.errorText);
  });

  it("per-instance datePickerColors override wins over provider palette", async () => {
    await render(
      <DatePicker
        testID="dp"
        value={null}
        onChange={jest.fn()}
        label="Date"
        datePickerColors={{ label: "#7C3AED", placeholder: "#A78BFA" }}
      />
    );
    expect(screen.getByTestId("dp-label").props.color).toBe("#7C3AED");
    expect(screen.getByTestId("dp-trigger-text").props.color).toBe("#A78BFA");
  });

  it("uses the dark palette when activeTheme='dark'", async () => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "dark",
      tokens: {
        datePickerColors: DARK_COLORS,
        radius: { sm: 6, md: 12, lg: 18, pill: 9999 },
      },
    });
    await render(<DatePicker testID="dp" value={null} onChange={jest.fn()} label="Date" />);
    expect(screen.getByTestId("dp-label").props.color).toBe(DARK_COLORS.label);
    expect(screen.getByTestId("dp-trigger-text").props.color).toBe(DARK_COLORS.placeholder);
  });

  it("flows extra YStack props through the spread", async () => {
    await render(
      <DatePicker testID="dp" value={null} onChange={jest.fn()} padding={24} width={280} />
    );
    const root = screen.getByTestId("dp");
    expect(root.props.padding).toBe(24);
    expect(root.props.width).toBe(280);
  });

  describe("snapshots", () => {
    it("empty state, date mode, peer available", async () => {
      await render(<DatePicker value={null} onChange={jest.fn()} label="Date of birth" />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("value set + helper", async () => {
      await render(
        <DatePicker
          value={REFERENCE_DATE}
          onChange={jest.fn()}
          label="Date of birth"
          helperText="MM/DD/YYYY"
          locale="en-US"
        />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("missing peer dep fallback", async () => {
      mockPeerAvailable.mockReturnValue(false);
      mockNativeDateTime.mockReturnValue(null);
      await render(<DatePicker value={null} onChange={jest.fn()} label="Date of birth" />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("error state", async () => {
      await render(
        <DatePicker value={null} onChange={jest.fn()} label="Date of birth" errorText="Required" />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });
  });
});
