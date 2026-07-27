import { render, screen } from "@testing-library/react-native";
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

// Toggle-controlled probe mock.
const mockPeerAvailable = jest.fn(() => true);
jest.mock("./expo-ui-bottom-sheet-probe", () => ({
  isBottomSheetAvailable: () => mockPeerAvailable(),
}));

/**
 * Fake body that forwards every prop as a data-* attribute + a
 * ref shaped like `BottomSheetRef`. Lets us assert the shell
 * correctly resolves palette + defaults + forwards ref methods
 * without needing to load `@expo/ui` or a real platform body.
 */
const mockBodyRef = {
  present: jest.fn(),
  dismiss: jest.fn(),
  snapToIndex: jest.fn(),
  expand: jest.fn(),
  collapse: jest.fn(),
};
jest.mock("./bottom-sheet-body", () => {
  const rn = jest.requireActual("react-native");
  const React = jest.requireActual("react");
  return {
    BottomSheetBody: React.forwardRef(function FakeBody(
      props: {
        children?: React.ReactNode;
        testID?: string;
        snapPoints?: readonly (string | number)[];
        enablePanDownToClose?: boolean;
        enableDynamicSizing?: boolean;
        chromeColors?: { background: string };
        fallback?: React.ReactNode;
      },
      ref: React.Ref<unknown>
    ) {
      React.useImperativeHandle(ref, () => mockBodyRef, []);
      // When the shell passes a fallback, render it — matches
      // real body behavior.
      if (props.fallback != null) {
        return React.createElement(rn.View, { testID: props.testID }, props.fallback);
      }
      return React.createElement(
        rn.View,
        {
          testID: `${props.testID}-body`,
          "data-snap-points": JSON.stringify(props.snapPoints),
          "data-pan-close": props.enablePanDownToClose,
          "data-dynamic": props.enableDynamicSizing,
          "data-bg": props.chromeColors?.background,
        },
        props.children
      );
    }),
  };
});

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

import { BottomSheet } from "./bottom-sheet";

describe("BottomSheet (shell)", () => {
  beforeEach(() => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: { bottomSheetColors: LIGHT_COLORS },
    });
    mockPeerAvailable.mockReturnValue(true);
    Object.values(mockBodyRef).forEach((fn) => (fn as jest.Mock).mockClear());
  });

  it("renders the body with default testID='bottom-sheet' when none passed", async () => {
    await render(
      <BottomSheet>
        <></>
      </BottomSheet>
    );
    expect(screen.getByTestId("bottom-sheet-body")).toBeTruthy();
  });

  it("root testID overrides propagate to the body", async () => {
    await render(
      <BottomSheet testID="dr">
        <></>
      </BottomSheet>
    );
    expect(screen.getByTestId("dr-body")).toBeTruthy();
  });

  it("renders children through the body", async () => {
    const rn = jest.requireActual("react-native");
    const React = jest.requireActual("react");
    await render(
      <BottomSheet testID="dr">
        {React.createElement(rn.Text, { testID: "dr-child" }, "hello")}
      </BottomSheet>
    );
    expect(screen.getByTestId("dr-child")).toHaveTextContent("hello");
  });

  it("default snapPoints = ['50%', '90%'] when consumer omits (Android partial-state fix)", async () => {
    await render(
      <BottomSheet testID="dr">
        <></>
      </BottomSheet>
    );
    expect(screen.getByTestId("dr-body").props["data-snap-points"]).toBe(
      JSON.stringify(["50%", "90%"])
    );
  });

  it("custom snapPoints forward to the body unchanged", async () => {
    await render(
      <BottomSheet testID="dr" snapPoints={["25%", "50%", "90%"]}>
        <></>
      </BottomSheet>
    );
    expect(screen.getByTestId("dr-body").props["data-snap-points"]).toBe(
      JSON.stringify(["25%", "50%", "90%"])
    );
  });

  it("enablePanDownToClose defaults to true", async () => {
    await render(
      <BottomSheet testID="dr">
        <></>
      </BottomSheet>
    );
    expect(screen.getByTestId("dr-body").props["data-pan-close"]).toBe(true);
  });

  it("enablePanDownToClose={false} forwards to body", async () => {
    await render(
      <BottomSheet testID="dr" enablePanDownToClose={false}>
        <></>
      </BottomSheet>
    );
    expect(screen.getByTestId("dr-body").props["data-pan-close"]).toBe(false);
  });

  it("enableDynamicSizing forwards when set", async () => {
    await render(
      <BottomSheet testID="dr" enableDynamicSizing>
        <></>
      </BottomSheet>
    );
    expect(screen.getByTestId("dr-body").props["data-dynamic"]).toBe(true);
  });

  it("chromeColors.background uses palette.background from the provider", async () => {
    await render(
      <BottomSheet testID="dr">
        <></>
      </BottomSheet>
    );
    expect(screen.getByTestId("dr-body").props["data-bg"]).toBe(LIGHT_COLORS.background);
  });

  it("per-instance bottomSheetColors override wins over provider palette", async () => {
    await render(
      <BottomSheet testID="dr" bottomSheetColors={{ background: "#FF00FF" }}>
        <></>
      </BottomSheet>
    );
    expect(screen.getByTestId("dr-body").props["data-bg"]).toBe("#FF00FF");
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
    expect(screen.getByTestId("dr-body").props["data-bg"]).toBe(DARK_COLORS.background);
  });

  it("ref.present() forwards through the body's ref", async () => {
    const ref = createRef<BottomSheetRef>();
    await render(
      <BottomSheet ref={ref} testID="dr">
        <></>
      </BottomSheet>
    );
    ref.current?.present();
    expect(mockBodyRef.present).toHaveBeenCalledTimes(1);
  });

  it("ref.present(index) passes the index through", async () => {
    const ref = createRef<BottomSheetRef>();
    await render(
      <BottomSheet ref={ref} testID="dr">
        <></>
      </BottomSheet>
    );
    ref.current?.present(2);
    expect(mockBodyRef.present).toHaveBeenCalledWith(2);
  });

  it("ref.dismiss() / snapToIndex() / expand() / collapse() all forward", async () => {
    const ref = createRef<BottomSheetRef>();
    await render(
      <BottomSheet ref={ref} testID="dr">
        <></>
      </BottomSheet>
    );
    ref.current?.dismiss();
    ref.current?.snapToIndex(1);
    ref.current?.expand();
    ref.current?.collapse();
    expect(mockBodyRef.dismiss).toHaveBeenCalledTimes(1);
    expect(mockBodyRef.snapToIndex).toHaveBeenCalledWith(1);
    expect(mockBodyRef.expand).toHaveBeenCalledTimes(1);
    expect(mockBodyRef.collapse).toHaveBeenCalledTimes(1);
  });

  it("renders the missing-peer hint when @expo/ui isn't available", async () => {
    mockPeerAvailable.mockReturnValue(false);
    await render(
      <BottomSheet testID="dr">
        <></>
      </BottomSheet>
    );
    const hint = screen.getByTestId("dr-missing-peer");
    expect(hint).toHaveTextContent(/install .+@expo\/ui/i);
    expect(hint.props.color).toBe(LIGHT_COLORS.missingPeer);
    // Body still renders (with the fallback inside) but the
    // sheet-only testID is absent since the mock body swaps to
    // the fallback branch.
    expect(screen.queryByTestId("dr-body")).toBeNull();
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
    expect(screen.getByTestId("dr-body")).toBeTruthy();
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
