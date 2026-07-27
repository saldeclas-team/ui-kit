import { render, screen } from "@testing-library/react-native";
import { createRef } from "react";
import { Text } from "react-native";
import type { View } from "react-native";

import type { SurfaceColors } from "../../tokens/tokens-types";

// Mock the styled file with rn.View stubs so component logic
// (level → slot resolution, testID propagation, compound slots,
// Tamagui pass-through) stays testable without booting Tamagui.
jest.mock("./card.styled", () => {
  const rn = jest.requireActual("react-native");
  const forwardRef = jest.requireActual("react").forwardRef;
  const box = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.View ref={ref} {...props} />
  ));
  return {
    StyledCard: box,
    StyledCardHeader: box,
    StyledCardBody: box,
    StyledCardFooter: box,
  };
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

import { Card } from "./card";

describe("Card", () => {
  beforeEach(() => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: { surfaceColors: LIGHT_SURFACE_COLORS },
    });
  });

  describe("simple usage (no slots)", () => {
    it("renders children under the root testID", async () => {
      await render(
        <Card testID="c">
          <Text testID="child">hi</Text>
        </Card>
      );
      expect(screen.getByTestId("c")).toBeTruthy();
      expect(screen.getByTestId("child")).toBeTruthy();
    });

    it('defaults testID to "card" when not provided', async () => {
      await render(
        <Card>
          <Text>x</Text>
        </Card>
      );
      expect(screen.getByTestId("card")).toBeTruthy();
    });

    it('defaults level="raised" and uses surfaceColors.raised', async () => {
      await render(
        <Card testID="c">
          <Text>x</Text>
        </Card>
      );
      expect(screen.getByTestId("c").props.backgroundColor).toBe("#F9FAFB");
    });
  });

  describe("compound usage (Header + Body + Footer)", () => {
    it("renders all three slots with their default testIDs", async () => {
      await render(
        <Card testID="c">
          <Card.Header>
            <Text>title</Text>
          </Card.Header>
          <Card.Body>
            <Text>body</Text>
          </Card.Body>
          <Card.Footer>
            <Text>footer</Text>
          </Card.Footer>
        </Card>
      );
      expect(screen.getByTestId("card-header")).toBeTruthy();
      expect(screen.getByTestId("card-body")).toBeTruthy();
      expect(screen.getByTestId("card-footer")).toBeTruthy();
    });

    it("sub-slot custom testIDs override defaults", async () => {
      await render(
        <Card testID="c">
          <Card.Header testID="c-hdr">
            <Text>title</Text>
          </Card.Header>
          <Card.Body testID="c-body">
            <Text>body</Text>
          </Card.Body>
          <Card.Footer testID="c-ftr">
            <Text>footer</Text>
          </Card.Footer>
        </Card>
      );
      expect(screen.getByTestId("c-hdr")).toBeTruthy();
      expect(screen.getByTestId("c-body")).toBeTruthy();
      expect(screen.getByTestId("c-ftr")).toBeTruthy();
    });

    it("renders children inside each slot", async () => {
      await render(
        <Card testID="c">
          <Card.Header>
            <Text testID="in-hdr">H</Text>
          </Card.Header>
          <Card.Body>
            <Text testID="in-body">B</Text>
          </Card.Body>
          <Card.Footer>
            <Text testID="in-ftr">F</Text>
          </Card.Footer>
        </Card>
      );
      expect(screen.getByTestId("in-hdr")).toBeTruthy();
      expect(screen.getByTestId("in-body")).toBeTruthy();
      expect(screen.getByTestId("in-ftr")).toBeTruthy();
    });
  });

  describe("level → surfaceColors slot resolution", () => {
    it.each([
      ["base", "#FFFFFF"],
      ["raised", "#F9FAFB"],
      ["overlay", "#FFFFFF"],
      ["sunken", "#F3F4F6"],
    ] as const)("level=%s resolves to surfaceColors.%s (%s)", async (level, expected) => {
      await render(
        <Card testID={level} level={level}>
          <Text>x</Text>
        </Card>
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
          <Card testID={`o-${level}`} level={level} surfaceColors={{ [level]: expected }}>
            <Text>x</Text>
          </Card>
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
        <Card testID="branded" level="raised">
          <Text>x</Text>
        </Card>
      );
      expect(screen.getByTestId("branded").props.backgroundColor).toBe("#FFEEDD");
    });

    it("uses dark palette when the provider swaps activeTheme", async () => {
      mockUseUIKit.mockReturnValue({
        activeTheme: "dark",
        tokens: { surfaceColors: DARK_SURFACE_COLORS },
      });
      await render(
        <Card testID="dark" level="raised">
          <Text>x</Text>
        </Card>
      );
      expect(screen.getByTestId("dark").props.backgroundColor).toBe("#111827");
    });
  });

  describe("Tamagui pass-through + a11y + ref", () => {
    it("passes padding / borderRadius / gap through to the root", async () => {
      await render(
        <Card testID="c" padding={24} borderRadius={20} gap={16}>
          <Text>x</Text>
        </Card>
      );
      const root = screen.getByTestId("c");
      expect(root.props.padding).toBe(24);
      expect(root.props.borderRadius).toBe(20);
      expect(root.props.gap).toBe(16);
    });

    it("passes accessibility props through to the root", async () => {
      await render(
        <Card testID="c" accessibilityRole="summary" accessibilityLabel="Weekly card">
          <Text>x</Text>
        </Card>
      );
      const root = screen.getByTestId("c");
      expect(root.props.accessibilityRole).toBe("summary");
      expect(root.props.accessibilityLabel).toBe("Weekly card");
    });

    it("forwards ref to the root element", async () => {
      const ref = createRef<View>();
      await render(
        <Card ref={ref} testID="c">
          <Text>x</Text>
        </Card>
      );
      expect(ref.current).not.toBeNull();
    });

    it("Header passes justifyContent + gap through to the slot root", async () => {
      await render(
        <Card testID="c">
          <Card.Header testID="hdr" justifyContent="center" gap={4}>
            <Text>x</Text>
          </Card.Header>
        </Card>
      );
      const hdr = screen.getByTestId("hdr");
      expect(hdr.props.justifyContent).toBe("center");
      expect(hdr.props.gap).toBe(4);
    });

    it("Body passes gap + flex through to the slot root", async () => {
      await render(
        <Card testID="c">
          <Card.Body testID="body" gap={20} flex={1}>
            <Text>x</Text>
          </Card.Body>
        </Card>
      );
      const body = screen.getByTestId("body");
      expect(body.props.gap).toBe(20);
      expect(body.props.flex).toBe(1);
    });

    it("Footer passes justifyContent + gap through to the slot root", async () => {
      await render(
        <Card testID="c">
          <Card.Footer testID="ftr" justifyContent="space-between" gap={12}>
            <Text>x</Text>
          </Card.Footer>
        </Card>
      );
      const ftr = screen.getByTestId("ftr");
      expect(ftr.props.justifyContent).toBe("space-between");
      expect(ftr.props.gap).toBe(12);
    });
  });

  // Structural snapshots — serialize the rendered RN tree and diff on
  // any structural / prop / inline-style change.
  describe("snapshots", () => {
    it("simple card (default level=raised)", async () => {
      await render(
        <Card padding={16} borderRadius={12}>
          <Text>Simple content</Text>
        </Card>
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("compound card (Header + Body + Footer)", async () => {
      await render(
        <Card>
          <Card.Header>
            <Text>Header title</Text>
          </Card.Header>
          <Card.Body>
            <Text>Body copy.</Text>
          </Card.Body>
          <Card.Footer>
            <Text>Action</Text>
          </Card.Footer>
        </Card>
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it.each(["base", "overlay", "sunken"] as const)("level=%s", async (level) => {
      await render(
        <Card level={level}>
          <Text>level={level}</Text>
        </Card>
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("dark theme × raised", async () => {
      mockUseUIKit.mockReturnValue({
        activeTheme: "dark",
        tokens: { surfaceColors: DARK_SURFACE_COLORS },
      });
      await render(
        <Card level="raised">
          <Text>Dark raised</Text>
        </Card>
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });
  });
});
