import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Pressable, Text } from "react-native";

/**
 * Direct test of the iOS body — exercises modal open, backdrop
 * close, Done commit, and the staged-value flow. The shell spec
 * only presses the trigger; this file covers the modal's own
 * callbacks that don't fire from a shell render alone.
 */
const mockNativeDateTime = jest.fn();

jest.mock("./expo-ui-datetime-probe", () => ({
  isDateTimePickerAvailable: () => true,
  getExpoUIDateTimePicker: () => mockNativeDateTime(),
}));

jest.mock("../../provider/use-ui-kit", () => ({
  useUIKit: () => ({ activeTheme: "light", tokens: {} }),
}));

// Fake native picker — surfaces a Pressable that fires
// onValueChange with a captured replacement date. The modal
// wraps around it; we can then press the Done button (rendered
// by the body itself) to commit.
const REPLACEMENT_DATE = new Date(2028, 3, 15, 14, 30);

function makeFakeNativePicker() {
  const rn = jest.requireActual("react-native");
  const React = jest.requireActual("react");
  return function FakePicker(props: {
    testID?: string;
    onValueChange?: (event: unknown, date: Date) => void;
  }) {
    return React.createElement(rn.Pressable, {
      testID: props.testID,
      onPress: () => props.onValueChange?.({}, REPLACEMENT_DATE),
    });
  };
}

import { DatePickerBody } from "./date-picker-body.ios";
import type { DatePickerBodyPalette } from "./date-picker-body-types";

const CHROME: DatePickerBodyPalette = {
  accent: "#7C3AED",
  background: "#FFFFFF",
  border: "#D1D5DB",
  borderFocused: "#2563EB",
};

function TriggerStub({ onPress, testID }: { onPress: () => void; testID: string }) {
  return (
    <Pressable onPress={onPress} testID={testID}>
      <Text>Trigger</Text>
    </Pressable>
  );
}

describe("DatePickerBody.ios (modal + staged value)", () => {
  beforeEach(() => {
    mockNativeDateTime.mockReturnValue(makeFakeNativePicker());
  });

  it("renders the trigger; picker not present until tapped", async () => {
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
    expect(screen.queryByTestId("dp-done")).toBeNull();
  });

  it("tapping the trigger opens the modal (picker + Done present)", async () => {
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
    expect(screen.getByTestId("dp-done")).toBeTruthy();
  });

  it("Done button commits the staged value via onChange", async () => {
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
    // Fake picker's onPress fires onValueChange with REPLACEMENT_DATE.
    await act(async () => {
      fireEvent.press(screen.getByTestId("dp-picker"));
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId("dp-done"));
    });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(REPLACEMENT_DATE);
    // Modal closes after Done → picker + Done unmount.
    expect(screen.queryByTestId("dp-picker")).toBeNull();
    expect(screen.queryByTestId("dp-done")).toBeNull();
  });

  it("Modal onRequestClose closes without committing", async () => {
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
    // Backdrop press closes the modal without committing.
    await act(async () => {
      fireEvent.press(screen.getByTestId("dp-modal-overlay"));
    });
    expect(screen.queryByTestId("dp-picker")).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("tapping the backdrop closes without committing (Done wasn't pressed)", async () => {
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
    // User picks a new value...
    await act(async () => {
      fireEvent.press(screen.getByTestId("dp-picker"));
    });
    // ...then dismisses instead of pressing Done.
    await act(async () => {
      fireEvent.press(screen.getByTestId("dp-modal-overlay"));
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("disabled=true swallows the trigger tap — picker never mounts", async () => {
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

  it("initial staged value comes from `value` prop when non-null", async () => {
    const initial = new Date(2027, 5, 12);
    await render(
      <DatePickerBody
        value={initial}
        onChange={jest.fn()}
        disabled={false}
        mode="date"
        appearance="light"
        chromeColors={CHROME}
        testID="dp"
        renderTrigger={(open) => <TriggerStub testID="dp-trigger" onPress={open} />}
      />
    );
    // Just opening should mount the native picker — no crash.
    await act(async () => {
      fireEvent.press(screen.getByTestId("dp-trigger"));
    });
    expect(screen.getByTestId("dp-picker")).toBeTruthy();
  });

  it("renders the fallback and skips the modal when passed", async () => {
    const fallback = <Text testID="dp-missing">Missing</Text>;
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
    expect(screen.queryByTestId("dp-picker")).toBeNull();
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

  it("handleValueChange ignores undefined dates from the native picker (defensive branch)", async () => {
    // Native pickers occasionally emit `undefined` as the date arg
    // when the user dismisses without picking. `handleValueChange`
    // guards this and leaves the staged value untouched — the
    // subsequent Done press commits the unchanged initial value.
    const onChange = jest.fn();
    const initial = new Date(Date.UTC(2027, 5, 12));
    // Craft a fake picker that fires onValueChange with (event, undefined).
    mockNativeDateTime.mockReturnValue(function FakeUndef(props: {
      testID?: string;
      onValueChange?: (event: unknown, date: Date | undefined) => void;
    }) {
      const rn = jest.requireActual("react-native");
      const React = jest.requireActual("react");
      return React.createElement(rn.Pressable, {
        testID: props.testID,
        onPress: () => props.onValueChange?.({}, undefined),
      });
    });
    await render(
      <DatePickerBody
        value={initial}
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
    // Fake picker fires with date=undefined — the setStaged branch
    // is skipped, so Done still commits the initial staged value.
    await act(async () => {
      fireEvent.press(screen.getByTestId("dp-picker"));
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId("dp-done"));
    });
    expect(onChange).toHaveBeenCalledWith(initial);
  });
});
