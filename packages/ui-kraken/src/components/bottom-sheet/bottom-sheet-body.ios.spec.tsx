import { render, screen } from "@testing-library/react-native";
import { createRef } from "react";

import type { BottomSheetBodyRef } from "./bottom-sheet-body-types";

/**
 * Direct test of the iOS body — jest-expo resolves `.ios.tsx` by
 * default so we import the `.ios` variant explicitly to guarantee
 * coverage of THIS file. Mirrors the DatePicker + Segmented body
 * spec pattern.
 */

const fakeNativeRef = {
  present: jest.fn(),
  dismiss: jest.fn(),
  snapToIndex: jest.fn(),
  snapToPosition: jest.fn(),
  expand: jest.fn(),
  collapse: jest.fn(),
  close: jest.fn(),
  forceClose: jest.fn(),
};

const mockNativeBottomSheet = jest.fn();
const mockNativeBottomSheetView = jest.fn();

jest.mock("./expo-ui-bottom-sheet-probe", () => ({
  isBottomSheetAvailable: () => true,
  getExpoUIBottomSheet: () => mockNativeBottomSheet(),
  getExpoUIBottomSheetView: () => mockNativeBottomSheetView(),
}));

function makeFakeNativeBottomSheet() {
  const rn = jest.requireActual("react-native");
  const React = jest.requireActual("react");
  return React.forwardRef(function FakeSheet(
    props: {
      children?: React.ReactNode;
      testID?: string;
      snapPoints?: readonly (string | number)[];
      index?: number;
      onChange?: (index: number) => void;
      onDismiss?: () => void;
      enablePanDownToClose?: boolean;
      backgroundStyle?: { backgroundColor?: string };
    },
    ref: React.Ref<unknown>
  ) {
    React.useImperativeHandle(ref, () => fakeNativeRef, []);
    return React.createElement(
      rn.View,
      {
        testID: props.testID,
        "data-snap-points": JSON.stringify(props.snapPoints),
        "data-index": props.index,
        "data-pan-close": props.enablePanDownToClose,
        "data-bg": props.backgroundStyle?.backgroundColor,
      },
      props.children
    );
  });
}

function makeFakeNativeBottomSheetView() {
  const rn = jest.requireActual("react-native");
  const React = jest.requireActual("react");
  return function FakeSheetView(props: {
    children?: React.ReactNode;
    testID?: string;
    style?: unknown;
  }) {
    return React.createElement(
      rn.View,
      { testID: props.testID, style: props.style },
      props.children
    );
  };
}

jest.mock("../../provider/use-ui-kit", () => ({
  useUIKit: () => ({ activeTheme: "light", tokens: {} }),
}));

jest.mock("../../provider/provider-context", () => {
  const React = jest.requireActual("react");
  return { UIKitContext: React.createContext(null) };
});

import { BottomSheetBody } from "./bottom-sheet-body.ios";

const DEFAULT_PROPS = {
  snapPoints: ["50%", "90%"] as const,
  enablePanDownToClose: true,
  chromeColors: { background: "#FFFFFF" },
  testID: "bs",
};

describe("BottomSheetBody.ios", () => {
  beforeEach(() => {
    mockNativeBottomSheet.mockReturnValue(makeFakeNativeBottomSheet());
    mockNativeBottomSheetView.mockReturnValue(makeFakeNativeBottomSheetView());
    Object.values(fakeNativeRef).forEach((fn) => (fn as jest.Mock).mockClear());
  });

  it("renders the native sheet + view with correct testIDs", async () => {
    await render(
      <BottomSheetBody {...DEFAULT_PROPS}>
        <></>
      </BottomSheetBody>
    );
    expect(screen.getByTestId("bs-sheet")).toBeTruthy();
    expect(screen.getByTestId("bs-view")).toBeTruthy();
  });

  it("renders children inside the native view", async () => {
    const rn = jest.requireActual("react-native");
    const React = jest.requireActual("react");
    await render(
      <BottomSheetBody {...DEFAULT_PROPS}>
        {React.createElement(rn.Text, { testID: "bs-child" }, "hi")}
      </BottomSheetBody>
    );
    expect(screen.getByTestId("bs-child")).toHaveTextContent("hi");
  });

  it("forwards snapPoints + index=-1 + enablePanDownToClose + background", async () => {
    await render(
      <BottomSheetBody {...DEFAULT_PROPS}>
        <></>
      </BottomSheetBody>
    );
    const el = screen.getByTestId("bs-sheet");
    expect(el.props["data-snap-points"]).toBe(JSON.stringify(["50%", "90%"]));
    expect(el.props["data-index"]).toBe(-1);
    expect(el.props["data-pan-close"]).toBe(true);
    expect(el.props["data-bg"]).toBe("#FFFFFF");
  });

  it("ref.present() forwards to native ref.present()", async () => {
    const ref = createRef<BottomSheetBodyRef>();
    await render(
      <BottomSheetBody ref={ref} {...DEFAULT_PROPS}>
        <></>
      </BottomSheetBody>
    );
    ref.current?.present();
    expect(fakeNativeRef.present).toHaveBeenCalledTimes(1);
  });

  it("ref.dismiss / snapToIndex / expand / collapse all forward", async () => {
    const ref = createRef<BottomSheetBodyRef>();
    await render(
      <BottomSheetBody ref={ref} {...DEFAULT_PROPS}>
        <></>
      </BottomSheetBody>
    );
    ref.current?.dismiss();
    ref.current?.snapToIndex(1);
    ref.current?.expand();
    ref.current?.collapse();
    expect(fakeNativeRef.dismiss).toHaveBeenCalledTimes(1);
    expect(fakeNativeRef.snapToIndex).toHaveBeenCalledWith(1);
    expect(fakeNativeRef.expand).toHaveBeenCalledTimes(1);
    expect(fakeNativeRef.collapse).toHaveBeenCalledTimes(1);
  });

  it("renders the fallback and skips the sheet when passed", async () => {
    const rn = jest.requireActual("react-native");
    const React = jest.requireActual("react");
    const fallback = React.createElement(rn.Text, { testID: "bs-missing" }, "Install @expo/ui");
    await render(
      <BottomSheetBody {...DEFAULT_PROPS} fallback={fallback}>
        <></>
      </BottomSheetBody>
    );
    expect(screen.getByTestId("bs-missing")).toBeTruthy();
    expect(screen.queryByTestId("bs-sheet")).toBeNull();
  });

  it("returns null when peer is unavailable (defensive)", async () => {
    mockNativeBottomSheet.mockReturnValue(null);
    mockNativeBottomSheetView.mockReturnValue(null);
    await render(
      <BottomSheetBody {...DEFAULT_PROPS}>
        <></>
      </BottomSheetBody>
    );
    expect(screen.queryByTestId("bs-sheet")).toBeNull();
  });
});
