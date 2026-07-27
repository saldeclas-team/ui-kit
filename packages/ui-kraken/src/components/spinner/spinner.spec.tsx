import { render, screen } from "@testing-library/react-native";
import { createRef } from "react";
import type { ActivityIndicator } from "react-native";

import type { SpinnerColors } from "../../tokens/tokens-types";

const LIGHT_SPINNER_COLORS: SpinnerColors = { color: "#6B7280" };
const DARK_SPINNER_COLORS: SpinnerColors = { color: "#9CA3AF" };

type MockUIKit = {
  activeTheme: "light" | "dark";
  tokens: { spinnerColors: SpinnerColors };
};
const mockUseUIKit = jest.fn<MockUIKit, []>(() => ({
  activeTheme: "light",
  tokens: { spinnerColors: LIGHT_SPINNER_COLORS },
}));
jest.mock("../../provider/use-ui-kit", () => ({
  useUIKit: () => mockUseUIKit(),
}));

import { resolveSpinnerSize, Spinner } from "./spinner";

describe("Spinner component", () => {
  beforeEach(() => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: { spinnerColors: LIGHT_SPINNER_COLORS },
    });
  });

  describe("root testID + defaults", () => {
    it('defaults testID to "spinner"', async () => {
      await render(<Spinner />);
      expect(screen.getByTestId("spinner")).toBeTruthy();
    });

    it("custom testID overrides the default", async () => {
      await render(<Spinner testID="s1" />);
      expect(screen.getByTestId("s1")).toBeTruthy();
    });

    it('default size="md" resolves to 32', async () => {
      await render(<Spinner testID="s" />);
      expect(screen.getByTestId("s").props.size).toBe(32);
    });

    it("default color comes from provider's spinnerColors.color", async () => {
      await render(<Spinner testID="s" />);
      expect(screen.getByTestId("s").props.color).toBe("#6B7280");
    });

    it("animating defaults to true", async () => {
      await render(<Spinner testID="s" />);
      expect(screen.getByTestId("s").props.animating).toBe(true);
    });

    it('accessibilityRole defaults to "progressbar"', async () => {
      await render(<Spinner testID="s" />);
      expect(screen.getByTestId("s").props.accessibilityRole).toBe("progressbar");
    });

    it('accessibilityLabel defaults to "Loading"', async () => {
      await render(<Spinner testID="s" />);
      expect(screen.getByTestId("s").props.accessibilityLabel).toBe("Loading");
    });

    it("accessibilityState.busy reflects animating", async () => {
      await render(<Spinner testID="s" animating={false} />);
      expect(screen.getByTestId("s").props.accessibilityState).toEqual({ busy: false });
    });
  });

  describe("size resolution", () => {
    it.each([
      ["sm", 20],
      ["md", 32],
      ["lg", 48],
    ] as const)("preset '%s' resolves to %d", async (size, expected) => {
      await render(<Spinner testID={size} size={size} />);
      expect(screen.getByTestId(size).props.size).toBe(expected);
    });

    it("raw numeric size passes through", async () => {
      await render(<Spinner testID="s" size={64} />);
      expect(screen.getByTestId("s").props.size).toBe(64);
    });

    it("RN 'small' string passes through untouched", async () => {
      await render(<Spinner testID="s" size="small" />);
      expect(screen.getByTestId("s").props.size).toBe("small");
    });

    it("RN 'large' string passes through untouched", async () => {
      await render(<Spinner testID="s" size="large" />);
      expect(screen.getByTestId("s").props.size).toBe("large");
    });
  });

  describe("palette resolution", () => {
    it("per-instance spinnerColors override wins", async () => {
      await render(<Spinner testID="s" spinnerColors={{ color: "#FF6B00" }} />);
      expect(screen.getByTestId("s").props.color).toBe("#FF6B00");
    });

    it("provider-level spinnerColors override propagates through useUIKit", async () => {
      mockUseUIKit.mockReturnValue({
        activeTheme: "light",
        tokens: { spinnerColors: { color: "#FFEEDD" } },
      });
      await render(<Spinner testID="branded" />);
      expect(screen.getByTestId("branded").props.color).toBe("#FFEEDD");
    });

    it("dark palette wins when provider swaps activeTheme", async () => {
      mockUseUIKit.mockReturnValue({
        activeTheme: "dark",
        tokens: { spinnerColors: DARK_SPINNER_COLORS },
      });
      await render(<Spinner testID="dark" />);
      expect(screen.getByTestId("dark").props.color).toBe("#9CA3AF");
    });
  });

  describe("prop overrides + ref forwarding", () => {
    it("consumer accessibilityRole override wins over the default", async () => {
      await render(<Spinner testID="s" accessibilityRole="none" />);
      expect(screen.getByTestId("s").props.accessibilityRole).toBe("none");
    });

    it("consumer accessibilityLabel override wins over the default", async () => {
      await render(<Spinner testID="s" accessibilityLabel="Saving..." />);
      expect(screen.getByTestId("s").props.accessibilityLabel).toBe("Saving...");
    });

    it("consumer animating=false wins over the default true", async () => {
      await render(<Spinner testID="s" animating={false} />);
      expect(screen.getByTestId("s").props.animating).toBe(false);
    });

    it("passes hidesWhenStopped through the spread", async () => {
      await render(<Spinner testID="s" hidesWhenStopped={false} />);
      expect(screen.getByTestId("s").props.hidesWhenStopped).toBe(false);
    });

    it("forwards ref to the ActivityIndicator element", async () => {
      const ref = createRef<ActivityIndicator>();
      await render(<Spinner ref={ref} testID="s" />);
      expect(ref.current).not.toBeNull();
    });
  });

  describe("snapshots", () => {
    it("default (md)", async () => {
      await render(<Spinner />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("small", async () => {
      await render(<Spinner size="sm" />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("dark theme × large", async () => {
      mockUseUIKit.mockReturnValue({
        activeTheme: "dark",
        tokens: { spinnerColors: DARK_SPINNER_COLORS },
      });
      await render(<Spinner size="lg" />);
      expect(screen.toJSON()).toMatchSnapshot();
    });
  });
});

describe("resolveSpinnerSize — pure helper", () => {
  it.each([
    ["sm", 20],
    ["md", 32],
    ["lg", 48],
  ] as const)("preset '%s' → %d", (input, expected) => {
    expect(resolveSpinnerSize(input)).toBe(expected);
  });

  it.each(["small", "large"] as const)("RN string '%s' passes through", (input) => {
    expect(resolveSpinnerSize(input)).toBe(input);
  });

  it("raw number passes through", () => {
    expect(resolveSpinnerSize(64)).toBe(64);
    expect(resolveSpinnerSize(1)).toBe(1);
  });
});
