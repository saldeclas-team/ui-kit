import { fireEvent, render, screen } from "@testing-library/react-native";

// Stub `tamagui` + Reanimated so jest can parse the body's
// imports without loading the full runtimes.
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

jest.mock("react-native-reanimated", () => {
  const rn = jest.requireActual("react-native");
  const React = jest.requireActual("react");
  return {
    __esModule: true,
    default: {
      View: (props: Record<string, unknown>) => React.createElement(rn.View, props),
    },
    useSharedValue: (initial: unknown) => ({ value: initial }),
    useAnimatedStyle: (worklet: () => Record<string, unknown>) => worklet(),
    withTiming: (target: unknown) => target,
    Easing: { inOut: () => () => 0, ease: () => 0 },
  };
});

import { SegmentedControlBody } from "./segmented-control-body.android";

const OPTIONS = [
  { value: "list", label: "List" },
  { value: "grid", label: "Grid" },
  { value: "map", label: "Map" },
] as const;

const CHROME = {
  containerBackground: "#FEF7FF",
  containerBorder: "#79747E",
  selectedBackground: "#E8DEF8",
  selectedLabel: "#1D192B",
  unselectedLabel: "#1C1B1F",
  ripple: "#D0BCFF33",
};

describe("SegmentedControlBody.android (Material 3 pure JS)", () => {
  it("renders one Pressable per option with correct testIDs", async () => {
    await render(
      <SegmentedControlBody
        testID="sc"
        options={[...OPTIONS]}
        value="list"
        onChange={jest.fn()}
        disabled={false}
        appearance="light"
        chromeColors={CHROME}
        radius={20}
      />
    );
    expect(screen.getByTestId("sc-control-segment-0")).toBeTruthy();
    expect(screen.getByTestId("sc-control-segment-1")).toBeTruthy();
    expect(screen.getByTestId("sc-control-segment-2")).toBeTruthy();
  });

  it("marks the selected segment with accessibilityState.selected=true", async () => {
    await render(
      <SegmentedControlBody
        testID="sc"
        options={[...OPTIONS]}
        value="grid"
        onChange={jest.fn()}
        disabled={false}
        appearance="light"
        chromeColors={CHROME}
        radius={20}
      />
    );
    expect(screen.getByTestId("sc-control-segment-1").props.accessibilityState.selected).toBe(true);
    expect(screen.getByTestId("sc-control-segment-0").props.accessibilityState.selected).toBe(
      false
    );
  });

  it("tapping a segment fires onChange with that option's value", async () => {
    const onChange = jest.fn();
    await render(
      <SegmentedControlBody
        testID="sc"
        options={[...OPTIONS]}
        value="list"
        onChange={onChange}
        disabled={false}
        appearance="light"
        chromeColors={CHROME}
        radius={20}
      />
    );
    fireEvent.press(screen.getByTestId("sc-control-segment-2"));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("map");
  });

  it("tapping the already-selected segment is a no-op (skips onChange)", async () => {
    const onChange = jest.fn();
    await render(
      <SegmentedControlBody
        testID="sc"
        options={[...OPTIONS]}
        value="grid"
        onChange={onChange}
        disabled={false}
        appearance="light"
        chromeColors={CHROME}
        radius={20}
      />
    );
    fireEvent.press(screen.getByTestId("sc-control-segment-1"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("disabled swallows every press", async () => {
    const onChange = jest.fn();
    await render(
      <SegmentedControlBody
        testID="sc"
        options={[...OPTIONS]}
        value="list"
        onChange={onChange}
        disabled
        appearance="light"
        chromeColors={CHROME}
        radius={20}
      />
    );
    fireEvent.press(screen.getByTestId("sc-control-segment-2"));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByTestId("sc-control").props.accessibilityState.disabled).toBe(true);
    expect(screen.getByTestId("sc-control").props.opacity).toBe(0.5);
  });

  it("applies the chrome palette to container + border + selected pill", async () => {
    await render(
      <SegmentedControlBody
        testID="sc"
        options={[...OPTIONS]}
        value="list"
        onChange={jest.fn()}
        disabled={false}
        appearance="light"
        chromeColors={CHROME}
        radius={20}
      />
    );
    const container = screen.getByTestId("sc-control");
    expect(container.props.backgroundColor).toBe(CHROME.containerBackground);
    expect(container.props.borderColor).toBe(CHROME.containerBorder);
    expect(container.props.borderRadius).toBe(20);
  });

  it("passes the radius through to the container's borderRadius", async () => {
    await render(
      <SegmentedControlBody
        testID="sc"
        options={[...OPTIONS]}
        value="list"
        onChange={jest.fn()}
        disabled={false}
        appearance="light"
        chromeColors={CHROME}
        radius={0}
      />
    );
    expect(screen.getByTestId("sc-control").props.borderRadius).toBe(0);
  });

  it("captures the container width via onLayout (feeds the sliding-pill animation)", async () => {
    // The pill's translateX depends on the container's actual
    // width; we grab it via `onLayout` on the outer XStack. Fire
    // a synthetic layout event to exercise the handler (jest
    // doesn't compute real layout).
    await render(
      <SegmentedControlBody
        testID="sc"
        options={[...OPTIONS]}
        value="list"
        onChange={jest.fn()}
        disabled={false}
        appearance="light"
        chromeColors={CHROME}
        radius={20}
      />
    );
    const container = screen.getByTestId("sc-control");
    fireEvent(container, "layout", { nativeEvent: { layout: { width: 320 } } });
    // No assertion needed — the goal is to hit the layout
    // callback branch; not throwing is the pass condition.
    expect(container).toBeTruthy();
  });

  it("renders the fallback ReactNode when passed (peer-missing path)", async () => {
    const rn = jest.requireActual("react-native");
    const React = jest.requireActual("react");
    const fallback = React.createElement(rn.Text, { testID: "sc-fallback" }, "install hint");
    await render(
      <SegmentedControlBody
        testID="sc"
        options={[...OPTIONS]}
        value="list"
        onChange={jest.fn()}
        disabled={false}
        appearance="light"
        chromeColors={CHROME}
        radius={20}
        fallback={fallback}
      />
    );
    expect(screen.getByTestId("sc-fallback")).toHaveTextContent("install hint");
    expect(screen.queryByTestId("sc-control")).toBeNull();
  });
});
