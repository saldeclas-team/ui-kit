import { render, screen } from "@testing-library/react-native";
import { StatusBar } from "react-native";

import type { ScreenContainerColors } from "../../tokens/tokens-types";

// Stub `tamagui` so jest can parse the shell's imports.
jest.mock("tamagui", () => {
  const rn = jest.requireActual("react-native");
  const React = jest.requireActual("react");
  return {
    View: (props: Record<string, unknown>) => React.createElement(rn.View, props),
    styled: () => () => null,
  };
});

// Mock the styled file with rn.View stubs.
jest.mock("./screen-container-styled", () => {
  const rn = jest.requireActual("react-native");
  const forwardRef = jest.requireActual("react").forwardRef;
  const box = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.View ref={ref} {...props} />
  ));
  return {
    StyledScreenContainer: box,
    StyledScreenContainerInner: box,
  };
});

// Toggle-controlled probe mock — lets us test both "peer
// installed" (returns custom insets) and "peer missing" (returns
// null hook so shell falls back to hardcoded defaults).
const mockUseInsets = jest.fn(() => ({ top: 50, bottom: 34, left: 0, right: 0 }));
const mockGetHook = jest.fn<
  (() => { top: number; bottom: number; left: number; right: number }) | null,
  []
>(() => mockUseInsets);
jest.mock("./safe-area-probe", () => ({
  isSafeAreaContextAvailable: () => mockGetHook() != null,
  getUseSafeAreaInsets: () => mockGetHook(),
}));

// Note: we don't mock KeyboardAvoidingView. RN's real component
// consumes `behavior` + `keyboardVerticalOffset` internally and
// doesn't forward them to the host element, so RTL's props
// proxy can't read them. We assert presence (via testID) +
// trust TypeScript to enforce the prop shape at compile time.
// Tests that need to verify the actual behavior would need to
// spin up a device — out of scope for a shell test.

const LIGHT_COLORS: ScreenContainerColors = {
  background: "#FFFFFF",
  statusBarBackground: "#FFFFFF",
  fallbackPadding: "hardcoded-defaults",
};

const DARK_COLORS: ScreenContainerColors = {
  background: "#0B0B0F",
  statusBarBackground: "#0B0B0F",
  fallbackPadding: "hardcoded-defaults",
};

type MockUIKit = {
  activeTheme: "light" | "dark";
  tokens: { screenContainerColors: ScreenContainerColors };
};

const mockUseUIKit = jest.fn<MockUIKit, []>(() => ({
  activeTheme: "light",
  tokens: { screenContainerColors: LIGHT_COLORS },
}));

jest.mock("../../provider/use-ui-kit", () => ({
  useUIKit: () => mockUseUIKit(),
}));

import { ScreenContainer, __resetInsetsHookCache } from "./screen-container";

const CHILD = <></>;

describe("ScreenContainer", () => {
  let setBarStyleSpy: jest.SpyInstance;
  let setBackgroundColorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: { screenContainerColors: LIGHT_COLORS },
    });
    mockUseInsets.mockReturnValue({ top: 50, bottom: 34, left: 0, right: 0 });
    mockGetHook.mockReturnValue(mockUseInsets);
    __resetInsetsHookCache();
    setBarStyleSpy = jest.spyOn(StatusBar, "setBarStyle").mockImplementation(() => undefined);
    setBackgroundColorSpy = jest
      .spyOn(StatusBar, "setBackgroundColor")
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    setBarStyleSpy.mockRestore();
    setBackgroundColorSpy.mockRestore();
  });

  it("renders with default testID='screen-container'", async () => {
    await render(<ScreenContainer>{CHILD}</ScreenContainer>);
    expect(screen.getByTestId("screen-container")).toBeTruthy();
  });

  it("custom testID propagates", async () => {
    await render(<ScreenContainer testID="sc">{CHILD}</ScreenContainer>);
    expect(screen.getByTestId("sc")).toBeTruthy();
  });

  it("renders children", async () => {
    const rn = jest.requireActual("react-native");
    const React = jest.requireActual("react");
    await render(
      <ScreenContainer testID="sc">
        {React.createElement(rn.Text, { testID: "sc-child" }, "hi")}
      </ScreenContainer>
    );
    expect(screen.getByTestId("sc-child")).toHaveTextContent("hi");
  });

  it("applies safe-area insets from the peer as padding on default (all 4) edges", async () => {
    mockUseInsets.mockReturnValue({ top: 47, bottom: 34, left: 10, right: 12 });
    await render(<ScreenContainer testID="sc">{CHILD}</ScreenContainer>);
    const root = screen.getByTestId("sc");
    expect(root.props.paddingTop).toBe(47);
    expect(root.props.paddingBottom).toBe(34);
    expect(root.props.paddingLeft).toBe(10);
    expect(root.props.paddingRight).toBe(12);
  });

  it("edges prop restricts which sides get inset", async () => {
    mockUseInsets.mockReturnValue({ top: 47, bottom: 34, left: 10, right: 12 });
    await render(
      <ScreenContainer testID="sc" edges={["top", "left", "right"]}>
        {CHILD}
      </ScreenContainer>
    );
    const root = screen.getByTestId("sc");
    expect(root.props.paddingTop).toBe(47);
    expect(root.props.paddingBottom).toBe(0);
    expect(root.props.paddingLeft).toBe(10);
    expect(root.props.paddingRight).toBe(12);
  });

  it("empty edges array zeroes all padding", async () => {
    await render(
      <ScreenContainer testID="sc" edges={[]}>
        {CHILD}
      </ScreenContainer>
    );
    const root = screen.getByTestId("sc");
    expect(root.props.paddingTop).toBe(0);
    expect(root.props.paddingBottom).toBe(0);
    expect(root.props.paddingLeft).toBe(0);
    expect(root.props.paddingRight).toBe(0);
  });

  it("background uses palette from the provider (light)", async () => {
    await render(<ScreenContainer testID="sc">{CHILD}</ScreenContainer>);
    expect(screen.getByTestId("sc").props.backgroundColor).toBe(LIGHT_COLORS.background);
  });

  it("per-instance screenContainerColors override wins", async () => {
    await render(
      <ScreenContainer testID="sc" screenContainerColors={{ background: "#F5F3FF" }}>
        {CHILD}
      </ScreenContainer>
    );
    expect(screen.getByTestId("sc").props.backgroundColor).toBe("#F5F3FF");
  });

  it("uses the dark palette when activeTheme='dark'", async () => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "dark",
      tokens: { screenContainerColors: DARK_COLORS },
    });
    await render(<ScreenContainer testID="sc">{CHILD}</ScreenContainer>);
    expect(screen.getByTestId("sc").props.backgroundColor).toBe(DARK_COLORS.background);
  });

  it("no <KeyboardAvoidingView> wrap by default (keyboardBehavior='none')", async () => {
    await render(<ScreenContainer testID="sc">{CHILD}</ScreenContainer>);
    expect(screen.queryByTestId("sc-keyboard-avoiding")).toBeNull();
  });

  it("wraps in <KeyboardAvoidingView> when keyboardBehavior='padding' (element present)", async () => {
    await render(
      <ScreenContainer testID="sc" keyboardBehavior="padding">
        {CHILD}
      </ScreenContainer>
    );
    expect(screen.getByTestId("sc-keyboard-avoiding")).toBeTruthy();
  });

  it("wraps in <KeyboardAvoidingView> when keyboardBehavior='height' (element present)", async () => {
    await render(
      <ScreenContainer testID="sc" keyboardBehavior="height">
        {CHILD}
      </ScreenContainer>
    );
    expect(screen.getByTestId("sc-keyboard-avoiding")).toBeTruthy();
  });

  it("does NOT wrap when keyboardBehavior is default ('none')", async () => {
    await render(<ScreenContainer testID="sc">{CHILD}</ScreenContainer>);
    expect(screen.queryByTestId("sc-keyboard-avoiding")).toBeNull();
  });

  it("scrollable=false (default) renders a plain inner View — no ScrollView", async () => {
    await render(<ScreenContainer testID="sc">{CHILD}</ScreenContainer>);
    expect(screen.queryByTestId("sc-scroll-view")).toBeNull();
  });

  it("scrollable=true renders a <ScrollView> as inner element", async () => {
    await render(
      <ScreenContainer testID="sc" scrollable>
        {CHILD}
      </ScreenContainer>
    );
    expect(screen.getByTestId("sc-scroll-view")).toBeTruthy();
  });

  it("scrollable=true applies the palette background to the ScrollView", async () => {
    await render(
      <ScreenContainer testID="sc" scrollable>
        {CHILD}
      </ScreenContainer>
    );
    const scrollView = screen.getByTestId("sc-scroll-view");
    const styleProp = scrollView.props.style;
    const flat = Array.isArray(styleProp) ? Object.assign({}, ...styleProp) : styleProp;
    expect(flat.backgroundColor).toBe(LIGHT_COLORS.background);
  });

  it("scrollable=true renders children inside the ScrollView", async () => {
    const rn = jest.requireActual("react-native");
    const React = jest.requireActual("react");
    await render(
      <ScreenContainer testID="sc" scrollable>
        {React.createElement(rn.Text, { testID: "sc-child" }, "hi")}
      </ScreenContainer>
    );
    expect(screen.getByTestId("sc-child")).toBeTruthy();
  });

  it("scrollable + keyboardBehavior='padding' — KAV wraps the ScrollView", async () => {
    await render(
      <ScreenContainer testID="sc" scrollable keyboardBehavior="padding">
        {CHILD}
      </ScreenContainer>
    );
    expect(screen.getByTestId("sc-keyboard-avoiding")).toBeTruthy();
    expect(screen.getByTestId("sc-scroll-view")).toBeTruthy();
  });

  it("scrollProps.contentContainerStyle forwards to the ScrollView", async () => {
    const contentContainerStyle = { padding: 24 };
    await render(
      <ScreenContainer testID="sc" scrollable scrollProps={{ contentContainerStyle }}>
        {CHILD}
      </ScreenContainer>
    );
    expect(screen.getByTestId("sc-scroll-view").props.contentContainerStyle).toEqual(
      contentContainerStyle
    );
  });

  it("scrollProps.keyboardShouldPersistTaps forwards to the ScrollView", async () => {
    await render(
      <ScreenContainer
        testID="sc"
        scrollable
        scrollProps={{ keyboardShouldPersistTaps: "handled" }}
      >
        {CHILD}
      </ScreenContainer>
    );
    expect(screen.getByTestId("sc-scroll-view").props.keyboardShouldPersistTaps).toBe("handled");
  });

  it("statusBarStyle='auto' flips to dark-content on light theme", async () => {
    await render(<ScreenContainer testID="sc">{CHILD}</ScreenContainer>);
    expect(setBarStyleSpy).toHaveBeenCalledWith("dark-content", true);
  });

  it("statusBarStyle='auto' flips to light-content on dark theme", async () => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "dark",
      tokens: { screenContainerColors: DARK_COLORS },
    });
    await render(<ScreenContainer testID="sc">{CHILD}</ScreenContainer>);
    expect(setBarStyleSpy).toHaveBeenCalledWith("light-content", true);
  });

  it("statusBarStyle='light' forces light-content regardless of theme", async () => {
    await render(
      <ScreenContainer testID="sc" statusBarStyle="light">
        {CHILD}
      </ScreenContainer>
    );
    expect(setBarStyleSpy).toHaveBeenCalledWith("light-content", true);
  });

  it("statusBarStyle='dark' forces dark-content regardless of theme", async () => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "dark",
      tokens: { screenContainerColors: DARK_COLORS },
    });
    await render(
      <ScreenContainer testID="sc" statusBarStyle="dark">
        {CHILD}
      </ScreenContainer>
    );
    expect(setBarStyleSpy).toHaveBeenCalledWith("dark-content", true);
  });

  it("falls back to hardcoded insets when peer isn't installed", async () => {
    mockGetHook.mockReturnValue(null);
    await render(<ScreenContainer testID="sc">{CHILD}</ScreenContainer>);
    const root = screen.getByTestId("sc");
    // Jest-expo default OS is iOS → fallback: top=44, bottom=34
    expect(root.props.paddingTop).toBe(44);
    expect(root.props.paddingBottom).toBe(34);
    expect(root.props.paddingLeft).toBe(0);
    expect(root.props.paddingRight).toBe(0);
  });

  describe("snapshots", () => {
    it("default light + all edges", async () => {
      const rn = jest.requireActual("react-native");
      const React = jest.requireActual("react");
      await render(
        <ScreenContainer>{React.createElement(rn.Text, null, "hello")}</ScreenContainer>
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("keyboardBehavior='padding' wraps in KeyboardAvoidingView", async () => {
      const rn = jest.requireActual("react-native");
      const React = jest.requireActual("react");
      await render(
        <ScreenContainer keyboardBehavior="padding">
          {React.createElement(rn.Text, null, "form")}
        </ScreenContainer>
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("dark palette + top+left+right edges (no bottom for tab bar layout)", async () => {
      mockUseUIKit.mockReturnValue({
        activeTheme: "dark",
        tokens: { screenContainerColors: DARK_COLORS },
      });
      const rn = jest.requireActual("react-native");
      const React = jest.requireActual("react");
      await render(
        <ScreenContainer edges={["top", "left", "right"]}>
          {React.createElement(rn.Text, null, "dark body")}
        </ScreenContainer>
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });
  });
});
