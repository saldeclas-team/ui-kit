import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Pressable, Text } from "react-native";

/**
 * Direct test of the Android body — jest-expo resolves `.ios.tsx`
 * by default so we import the `.android` file explicitly to
 * exercise its OS-dialog path. Mirrors
 * `segmented-control-body.android.spec.tsx`.
 */
const mockNativeDateTime = jest.fn();

jest.mock("./expo-ui-datetime-probe", () => ({
  isDateTimePickerAvailable: () => true,
  getExpoUIDateTimePicker: () => mockNativeDateTime(),
}));

function makeFakeNativePicker(replacement: Date) {
  const rn = jest.requireActual("react-native");
  const React = jest.requireActual("react");
  return function FakePicker(props: {
    testID?: string;
    onValueChange?: (event: unknown, date: Date) => void;
    onDismiss?: () => void;
  }) {
    return React.createElement(rn.View, {
      testID: props.testID,
      onLayout: () => {
        props.onValueChange?.({}, replacement);
      },
    });
  };
}

import { DatePickerBody } from "./date-picker-body.android";
import type { DatePickerBodyPalette } from "./date-picker-body-types";

const CHROME: DatePickerBodyPalette = {
  accent: "#7C3AED",
  background: "#FFFFFF",
  border: "#D1D5DB",
  borderFocused: "#2563EB",
};

const REPLACEMENT_DATE = new Date(2028, 3, 15);

function TriggerStub({ onPress, testID }: { onPress: () => void; testID: string }) {
  return (
    <Pressable onPress={onPress} testID={testID}>
      <Text>Trigger</Text>
    </Pressable>
  );
}

describe("DatePickerBody.android (Material 3 native dialog)", () => {
  beforeEach(() => {
    mockNativeDateTime.mockReturnValue(makeFakeNativePicker(REPLACEMENT_DATE));
  });

  it("renders the trigger via renderTrigger — no picker until tapped", async () => {
    await render(
      <DatePickerBody
        value={null}
        onChange={jest.fn()}
        disabled={false}
        mode="date"
        appearance="light"
        chromeColors={CHROME}
        testID="dp"
        renderTrigger={(open) => <TriggerStub testID="dp-trigger" onPress={open} />}
      />
    );
    expect(screen.getByTestId("dp-trigger")).toBeTruthy();
    expect(screen.queryByTestId("dp-picker")).toBeNull();
  });

  it("tapping the trigger mounts the native picker", async () => {
    await render(
      <DatePickerBody
        value={null}
        onChange={jest.fn()}
        disabled={false}
        mode="date"
        appearance="light"
        chromeColors={CHROME}
        testID="dp"
        renderTrigger={(open) => <TriggerStub testID="dp-trigger" onPress={open} />}
      />
    );
    await act(async () => {
      fireEvent.press(screen.getByTestId("dp-trigger"));
    });
    expect(screen.getByTestId("dp-picker")).toBeTruthy();
  });

  it("fires onChange with the picked date when the native picker reports one", async () => {
    const onChange = jest.fn();
    await render(
      <DatePickerBody
        value={null}
        onChange={onChange}
        disabled={false}
        mode="date"
        appearance="light"
        chromeColors={CHROME}
        testID="dp"
        renderTrigger={(open) => <TriggerStub testID="dp-trigger" onPress={open} />}
      />
    );
    await act(async () => {
      fireEvent.press(screen.getByTestId("dp-trigger"));
    });
    // Fake picker fires onValueChange on layout — trigger it.
    await act(async () => {
      fireEvent(screen.getByTestId("dp-picker"), "layout", {});
    });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(REPLACEMENT_DATE);
  });

  it("disabled=true swallows the trigger tap — no picker mounts", async () => {
    await render(
      <DatePickerBody
        value={null}
        onChange={jest.fn()}
        disabled
        mode="date"
        appearance="light"
        chromeColors={CHROME}
        testID="dp"
        renderTrigger={(open) => <TriggerStub testID="dp-trigger" onPress={open} />}
      />
    );
    await act(async () => {
      fireEvent.press(screen.getByTestId("dp-trigger"));
    });
    expect(screen.queryByTestId("dp-picker")).toBeNull();
  });

  it("renders the fallback instead of the picker when passed", async () => {
    const rn = jest.requireActual("react-native");
    const React = jest.requireActual("react");
    const fallback = React.createElement(rn.Text, { testID: "dp-missing" }, "Missing");
    await render(
      <DatePickerBody
        value={null}
        onChange={jest.fn()}
        disabled={false}
        mode="date"
        appearance="light"
        chromeColors={CHROME}
        testID="dp"
        renderTrigger={(open) => <TriggerStub testID="dp-trigger" onPress={open} />}
        fallback={fallback}
      />
    );
    expect(screen.getByTestId("dp-missing")).toBeTruthy();
    expect(screen.queryByTestId("dp-trigger")).toBeNull();
  });

  it("onValueChange with undefined date closes the dialog without firing onChange", async () => {
    const onChange = jest.fn();
    // Fake picker that fires onValueChange with undefined (edge case
    // where the native side reports no date, e.g. dialog cancel via
    // OS back).
    mockNativeDateTime.mockReturnValue(
      (() => {
        const rn = jest.requireActual("react-native");
        const React = jest.requireActual("react");
        return function FakePicker(props: {
          testID?: string;
          onValueChange?: (event: unknown, date: Date | undefined) => void;
        }) {
          return React.createElement(rn.View, {
            testID: props.testID,
            onLayout: () => props.onValueChange?.({}, undefined),
          });
        };
      })()
    );
    await render(
      <DatePickerBody
        value={null}
        onChange={onChange}
        disabled={false}
        mode="date"
        appearance="light"
        chromeColors={CHROME}
        testID="dp"
        renderTrigger={(open) => <TriggerStub testID="dp-trigger" onPress={open} />}
      />
    );
    await act(async () => {
      fireEvent.press(screen.getByTestId("dp-trigger"));
    });
    await act(async () => {
      fireEvent(screen.getByTestId("dp-picker"), "layout", {});
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("onDismiss closes the dialog without firing onChange", async () => {
    const onChange = jest.fn();
    // Capture onDismiss so we can invoke it externally.
    const captured: { onDismiss?: () => void } = {};
    mockNativeDateTime.mockReturnValue(
      (() => {
        const rn = jest.requireActual("react-native");
        const React = jest.requireActual("react");
        return function FakePicker(props: { testID?: string; onDismiss?: () => void }) {
          captured.onDismiss = props.onDismiss;
          return React.createElement(rn.View, { testID: props.testID });
        };
      })()
    );
    await render(
      <DatePickerBody
        value={null}
        onChange={onChange}
        disabled={false}
        mode="date"
        appearance="light"
        chromeColors={CHROME}
        testID="dp"
        renderTrigger={(open) => <TriggerStub testID="dp-trigger" onPress={open} />}
      />
    );
    await act(async () => {
      fireEvent.press(screen.getByTestId("dp-trigger"));
    });
    expect(screen.getByTestId("dp-picker")).toBeTruthy();
    await act(async () => {
      captured.onDismiss?.();
    });
    expect(screen.queryByTestId("dp-picker")).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("returns null when peer is unavailable and no fallback", async () => {
    mockNativeDateTime.mockReturnValue(null);
    await render(
      <DatePickerBody
        value={null}
        onChange={jest.fn()}
        disabled={false}
        mode="date"
        appearance="light"
        chromeColors={CHROME}
        testID="dp"
        renderTrigger={(open) => <TriggerStub testID="dp-trigger" onPress={open} />}
      />
    );
    expect(screen.queryByTestId("dp-trigger")).toBeNull();
    expect(screen.queryByTestId("dp-picker")).toBeNull();
  });
});
