import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

import type { HintColors } from "../../tokens/tokens-types";

// Mock the styled file with plain-RN forwarders so the component logic
// (tone resolution, palette derivation, emphasis background paint,
// testID propagation, compound export, a11y live region) stays
// testable without booting Tamagui.
jest.mock("./hint.styled", () => {
  const rn = jest.requireActual("react-native");
  const forwardRef = jest.requireActual("react").forwardRef;
  const StyledHint = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.View ref={ref} {...props} />
  ));
  const StyledHintIconWrapper = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.View ref={ref} {...props} />
  ));
  const StyledHintContent = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.View ref={ref} {...props} />
  ));
  const StyledHintTitle = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.Text ref={ref} {...props} />
  ));
  const StyledHintBody = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.Text ref={ref} {...props} />
  ));
  return {
    StyledHint,
    StyledHintIconWrapper,
    StyledHintContent,
    StyledHintTitle,
    StyledHintBody,
  };
});

const LIGHT_HINT_COLORS: HintColors = {
  neutral: { text: "#4B5563", icon: "#6B7280", background: "#F3F4F6" },
  info: { text: "#1E40AF", icon: "#2563EB", background: "#EFF6FF" },
  success: { text: "#065F46", icon: "#059669", background: "#ECFDF5" },
  warning: { text: "#92400E", icon: "#D97706", background: "#FFFBEB" },
  danger: { text: "#991B1B", icon: "#DC2626", background: "#FEF2F2" },
};

const DARK_HINT_COLORS: HintColors = {
  neutral: { text: "#D1D5DB", icon: "#9CA3AF", background: "#1F2937" },
  info: { text: "#93C5FD", icon: "#60A5FA", background: "#1E3A8A" },
  success: { text: "#6EE7B7", icon: "#34D399", background: "#064E3B" },
  warning: { text: "#FCD34D", icon: "#FBBF24", background: "#78350F" },
  danger: { text: "#FCA5A5", icon: "#F87171", background: "#7F1D1D" },
};

type MockUIKit = {
  activeTheme: "light" | "dark";
  tokens: { hintColors: HintColors };
};

const mockUseUIKit = jest.fn<MockUIKit, []>(() => ({
  activeTheme: "light",
  tokens: { hintColors: LIGHT_HINT_COLORS },
}));
jest.mock("../../provider/use-ui-kit", () => ({
  useUIKit: () => mockUseUIKit(),
}));

import { Hint } from "./hint";

describe("Hint", () => {
  beforeEach(() => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: { hintColors: LIGHT_HINT_COLORS },
    });
  });

  it("renders body children under the derived body testID", async () => {
    await render(<Hint testID="h">Body text</Hint>);
    expect(screen.getByTestId("h-body")).toHaveTextContent("Body text");
  });

  it("uses default testID='hint' when none is passed", async () => {
    await render(<Hint>Body</Hint>);
    expect(screen.getByTestId("hint")).toBeTruthy();
    expect(screen.getByTestId("hint-body")).toBeTruthy();
  });

  it("omits the body when no children are passed", async () => {
    await render(<Hint testID="h" title="Just a title" />);
    expect(screen.getByTestId("h-title")).toBeTruthy();
    expect(screen.queryByTestId("h-body")).toBeNull();
  });

  it("omits the title when no title is passed", async () => {
    await render(<Hint testID="h">Body only</Hint>);
    expect(screen.queryByTestId("h-title")).toBeNull();
    expect(screen.getByTestId("h-body")).toBeTruthy();
  });

  it("omits the title when title is an empty string", async () => {
    await render(
      <Hint testID="h" title="">
        Body only
      </Hint>
    );
    expect(screen.queryByTestId("h-title")).toBeNull();
  });

  it("mounts the icon slot only when icon is passed", async () => {
    await render(
      <Hint testID="h" icon={<Text testID="glyph">i</Text>}>
        With icon
      </Hint>
    );
    expect(screen.getByTestId("h-icon")).toBeTruthy();
    expect(screen.getByTestId("glyph")).toBeTruthy();
  });

  it("omits the icon slot when no icon is passed", async () => {
    await render(<Hint testID="h">No icon</Hint>);
    expect(screen.queryByTestId("h-icon")).toBeNull();
  });

  it.each(["neutral", "info", "success", "warning", "danger"] as const)(
    "paints text + icon from the %s tone palette",
    async (tone) => {
      await render(
        <Hint testID="h" tone={tone} icon={<Text>i</Text>}>
          Body
        </Hint>
      );
      const expected = LIGHT_HINT_COLORS[tone];
      expect(screen.getByTestId("h-body").props.color).toBe(expected.text);
    }
  );

  it("emphasis='ghost' (default) paints a transparent background", async () => {
    await render(<Hint testID="h">Body</Hint>);
    expect(screen.getByTestId("h").props.backgroundColor).toBe("transparent");
  });

  it("emphasis='soft' paints the tone's background slot", async () => {
    await render(
      <Hint testID="h" tone="warning" emphasis="soft">
        Body
      </Hint>
    );
    expect(screen.getByTestId("h").props.backgroundColor).toBe(
      LIGHT_HINT_COLORS.warning.background
    );
  });

  it("per-instance hintColors.text override wins over the provider tone", async () => {
    await render(
      <Hint testID="h" tone="info" hintColors={{ text: "#312E81" }}>
        Body
      </Hint>
    );
    expect(screen.getByTestId("h-body").props.color).toBe("#312E81");
  });

  it("per-instance hintColors.background override wins in soft emphasis", async () => {
    await render(
      <Hint testID="h" tone="info" emphasis="soft" hintColors={{ background: "#312E81" }}>
        Body
      </Hint>
    );
    expect(screen.getByTestId("h").props.backgroundColor).toBe("#312E81");
  });

  it("per-instance override on one hint does NOT leak to a sibling hint", async () => {
    await render(
      <>
        <Hint testID="h1" tone="info" hintColors={{ text: "#312E81" }}>
          Overridden
        </Hint>
        <Hint testID="h2" tone="danger">
          Default danger
        </Hint>
      </>
    );
    expect(screen.getByTestId("h1-body").props.color).toBe("#312E81");
    expect(screen.getByTestId("h2-body").props.color).toBe(LIGHT_HINT_COLORS.danger.text);
  });

  it("propagates provider palette overrides through useUIKit", async () => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: {
        hintColors: {
          ...LIGHT_HINT_COLORS,
          info: { text: "#0F172A", icon: "#1E293B", background: "#E2E8F0" },
        },
      },
    });
    await render(
      <Hint testID="h" tone="info">
        Body
      </Hint>
    );
    expect(screen.getByTestId("h-body").props.color).toBe("#0F172A");
  });

  it("uses the dark palette when the provider swaps activeTheme", async () => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "dark",
      tokens: { hintColors: DARK_HINT_COLORS },
    });
    await render(
      <Hint testID="h" tone="danger" emphasis="soft">
        Body
      </Hint>
    );
    expect(screen.getByTestId("h").props.backgroundColor).toBe(DARK_HINT_COLORS.danger.background);
    expect(screen.getByTestId("h-body").props.color).toBe(DARK_HINT_COLORS.danger.text);
  });

  it("sets accessibilityRole='text' on the root", async () => {
    await render(<Hint testID="h">Body</Hint>);
    expect(screen.getByTestId("h").props.accessibilityRole).toBe("text");
  });

  it.each([
    ["neutral", "none"],
    ["info", "none"],
    ["success", "none"],
    ["warning", "polite"],
    ["danger", "polite"],
  ] as const)("wires accessibilityLiveRegion='%s' → '%s'", async (tone, expected) => {
    await render(
      <Hint testID="h" tone={tone}>
        Body
      </Hint>
    );
    expect(screen.getByTestId("h").props.accessibilityLiveRegion).toBe(expected);
  });

  it("dense mode passes the tighter spacing tokens", async () => {
    await render(
      <Hint testID="h" dense>
        Body
      </Hint>
    );
    const node = screen.getByTestId("h");
    expect(node.props.paddingHorizontal).toBe("$uiSpacingSm");
    expect(node.props.paddingVertical).toBe("$uiSpacingXs");
    expect(node.props.gap).toBe("$uiSpacingXs");
  });

  it("non-dense (default) leaves the styled defaults in place", async () => {
    await render(<Hint testID="h">Body</Hint>);
    const node = screen.getByTestId("h");
    expect(node.props.paddingHorizontal).toBeUndefined();
    expect(node.props.paddingVertical).toBeUndefined();
    expect(node.props.gap).toBeUndefined();
  });

  it("flows extra XStack props through the spread", async () => {
    await render(
      <Hint testID="h" borderRadius={4} padding={20}>
        Body
      </Hint>
    );
    const node = screen.getByTestId("h");
    expect(node.props.borderRadius).toBe(4);
    expect(node.props.padding).toBe(20);
  });

  describe("compound shortcuts", () => {
    it.each(["Info", "Success", "Warning", "Danger"] as const)(
      "Hint.%s picks the corresponding tone",
      async (shortcut) => {
        const Shortcut = Hint[shortcut];
        await render(<Shortcut testID="h">Body</Shortcut>);
        const expected = LIGHT_HINT_COLORS[shortcut.toLowerCase() as keyof HintColors];
        expect(screen.getByTestId("h-body").props.color).toBe(expected.text);
      }
    );
  });

  describe("snapshots", () => {
    it.each(["neutral", "info", "success", "warning", "danger"] as const)(
      "%s tone × ghost emphasis",
      async (tone) => {
        await render(
          <Hint tone={tone} icon={<Text>i</Text>} title="Heads up">
            Body copy for the hint
          </Hint>
        );
        expect(screen.toJSON()).toMatchSnapshot();
      }
    );

    it("warning tone × soft emphasis", async () => {
      await render(
        <Hint tone="warning" emphasis="soft" icon={<Text>!</Text>}>
          You are approaching your limit
        </Hint>
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("dark palette × info × soft", async () => {
      mockUseUIKit.mockReturnValue({
        activeTheme: "dark",
        tokens: { hintColors: DARK_HINT_COLORS },
      });
      await render(
        <Hint tone="info" emphasis="soft" title="Note">
          Body copy in dark mode
        </Hint>
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });
  });
});
