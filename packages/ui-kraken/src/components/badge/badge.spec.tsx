import { render, screen } from "@testing-library/react-native";
import { createRef } from "react";
import type { View } from "react-native";

import type { BadgeColors } from "../../tokens/tokens-types";

// Mock tamagui YStack + Text so we can inspect resolved props
// without booting Tamagui.
jest.mock("tamagui", () => {
  const rn = jest.requireActual("react-native");
  const forwardRef = jest.requireActual("react").forwardRef;
  const box = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.View ref={ref} {...props} />
  ));
  const text = (props: Record<string, unknown>) => <rn.Text {...props} />;
  return { YStack: box, Text: text };
});

const LIGHT_BADGE_COLORS: BadgeColors = {
  neutral: { background: "#F3F4F6", text: "#374151" },
  primary: { background: "#DBEAFE", text: "#1E3A8A" },
  success: { background: "#DCFCE7", text: "#166534" },
  warning: { background: "#FEF3C7", text: "#92400E" },
  danger: { background: "#FEE2E2", text: "#991B1B" },
};

const DARK_BADGE_COLORS: BadgeColors = {
  neutral: { background: "#1F2937", text: "#D1D5DB" },
  primary: { background: "#1E3A8A", text: "#93C5FD" },
  success: { background: "#064E3B", text: "#6EE7B7" },
  warning: { background: "#78350F", text: "#FCD34D" },
  danger: { background: "#7F1D1D", text: "#FCA5A5" },
};

type MockUIKit = {
  activeTheme: "light" | "dark";
  tokens: { badgeColors: BadgeColors };
};
const mockUseUIKit = jest.fn<MockUIKit, []>(() => ({
  activeTheme: "light",
  tokens: { badgeColors: LIGHT_BADGE_COLORS },
}));
jest.mock("../../provider/use-ui-kit", () => ({
  useUIKit: () => mockUseUIKit(),
}));

import { Badge, formatCount, resolveContent } from "./badge";

describe("Badge component", () => {
  beforeEach(() => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: { badgeColors: LIGHT_BADGE_COLORS },
    });
  });

  describe("root testID + defaults", () => {
    it('defaults testID to "badge"', async () => {
      await render(<Badge>Beta</Badge>);
      expect(screen.getByTestId("badge")).toBeTruthy();
    });

    it("custom testID overrides + propagates to text sub-slot", async () => {
      await render(<Badge testID="b1">Beta</Badge>);
      expect(screen.getByTestId("b1")).toBeTruthy();
      expect(screen.getByTestId("b1-text")).toBeTruthy();
    });

    it('default tone="neutral" resolves to the neutral palette', async () => {
      await render(<Badge testID="b">Beta</Badge>);
      const root = screen.getByTestId("b");
      expect(root.props.backgroundColor).toBe("#F3F4F6");
      expect(screen.getByTestId("b-text").props.color).toBe("#374151");
    });

    it('default size="md" resolves to md dimensions', async () => {
      await render(<Badge testID="b">Beta</Badge>);
      const root = screen.getByTestId("b");
      expect(root.props.minHeight).toBe(20);
      expect(screen.getByTestId("b-text").props.fontSize).toBe(12);
    });
  });

  describe("tone palette resolution", () => {
    it.each([
      ["neutral", "#F3F4F6", "#374151"],
      ["primary", "#DBEAFE", "#1E3A8A"],
      ["success", "#DCFCE7", "#166534"],
      ["warning", "#FEF3C7", "#92400E"],
      ["danger", "#FEE2E2", "#991B1B"],
    ] as const)("tone=%s → bg=%s + text=%s", async (tone, bg, text) => {
      await render(
        <Badge testID={tone} tone={tone}>
          x
        </Badge>
      );
      expect(screen.getByTestId(tone).props.backgroundColor).toBe(bg);
      expect(screen.getByTestId(`${tone}-text`).props.color).toBe(text);
    });

    it("per-instance badgeColors override wins for the picked tone", async () => {
      await render(
        <Badge testID="b" tone="success" badgeColors={{ background: "#FF6B00", text: "#FFFFFF" }}>
          Done
        </Badge>
      );
      expect(screen.getByTestId("b").props.backgroundColor).toBe("#FF6B00");
      expect(screen.getByTestId("b-text").props.color).toBe("#FFFFFF");
    });

    it("provider-level badgeColors propagates through useUIKit", async () => {
      mockUseUIKit.mockReturnValue({
        activeTheme: "light",
        tokens: {
          badgeColors: {
            ...LIGHT_BADGE_COLORS,
            primary: { background: "#FFEEDD", text: "#3B0A00" },
          },
        },
      });
      await render(
        <Badge testID="branded" tone="primary">
          x
        </Badge>
      );
      expect(screen.getByTestId("branded").props.backgroundColor).toBe("#FFEEDD");
    });

    it("dark palette wins when provider swaps activeTheme", async () => {
      mockUseUIKit.mockReturnValue({
        activeTheme: "dark",
        tokens: { badgeColors: DARK_BADGE_COLORS },
      });
      await render(
        <Badge testID="dark" tone="success">
          x
        </Badge>
      );
      expect(screen.getByTestId("dark").props.backgroundColor).toBe("#064E3B");
    });
  });

  describe("size resolution", () => {
    it("size='sm' → fontSize=10, minHeight=16", async () => {
      await render(
        <Badge testID="b" size="sm">
          x
        </Badge>
      );
      expect(screen.getByTestId("b").props.minHeight).toBe(16);
      expect(screen.getByTestId("b-text").props.fontSize).toBe(10);
    });
  });

  describe("compound shortcuts", () => {
    it.each([
      ["Primary", "#DBEAFE"],
      ["Success", "#DCFCE7"],
      ["Warning", "#FEF3C7"],
      ["Danger", "#FEE2E2"],
    ] as const)("Badge.%s renders with matching tone bg (%s)", async (name, expected) => {
      const Component = Badge[name];
      await render(<Component testID={name.toLowerCase()}>x</Component>);
      expect(screen.getByTestId(name.toLowerCase()).props.backgroundColor).toBe(expected);
    });
  });

  describe("rendering modes", () => {
    it("text mode: children render in text sub-slot", async () => {
      await render(<Badge testID="b">Active</Badge>);
      expect(screen.getByTestId("b-text").props.children).toBe("Active");
    });

    it("count mode: numeric count formats as string", async () => {
      await render(<Badge testID="b" count={5} />);
      expect(screen.getByTestId("b-text").props.children).toBe("5");
    });

    it("count mode: 0 still renders '0' (does not auto-hide)", async () => {
      await render(<Badge testID="b" count={0} />);
      expect(screen.getByTestId("b-text").props.children).toBe("0");
    });

    it("count mode: count > maxCount → '99+' with default maxCount", async () => {
      await render(<Badge testID="b" count={120} />);
      expect(screen.getByTestId("b-text").props.children).toBe("99+");
    });

    it("count mode: custom maxCount is respected", async () => {
      await render(<Badge testID="b" count={12} maxCount={9} />);
      expect(screen.getByTestId("b-text").props.children).toBe("9+");
    });

    it("count mode wins over children", async () => {
      await render(
        <Badge testID="b" count={5}>
          IgnoredChildren
        </Badge>
      );
      expect(screen.getByTestId("b-text").props.children).toBe("5");
    });

    it("dot mode: renders as circle, no text sub-slot", async () => {
      await render(<Badge testID="b" dot />);
      const root = screen.getByTestId("b");
      expect(root.props.width).toBe(10); // md dot
      expect(root.props.height).toBe(10);
      expect(root.props.borderRadius).toBe(5);
      expect(screen.queryByTestId("b-text")).toBeNull();
    });

    it("dot mode: sm dot is 8px", async () => {
      await render(<Badge testID="b" dot size="sm" />);
      expect(screen.getByTestId("b").props.width).toBe(8);
    });

    it("dot mode wins over count + children", async () => {
      await render(
        <Badge testID="b" dot count={5}>
          Beta
        </Badge>
      );
      expect(screen.queryByTestId("b-text")).toBeNull();
      expect(screen.getByTestId("b").props.width).toBe(10);
    });
  });

  describe("a11y + ref", () => {
    it('defaults accessibilityRole to "text"', async () => {
      await render(<Badge testID="b">Active</Badge>);
      expect(screen.getByTestId("b").props.accessibilityRole).toBe("text");
    });

    it("text mode: accessibilityLabel defaults to the string children", async () => {
      await render(<Badge testID="b">Active</Badge>);
      expect(screen.getByTestId("b").props.accessibilityLabel).toBe("Active");
    });

    it("count mode: accessibilityLabel defaults to the formatted count string", async () => {
      await render(<Badge testID="b" count={5} />);
      expect(screen.getByTestId("b").props.accessibilityLabel).toBe("5");
    });

    it("non-string children fall back to 'Badge' label", async () => {
      await render(
        <Badge testID="b">
          <>fragment</>
        </Badge>
      );
      expect(screen.getByTestId("b").props.accessibilityLabel).toBe("Badge");
    });

    it('dot mode: accessibilityLabel defaults to "Indicator"', async () => {
      await render(<Badge testID="b" dot />);
      expect(screen.getByTestId("b").props.accessibilityLabel).toBe("Indicator");
    });

    it("consumer accessibilityLabel override wins", async () => {
      await render(
        <Badge testID="b" dot accessibilityLabel="3 unread">
          x
        </Badge>
      );
      expect(screen.getByTestId("b").props.accessibilityLabel).toBe("3 unread");
    });

    it("forwards ref to the root element (text mode)", async () => {
      const ref = createRef<View>();
      await render(
        <Badge ref={ref} testID="b">
          x
        </Badge>
      );
      expect(ref.current).not.toBeNull();
    });

    it("forwards ref to the root element (dot mode)", async () => {
      const ref = createRef<View>();
      await render(<Badge ref={ref} testID="b" dot />);
      expect(ref.current).not.toBeNull();
    });
  });

  describe("snapshots", () => {
    it("text 'Beta' md neutral", async () => {
      await render(<Badge>Beta</Badge>);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("count 5 md primary", async () => {
      await render(<Badge tone="primary" count={5} />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("count overflow 120→99+ sm danger", async () => {
      await render(<Badge tone="danger" size="sm" count={120} />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("dot mode md success", async () => {
      await render(<Badge dot tone="success" />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("dark theme × sm × warning", async () => {
      mockUseUIKit.mockReturnValue({
        activeTheme: "dark",
        tokens: { badgeColors: DARK_BADGE_COLORS },
      });
      await render(
        <Badge tone="warning" size="sm">
          Pending
        </Badge>
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });
  });
});

describe("formatCount — pure helper", () => {
  it("count <= maxCount → count as string", () => {
    expect(formatCount(0, 99)).toBe("0");
    expect(formatCount(5, 99)).toBe("5");
    expect(formatCount(99, 99)).toBe("99");
  });

  it("count > maxCount → '{maxCount}+'", () => {
    expect(formatCount(100, 99)).toBe("99+");
    expect(formatCount(12, 9)).toBe("9+");
  });
});

describe("resolveContent — pure helper", () => {
  it("dot=true → null (dot renders no content)", () => {
    expect(resolveContent(true, 5, 99, "text")).toBeNull();
  });

  it("count set → formatted count wins over children", () => {
    expect(resolveContent(false, 5, 99, "children")).toBe("5");
    expect(resolveContent(false, 120, 99, "children")).toBe("99+");
  });

  it("no dot, no count → children pass through", () => {
    expect(resolveContent(false, undefined, 99, "Beta")).toBe("Beta");
  });

  it("no dot, no count, no children → null", () => {
    expect(resolveContent(false, undefined, 99, undefined)).toBeNull();
  });
});
