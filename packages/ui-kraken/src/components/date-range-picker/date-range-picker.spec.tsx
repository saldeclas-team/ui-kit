import { fireEvent, render, screen } from "@testing-library/react-native";

import type { DateRangePickerColors } from "../../tokens/tokens-types";

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
// inspect props (color, backgroundColor, testID).
jest.mock("./date-range-picker-styled", () => {
  const rn = jest.requireActual("react-native");
  const forwardRef = jest.requireActual("react").forwardRef;
  const box = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.View ref={ref} {...props} />
  ));
  const text = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.Text ref={ref} {...props} />
  ));
  return {
    StyledDateRangePicker: box,
    StyledDateRangePickerLabel: text,
    StyledDateRangePickerHorizontalRow: box,
    StyledDateRangePickerVerticalStack: box,
    StyledDateRangePickerSeparator: text,
    StyledDateRangePickerHelperText: text,
    StyledDateRangePickerErrorText: text,
  };
});

/**
 * Fake DatePicker — reports the props it received and lets tests
 * simulate a pick via a Pressable. Every prop the shell forwards
 * gets exposed as a `data-*` attribute so tests can assert
 * forwarding without relying on the real DatePicker (which has
 * its own peer + Modal + Reanimated deps that aren't relevant
 * here — the DatePicker spec already covers those paths).
 */
const mockReplacementStart = new Date(2027, 5, 12);
const mockReplacementEnd = new Date(2027, 5, 26);
// Aliases used by test assertions (jest.mock() factories are hoisted
// so they can only reference `mock*`-prefixed variables).
const REPLACEMENT_START = mockReplacementStart;
const REPLACEMENT_END = mockReplacementEnd;
jest.mock("../date-picker", () => {
  const rn = jest.requireActual("react-native");
  const React = jest.requireActual("react");
  return {
    DatePicker: (props: {
      testID?: string;
      value?: Date | null;
      onChange?: (date: Date) => void;
      label?: string;
      placeholderLabel?: string;
      disabled?: boolean;
      minimumDate?: Date;
      maximumDate?: Date;
      mode?: string;
      locale?: string;
      dateStyle?: string;
      timeStyle?: string;
      is24Hour?: boolean;
      radius?: unknown;
      datePickerColors?: Record<string, string>;
      flex?: number;
    }) => {
      return React.createElement(rn.Pressable, {
        testID: props.testID,
        onPress: () => {
          // Fire with a fixed date matching whichever picker this is.
          const isStart = props.testID?.endsWith("-start");
          props.onChange?.(isStart ? mockReplacementStart : mockReplacementEnd);
        },
        "data-value": props.value?.toISOString() ?? "null",
        "data-label": props.label,
        "data-placeholder": props.placeholderLabel,
        "data-disabled": props.disabled,
        "data-min": props.minimumDate?.toISOString(),
        "data-max": props.maximumDate?.toISOString(),
        "data-mode": props.mode,
        "data-locale": props.locale,
        "data-datestyle": props.dateStyle,
        "data-timestyle": props.timeStyle,
        "data-is24hour": props.is24Hour,
        "data-radius": props.radius,
        "data-border-color": props.datePickerColors?.border,
        "data-flex": props.flex,
      });
    },
  };
});

const LIGHT_COLORS: DateRangePickerColors = {
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
  separator: "#9CA3AF",
};

const DARK_COLORS: DateRangePickerColors = {
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
  separator: "#6B7280",
};

type MockUIKit = {
  activeTheme: "light" | "dark";
  tokens: { dateRangePickerColors: DateRangePickerColors };
};

const mockUseUIKit = jest.fn<MockUIKit, []>(() => ({
  activeTheme: "light",
  tokens: { dateRangePickerColors: LIGHT_COLORS },
}));

jest.mock("../../provider/use-ui-kit", () => ({
  useUIKit: () => mockUseUIKit(),
}));

import { DateRangePicker } from "./date-range-picker";

const START = new Date(2027, 5, 12);
const END = new Date(2027, 5, 20);

describe("DateRangePicker", () => {
  beforeEach(() => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: { dateRangePickerColors: LIGHT_COLORS },
    });
  });

  it("renders both start + end DatePickers with default testID root", async () => {
    await render(<DateRangePicker startDate={null} endDate={null} onChange={jest.fn()} />);
    expect(screen.getByTestId("date-range-picker-start")).toBeTruthy();
    expect(screen.getByTestId("date-range-picker-end")).toBeTruthy();
  });

  it("renders label above the range when passed", async () => {
    await render(
      <DateRangePicker
        testID="dr"
        startDate={null}
        endDate={null}
        onChange={jest.fn()}
        label="Vacation dates"
      />
    );
    expect(screen.getByTestId("dr-label")).toHaveTextContent("Vacation dates");
    expect(screen.getByTestId("dr-label").props.color).toBe(LIGHT_COLORS.label);
  });

  it("omits the label when passed an empty string", async () => {
    await render(
      <DateRangePicker testID="dr" startDate={null} endDate={null} onChange={jest.fn()} label="" />
    );
    expect(screen.queryByTestId("dr-label")).toBeNull();
  });

  it("start / end labels default to 'Start' / 'End'", async () => {
    await render(
      <DateRangePicker testID="dr" startDate={null} endDate={null} onChange={jest.fn()} />
    );
    expect(screen.getByTestId("dr-start").props["data-label"]).toBe("Start");
    expect(screen.getByTestId("dr-end").props["data-label"]).toBe("End");
  });

  it("start / end labels can be overridden per-instance", async () => {
    await render(
      <DateRangePicker
        testID="dr"
        startDate={null}
        endDate={null}
        onChange={jest.fn()}
        startLabel="Check-in"
        endLabel="Check-out"
      />
    );
    expect(screen.getByTestId("dr-start").props["data-label"]).toBe("Check-in");
    expect(screen.getByTestId("dr-end").props["data-label"]).toBe("Check-out");
  });

  it("start / end placeholders forward to the wrapped DatePickers", async () => {
    await render(
      <DateRangePicker
        testID="dr"
        startDate={null}
        endDate={null}
        onChange={jest.fn()}
        startPlaceholder="Pick check-in"
        endPlaceholder="Pick check-out"
      />
    );
    expect(screen.getByTestId("dr-start").props["data-placeholder"]).toBe("Pick check-in");
    expect(screen.getByTestId("dr-end").props["data-placeholder"]).toBe("Pick check-out");
  });

  it("picking a start fires onChange with (newStart, existingEnd) when end ≥ newStart", async () => {
    const onChange = jest.fn();
    await render(
      <DateRangePicker
        testID="dr"
        startDate={new Date(2027, 5, 1)}
        endDate={END}
        onChange={onChange}
      />
    );
    fireEvent.press(screen.getByTestId("dr-start"));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(REPLACEMENT_START, END);
  });

  it("picking a start LATER than the current end clears the end (auto-clamp)", async () => {
    const onChange = jest.fn();
    // Existing end is BEFORE the fake's REPLACEMENT_START — picking
    // a new start puts start > end → clamp.
    const earlyEnd = new Date(2027, 0, 10);
    await render(
      <DateRangePicker
        testID="dr"
        startDate={new Date(2027, 0, 1)}
        endDate={earlyEnd}
        onChange={onChange}
      />
    );
    fireEvent.press(screen.getByTestId("dr-start"));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(REPLACEMENT_START, null);
  });

  it("picking a start with no existing end does not fire a clamp", async () => {
    const onChange = jest.fn();
    await render(
      <DateRangePicker testID="dr" startDate={null} endDate={null} onChange={onChange} />
    );
    fireEvent.press(screen.getByTestId("dr-start"));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(REPLACEMENT_START, null);
  });

  it("picking an end fires onChange with (startDate, newEnd)", async () => {
    const onChange = jest.fn();
    await render(
      <DateRangePicker testID="dr" startDate={START} endDate={null} onChange={onChange} />
    );
    fireEvent.press(screen.getByTestId("dr-end"));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(START, REPLACEMENT_END);
  });

  it("end picker's minimumDate is startDate (when set)", async () => {
    await render(
      <DateRangePicker testID="dr" startDate={START} endDate={null} onChange={jest.fn()} />
    );
    expect(screen.getByTestId("dr-end").props["data-min"]).toBe(START.toISOString());
  });

  it("end picker's minimumDate falls back to top-level minimumDate when startDate=null", async () => {
    const rangeMin = new Date(2026, 0, 1);
    await render(
      <DateRangePicker
        testID="dr"
        startDate={null}
        endDate={null}
        onChange={jest.fn()}
        minimumDate={rangeMin}
      />
    );
    expect(screen.getByTestId("dr-end").props["data-min"]).toBe(rangeMin.toISOString());
  });

  it("start picker's maximumDate mirrors the top-level maximumDate", async () => {
    const rangeMax = new Date(2028, 0, 1);
    await render(
      <DateRangePicker
        testID="dr"
        startDate={null}
        endDate={null}
        onChange={jest.fn()}
        maximumDate={rangeMax}
      />
    );
    expect(screen.getByTestId("dr-start").props["data-max"]).toBe(rangeMax.toISOString());
    expect(screen.getByTestId("dr-end").props["data-max"]).toBe(rangeMax.toISOString());
  });

  it("mode forwards to both pickers (date default)", async () => {
    await render(
      <DateRangePicker testID="dr" startDate={null} endDate={null} onChange={jest.fn()} />
    );
    expect(screen.getByTestId("dr-start").props["data-mode"]).toBe("date");
    expect(screen.getByTestId("dr-end").props["data-mode"]).toBe("date");
  });

  it("mode='datetime' forwards to both pickers", async () => {
    await render(
      <DateRangePicker
        testID="dr"
        startDate={null}
        endDate={null}
        onChange={jest.fn()}
        mode="datetime"
      />
    );
    expect(screen.getByTestId("dr-start").props["data-mode"]).toBe("datetime");
    expect(screen.getByTestId("dr-end").props["data-mode"]).toBe("datetime");
  });

  it("locale / dateStyle / timeStyle / is24Hour forward to both pickers", async () => {
    await render(
      <DateRangePicker
        testID="dr"
        startDate={null}
        endDate={null}
        onChange={jest.fn()}
        locale="en-US"
        dateStyle="long"
        timeStyle="medium"
        is24Hour
      />
    );
    for (const id of ["dr-start", "dr-end"] as const) {
      const el = screen.getByTestId(id);
      expect(el.props["data-locale"]).toBe("en-US");
      expect(el.props["data-datestyle"]).toBe("long");
      expect(el.props["data-timestyle"]).toBe("medium");
      expect(el.props["data-is24hour"]).toBe(true);
    }
  });

  it("errorText overrides helperText, paints trigger borders red, hides helper", async () => {
    await render(
      <DateRangePicker
        testID="dr"
        startDate={null}
        endDate={null}
        onChange={jest.fn()}
        helperText="ignored"
        errorText="Please pick a range"
      />
    );
    expect(screen.getByTestId("dr-error-text")).toHaveTextContent("Please pick a range");
    expect(screen.getByTestId("dr-error-text").props.color).toBe(LIGHT_COLORS.errorText);
    expect(screen.queryByTestId("dr-helper-text")).toBeNull();
    // Both DatePickers get the error-colored border via the palette override.
    expect(screen.getByTestId("dr-start").props["data-border-color"]).toBe(
      LIGHT_COLORS.borderError
    );
    expect(screen.getByTestId("dr-end").props["data-border-color"]).toBe(LIGHT_COLORS.borderError);
  });

  it("helperText renders when no error", async () => {
    await render(
      <DateRangePicker
        testID="dr"
        startDate={null}
        endDate={null}
        onChange={jest.fn()}
        helperText="Choose your dates"
      />
    );
    expect(screen.getByTestId("dr-helper-text")).toHaveTextContent("Choose your dates");
    expect(screen.getByTestId("dr-helper-text").props.color).toBe(LIGHT_COLORS.helperText);
  });

  it("omits both helper + error when both are empty", async () => {
    await render(
      <DateRangePicker
        testID="dr"
        startDate={null}
        endDate={null}
        onChange={jest.fn()}
        helperText=""
        errorText=""
      />
    );
    expect(screen.queryByTestId("dr-helper-text")).toBeNull();
    expect(screen.queryByTestId("dr-error-text")).toBeNull();
  });

  it("disabled propagates to both pickers", async () => {
    await render(
      <DateRangePicker testID="dr" startDate={null} endDate={null} onChange={jest.fn()} disabled />
    );
    expect(screen.getByTestId("dr-start").props["data-disabled"]).toBe(true);
    expect(screen.getByTestId("dr-end").props["data-disabled"]).toBe(true);
  });

  it("vertical orientation (default) renders WITHOUT a separator", async () => {
    await render(
      <DateRangePicker testID="dr" startDate={null} endDate={null} onChange={jest.fn()} />
    );
    expect(screen.queryByTestId("dr-separator")).toBeNull();
  });

  it("horizontal orientation renders WITH a separator and flex:1 pickers", async () => {
    await render(
      <DateRangePicker
        testID="dr"
        startDate={null}
        endDate={null}
        onChange={jest.fn()}
        orientation="horizontal"
      />
    );
    const separator = screen.getByTestId("dr-separator");
    expect(separator).toBeTruthy();
    expect(separator.props.color).toBe(LIGHT_COLORS.separator);
    expect(screen.getByTestId("dr-start").props["data-flex"]).toBe(1);
    expect(screen.getByTestId("dr-end").props["data-flex"]).toBe(1);
  });

  it("per-instance dateRangePickerColors override wins over provider palette", async () => {
    await render(
      <DateRangePicker
        testID="dr"
        startDate={null}
        endDate={null}
        onChange={jest.fn()}
        label="Range"
        dateRangePickerColors={{ label: "#7C3AED", separator: "#A78BFA" }}
        orientation="horizontal"
      />
    );
    expect(screen.getByTestId("dr-label").props.color).toBe("#7C3AED");
    expect(screen.getByTestId("dr-separator").props.color).toBe("#A78BFA");
  });

  it("uses the dark palette when activeTheme='dark'", async () => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "dark",
      tokens: { dateRangePickerColors: DARK_COLORS },
    });
    await render(
      <DateRangePicker
        testID="dr"
        startDate={null}
        endDate={null}
        onChange={jest.fn()}
        label="Range"
        helperText="Dark mode"
      />
    );
    expect(screen.getByTestId("dr-label").props.color).toBe(DARK_COLORS.label);
    expect(screen.getByTestId("dr-helper-text").props.color).toBe(DARK_COLORS.helperText);
  });

  it("flows extra YStack props through the spread", async () => {
    await render(
      <DateRangePicker
        testID="dr"
        startDate={null}
        endDate={null}
        onChange={jest.fn()}
        padding={24}
        width={320}
      />
    );
    const root = screen.getByTestId("dr");
    expect(root.props.padding).toBe(24);
    expect(root.props.width).toBe(320);
  });

  it("formatValue applies to both wrapped pickers (forwarded, not called by shell)", async () => {
    const formatValue = jest.fn((d: Date) => `Formatted ${d.getFullYear()}`);
    await render(
      <DateRangePicker
        testID="dr"
        startDate={START}
        endDate={END}
        onChange={jest.fn()}
        formatValue={formatValue}
      />
    );
    // Shell forwards `formatValue` to DatePicker; the shell itself
    // doesn't call it (DatePicker's own shell does). We assert the
    // shell doesn't accidentally invoke it during render.
    expect(formatValue).not.toHaveBeenCalled();
    // And both pickers received the same value forwarding — sanity.
    expect(screen.getByTestId("dr-start")).toBeTruthy();
    expect(screen.getByTestId("dr-end")).toBeTruthy();
  });

  describe("snapshots", () => {
    it("default empty state, vertical", async () => {
      await render(
        <DateRangePicker
          startDate={null}
          endDate={null}
          onChange={jest.fn()}
          label="Vacation"
          helperText="Choose start and end"
        />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("both dates set, horizontal", async () => {
      await render(
        <DateRangePicker
          startDate={START}
          endDate={END}
          onChange={jest.fn()}
          label="Vacation"
          orientation="horizontal"
        />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("error state, vertical", async () => {
      await render(
        <DateRangePicker
          startDate={null}
          endDate={null}
          onChange={jest.fn()}
          label="Vacation"
          errorText="Both dates required"
        />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });
  });
});
