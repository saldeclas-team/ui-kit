import { render, screen } from "@testing-library/react-native";

import type { SkeletonColors } from "../../tokens/tokens-types";

const LIGHT_SKELETON_COLORS: SkeletonColors = {
  base: "#E5E7EB",
  highlight: "#F3F4F6",
};

const DARK_SKELETON_COLORS: SkeletonColors = {
  base: "#1F2937",
  highlight: "#374151",
};

const RADIUS_SCALE = { sm: 6, md: 12, lg: 18, pill: 9999 };

type MockUIKit = {
  activeTheme: "light" | "dark";
  tokens: { skeletonColors: SkeletonColors; radius: typeof RADIUS_SCALE };
};

const mockUseUIKit = jest.fn<MockUIKit, []>(() => ({
  activeTheme: "light",
  tokens: { skeletonColors: LIGHT_SKELETON_COLORS, radius: RADIUS_SCALE },
}));

jest.mock("../../provider/use-ui-kit", () => ({
  useUIKit: () => mockUseUIKit(),
}));

import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  beforeEach(() => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: { skeletonColors: LIGHT_SKELETON_COLORS, radius: RADIUS_SCALE },
    });
  });

  it("renders under the default testID", async () => {
    await render(<Skeleton />);
    expect(screen.getByTestId("skeleton")).toBeTruthy();
  });

  it("uses a custom testID when provided", async () => {
    await render(<Skeleton testID="sk" />);
    expect(screen.getByTestId("sk")).toBeTruthy();
  });

  it("mounts both fill layers in the default pulse variant", async () => {
    await render(<Skeleton testID="sk" />);
    expect(screen.getByTestId("sk")).toBeTruthy();
    expect(screen.getByTestId("sk-highlight")).toBeTruthy();
  });

  it("omits the highlight layer when variant='static'", async () => {
    await render(<Skeleton testID="sk" variant="static" />);
    expect(screen.getByTestId("sk")).toBeTruthy();
    expect(screen.queryByTestId("sk-highlight")).toBeNull();
  });

  it("paints the base layer with skeletonColors.base from the palette", async () => {
    await render(<Skeleton testID="sk" />);
    const style = flatten(screen.getByTestId("sk").props.style);
    expect(style.backgroundColor).toBe("#E5E7EB");
  });

  it("paints the highlight layer with skeletonColors.highlight from the palette", async () => {
    await render(<Skeleton testID="sk" />);
    const style = flatten(screen.getByTestId("sk-highlight").props.style);
    expect(style.backgroundColor).toBe("#F3F4F6");
  });

  it("per-instance base override wins over the provider palette", async () => {
    await render(<Skeleton testID="sk" skeletonColors={{ base: "#DBEAFE" }} />);
    const style = flatten(screen.getByTestId("sk").props.style);
    expect(style.backgroundColor).toBe("#DBEAFE");
  });

  it("per-instance highlight override wins", async () => {
    await render(<Skeleton testID="sk" skeletonColors={{ highlight: "#EFF6FF" }} />);
    const style = flatten(screen.getByTestId("sk-highlight").props.style);
    expect(style.backgroundColor).toBe("#EFF6FF");
  });

  it("propagates the provider palette through useUIKit", async () => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: {
        skeletonColors: { base: "#065F46", highlight: "#059669" },
        radius: RADIUS_SCALE,
      },
    });
    await render(<Skeleton testID="sk" />);
    expect(flatten(screen.getByTestId("sk").props.style).backgroundColor).toBe("#065F46");
    expect(flatten(screen.getByTestId("sk-highlight").props.style).backgroundColor).toBe("#059669");
  });

  it("uses the dark palette when the provider swaps activeTheme", async () => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "dark",
      tokens: { skeletonColors: DARK_SKELETON_COLORS, radius: RADIUS_SCALE },
    });
    await render(<Skeleton testID="sk" />);
    expect(flatten(screen.getByTestId("sk").props.style).backgroundColor).toBe("#1F2937");
    expect(flatten(screen.getByTestId("sk-highlight").props.style).backgroundColor).toBe("#374151");
  });

  it.each([
    ["none", 0],
    ["sm", 6],
    ["md", 12],
    ["lg", 18],
    ["pill", 9999],
  ] as const)("maps radius=%s to borderRadius=%s", async (radius, expected) => {
    await render(<Skeleton testID="sk" radius={radius} />);
    const style = flatten(screen.getByTestId("sk").props.style);
    expect(style.borderRadius).toBe(expected);
  });

  it("lets an explicit style.borderRadius win over the radius prop", async () => {
    await render(<Skeleton testID="sk" radius="lg" style={{ borderRadius: 4 }} />);
    const style = flatten(screen.getByTestId("sk").props.style);
    expect(style.borderRadius).toBe(4);
  });

  it("flows width / height through the style spread", async () => {
    await render(<Skeleton testID="sk" style={{ width: 240, height: 16 }} />);
    const style = flatten(screen.getByTestId("sk").props.style);
    expect(style.width).toBe(240);
    expect(style.height).toBe(16);
  });

  it("defaults accessibility role='progressbar' + label='Loading'", async () => {
    await render(<Skeleton testID="sk" />);
    const node = screen.getByTestId("sk");
    expect(node.props.accessibilityRole).toBe("progressbar");
    expect(node.props.accessibilityLabel).toBe("Loading");
  });

  it("lets consumers override accessibility props via pass-through", async () => {
    await render(
      <Skeleton
        testID="sk"
        accessibilityRole="none"
        accessibilityLabel="Cargando la sección de perfil"
      />
    );
    const node = screen.getByTestId("sk");
    expect(node.props.accessibilityRole).toBe("none");
    expect(node.props.accessibilityLabel).toBe("Cargando la sección de perfil");
  });

  // Structural snapshots
  describe("snapshots", () => {
    it("default pulse × light × md radius", async () => {
      await render(<Skeleton style={{ width: 240, height: 16 }} />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("static variant × light", async () => {
      await render(<Skeleton variant="static" style={{ width: 240, height: 16 }} />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("pill radius × avatar dimensions", async () => {
      await render(<Skeleton radius="pill" style={{ width: 48, height: 48 }} />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("dark palette × pulse", async () => {
      mockUseUIKit.mockReturnValue({
        activeTheme: "dark",
        tokens: { skeletonColors: DARK_SKELETON_COLORS, radius: RADIUS_SCALE },
      });
      await render(<Skeleton style={{ width: 240, height: 16 }} />);
      expect(screen.toJSON()).toMatchSnapshot();
    });
  });
});

function flatten(style: unknown): Record<string, unknown> {
  if (Array.isArray(style)) {
    return style.reduce<Record<string, unknown>>((acc, entry) => {
      return { ...acc, ...flatten(entry) };
    }, {});
  }
  if (style != null && typeof style === "object") {
    return style as Record<string, unknown>;
  }
  return {};
}
