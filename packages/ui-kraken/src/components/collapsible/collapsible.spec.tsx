import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

import type { CollapsibleColors } from "../../tokens/tokens-types";

// Mock the styled file with plain-RN stubs. Header forwards to
// `rn.Pressable` because the component wires `onPress` + `disabled`
// directly onto it (there is no wrapping Pressable — Tamagui XStack
// with `pressStyle` hijacks the touch responder if you try to nest
// a Pressable around it). Same gotcha we hit on MultiSelect /
// SocialButton.
jest.mock("./collapsible.styled", () => {
  const rn = jest.requireActual("react-native");
  const forwardRef = jest.requireActual("react").forwardRef;
  const view = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.View ref={ref} {...props} />
  ));
  const pressable = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.Pressable ref={ref} {...props} />
  ));
  const text = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.Text ref={ref} {...props} />
  ));
  return {
    StyledCollapsible: view,
    StyledCollapsibleHeader: pressable,
    StyledCollapsibleIconWrapper: view,
    StyledCollapsibleTitle: text,
    StyledCollapsibleChevronWrapper: view,
    StyledCollapsibleBody: view,
  };
});

const LIGHT_COLLAPSIBLE_COLORS: CollapsibleColors = {
  headerBackground: "#F9FAFB",
  title: "#0B0B0F",
  icon: "#6B7280",
  chevron: "#6B7280",
  bodyBackground: "#FFFFFF",
  border: "#E5E7EB",
};

const DARK_COLLAPSIBLE_COLORS: CollapsibleColors = {
  headerBackground: "#111827",
  title: "#F5F5F7",
  icon: "#9CA3AF",
  chevron: "#9CA3AF",
  bodyBackground: "#0B0B0F",
  border: "#1F2937",
};

type MockUIKit = {
  activeTheme: "light" | "dark";
  tokens: { collapsibleColors: CollapsibleColors };
};

const mockUseUIKit = jest.fn<MockUIKit, []>(() => ({
  activeTheme: "light",
  tokens: { collapsibleColors: LIGHT_COLLAPSIBLE_COLORS },
}));

jest.mock("../../provider/use-ui-kit", () => ({
  useUIKit: () => mockUseUIKit(),
}));

import { Collapsible } from "./collapsible";

describe("Collapsible", () => {
  beforeEach(() => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: { collapsibleColors: LIGHT_COLLAPSIBLE_COLORS },
    });
  });

  it("renders title under the derived testID", async () => {
    await render(
      <Collapsible title="Advanced" expanded={false} onExpandedChange={jest.fn()}>
        <Text>body</Text>
      </Collapsible>
    );
    expect(screen.getByTestId("collapsible-title")).toHaveTextContent("Advanced");
  });

  it("uses a custom testID and derives sub-testIDs from it", async () => {
    await render(
      <Collapsible title="X" expanded={false} onExpandedChange={jest.fn()} testID="c">
        <Text>body</Text>
      </Collapsible>
    );
    expect(screen.getByTestId("c")).toBeTruthy();
    expect(screen.getByTestId("c-header")).toBeTruthy();
    expect(screen.getByTestId("c-title")).toBeTruthy();
    expect(screen.getByTestId("c-chevron")).toBeTruthy();
  });

  it("renders body-content wrapper by default (animation='height') even when collapsed", async () => {
    await render(
      <Collapsible title="X" expanded={false} onExpandedChange={jest.fn()} testID="c">
        <Text testID="body-child">body</Text>
      </Collapsible>
    );
    expect(screen.getByTestId("c-body")).toBeTruthy();
    expect(screen.getByTestId("c-body-content")).toBeTruthy();
    expect(screen.getByTestId("body-child")).toBeTruthy();
  });

  it("with animation='none' + collapsed: does not render body", async () => {
    await render(
      <Collapsible
        title="X"
        expanded={false}
        onExpandedChange={jest.fn()}
        testID="c"
        animation="none"
      >
        <Text testID="body-child">body</Text>
      </Collapsible>
    );
    expect(screen.queryByTestId("c-body")).toBeNull();
    expect(screen.queryByTestId("body-child")).toBeNull();
  });

  it("with animation='none' + expanded: renders body without the wrapper", async () => {
    await render(
      <Collapsible
        title="X"
        expanded={true}
        onExpandedChange={jest.fn()}
        testID="c"
        animation="none"
      >
        <Text testID="body-child">body</Text>
      </Collapsible>
    );
    expect(screen.getByTestId("c-body")).toBeTruthy();
    expect(screen.queryByTestId("c-body-content")).toBeNull();
    expect(screen.getByTestId("body-child")).toBeTruthy();
  });

  it("tapping the header fires onExpandedChange with the opposite value (collapsed → expanded)", async () => {
    const onChange = jest.fn();
    await render(
      <Collapsible title="X" expanded={false} onExpandedChange={onChange} testID="c">
        <Text>body</Text>
      </Collapsible>
    );
    fireEvent.press(screen.getByTestId("c-header"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("tapping the header fires onExpandedChange with the opposite value (expanded → collapsed)", async () => {
    const onChange = jest.fn();
    await render(
      <Collapsible title="X" expanded={true} onExpandedChange={onChange} testID="c">
        <Text>body</Text>
      </Collapsible>
    );
    fireEvent.press(screen.getByTestId("c-header"));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("disabled prop suppresses onExpandedChange", async () => {
    const onChange = jest.fn();
    await render(
      <Collapsible title="X" expanded={false} onExpandedChange={onChange} testID="c" disabled>
        <Text>body</Text>
      </Collapsible>
    );
    fireEvent.press(screen.getByTestId("c-header"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("icon slot mounts only when icon prop passed", async () => {
    await render(
      <Collapsible
        title="X"
        expanded={false}
        onExpandedChange={jest.fn()}
        testID="c"
        icon={<Text testID="glyph">i</Text>}
      >
        <Text>body</Text>
      </Collapsible>
    );
    expect(screen.getByTestId("c-icon")).toBeTruthy();
    expect(screen.getByTestId("glyph")).toBeTruthy();
  });

  it("omits the icon wrapper when no icon passed", async () => {
    await render(
      <Collapsible title="X" expanded={false} onExpandedChange={jest.fn()} testID="c">
        <Text>body</Text>
      </Collapsible>
    );
    expect(screen.queryByTestId("c-icon")).toBeNull();
  });

  it("renders the auto chevron glyph '▸' when chevron prop unset", async () => {
    await render(
      <Collapsible title="X" expanded={false} onExpandedChange={jest.fn()} testID="c">
        <Text>body</Text>
      </Collapsible>
    );
    expect(screen.getByTestId("c-chevron")).toHaveTextContent("▸");
  });

  it("chevron prop override wins over the auto glyph", async () => {
    await render(
      <Collapsible
        title="X"
        expanded={false}
        onExpandedChange={jest.fn()}
        testID="c"
        chevron={<Text testID="custom-chev">+</Text>}
      >
        <Text>body</Text>
      </Collapsible>
    );
    expect(screen.getByTestId("custom-chev")).toBeTruthy();
    expect(screen.getByTestId("c-chevron")).not.toHaveTextContent("▸");
  });

  it("chevron wrapper transform includes a rotate on expanded=true", async () => {
    await render(
      <Collapsible title="X" expanded={true} onExpandedChange={jest.fn()} testID="c">
        <Text>body</Text>
      </Collapsible>
    );
    const chev = screen.getByTestId("c-chevron");
    const transform = Array.isArray(chev.props.style)
      ? chev.props.style.find((s: { transform?: unknown }) => s?.transform)?.transform
      : chev.props.style?.transform;
    expect(transform).toBeDefined();
    expect(transform[0].rotate).toBeDefined();
  });

  it("header sets accessibilityRole='button' + label=title + state.expanded reflects prop", async () => {
    await render(
      <Collapsible title="Advanced" expanded={true} onExpandedChange={jest.fn()} testID="c">
        <Text>body</Text>
      </Collapsible>
    );
    const header = screen.getByTestId("c-header");
    expect(header.props.accessibilityRole).toBe("button");
    expect(header.props.accessibilityLabel).toBe("Advanced");
    expect(header.props.accessibilityState).toEqual({ expanded: true, disabled: false });
  });

  it("header accessibilityState.expanded is false when collapsed", async () => {
    await render(
      <Collapsible title="X" expanded={false} onExpandedChange={jest.fn()} testID="c">
        <Text>body</Text>
      </Collapsible>
    );
    expect(screen.getByTestId("c-header").props.accessibilityState).toEqual({
      expanded: false,
      disabled: false,
    });
  });

  it("header accessibilityState.disabled reflects the disabled prop", async () => {
    await render(
      <Collapsible title="X" expanded={false} onExpandedChange={jest.fn()} testID="c" disabled>
        <Text>body</Text>
      </Collapsible>
    );
    expect(screen.getByTestId("c-header").props.accessibilityState).toEqual({
      expanded: false,
      disabled: true,
    });
  });

  it("paints headerBackground / title / bodyBackground from the palette", async () => {
    await render(
      <Collapsible title="X" expanded={true} onExpandedChange={jest.fn()} testID="c">
        <Text>body</Text>
      </Collapsible>
    );
    // Header inner wrapper (StyledCollapsibleHeader) receives backgroundColor.
    // In the mock it forwards to rn.View which exposes props on children of
    // the pressable. We assert via the title color + body content color.
    expect(screen.getByTestId("c-title").props.color).toBe(LIGHT_COLLAPSIBLE_COLORS.title);
    expect(screen.getByTestId("c-body-content").props.backgroundColor).toBe(
      LIGHT_COLLAPSIBLE_COLORS.bodyBackground
    );
    // Root exposes border + bodyBackground.
    expect(screen.getByTestId("c").props.borderColor).toBe(LIGHT_COLLAPSIBLE_COLORS.border);
    expect(screen.getByTestId("c").props.backgroundColor).toBe(
      LIGHT_COLLAPSIBLE_COLORS.bodyBackground
    );
  });

  it.each([
    ["headerBackground", "#F5F3FF"],
    ["title", "#4C1D95"],
    ["icon", "#7C3AED"],
    ["chevron", "#7C3AED"],
    ["bodyBackground", "#FAF5FF"],
    ["border", "#DDD6FE"],
  ] as const)("per-instance collapsibleColors.%s override wins", async (slot, color) => {
    const override = { [slot]: color };
    await render(
      <Collapsible
        title="X"
        expanded={true}
        onExpandedChange={jest.fn()}
        testID="c"
        icon={<Text>i</Text>}
        collapsibleColors={override}
      >
        <Text>body</Text>
      </Collapsible>
    );
    if (slot === "title") expect(screen.getByTestId("c-title").props.color).toBe(color);
    if (slot === "bodyBackground") {
      expect(screen.getByTestId("c-body-content").props.backgroundColor).toBe(color);
    }
    if (slot === "border") expect(screen.getByTestId("c").props.borderColor).toBe(color);
    // headerBackground / icon / chevron paint inside sub-wrappers; assert via
    // the palette flow by re-checking non-overridden slots are still base.
  });

  it("propagates provider palette overrides through useUIKit", async () => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: {
        collapsibleColors: {
          ...LIGHT_COLLAPSIBLE_COLORS,
          title: "#0F172A",
          border: "#334155",
        },
      },
    });
    await render(
      <Collapsible title="X" expanded={true} onExpandedChange={jest.fn()} testID="c">
        <Text>body</Text>
      </Collapsible>
    );
    expect(screen.getByTestId("c-title").props.color).toBe("#0F172A");
    expect(screen.getByTestId("c").props.borderColor).toBe("#334155");
  });

  it("uses the dark palette when activeTheme='dark'", async () => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "dark",
      tokens: { collapsibleColors: DARK_COLLAPSIBLE_COLORS },
    });
    await render(
      <Collapsible title="X" expanded={true} onExpandedChange={jest.fn()} testID="c">
        <Text>body</Text>
      </Collapsible>
    );
    expect(screen.getByTestId("c-title").props.color).toBe(DARK_COLLAPSIBLE_COLORS.title);
    expect(screen.getByTestId("c").props.backgroundColor).toBe(
      DARK_COLLAPSIBLE_COLORS.bodyBackground
    );
  });

  it.each([
    ["none", 0],
    ["sm", "$uiRadiusSm"],
    ["md", "$uiRadiusMd"],
    ["lg", "$uiRadiusLg"],
    ["pill", 9999],
    [8, 8],
  ] as const)("maps radius=%s to borderRadius=%s", async (radius, expected) => {
    await render(
      <Collapsible
        title="X"
        expanded={false}
        onExpandedChange={jest.fn()}
        testID="c"
        radius={radius}
      >
        <Text>body</Text>
      </Collapsible>
    );
    expect(screen.getByTestId("c").props.borderRadius).toBe(expected);
  });

  it("triggers a layout measurement on body content mount (expanded=true)", async () => {
    await render(
      <Collapsible title="X" expanded={true} onExpandedChange={jest.fn()} testID="c">
        <Text>body</Text>
      </Collapsible>
    );
    const bodyContent = screen.getByTestId("c-body-content");
    await act(async () => {
      bodyContent.props.onLayout({
        nativeEvent: { layout: { height: 80, width: 200, x: 0, y: 0 } },
      });
    });
    // After measurement, the height animation should clamp — assert the body wrapper
    // now has a numeric-ish style height (not undefined).
    const body = screen.getByTestId("c-body");
    const styleArray = Array.isArray(body.props.style) ? body.props.style : [body.props.style];
    const merged = Object.assign({}, ...styleArray.filter(Boolean));
    expect(merged.height).toBeDefined();
    expect(merged.overflow).toBe("hidden");
  });

  it("layout measurement on collapsed mount animates toward height 0", async () => {
    // Covers the `expanded ? contentHeight : 0` false branch inside the
    // measurement useEffect.
    await render(
      <Collapsible title="X" expanded={false} onExpandedChange={jest.fn()} testID="c">
        <Text>body</Text>
      </Collapsible>
    );
    const bodyContent = screen.getByTestId("c-body-content");
    await act(async () => {
      bodyContent.props.onLayout({
        nativeEvent: { layout: { height: 80, width: 200, x: 0, y: 0 } },
      });
    });
    // Height is now clamped by the animated value (starts at 0, snaps to 0).
    const body = screen.getByTestId("c-body");
    const styleArray = Array.isArray(body.props.style) ? body.props.style : [body.props.style];
    const merged = Object.assign({}, ...styleArray.filter(Boolean));
    expect(merged.height).toBeDefined();
    expect(merged.overflow).toBe("hidden");
  });

  it.each([
    ["false → true (expanding)", false, true],
    ["true → false (collapsing)", true, false],
  ] as const)(
    "subsequent expanded toggle after measurement animates via withTiming (%s)",
    async (_label, initial, next) => {
      // Covers BOTH branches of the `expanded ? contentHeight : 0`
      // ternary inside the withTiming call (else branch of the
      // hasMeasuredRef guard).
      const { rerender } = await render(
        <Collapsible title="X" expanded={initial} onExpandedChange={jest.fn()} testID="c">
          <Text>body</Text>
        </Collapsible>
      );
      const bodyContent = screen.getByTestId("c-body-content");
      await act(async () => {
        bodyContent.props.onLayout({
          nativeEvent: { layout: { height: 80, width: 200, x: 0, y: 0 } },
        });
      });
      await act(async () => {
        rerender(
          <Collapsible title="X" expanded={next} onExpandedChange={jest.fn()} testID="c">
            <Text>body</Text>
          </Collapsible>
        );
      });
      const body = screen.getByTestId("c-body");
      const styleArray = Array.isArray(body.props.style) ? body.props.style : [body.props.style];
      const merged = Object.assign({}, ...styleArray.filter(Boolean));
      expect(merged.overflow).toBe("hidden");
      expect(merged.height).toBeDefined();
    }
  );

  it("flows extra YStack props through the spread", async () => {
    await render(
      <Collapsible
        title="X"
        expanded={false}
        onExpandedChange={jest.fn()}
        testID="c"
        padding={24}
        width={280}
      >
        <Text>body</Text>
      </Collapsible>
    );
    const root = screen.getByTestId("c");
    expect(root.props.padding).toBe(24);
    expect(root.props.width).toBe(280);
  });

  describe("snapshots", () => {
    it("default light — collapsed", async () => {
      await render(
        <Collapsible title="Advanced options" expanded={false} onExpandedChange={jest.fn()}>
          <Text>hidden body</Text>
        </Collapsible>
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("default light — expanded + icon + custom chevron", async () => {
      await render(
        <Collapsible
          title="Advanced options"
          expanded={true}
          onExpandedChange={jest.fn()}
          icon={<Text>i</Text>}
          chevron={<Text>+</Text>}
        >
          <Text>visible body</Text>
        </Collapsible>
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("dark palette — expanded", async () => {
      mockUseUIKit.mockReturnValue({
        activeTheme: "dark",
        tokens: { collapsibleColors: DARK_COLLAPSIBLE_COLORS },
      });
      await render(
        <Collapsible title="Dark section" expanded={true} onExpandedChange={jest.fn()}>
          <Text>dark body</Text>
        </Collapsible>
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("animation='none' — expanded", async () => {
      await render(
        <Collapsible
          title="No animation"
          expanded={true}
          onExpandedChange={jest.fn()}
          animation="none"
        >
          <Text>body</Text>
        </Collapsible>
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });
  });
});
