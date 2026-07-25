import { render, screen } from "@testing-library/react-native";

import type { RefreshControlColors } from "../../tokens/tokens-types";

// Mock RN's `RefreshControl` with a minimal View-like element so RTL
// can query the props we pass in. Under jest-expo the real
// `RefreshControl` renders as `<RCTRefreshControl />` with no
// queryable testID / props. Wholesale mocking `react-native` blows
// up because it pulls in TurboModuleRegistry / DevMenu at import time
// — so we use a minimal module-level mock that only replaces
// `RefreshControl` and re-exports the rest of RN untouched.
jest.mock("react-native/Libraries/Components/RefreshControl/RefreshControl", () => {
  const React = jest.requireActual("react");
  const RefreshControlMock = React.forwardRef(function RefreshControlMock(
    props: Record<string, unknown>,
    ref: unknown
  ) {
    return React.createElement("RCTRefreshControl", { ...props, ref });
  });
  return { __esModule: true, default: RefreshControlMock };
});

const LIGHT_REFRESH_CONTROL_COLORS: RefreshControlColors = {
  spinner: "#2563EB",
  background: "#F9FAFB",
  title: "#5B6472",
};

const DARK_REFRESH_CONTROL_COLORS: RefreshControlColors = {
  spinner: "#60A5FA",
  background: "#111827",
  title: "#9CA3AF",
};

type MockUIKit = {
  activeTheme: "light" | "dark";
  tokens: { refreshControlColors: RefreshControlColors };
};
const mockUseUIKit = jest.fn<MockUIKit, []>(() => ({
  activeTheme: "light",
  tokens: { refreshControlColors: LIGHT_REFRESH_CONTROL_COLORS },
}));
jest.mock("../../provider/use-ui-kit", () => ({
  useUIKit: () => mockUseUIKit(),
}));

import { RefreshControl } from "./refresh-control";

describe("RefreshControl", () => {
  beforeEach(() => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: { refreshControlColors: LIGHT_REFRESH_CONTROL_COLORS },
    });
  });

  it("renders under the default testID", async () => {
    await render(<RefreshControl refreshing={false} onRefresh={jest.fn()} />);
    expect(screen.getByTestId("refresh-control")).toBeTruthy();
  });

  it("uses a custom testID when provided", async () => {
    await render(<RefreshControl testID="rc" refreshing={false} onRefresh={jest.fn()} />);
    expect(screen.getByTestId("rc")).toBeTruthy();
  });

  it("forwards the refreshing prop", async () => {
    await render(<RefreshControl testID="rc" refreshing={true} onRefresh={jest.fn()} />);
    expect(screen.getByTestId("rc").props.refreshing).toBe(true);
  });

  it("forwards the onRefresh prop", async () => {
    const onRefresh = jest.fn();
    await render(<RefreshControl testID="rc" refreshing={false} onRefresh={onRefresh} />);
    expect(screen.getByTestId("rc").props.onRefresh).toBe(onRefresh);
  });

  it("wires iOS tintColor to the spinner slot", async () => {
    await render(<RefreshControl testID="rc" refreshing={false} onRefresh={jest.fn()} />);
    expect(screen.getByTestId("rc").props.tintColor).toBe("#2563EB");
  });

  it("wires Android colors[] to a monochrome [spinner] array", async () => {
    await render(<RefreshControl testID="rc" refreshing={false} onRefresh={jest.fn()} />);
    expect(screen.getByTestId("rc").props.colors).toEqual(["#2563EB"]);
  });

  it("wires Android progressBackgroundColor to the background slot", async () => {
    await render(<RefreshControl testID="rc" refreshing={false} onRefresh={jest.fn()} />);
    expect(screen.getByTestId("rc").props.progressBackgroundColor).toBe("#F9FAFB");
  });

  it("wires iOS titleColor to the title slot", async () => {
    await render(<RefreshControl testID="rc" refreshing={false} onRefresh={jest.fn()} />);
    expect(screen.getByTestId("rc").props.titleColor).toBe("#5B6472");
  });

  it("forwards the title prop (iOS)", async () => {
    await render(
      <RefreshControl testID="rc" refreshing={true} onRefresh={jest.fn()} title="Pulling…" />
    );
    expect(screen.getByTestId("rc").props.title).toBe("Pulling…");
  });

  it("per-instance spinner override wins over the provider palette", async () => {
    await render(
      <RefreshControl
        testID="rc"
        refreshing={false}
        onRefresh={jest.fn()}
        refreshControlColors={{ spinner: "#7C3AED" }}
      />
    );
    const rc = screen.getByTestId("rc");
    expect(rc.props.tintColor).toBe("#7C3AED");
    expect(rc.props.colors).toEqual(["#7C3AED"]);
  });

  it("per-instance background override wins", async () => {
    await render(
      <RefreshControl
        testID="rc"
        refreshing={false}
        onRefresh={jest.fn()}
        refreshControlColors={{ background: "#4C1D95" }}
      />
    );
    expect(screen.getByTestId("rc").props.progressBackgroundColor).toBe("#4C1D95");
  });

  it("per-instance title override wins", async () => {
    await render(
      <RefreshControl
        testID="rc"
        refreshing={false}
        onRefresh={jest.fn()}
        refreshControlColors={{ title: "#3B0A00" }}
      />
    );
    expect(screen.getByTestId("rc").props.titleColor).toBe("#3B0A00");
  });

  it("provider-level override propagates through useUIKit", async () => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: {
        refreshControlColors: { ...LIGHT_REFRESH_CONTROL_COLORS, spinner: "#059669" },
      },
    });
    await render(<RefreshControl testID="rc" refreshing={false} onRefresh={jest.fn()} />);
    const rc = screen.getByTestId("rc");
    expect(rc.props.tintColor).toBe("#059669");
    expect(rc.props.colors).toEqual(["#059669"]);
  });

  it("uses dark palette when the provider swaps activeTheme", async () => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "dark",
      tokens: { refreshControlColors: DARK_REFRESH_CONTROL_COLORS },
    });
    await render(<RefreshControl testID="rc" refreshing={false} onRefresh={jest.fn()} />);
    const rc = screen.getByTestId("rc");
    expect(rc.props.tintColor).toBe("#60A5FA");
    expect(rc.props.progressBackgroundColor).toBe("#111827");
    expect(rc.props.titleColor).toBe("#9CA3AF");
  });

  it("passes through arbitrary RN RefreshControlProps (progressViewOffset, size)", async () => {
    await render(
      <RefreshControl
        testID="rc"
        refreshing={false}
        onRefresh={jest.fn()}
        progressViewOffset={40}
        size="default"
      />
    );
    const rc = screen.getByTestId("rc");
    expect(rc.props.progressViewOffset).toBe(40);
    expect(rc.props.size).toBe("default");
  });

  // Structural snapshots
  describe("snapshots", () => {
    it("default palette", async () => {
      await render(<RefreshControl refreshing={false} onRefresh={jest.fn()} />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("dark palette", async () => {
      mockUseUIKit.mockReturnValue({
        activeTheme: "dark",
        tokens: { refreshControlColors: DARK_REFRESH_CONTROL_COLORS },
      });
      await render(<RefreshControl refreshing={true} onRefresh={jest.fn()} />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("per-instance override", async () => {
      await render(
        <RefreshControl
          refreshing={false}
          onRefresh={jest.fn()}
          refreshControlColors={{ spinner: "#7C3AED", background: "#F5F3FF", title: "#4C1D95" }}
        />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("with iOS title", async () => {
      await render(
        <RefreshControl refreshing={true} onRefresh={jest.fn()} title="Pulling to refresh…" />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });
  });
});
