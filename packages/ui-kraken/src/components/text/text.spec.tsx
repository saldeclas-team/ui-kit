import { fireEvent, render, screen } from "@testing-library/react-native";

// Mock the styled file the same way Button does — Tamagui's ESM entry breaks
// under Jest's CJS runtime. The stub forwards every prop to a plain RN Text
// so the component logic (color resolution, intensity, variant forwarding,
// compound shortcuts) stays testable end to end.
jest.mock("./text.styled", () => {
  const rn = jest.requireActual("react-native");
  const forwardRef = jest.requireActual("react").forwardRef;
  const StyledText = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.Text ref={ref} {...props} />
  ));
  return { StyledText };
});

// Mock useUIKit so Text can run without a UIKitProvider wrapper in tests.
// Give it the DEFAULT_LIGHT_TEXT_COLORS values so `color="danger"` etc. can
// be asserted against a known palette.
const mockUseUIKit = jest.fn(() => ({
  activeTheme: "light" as const,
  tokens: {
    textColors: {
      primary: "#0B0B0F",
      secondary: "#5B6472",
      tertiary: "#9CA3AF",
      disabled: "#D1D5DB",
      inverse: "#FFFFFF",
      interactive: "#2563EB",
      success: "#059669",
      warning: "#D97706",
      danger: "#DC2626",
      info: "#0284C7",
      onPrimary: "#FFFFFF",
      onSecondary: "#FFFFFF",
      onSuccess: "#FFFFFF",
      onDanger: "#FFFFFF",
    },
  },
}));
jest.mock("../../provider/use-ui-kit", () => ({
  useUIKit: () => mockUseUIKit(),
}));

import { Text } from "./text";

describe("Text", () => {
  it("renders children with the default variant/color when no props given", async () => {
    await render(<Text testID="hello">hello</Text>);
    const el = screen.getByTestId("hello");
    expect(el.props.children).toBe("hello");
    expect(el.props.variant).toBe("body2");
    expect(el.props.color).toBe("#0B0B0F"); // primary from mocked tokens
  });

  it("forwards every variant to the styled prop", async () => {
    const variants = [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "subtitle1",
      "subtitle2",
      "body1",
      "body2",
      "caption",
      "overline",
      "label",
    ] as const;
    await render(
      <>
        {variants.map((v) => (
          <Text key={v} testID={`v-${v}`} variant={v}>
            {v}
          </Text>
        ))}
      </>
    );
    for (const v of variants) {
      expect(screen.getByTestId(`v-${v}`).props.variant).toBe(v);
    }
  });

  it("resolves each theme slot when color matches TextColors", async () => {
    await render(
      <>
        <Text testID="danger" color="danger">
          err
        </Text>
        <Text testID="success" color="success">
          ok
        </Text>
        <Text testID="onPrimary" color="onPrimary">
          on
        </Text>
      </>
    );
    expect(screen.getByTestId("danger").props.color).toBe("#DC2626");
    expect(screen.getByTestId("success").props.color).toBe("#059669");
    expect(screen.getByTestId("onPrimary").props.color).toBe("#FFFFFF");
  });

  it("passes through a raw hex color when it does not match a slot name", async () => {
    await render(
      <Text testID="custom" color="#FF6B00">
        custom
      </Text>
    );
    expect(screen.getByTestId("custom").props.color).toBe("#FF6B00");
  });

  it("passes through a raw rgb color unchanged", async () => {
    await render(
      <Text testID="rgb" color="rgb(255, 107, 0)">
        rgb
      </Text>
    );
    expect(screen.getByTestId("rgb").props.color).toBe("rgb(255, 107, 0)");
  });

  it("applies opacity 0.65 when intensity='subtle'", async () => {
    await render(
      <Text testID="subtle" intensity="subtle">
        subtle
      </Text>
    );
    expect(screen.getByTestId("subtle").props.opacity).toBe(0.65);
  });

  it("bumps fontWeight when intensity='strong' on a light variant", async () => {
    await render(
      <Text testID="body-strong" variant="body2" intensity="strong">
        strong
      </Text>
    );
    // body2 base weight is 400, strong bumps to 600
    expect(screen.getByTestId("body-strong").props.fontWeight).toBe("600");
  });

  it("does NOT bump fontWeight when intensity='strong' on an already 700 variant", async () => {
    await render(
      <Text testID="h1-strong" variant="h1" intensity="strong">
        strong
      </Text>
    );
    // h1 is already 700 — no bump
    expect(screen.getByTestId("h1-strong").props.fontWeight).toBeUndefined();
  });

  it("flows RN Text props through the spread (onPress, numberOfLines, textAlign)", async () => {
    const onPress = jest.fn();
    await render(
      <Text
        testID="rich"
        onPress={onPress}
        numberOfLines={2}
        textAlign="center"
        accessibilityLabel="rich text"
      >
        rich
      </Text>
    );
    const el = screen.getByTestId("rich");
    expect(el.props.numberOfLines).toBe(2);
    expect(el.props.textAlign).toBe("center");
    expect(el.props.accessibilityLabel).toBe("rich text");

    fireEvent.press(el);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("exposes all 13 compound shortcuts with the right variant", async () => {
    const compoundMap = {
      H1: "h1",
      H2: "h2",
      H3: "h3",
      H4: "h4",
      H5: "h5",
      H6: "h6",
      Subtitle1: "subtitle1",
      Subtitle2: "subtitle2",
      Body1: "body1",
      Body2: "body2",
      Caption: "caption",
      Overline: "overline",
      Label: "label",
    } as const;
    await render(
      <>
        {(Object.keys(compoundMap) as Array<keyof typeof compoundMap>).map((key) => {
          const Component = Text[key];
          return (
            <Component key={key} testID={`c-${key}`}>
              {key}
            </Component>
          );
        })}
      </>
    );
    for (const [key, variant] of Object.entries(compoundMap)) {
      expect(screen.getByTestId(`c-${key}`).props.variant).toBe(variant);
    }
  });

  // Structural snapshots — serialize the rendered RN tree and diff on any
  // structural / prop / inline-style change. Complements the targeted
  // assertions above by catching regressions the specific asserts don't
  // (e.g. a variant losing its fontWeight, an intensity dropping opacity).
  //
  // If a snapshot diff is intentional: run `pnpm --filter ui-kraken test -u`,
  // review the .snap diff carefully, and commit both the code and the
  // snapshot update in the same PR.
  describe("snapshots", () => {
    // --- Variants × primary color (13) ---
    const VARIANTS = [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "subtitle1",
      "subtitle2",
      "body1",
      "body2",
      "caption",
      "overline",
      "label",
    ] as const;

    it.each(VARIANTS)("variant=%s @ primary color", async (variant) => {
      await render(<Text variant={variant}>The quick brown fox</Text>);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    // --- Hierarchy colors × body2 (5) ---
    it.each(["primary", "secondary", "tertiary", "disabled", "inverse"] as const)(
      "hierarchy color=%s @ body2",
      async (color) => {
        await render(<Text color={color}>Hierarchy</Text>);
        expect(screen.toJSON()).toMatchSnapshot();
      }
    );

    // --- Semantic colors × body2 (5) ---
    it.each(["interactive", "success", "warning", "danger", "info"] as const)(
      "semantic color=%s @ body2",
      async (color) => {
        await render(<Text color={color}>Semantic</Text>);
        expect(screen.toJSON()).toMatchSnapshot();
      }
    );

    // --- On-* colors × body2 (4) ---
    it.each(["onPrimary", "onSecondary", "onSuccess", "onDanger"] as const)(
      "on-* color=%s @ body2",
      async (color) => {
        await render(<Text color={color}>OnColor</Text>);
        expect(screen.toJSON()).toMatchSnapshot();
      }
    );

    // --- Intensities × body1 × primary (3) ---
    it.each(["subtle", "normal", "strong"] as const)(
      "intensity=%s @ body1 primary",
      async (intensity) => {
        await render(
          <Text variant="body1" intensity={intensity}>
            Intensity
          </Text>
        );
        expect(screen.toJSON()).toMatchSnapshot();
      }
    );

    // --- Custom color passthrough (hex / rgb / named) (3) ---
    it("custom color: hex", async () => {
      await render(<Text color="#FF6B00">Custom</Text>);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("custom color: rgb", async () => {
      await render(<Text color="rgb(139, 92, 246)">Custom</Text>);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("custom color: named", async () => {
      await render(<Text color="hotpink">Custom</Text>);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    // --- Truncation + textAlign (5) ---
    it("truncation: numberOfLines=2", async () => {
      await render(
        <Text numberOfLines={2}>
          A longer paragraph that would wrap onto three lines but should be truncated after two,
          with an ellipsis at the tail.
        </Text>
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it.each(["auto", "left", "center", "right", "justify"] as const)(
      "textAlign=%s",
      async (textAlign) => {
        await render(<Text textAlign={textAlign}>Aligned</Text>);
        expect(screen.toJSON()).toMatchSnapshot();
      }
    );
  });
});
