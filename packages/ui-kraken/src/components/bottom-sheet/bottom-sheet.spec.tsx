import { act, render, screen } from "@testing-library/react-native";
import { createRef } from "react";

import type { BottomSheetColors } from "../../tokens/tokens-types";
import type { BottomSheetRef } from "./bottom-sheet";

// Stub `tamagui` so jest can parse the shell's imports.
jest.mock("tamagui", () => {
  const rn = jest.requireActual("react-native");
  const React = jest.requireActual("react");
  return {
    Text: (props: Record<string, unknown>) => React.createElement(rn.Text, props),
    styled: () => () => null,
  };
});

// Mock the styled file with an rn.Text stub so we can inspect
// the `color` prop on the missing-peer hint.
jest.mock("./bottom-sheet-styled", () => {
  const rn = jest.requireActual("react-native");
  const forwardRef = jest.requireActual("react").forwardRef;
  const text = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.Text ref={ref} {...props} />
  ));
  return {
    StyledBottomSheetMissingPeer: text,
  };
});

// Fake native BottomSheet — surfaces its own props as data-*
// attributes on a plain View so tests can assert prop forwarding.
// Exposes a ref shaped like `@expo/ui`'s so `useImperativeHandle`
// can forward through our shell.
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

const mockPeerAvailable = jest.fn(() => true);
const mockNativeBottomSheet = jest.fn();
const mockNativeBottomSheetView = jest.fn();

jest.mock("./expo-ui-bottom-sheet-probe", () => ({
  isBottomSheetAvailable: () => mockPeerAvailable(),
  getExpoUIBottomSheet: () => mockNativeBottomSheet(),
  getExpoUIBottomSheetView: () => mockNativeBottomSheetView(),
}));

function makeFakeNativeBottomSheet() {
  const rn = jest.requireActual("react-native");
  const React = jest.requireActual("react");
  return React.forwardRef(function FakeSheet(
    props: {
      testID?: string;
      snapPoints?: readonly (string | number)[];
      index?: number;
      onChange?: (index: number) => void;
      onDismiss?: () => void;
      enablePanDownToClose?: boolean;
      enableDynamicSizing?: boolean;
      backgroundStyle?: { backgroundColor?: string };
      children?: React.ReactNode;
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
        "data-dynamic": props.enableDynamicSizing,
        "data-bg": props.backgroundStyle?.backgroundColor,
        onLayout: () => {
          // Simulate a snap change so onChange coverage fires
          props.onChange?.(0);
        },
      },
      props.children
    );
  });
}

function makeFakeNativeBottomSheetView() {
  const rn = jest.requireActual("react-native");
  const React = jest.requireActual("react");
  return function FakeSheetView(props: {
    testID?: string;
    children?: React.ReactNode;
    style?: unknown;
  }) {
    return React.createElement(
      rn.View,
      { testID: props.testID, style: props.style },
      props.children
    );
  };
}

const LIGHT_COLORS: BottomSheetColors = {
  background: "#FFFFFF",
  backdrop: "rgba(0,0,0,0.5)",
  handle: "#9CA3AF",
  divider: "#E5E7EB",
  missingPeer: "#DC2626",
};

const DARK_COLORS: BottomSheetColors = {
  background: "#1C1C1E",
  backdrop: "rgba(0,0,0,0.7)",
  handle: "#6B7280",
  divider: "#374151",
  missingPeer: "#F87171",
};

type MockUIKit = {
  activeTheme: "light" | "dark";
  tokens: { bottomSheetColors: BottomSheetColors };
};

const mockUseUIKit = jest.fn<MockUIKit, []>(() => ({
  activeTheme: "light",
  tokens: { bottomSheetColors: LIGHT_COLORS },
}));

jest.mock("../../provider/use-ui-kit", () => ({
  useUIKit: () => mockUseUIKit(),
}));

jest.mock("../../provider/provider-context", () => {
  const React = jest.requireActual("react");
  return {
    UIKitContext: React.createContext(null),
  };
});

import { BottomSheet } from "./bottom-sheet";

describe("BottomSheet", () => {
  beforeEach(() => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: { bottomSheetColors: LIGHT_COLORS },
    });
    mockPeerAvailable.mockReturnValue(true);
    mockNativeBottomSheet.mockReturnValue(makeFakeNativeBottomSheet());
    mockNativeBottomSheetView.mockReturnValue(makeFakeNativeBottomSheetView());
    Object.values(fakeNativeRef).forEach((fn) => (fn as jest.Mock).mockClear());
  });

  it("renders the native sheet + view with default testID='bottom-sheet' when none passed", async () => {
    await render(
      <BottomSheet>
        <></>
      </BottomSheet>
    );
    expect(screen.getByTestId("bottom-sheet-sheet")).toBeTruthy();
    expect(screen.getByTestId("bottom-sheet-view")).toBeTruthy();
  });

  it("root testID overrides propagate to sheet + view sub-elements", async () => {
    await render(
      <BottomSheet testID="dr">
        <></>
      </BottomSheet>
    );
    expect(screen.getByTestId("dr-sheet")).toBeTruthy();
    expect(screen.getByTestId("dr-view")).toBeTruthy();
  });

  it("renders children inside the native sheet view", async () => {
    const rn = jest.requireActual("react-native");
    const React = jest.requireActual("react");
    await render(
      <BottomSheet testID="dr">
        {React.createElement(rn.Text, { testID: "dr-child" }, "hello")}
      </BottomSheet>
    );
    expect(screen.getByTestId("dr-child")).toHaveTextContent("hello");
  });

  it("default snapPoints = ['50%'] when consumer omits", async () => {
    await render(
      <BottomSheet testID="dr">
        <></>
      </BottomSheet>
    );
    expect(screen.getByTestId("dr-sheet").props["data-snap-points"]).toBe(JSON.stringify(["50%"]));
  });

  it("custom snapPoints forward to the native sheet", async () => {
    await render(
      <BottomSheet testID="dr" snapPoints={["25%", "50%", "90%"]}>
        <></>
      </BottomSheet>
    );
    expect(screen.getByTestId("dr-sheet").props["data-snap-points"]).toBe(
      JSON.stringify(["25%", "50%", "90%"])
    );
  });

  it("index defaults to -1 (closed)", async () => {
    await render(
      <BottomSheet testID="dr">
        <></>
      </BottomSheet>
    );
    expect(screen.getByTestId("dr-sheet").props["data-index"]).toBe(-1);
  });

  it("enablePanDownToClose defaults to true", async () => {
    await render(
      <BottomSheet testID="dr">
        <></>
      </BottomSheet>
    );
    expect(screen.getByTestId("dr-sheet").props["data-pan-close"]).toBe(true);
  });

  it("enablePanDownToClose={false} disables swipe / backdrop-tap dismissal", async () => {
    await render(
      <BottomSheet testID="dr" enablePanDownToClose={false}>
        <></>
      </BottomSheet>
    );
    expect(screen.getByTestId("dr-sheet").props["data-pan-close"]).toBe(false);
  });

  it("enableDynamicSizing forwards when set", async () => {
    await render(
      <BottomSheet testID="dr" enableDynamicSizing>
        <></>
      </BottomSheet>
    );
    expect(screen.getByTestId("dr-sheet").props["data-dynamic"]).toBe(true);
  });

  it("background style uses palette.background", async () => {
    await render(
      <BottomSheet testID="dr">
        <></>
      </BottomSheet>
    );
    expect(screen.getByTestId("dr-sheet").props["data-bg"]).toBe(LIGHT_COLORS.background);
  });

  it("per-instance bottomSheetColors override wins over provider palette", async () => {
    await render(
      <BottomSheet testID="dr" bottomSheetColors={{ background: "#FF00FF" }}>
        <></>
      </BottomSheet>
    );
    expect(screen.getByTestId("dr-sheet").props["data-bg"]).toBe("#FF00FF");
  });

  it("uses the dark palette when activeTheme='dark'", async () => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "dark",
      tokens: { bottomSheetColors: DARK_COLORS },
    });
    await render(
      <BottomSheet testID="dr">
        <></>
      </BottomSheet>
    );
    expect(screen.getByTestId("dr-sheet").props["data-bg"]).toBe(DARK_COLORS.background);
  });

  it("onChange fires with the new snap index from the native sheet", async () => {
    const onChange = jest.fn();
    await render(
      <BottomSheet testID="dr" onChange={onChange}>
        <></>
      </BottomSheet>
    );
    // Fake native sheet fires onChange(0) on layout.
    await act(async () => {
      const el = screen.getByTestId("dr-sheet");
      el.props.onLayout?.();
    });
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it("ref.present() forwards to native present()", async () => {
    const ref = createRef<BottomSheetRef>();
    await render(
      <BottomSheet ref={ref} testID="dr">
        <></>
      </BottomSheet>
    );
    ref.current?.present();
    expect(fakeNativeRef.present).toHaveBeenCalledTimes(1);
  });

  it("ref.present(index) passes the index through", async () => {
    const ref = createRef<BottomSheetRef>();
    await render(
      <BottomSheet ref={ref} testID="dr">
        <></>
      </BottomSheet>
    );
    ref.current?.present(2);
    expect(fakeNativeRef.present).toHaveBeenCalledWith(2);
  });

  it("ref.dismiss() forwards to native dismiss()", async () => {
    const ref = createRef<BottomSheetRef>();
    await render(
      <BottomSheet ref={ref} testID="dr">
        <></>
      </BottomSheet>
    );
    ref.current?.dismiss();
    expect(fakeNativeRef.dismiss).toHaveBeenCalledTimes(1);
  });

  it("ref.snapToIndex(n) forwards to native snapToIndex(n)", async () => {
    const ref = createRef<BottomSheetRef>();
    await render(
      <BottomSheet ref={ref} testID="dr">
        <></>
      </BottomSheet>
    );
    ref.current?.snapToIndex(1);
    expect(fakeNativeRef.snapToIndex).toHaveBeenCalledWith(1);
  });

  it("ref.expand() forwards to native expand()", async () => {
    const ref = createRef<BottomSheetRef>();
    await render(
      <BottomSheet ref={ref} testID="dr">
        <></>
      </BottomSheet>
    );
    ref.current?.expand();
    expect(fakeNativeRef.expand).toHaveBeenCalledTimes(1);
  });

  it("ref.collapse() forwards to native collapse()", async () => {
    const ref = createRef<BottomSheetRef>();
    await render(
      <BottomSheet ref={ref} testID="dr">
        <></>
      </BottomSheet>
    );
    ref.current?.collapse();
    expect(fakeNativeRef.collapse).toHaveBeenCalledTimes(1);
  });

  it("renders the missing-peer hint when @expo/ui isn't available", async () => {
    mockPeerAvailable.mockReturnValue(false);
    mockNativeBottomSheet.mockReturnValue(null);
    mockNativeBottomSheetView.mockReturnValue(null);
    await render(
      <BottomSheet testID="dr">
        <></>
      </BottomSheet>
    );
    const hint = screen.getByTestId("dr-missing-peer");
    expect(hint).toHaveTextContent(/install .+@expo\/ui/i);
    expect(hint.props.color).toBe(LIGHT_COLORS.missingPeer);
    expect(screen.queryByTestId("dr-sheet")).toBeNull();
  });

  it("renders missing-peer hint when isBottomSheetAvailable=true but component getters return null (defensive)", async () => {
    // Edge case: probe says available but getters return null —
    // shouldn't happen in practice but the shell should not crash.
    mockPeerAvailable.mockReturnValue(true);
    mockNativeBottomSheet.mockReturnValue(null);
    mockNativeBottomSheetView.mockReturnValue(null);
    await render(
      <BottomSheet testID="dr">
        <></>
      </BottomSheet>
    );
    expect(screen.getByTestId("dr-missing-peer")).toBeTruthy();
    expect(screen.queryByTestId("dr-sheet")).toBeNull();
  });

  it("radius prop is accepted (currently unused on native — web-only follow-up)", async () => {
    // Prop exists in the API for forward-compat + symmetry with
    // DatePicker; native ignores it (SwiftUI + Material 3 own the
    // sheet shape). Just verify passing it doesn't crash.
    await render(
      <BottomSheet testID="dr" radius="pill">
        <></>
      </BottomSheet>
    );
    expect(screen.getByTestId("dr-sheet")).toBeTruthy();
  });

  describe("snapshots", () => {
    it("default light + peer available", async () => {
      const rn = jest.requireActual("react-native");
      const React = jest.requireActual("react");
      await render(<BottomSheet>{React.createElement(rn.Text, null, "Sheet body")}</BottomSheet>);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("missing peer dep fallback", async () => {
      mockPeerAvailable.mockReturnValue(false);
      mockNativeBottomSheet.mockReturnValue(null);
      mockNativeBottomSheetView.mockReturnValue(null);
      await render(
        <BottomSheet>
          <></>
        </BottomSheet>
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("dark palette + peer available", async () => {
      mockUseUIKit.mockReturnValue({
        activeTheme: "dark",
        tokens: { bottomSheetColors: DARK_COLORS },
      });
      const rn = jest.requireActual("react-native");
      const React = jest.requireActual("react");
      await render(<BottomSheet>{React.createElement(rn.Text, null, "Dark body")}</BottomSheet>);
      expect(screen.toJSON()).toMatchSnapshot();
    });
  });
});
