import { render, screen } from "@testing-library/react-native";
import { createRef } from "react";

import type * as BottomSheetBodyModule from "./bottom-sheet-body";
import type { BottomSheetBodyRef } from "./bottom-sheet-body-types";

/**
 * Direct test of the web body — jest-expo resolves `.ios.tsx` by
 * default so we import the `.web` variant explicitly to exercise
 * this file. Same shape as `.ios.spec` / `.android.spec`. Even
 * though the three bodies are structurally identical today (all
 * three thin-wrap the same `@expo/ui` component), we keep the
 * split + coverage per the `native-bridges-platform-split` rule
 * so a future web-only tweak (vaul CSS overrides, backdrop /
 * handle palette wiring) has a home + a regression test.
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
      backgroundStyle?: { backgroundColor?: string };
    },
    ref: React.Ref<unknown>
  ) {
    React.useImperativeHandle(ref, () => fakeNativeRef, []);
    return React.createElement(
      rn.View,
      { testID: props.testID, "data-bg": props.backgroundStyle?.backgroundColor },
      props.children
    );
  });
}

function makeFakeNativeBottomSheetView() {
  const rn = jest.requireActual("react-native");
  const React = jest.requireActual("react");
  return function FakeSheetView(props: { children?: React.ReactNode; testID?: string }) {
    return React.createElement(rn.View, { testID: props.testID }, props.children);
  };
}

jest.mock("../../provider/use-ui-kit", () => ({
  useUIKit: () => ({ activeTheme: "light", tokens: {} }),
}));

jest.mock("../../provider/provider-context", () => {
  const React = jest.requireActual("react");
  return { UIKitContext: React.createContext(null) };
});

// Import the web body directly by full filename — jest-expo would
// otherwise resolve to `.ios.tsx`.
const { BottomSheetBody } = require("./bottom-sheet-body.web.tsx") as typeof BottomSheetBodyModule;

const DEFAULT_PROPS = {
  snapPoints: ["50%", "90%"] as const,
  enablePanDownToClose: true,
  chromeColors: { background: "#FFFFFF" },
  testID: "bs",
};

describe("BottomSheetBody.web", () => {
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

  it("forwards palette.background", async () => {
    await render(
      <BottomSheetBody {...DEFAULT_PROPS} chromeColors={{ background: "#ABCDEF" }}>
        <></>
      </BottomSheetBody>
    );
    expect(screen.getByTestId("bs-sheet").props["data-bg"]).toBe("#ABCDEF");
  });

  it("all ref methods forward to the native ref", async () => {
    const ref = createRef<BottomSheetBodyRef>();
    await render(
      <BottomSheetBody ref={ref} {...DEFAULT_PROPS}>
        <></>
      </BottomSheetBody>
    );
    ref.current?.present();
    ref.current?.dismiss();
    ref.current?.snapToIndex(1);
    ref.current?.expand();
    ref.current?.collapse();
    expect(fakeNativeRef.present).toHaveBeenCalledTimes(1);
    expect(fakeNativeRef.dismiss).toHaveBeenCalledTimes(1);
    expect(fakeNativeRef.snapToIndex).toHaveBeenCalledWith(1);
    expect(fakeNativeRef.expand).toHaveBeenCalledTimes(1);
    expect(fakeNativeRef.collapse).toHaveBeenCalledTimes(1);
  });

  it("renders the fallback when passed", async () => {
    const rn = jest.requireActual("react-native");
    const React = jest.requireActual("react");
    const fallback = React.createElement(rn.Text, { testID: "bs-missing" }, "hint");
    await render(
      <BottomSheetBody {...DEFAULT_PROPS} fallback={fallback}>
        <></>
      </BottomSheetBody>
    );
    expect(screen.getByTestId("bs-missing")).toBeTruthy();
    expect(screen.queryByTestId("bs-sheet")).toBeNull();
  });

  it("returns null when peer is unavailable and no fallback", async () => {
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
