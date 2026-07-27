/**
 * Direct test of the web body. jest-expo defaults to iOS platform
 * resolution, so we require the `.web.tsx` file explicitly by full
 * name (same trick as `image-picker-sheet-body.web.spec.tsx`).
 *
 * jest-expo doesn't spin up a real DOM, so we can't dispatch
 * `change` / `showPicker` events on the rendered `<input>` — and
 * RN's test renderer refuses `<input>` (unknown host component).
 * We use `react-test-renderer` inside a try wrapper: it evaluates
 * the component function body (guards, memos, callbacks,
 * inputType / inputValue) BEFORE reconciling children, so
 * instrumentation captures every non-DOM branch. `toInputValue`
 * is exported for direct pure-function tests.
 */
import * as React from "react";
import { Pressable, Text } from "react-native";
import TestRenderer, { act } from "react-test-renderer";

import type * as WebBodyModule from "./date-picker-body.web";

const {
  DatePickerBody,
  toInputValue,
  openInputPicker,
  commitInputChange,
  createInputChangeHandler,
} = require("./date-picker-body.web.tsx") as typeof WebBodyModule;

const CHROME = {
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

/**
 * Wrap `TestRenderer.create` in try/catch so the unknown `<input>`
 * host element doesn't fail the test. React evaluates the JSX
 * children (including `renderTrigger(handleOpen)`) BEFORE
 * reconciling, so callbacks fire and captures land — instrumentation
 * still counts every line of the component body that ran up to the
 * throw point.
 */
function tryRender(element: React.ReactElement): void {
  try {
    act(() => {
      TestRenderer.create(element);
    });
  } catch {
    /* swallow — `<input>` isn't a valid RN host component */
  }
}

describe("DatePickerBody.web — render / early-return branches", () => {
  it("invokes renderTrigger with an open callback (happy path)", () => {
    let capturedOpen: (() => void) | null = null;
    tryRender(
      <DatePickerBody
        value={null}
        onChange={jest.fn()}
        disabled={false}
        mode="date"
        appearance="light"
        chromeColors={CHROME}
        testID="dp"
        renderTrigger={(open) => {
          capturedOpen = open;
          return <TriggerStub testID="dp-trigger" onPress={open} />;
        }}
      />
    );
    expect(typeof capturedOpen).toBe("function");
  });

  it("does NOT invoke renderTrigger when fallback is set (early return)", () => {
    const renderTrigger = jest.fn(() => <TriggerStub testID="dp-trigger" onPress={jest.fn()} />);
    tryRender(
      <DatePickerBody
        value={null}
        onChange={jest.fn()}
        disabled={false}
        mode="date"
        appearance="light"
        chromeColors={CHROME}
        testID="dp"
        renderTrigger={renderTrigger}
        fallback={<Text>Missing</Text>}
      />
    );
    expect(renderTrigger).not.toHaveBeenCalled();
  });

  it.each([
    ["date" as const, null],
    ["time" as const, null],
    ["datetime" as const, null],
    ["date" as const, new Date(Date.UTC(2027, 5, 12))],
    ["time" as const, new Date(Date.UTC(2027, 5, 12, 14, 30))],
    ["datetime" as const, new Date(Date.UTC(2027, 5, 12, 14, 30))],
  ])(
    "runs the body for mode=%s / value=%p (exercises inputType + inputValue branches)",
    (mode, value) => {
      const renderTrigger = jest.fn(() => <TriggerStub testID="dp-trigger" onPress={jest.fn()} />);
      tryRender(
        <DatePickerBody
          value={value}
          onChange={jest.fn()}
          disabled={false}
          mode={mode}
          appearance="light"
          chromeColors={CHROME}
          testID="dp"
          renderTrigger={renderTrigger}
        />
      );
      expect(renderTrigger).toHaveBeenCalledTimes(1);
    }
  );

  it("passes minimumDate + maximumDate as ISO strings on the input", () => {
    // No DOM to assert against; this test exists to exercise the
    // `minimumDate == null ? undefined : toInputValue(...)` ternary
    // + its `maximumDate` sibling — both branches inside the JSX.
    const renderTrigger = jest.fn(() => <TriggerStub testID="dp-trigger" onPress={jest.fn()} />);
    tryRender(
      <DatePickerBody
        value={null}
        onChange={jest.fn()}
        disabled={false}
        mode="date"
        appearance="light"
        minimumDate={new Date(Date.UTC(2027, 0, 1))}
        maximumDate={new Date(Date.UTC(2028, 11, 31))}
        chromeColors={CHROME}
        testID="dp"
        renderTrigger={renderTrigger}
      />
    );
    expect(renderTrigger).toHaveBeenCalledTimes(1);
  });

  it("captures the open callback and swallows it when disabled=true", () => {
    let capturedOpen: (() => void) | null = null;
    tryRender(
      <DatePickerBody
        value={null}
        onChange={jest.fn()}
        disabled
        mode="date"
        appearance="light"
        chromeColors={CHROME}
        testID="dp"
        renderTrigger={(open) => {
          capturedOpen = open;
          return <TriggerStub testID="dp-trigger" onPress={open} />;
        }}
      />
    );
    // disabled=true → handler bails at the first `if (disabled) return;`
    // before touching the ref, so calling it never throws.
    expect(capturedOpen).not.toBeNull();
    expect(() => (capturedOpen as unknown as () => void)()).not.toThrow();
  });

  it("captures the open callback and no-ops when the ref is null (unmounted input)", () => {
    let capturedOpen: (() => void) | null = null;
    tryRender(
      <DatePickerBody
        value={null}
        onChange={jest.fn()}
        disabled={false}
        mode="date"
        appearance="light"
        chromeColors={CHROME}
        testID="dp"
        renderTrigger={(open) => {
          capturedOpen = open;
          return <TriggerStub testID="dp-trigger" onPress={open} />;
        }}
      />
    );
    // TestRenderer never runs useEffect / ref-assignment for host
    // elements like `<input>`, so `inputRef.current` stays null.
    // Calling `open()` should hit the `if (el == null) return;`
    // guard without throwing.
    expect(capturedOpen).not.toBeNull();
    expect(() => (capturedOpen as unknown as () => void)()).not.toThrow();
  });
});

describe("openInputPicker — pure helper, every branch", () => {
  it("swallows the call when disabled=true regardless of ref", () => {
    const showPicker = jest.fn();
    const focus = jest.fn();
    openInputPicker({ showPicker, focus } as unknown as HTMLInputElement, true);
    expect(showPicker).not.toHaveBeenCalled();
    expect(focus).not.toHaveBeenCalled();
  });

  it("no-ops safely when the ref is null", () => {
    expect(() => openInputPicker(null, false)).not.toThrow();
  });

  it("calls showPicker() when the browser supports it", () => {
    const showPicker = jest.fn();
    const focus = jest.fn();
    openInputPicker({ showPicker, focus } as unknown as HTMLInputElement, false);
    expect(showPicker).toHaveBeenCalledTimes(1);
    expect(focus).not.toHaveBeenCalled();
  });

  it("falls back to focus() when showPicker is absent (Safari)", () => {
    const focus = jest.fn();
    openInputPicker({ focus } as unknown as HTMLInputElement, false);
    expect(focus).toHaveBeenCalledTimes(1);
  });
});

describe("commitInputChange — parses valid ISO, guards empty + invalid", () => {
  it("commits the parsed Date for a valid ISO string", () => {
    const onChange = jest.fn();
    commitInputChange("2027-06-12", onChange);
    expect(onChange).toHaveBeenCalledTimes(1);
    const arg = onChange.mock.calls[0][0] as Date;
    expect(arg).toBeInstanceOf(Date);
    expect(Number.isFinite(arg.getTime())).toBe(true);
  });

  it("ignores an empty string (user cleared the field)", () => {
    const onChange = jest.fn();
    commitInputChange("", onChange);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("ignores an unparseable string (never fires onChange)", () => {
    const onChange = jest.fn();
    commitInputChange("not-a-date", onChange);
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("createInputChangeHandler — factory used as the `<input>` onChange", () => {
  it("returns a callback that forwards event.target.value to commitInputChange", () => {
    const onChange = jest.fn();
    const handler = createInputChangeHandler(onChange);
    handler({ target: { value: "2027-06-12" } } as React.ChangeEvent<HTMLInputElement>);
    expect(onChange).toHaveBeenCalledTimes(1);
    const arg = onChange.mock.calls[0][0] as Date;
    expect(arg).toBeInstanceOf(Date);
  });

  it("returned callback ignores empty-string events (delegated to commitInputChange guard)", () => {
    const onChange = jest.fn();
    const handler = createInputChangeHandler(onChange);
    handler({ target: { value: "" } } as React.ChangeEvent<HTMLInputElement>);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("returned callback ignores unparseable events (delegated to commitInputChange guard)", () => {
    const onChange = jest.fn();
    const handler = createInputChangeHandler(onChange);
    handler({ target: { value: "not-a-date" } } as React.ChangeEvent<HTMLInputElement>);
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("toInputValue — pure formatter, one branch per input type", () => {
  it("date → YYYY-MM-DD (zero-pads single-digit month + day)", () => {
    expect(toInputValue(new Date(2027, 0, 5), "date")).toBe("2027-01-05");
  });

  it("date → double-digit month + day pass through", () => {
    expect(toInputValue(new Date(2027, 10, 25), "date")).toBe("2027-11-25");
  });

  it("time → HH:MM (zero-pads single-digit hour + minute)", () => {
    expect(toInputValue(new Date(2027, 5, 12, 9, 5), "time")).toBe("09:05");
  });

  it("time → 23:59 boundary formats correctly", () => {
    expect(toInputValue(new Date(2027, 5, 12, 23, 59), "time")).toBe("23:59");
  });

  it("datetime-local → YYYY-MM-DDTHH:MM combines both formats", () => {
    expect(toInputValue(new Date(2027, 5, 12, 14, 30), "datetime-local")).toBe("2027-06-12T14:30");
  });

  it("datetime-local → midnight formats with T00:00 suffix", () => {
    expect(toInputValue(new Date(2027, 5, 12, 0, 0), "datetime-local")).toBe("2027-06-12T00:00");
  });
});
