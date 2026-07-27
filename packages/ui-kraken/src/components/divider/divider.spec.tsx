import { render, screen } from "@testing-library/react-native";
import { createRef } from "react";
import type { View } from "react-native";

import type { DividerColors } from "../../tokens/tokens-types";

// Mock the tamagui YStack the component uses so we can inspect
// backgroundColor + width/height + margin props without booting
// the Tamagui runtime.
jest.mock("tamagui", () => {
  const rn = jest.requireActual("react-native");
  const forwardRef = jest.requireActual("react").forwardRef;
  return {
    YStack: forwardRef((props: Record<string, unknown>, ref: unknown) => (
      <rn.View ref={ref} {...props} />
    )),
  };
});

const LIGHT_DIVIDER_COLORS: DividerColors = { line: "#E5E7EB" };
const DARK_DIVIDER_COLORS: DividerColors = { line: "#374151" };

type MockUIKit = {
  activeTheme: "light" | "dark";
  tokens: { dividerColors: DividerColors };
};
const mockUseUIKit = jest.fn<MockUIKit, []>(() => ({
  activeTheme: "light",
  tokens: { dividerColors: LIGHT_DIVIDER_COLORS },
}));
jest.mock("../../provider/use-ui-kit", () => ({
  useUIKit: () => mockUseUIKit(),
}));

import { Divider, orientationInsetProps, orientationSizeProps } from "./divider";

describe("Divider component", () => {
  beforeEach(() => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: { dividerColors: LIGHT_DIVIDER_COLORS },
    });
  });

  describe("root testID", () => {
    it('defaults testID to "divider"', async () => {
      await render(<Divider />);
      expect(screen.getByTestId("divider")).toBeTruthy();
    });

    it("custom testID overrides the default", async () => {
      await render(<Divider testID="d1" />);
      expect(screen.getByTestId("d1")).toBeTruthy();
    });
  });

  describe("orientation → size prop", () => {
    it('default orientation="horizontal" → height=1, no width', async () => {
      await render(<Divider testID="d" />);
      const root = screen.getByTestId("d");
      expect(root.props.height).toBe(1);
      expect(root.props.width).toBeUndefined();
    });

    it('orientation="vertical" → width=1, no height', async () => {
      await render(<Divider testID="d" orientation="vertical" />);
      const root = screen.getByTestId("d");
      expect(root.props.width).toBe(1);
      expect(root.props.height).toBeUndefined();
    });

    it("horizontal + thickness=4 → height=4", async () => {
      await render(<Divider testID="d" thickness={4} />);
      expect(screen.getByTestId("d").props.height).toBe(4);
    });

    it("vertical + thickness=2 → width=2", async () => {
      await render(<Divider testID="d" orientation="vertical" thickness={2} />);
      expect(screen.getByTestId("d").props.width).toBe(2);
    });
  });

  describe("inset → margin prop", () => {
    it("default inset=0 → no margin props", async () => {
      await render(<Divider testID="d" />);
      const root = screen.getByTestId("d");
      expect(root.props.marginHorizontal).toBeUndefined();
      expect(root.props.marginVertical).toBeUndefined();
    });

    it("horizontal + inset=16 → marginHorizontal=16", async () => {
      await render(<Divider testID="d" inset={16} />);
      expect(screen.getByTestId("d").props.marginHorizontal).toBe(16);
    });

    it("vertical + inset=12 → marginVertical=12", async () => {
      await render(<Divider testID="d" orientation="vertical" inset={12} />);
      expect(screen.getByTestId("d").props.marginVertical).toBe(12);
    });
  });

  describe("palette resolution", () => {
    it("default line color comes from provider's dividerColors.line", async () => {
      await render(<Divider testID="d" />);
      expect(screen.getByTestId("d").props.backgroundColor).toBe("#E5E7EB");
    });

    it("per-instance dividerColors override wins", async () => {
      await render(<Divider testID="d" dividerColors={{ line: "#FF6B00" }} />);
      expect(screen.getByTestId("d").props.backgroundColor).toBe("#FF6B00");
    });

    it("provider-level dividerColors override propagates through useUIKit", async () => {
      mockUseUIKit.mockReturnValue({
        activeTheme: "light",
        tokens: { dividerColors: { line: "#FFEEDD" } },
      });
      await render(<Divider testID="branded" />);
      expect(screen.getByTestId("branded").props.backgroundColor).toBe("#FFEEDD");
    });

    it("dark palette wins when provider swaps activeTheme", async () => {
      mockUseUIKit.mockReturnValue({
        activeTheme: "dark",
        tokens: { dividerColors: DARK_DIVIDER_COLORS },
      });
      await render(<Divider testID="dark" />);
      expect(screen.getByTestId("dark").props.backgroundColor).toBe("#374151");
    });
  });

  describe("Tamagui pass-through + a11y + ref", () => {
    it("passes accessibility props through (accessibilityRole default 'none' + custom label)", async () => {
      await render(<Divider testID="d" accessibilityLabel="Section separator" />);
      const root = screen.getByTestId("d");
      expect(root.props.accessibilityRole).toBe("none");
      expect(root.props.accessibilityLabel).toBe("Section separator");
    });

    it("consumer can override accessibilityRole via spread (default 'none' loses)", async () => {
      // The spread happens AFTER the default so consumer-passed props win.
      // RN's typings don't expose the iOS 'separator' trait; consumers who
      // want that pass it as any / a broader role literal at their callsite.
      await render(<Divider testID="d" accessibilityRole="text" />);
      expect(screen.getByTestId("d").props.accessibilityRole).toBe("text");
    });

    it("alignSelf defaults to 'stretch'", async () => {
      await render(<Divider testID="d" />);
      expect(screen.getByTestId("d").props.alignSelf).toBe("stretch");
    });

    it("passes opacity + other layout props through the spread", async () => {
      await render(<Divider testID="d" opacity={0.5} flex={0} />);
      const root = screen.getByTestId("d");
      expect(root.props.opacity).toBe(0.5);
      expect(root.props.flex).toBe(0);
    });

    it("forwards ref to the root element", async () => {
      const ref = createRef<View>();
      await render(<Divider ref={ref} testID="d" />);
      expect(ref.current).not.toBeNull();
    });
  });

  describe("snapshots", () => {
    it("horizontal default", async () => {
      await render(<Divider />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("horizontal + inset + thick", async () => {
      await render(<Divider inset={16} thickness={4} />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("vertical default", async () => {
      await render(<Divider orientation="vertical" />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("dark theme × horizontal", async () => {
      mockUseUIKit.mockReturnValue({
        activeTheme: "dark",
        tokens: { dividerColors: DARK_DIVIDER_COLORS },
      });
      await render(<Divider />);
      expect(screen.toJSON()).toMatchSnapshot();
    });
  });
});

describe("orientationSizeProps — pure helper", () => {
  it("horizontal returns { height }", () => {
    expect(orientationSizeProps("horizontal", 1)).toEqual({ height: 1 });
    expect(orientationSizeProps("horizontal", 4)).toEqual({ height: 4 });
  });

  it("vertical returns { width }", () => {
    expect(orientationSizeProps("vertical", 1)).toEqual({ width: 1 });
    expect(orientationSizeProps("vertical", 2)).toEqual({ width: 2 });
  });
});

describe("orientationInsetProps — pure helper", () => {
  it("returns empty object when inset === 0 (both orientations)", () => {
    expect(orientationInsetProps("horizontal", 0)).toEqual({});
    expect(orientationInsetProps("vertical", 0)).toEqual({});
  });

  it("horizontal + inset returns { marginHorizontal }", () => {
    expect(orientationInsetProps("horizontal", 16)).toEqual({ marginHorizontal: 16 });
  });

  it("vertical + inset returns { marginVertical }", () => {
    expect(orientationInsetProps("vertical", 8)).toEqual({ marginVertical: 8 });
  });
});
