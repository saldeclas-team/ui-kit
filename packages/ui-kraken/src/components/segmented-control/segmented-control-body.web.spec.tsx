/**
 * Direct test of the web body. jest-expo resolves iOS by default,
 * so we require the `.web.tsx` file explicitly by full name.
 *
 * The body forwards props to `@expo/ui/community/segmented-control`,
 * which in tests is mocked by us — we assert prop forwarding and
 * the `onChange` unwrap that maps the native event shape back to a
 * simple `(value) => void` call.
 */
import * as React from "react";
import TestRenderer, { act } from "react-test-renderer";

import type * as WebBodyModule from "./segmented-control-body.web";
import type { SegmentedControlOption } from "./segmented-control-types";

const mockNative = jest.fn();

jest.mock("./expo-ui-segmented-probe", () => ({
  isSegmentedControlAvailable: () => true,
  getExpoUISegmentedControl: () => mockNative(),
}));

const { SegmentedControlBody } =
  require("./segmented-control-body.web.tsx") as typeof WebBodyModule;

const OPTIONS: SegmentedControlOption<"a" | "b" | "c">[] = [
  { value: "a", label: "A" },
  { value: "b", label: "B" },
  { value: "c", label: "C" },
];

const CHROME = {
  containerBackground: "#FFF",
  containerBorder: "#DDD",
  selectedBackground: "#EEE",
  selectedLabel: "#000",
  unselectedLabel: "#666",
  ripple: "#0000001A",
};

/**
 * Fake `@expo/ui` segmented control that captures its props on
 * `mockNative` so we can assert forwarding, plus fires a press
 * that invokes the body's `onChange` handler.
 */
function makeFakeControl() {
  const rn = jest.requireActual("react-native");
  return function FakeControl(props: {
    testID?: string;
    values: string[];
    selectedIndex: number;
    enabled: boolean;
    onChange: (event: { nativeEvent: { selectedSegmentIndex: number; value: string } }) => void;
  }) {
    return React.createElement(rn.Pressable, {
      testID: props.testID,
      onPress: () =>
        props.onChange({
          nativeEvent: { selectedSegmentIndex: 1, value: props.values[1] ?? "" },
        }),
    });
  };
}

function tryRender(element: React.ReactElement): TestRenderer.ReactTestRenderer | null {
  let root: TestRenderer.ReactTestRenderer | null = null;
  try {
    act(() => {
      root = TestRenderer.create(element);
    });
  } catch {
    /* swallow — unknown host components can throw during reconciliation */
  }
  return root;
}

describe("SegmentedControlBody.web", () => {
  beforeEach(() => {
    mockNative.mockReset();
    mockNative.mockReturnValue(makeFakeControl());
  });

  it("renders the native control with forwarded props", () => {
    const root = tryRender(
      <SegmentedControlBody
        testID="sc"
        options={OPTIONS}
        value="a"
        onChange={jest.fn()}
        disabled={false}
        appearance="light"
        chromeColors={CHROME}
        radius={12}
      />
    );
    expect(root).not.toBeNull();
    const control = root!.root.findByProps({ testID: "sc-control" });
    expect(control.props.values).toEqual(["A", "B", "C"]);
    expect(control.props.selectedIndex).toBe(0);
    expect(control.props.enabled).toBe(true);
    expect(control.props.appearance).toBe("light");
  });

  it("computes selectedIndex from value; unknown value falls back to 0", () => {
    const root = tryRender(
      <SegmentedControlBody
        testID="sc"
        options={OPTIONS}
        // Deliberately unknown value — cast around the union so
        // we can exercise the "value not in options" branch. Body
        // should fall back to selectedIndex=0.
        value={"nonexistent" as never}
        onChange={jest.fn()}
        disabled={false}
        appearance="light"
        chromeColors={CHROME}
        radius={12}
      />
    );
    const control = root!.root.findByProps({ testID: "sc-control" });
    expect(control.props.selectedIndex).toBe(0);
  });

  it("computes selectedIndex correctly for the last option", () => {
    const root = tryRender(
      <SegmentedControlBody
        testID="sc"
        options={OPTIONS}
        value="c"
        onChange={jest.fn()}
        disabled={false}
        appearance="light"
        chromeColors={CHROME}
        radius={12}
      />
    );
    const control = root!.root.findByProps({ testID: "sc-control" });
    expect(control.props.selectedIndex).toBe(2);
  });

  it("passes enabled=false when disabled=true", () => {
    const root = tryRender(
      <SegmentedControlBody
        testID="sc"
        options={OPTIONS}
        value="a"
        onChange={jest.fn()}
        disabled
        appearance="light"
        chromeColors={CHROME}
        radius={12}
      />
    );
    const control = root!.root.findByProps({ testID: "sc-control" });
    expect(control.props.enabled).toBe(false);
  });

  it("onChange unwraps the native event and fires with the picked value", () => {
    const onChange = jest.fn();
    const root = tryRender(
      <SegmentedControlBody
        testID="sc"
        options={OPTIONS}
        value="a"
        onChange={onChange}
        disabled={false}
        appearance="light"
        chromeColors={CHROME}
        radius={12}
      />
    );
    // findAllByProps matches both the FakeControl function component
    // AND the RN Pressable it returns — pick the one with an onPress
    // handler (the Pressable).
    const pressable = root!.root
      .findAllByProps({ testID: "sc-control" })
      .find((n) => typeof n.props.onPress === "function");
    expect(pressable).toBeDefined();
    act(() => {
      pressable!.props.onPress();
    });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("onChange no-ops when the picked index is out of range (defensive)", () => {
    const rn = jest.requireActual("react-native");
    // Custom fake that fires with an out-of-range index.
    mockNative.mockReturnValue(function OOB(props: {
      testID?: string;
      onChange: (event: { nativeEvent: { selectedSegmentIndex: number; value: string } }) => void;
    }) {
      return React.createElement(rn.Pressable, {
        testID: props.testID,
        onPress: () => props.onChange({ nativeEvent: { selectedSegmentIndex: 99, value: "x" } }),
      });
    });
    const onChange = jest.fn();
    const root = tryRender(
      <SegmentedControlBody
        testID="sc"
        options={OPTIONS}
        value="a"
        onChange={onChange}
        disabled={false}
        appearance="light"
        chromeColors={CHROME}
        radius={12}
      />
    );
    // findAllByProps matches both the FakeControl function component
    // AND the RN Pressable it returns — pick the one with an onPress
    // handler (the Pressable).
    const pressable = root!.root
      .findAllByProps({ testID: "sc-control" })
      .find((n) => typeof n.props.onPress === "function");
    expect(pressable).toBeDefined();
    act(() => {
      pressable!.props.onPress();
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders the fallback and skips the native control when fallback is set", () => {
    const root = tryRender(
      <SegmentedControlBody
        testID="sc"
        options={OPTIONS}
        value="a"
        onChange={jest.fn()}
        disabled={false}
        appearance="light"
        chromeColors={CHROME}
        radius={12}
        fallback={<React.Fragment />}
      />
    );
    expect(() => root!.root.findByProps({ testID: "sc-control" })).toThrow();
  });

  it("returns null when the peer isn't installed (no fallback)", () => {
    mockNative.mockReturnValue(null);
    const root = tryRender(
      <SegmentedControlBody
        testID="sc"
        options={OPTIONS}
        value="a"
        onChange={jest.fn()}
        disabled={false}
        appearance="light"
        chromeColors={CHROME}
        radius={12}
      />
    );
    expect(() => root!.root.findByProps({ testID: "sc-control" })).toThrow();
  });
});
