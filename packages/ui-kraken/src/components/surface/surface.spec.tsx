import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

import type { SurfaceColors } from "../../tokens/tokens-types";

// Mock the styled file with an rn.View stub so component logic
// (level → slot resolution, testID propagation, Tamagui pass-through)
// stays testable without booting Tamagui.
jest.mock("./surface.styled", () => {
  const rn = jest.requireActual("react-native");
  const forwardRef = jest.requireActual("react").forwardRef;
  const box = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.View ref={ref} {...props} />
  ));
  return { StyledSurface: box };
});

const LIGHT_SURFACE_COLORS: SurfaceColors = {
  base: "#FFFFFF",
  raised: "#F9FAFB",
  overlay: "#FFFFFF",
  sunken: "#F3F4F6",
};

const DARK_SURFACE_COLORS: SurfaceColors = {
  base: "#0B0B0F",
  raised: "#111827",
  overlay: "#1F2937",
  sunken: "#030712",
};

type MockUIKit = {
  activeTheme: "light" | "dark";
  tokens: { surfaceColors: SurfaceColors };
};
const mockUseUIKit = jest.fn<MockUIKit, []>(() => ({
  activeTheme: "light",
  tokens: { surfaceColors: LIGHT_SURFACE_COLORS },
}));
jest.mock("../../provider/use-ui-kit", () => ({
  useUIKit: () => mockUseUIKit(),
}));

import { Surface } from "./surface";

describe("Surface", () => {
  beforeEach(() => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: { surfaceColors: LIGHT_SURFACE_COLORS },
    });
  });

  it("renders children under the root testID", async () => {
    await render(
      <Surface testID="s">
        <Text testID="child">hi</Text>
      </Surface>
    );
    expect(screen.getByTestId("s")).toBeTruthy();
    expect(screen.getByTestId("child")).toBeTruthy();
  });

  it('defaults testID to "surface" when not provided', async () => {
    await render(
      <Surface>
        <Text>x</Text>
      </Surface>
    );
    expect(screen.getByTestId("surface")).toBeTruthy();
  });

  it('defaults level="base" and uses surfaceColors.base', async () => {
    await render(
      <Surface testID="s">
        <Text>x</Text>
      </Surface>
    );
    expect(screen.getByTestId("s").props.backgroundColor).toBe("#FFFFFF");
  });

  it.each([
    ["base", "#FFFFFF"],
    ["raised", "#F9FAFB"],
    ["overlay", "#FFFFFF"],
    ["sunken", "#F3F4F6"],
  ] as const)("level=%s resolves to surfaceColors.%s (%s)", async (level, expected) => {
    await render(
      <Surface testID={level} level={level}>
        <Text>x</Text>
      </Surface>
    );
    expect(screen.getByTestId(level).props.backgroundColor).toBe(expected);
  });

  it.each([
    ["base", "#FF6B00"],
    ["raised", "#FF6B00"],
    ["overlay", "#FF6B00"],
    ["sunken", "#FF6B00"],
  ] as const)(
    "per-instance surfaceColors override applies to level=%s",
    async (level, expected) => {
      await render(
        <Surface testID={`o-${level}`} level={level} surfaceColors={{ [level]: expected }}>
          <Text>x</Text>
        </Surface>
      );
      expect(screen.getByTestId(`o-${level}`).props.backgroundColor).toBe(expected);
    }
  );

  it("provider-level surfaceColors override propagates through useUIKit", async () => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: { surfaceColors: { ...LIGHT_SURFACE_COLORS, raised: "#FFEEDD" } },
    });
    await render(
      <Surface testID="branded" level="raised">
        <Text>x</Text>
      </Surface>
    );
    expect(screen.getByTestId("branded").props.backgroundColor).toBe("#FFEEDD");
  });

  it("passes Tamagui style props (padding, flex, borderRadius) through the spread", async () => {
    await render(
      <Surface testID="s" padding={16} flex={1} borderRadius={12}>
        <Text>x</Text>
      </Surface>
    );
    const root = screen.getByTestId("s");
    expect(root.props.padding).toBe(16);
    expect(root.props.flex).toBe(1);
    expect(root.props.borderRadius).toBe(12);
  });

  it("passes accessibility props through the spread", async () => {
    await render(
      <Surface testID="s" accessibilityRole="summary" accessibilityLabel="Weekly summary">
        <Text>x</Text>
      </Surface>
    );
    const root = screen.getByTestId("s");
    expect(root.props.accessibilityRole).toBe("summary");
    expect(root.props.accessibilityLabel).toBe("Weekly summary");
  });

  it("uses dark palette when the provider swaps activeTheme", async () => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "dark",
      tokens: { surfaceColors: DARK_SURFACE_COLORS },
    });
    await render(
      <Surface testID="dark" level="raised">
        <Text>x</Text>
      </Surface>
    );
    expect(screen.getByTestId("dark").props.backgroundColor).toBe("#111827");
  });

  // Structural snapshots — serialize the rendered RN tree and diff on
  // any structural / prop / inline-style change.
  describe("snapshots", () => {
    it.each(["base", "raised", "overlay", "sunken"] as const)("level=%s", async (level) => {
      await render(
        <Surface level={level} padding={12} borderRadius={8}>
          <Text>level={level}</Text>
        </Surface>
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("dark theme × raised", async () => {
      mockUseUIKit.mockReturnValue({
        activeTheme: "dark",
        tokens: { surfaceColors: DARK_SURFACE_COLORS },
      });
      await render(
        <Surface level="raised" padding={12} borderRadius={8}>
          <Text>Dark raised</Text>
        </Surface>
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("per-instance surfaceColors override", async () => {
      await render(
        <Surface level="raised" padding={12} borderRadius={8} surfaceColors={{ raised: "#FFF7ED" }}>
          <Text>Custom tint</Text>
        </Surface>
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });
  });
});
