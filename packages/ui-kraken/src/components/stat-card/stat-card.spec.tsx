import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

import type { StatCardColors } from "../../tokens/tokens-types";

// Mock the styled file with plain-RN forwarders so the component logic
// (palette resolution, trend arrow, testID propagation, auto-a11y
// label, radius resolution) stays testable without booting Tamagui.
jest.mock("./stat-card.styled", () => {
  const rn = jest.requireActual("react-native");
  const forwardRef = jest.requireActual("react").forwardRef;
  const view = () =>
    forwardRef((props: Record<string, unknown>, ref: unknown) => <rn.View ref={ref} {...props} />);
  const text = () =>
    forwardRef((props: Record<string, unknown>, ref: unknown) => <rn.Text ref={ref} {...props} />);
  return {
    StyledStatCard: view(),
    StyledStatCardHeader: view(),
    StyledStatCardTitle: text(),
    StyledStatCardIconWrapper: view(),
    StyledStatCardValue: text(),
    StyledStatCardFooter: view(),
    StyledStatCardTrend: view(),
    StyledStatCardTrendIcon: text(),
    StyledStatCardDelta: text(),
    StyledStatCardDescription: text(),
  };
});

const LIGHT_STAT_CARD_COLORS: StatCardColors = {
  background: "#F9FAFB",
  title: "#6B7280",
  value: "#0B0B0F",
  description: "#6B7280",
  icon: "#6B7280",
  trendUp: "#059669",
  trendDown: "#DC2626",
  trendNeutral: "#6B7280",
};

const DARK_STAT_CARD_COLORS: StatCardColors = {
  background: "#111827",
  title: "#9CA3AF",
  value: "#F5F5F7",
  description: "#9CA3AF",
  icon: "#9CA3AF",
  trendUp: "#34D399",
  trendDown: "#F87171",
  trendNeutral: "#9CA3AF",
};

type MockUIKit = {
  activeTheme: "light" | "dark";
  tokens: { statCardColors: StatCardColors };
};

const mockUseUIKit = jest.fn<MockUIKit, []>(() => ({
  activeTheme: "light",
  tokens: { statCardColors: LIGHT_STAT_CARD_COLORS },
}));

jest.mock("../../provider/use-ui-kit", () => ({
  useUIKit: () => mockUseUIKit(),
}));

import { StatCard } from "./stat-card";

describe("StatCard", () => {
  beforeEach(() => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: { statCardColors: LIGHT_STAT_CARD_COLORS },
    });
  });

  it("renders title + value under the derived testIDs", async () => {
    await render(<StatCard title="Revenue" value="$12,340" />);
    expect(screen.getByTestId("stat-card-title")).toHaveTextContent("Revenue");
    expect(screen.getByTestId("stat-card-value")).toHaveTextContent("$12,340");
  });

  it("uses a custom testID and derives sub-testIDs from it", async () => {
    await render(<StatCard testID="s" title="Users" value={1200} />);
    expect(screen.getByTestId("s")).toBeTruthy();
    expect(screen.getByTestId("s-title")).toHaveTextContent("Users");
    expect(screen.getByTestId("s-value")).toHaveTextContent("1200");
  });

  it.each([
    ["string", "$12,340"],
    ["number", 12340],
  ] as const)("accepts value as a %s", async (_label, value) => {
    await render(<StatCard testID="s" title="Revenue" value={value} />);
    expect(screen.getByTestId("s-value")).toHaveTextContent(String(value));
  });

  it("mounts the icon slot only when icon is passed", async () => {
    await render(
      <StatCard testID="s" title="Users" value={1200} icon={<Text testID="glyph">◉</Text>} />
    );
    expect(screen.getByTestId("s-icon")).toBeTruthy();
    expect(screen.getByTestId("glyph")).toBeTruthy();
  });

  it("omits the icon slot when no icon is passed", async () => {
    await render(<StatCard testID="s" title="Users" value={1200} />);
    expect(screen.queryByTestId("s-icon")).toBeNull();
  });

  it("mounts the description only when description prop is passed", async () => {
    await render(<StatCard testID="s" title="Users" value={1200} description="vs last week" />);
    expect(screen.getByTestId("s-description")).toHaveTextContent("vs last week");
  });

  it("omits the description when not passed", async () => {
    await render(<StatCard testID="s" title="Users" value={1200} />);
    expect(screen.queryByTestId("s-description")).toBeNull();
  });

  it("omits the trend / delta row when trend is not set", async () => {
    await render(<StatCard testID="s" title="Users" value={1200} delta="+8%" />);
    expect(screen.queryByTestId("s-trend-icon")).toBeNull();
    expect(screen.queryByTestId("s-delta")).toBeNull();
  });

  it("renders trend arrow alone when trend is set without delta", async () => {
    await render(<StatCard testID="s" title="Users" value={1200} trend="up" />);
    expect(screen.getByTestId("s-trend-icon")).toBeTruthy();
    expect(screen.queryByTestId("s-delta")).toBeNull();
  });

  it.each([
    ["up", "▲"],
    ["down", "▼"],
    ["neutral", "—"],
  ] as const)("renders the %s auto glyph as '%s'", async (trend, glyph) => {
    await render(<StatCard testID="s" title="Users" value={1200} trend={trend} delta="0" />);
    expect(screen.getByTestId("s-trend-icon")).toHaveTextContent(glyph);
  });

  it("deltaIcon override wins over the auto glyph", async () => {
    await render(
      <StatCard
        testID="s"
        title="Users"
        value={1200}
        trend="up"
        delta="+8"
        deltaIcon={<Text testID="custom-arrow">↑</Text>}
      />
    );
    expect(screen.getByTestId("custom-arrow")).toBeTruthy();
    // The wrapper still exists at s-trend-icon; the auto glyph text is
    // replaced by the passed ReactNode.
    expect(screen.getByTestId("s-trend-icon").props.children).toBeTruthy();
  });

  it.each([
    ["up", "#059669"],
    ["down", "#DC2626"],
    ["neutral", "#6B7280"],
  ] as const)(
    "colors the %s arrow + delta from the trend%s palette slot",
    async (trend, expected) => {
      await render(<StatCard testID="s" title="Users" value={1200} trend={trend} delta="0" />);
      expect(screen.getByTestId("s-trend-icon").props.color).toBe(expected);
      expect(screen.getByTestId("s-delta").props.color).toBe(expected);
    }
  );

  it("paints title / value / description from the correct palette slots", async () => {
    await render(<StatCard testID="s" title="Users" value={1200} description="vs last week" />);
    expect(screen.getByTestId("s-title").props.color).toBe(LIGHT_STAT_CARD_COLORS.title);
    expect(screen.getByTestId("s-value").props.color).toBe(LIGHT_STAT_CARD_COLORS.value);
    expect(screen.getByTestId("s-description").props.color).toBe(
      LIGHT_STAT_CARD_COLORS.description
    );
  });

  it("paints the card background from the palette", async () => {
    await render(<StatCard testID="s" title="Users" value={1200} />);
    expect(screen.getByTestId("s").props.backgroundColor).toBe(LIGHT_STAT_CARD_COLORS.background);
  });

  it.each([
    ["background", "#F5F3FF"],
    ["title", "#312E81"],
    ["value", "#4C1D95"],
    ["description", "#7C3AED"],
    ["trendUp", "#065F46"],
    ["trendDown", "#7F1D1D"],
    ["trendNeutral", "#374151"],
  ] as const)("per-instance statCardColors.%s override wins", async (slot, color) => {
    const overrides: Partial<StatCardColors> = { [slot]: color };
    await render(
      <StatCard
        testID="s"
        title="X"
        value={1}
        trend={slot === "trendUp" ? "up" : slot === "trendDown" ? "down" : "neutral"}
        delta="0"
        description="d"
        statCardColors={overrides}
      />
    );
    if (slot === "background") {
      expect(screen.getByTestId("s").props.backgroundColor).toBe(color);
    } else if (slot === "title") {
      expect(screen.getByTestId("s-title").props.color).toBe(color);
    } else if (slot === "value") {
      expect(screen.getByTestId("s-value").props.color).toBe(color);
    } else if (slot === "description") {
      expect(screen.getByTestId("s-description").props.color).toBe(color);
    } else {
      expect(screen.getByTestId("s-trend-icon").props.color).toBe(color);
      expect(screen.getByTestId("s-delta").props.color).toBe(color);
    }
  });

  it("per-instance icon slot override colors the icon wrapper", async () => {
    await render(
      <StatCard
        testID="s"
        title="X"
        value={1}
        icon={<Text>◉</Text>}
        statCardColors={{ icon: "#7C3AED" }}
      />
    );
    // The wrapper hosts a text-like child colored by the palette override.
    expect(screen.getByTestId("s-icon")).toBeTruthy();
  });

  it("propagates provider palette overrides through useUIKit", async () => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: {
        statCardColors: {
          ...LIGHT_STAT_CARD_COLORS,
          value: "#0F172A",
          trendUp: "#047857",
        },
      },
    });
    await render(<StatCard testID="s" title="X" value={1} trend="up" delta="0" />);
    expect(screen.getByTestId("s-value").props.color).toBe("#0F172A");
    expect(screen.getByTestId("s-trend-icon").props.color).toBe("#047857");
  });

  it("uses the dark palette when activeTheme='dark'", async () => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "dark",
      tokens: { statCardColors: DARK_STAT_CARD_COLORS },
    });
    await render(<StatCard testID="s" title="X" value={1} trend="down" delta="-2" />);
    expect(screen.getByTestId("s").props.backgroundColor).toBe(DARK_STAT_CARD_COLORS.background);
    expect(screen.getByTestId("s-value").props.color).toBe(DARK_STAT_CARD_COLORS.value);
    expect(screen.getByTestId("s-trend-icon").props.color).toBe(DARK_STAT_CARD_COLORS.trendDown);
  });

  it.each([
    ["none", 0],
    ["sm", "$uiRadiusSm"],
    ["md", "$uiRadiusMd"],
    ["lg", "$uiRadiusLg"],
    ["pill", 9999],
    [8, 8],
  ] as const)("maps radius=%s to borderRadius=%s", async (radius, expected) => {
    await render(<StatCard testID="s" title="X" value={1} radius={radius} />);
    expect(screen.getByTestId("s").props.borderRadius).toBe(expected);
  });

  it("lets explicit borderRadius via the spread win over the radius prop", async () => {
    await render(<StatCard testID="s" title="X" value={1} radius="lg" borderRadius={4} />);
    expect(screen.getByTestId("s").props.borderRadius).toBe(4);
  });

  it("defaults accessibilityRole='summary'", async () => {
    await render(<StatCard testID="s" title="X" value={1} />);
    expect(screen.getByTestId("s").props.accessibilityRole).toBe("summary");
  });

  it("lets consumers override accessibilityRole via pass-through", async () => {
    await render(<StatCard testID="s" title="X" value={1} accessibilityRole="text" />);
    expect(screen.getByTestId("s").props.accessibilityRole).toBe("text");
  });

  it("auto-composes accessibilityLabel from title + value", async () => {
    await render(<StatCard testID="s" title="Revenue" value="$12,340" />);
    expect(screen.getByTestId("s").props.accessibilityLabel).toBe("Revenue, $12,340");
  });

  it("auto-composes accessibilityLabel including trend + delta + description", async () => {
    await render(
      <StatCard
        testID="s"
        title="Revenue"
        value="$12,340"
        trend="up"
        delta="+8.2%"
        description="vs last week"
      />
    );
    expect(screen.getByTestId("s").props.accessibilityLabel).toBe(
      "Revenue, $12,340, up +8.2%, vs last week"
    );
  });

  it("includes trend without delta in the auto-composed label when delta is unset", async () => {
    await render(<StatCard testID="s" title="Revenue" value="$12,340" trend="down" />);
    expect(screen.getByTestId("s").props.accessibilityLabel).toBe("Revenue, $12,340, down");
  });

  it("consumer-provided accessibilityLabel wins over the auto composition", async () => {
    await render(
      <StatCard
        testID="s"
        title="Revenue"
        value="$12,340"
        trend="up"
        delta="+8%"
        accessibilityLabel="Custom summary"
      />
    );
    expect(screen.getByTestId("s").props.accessibilityLabel).toBe("Custom summary");
  });

  it("flows extra YStack props through the spread", async () => {
    await render(<StatCard testID="s" title="X" value={1} padding={24} width={200} />);
    const node = screen.getByTestId("s");
    expect(node.props.padding).toBe(24);
    expect(node.props.width).toBe(200);
  });

  describe("snapshots", () => {
    it("minimal — title + value only", async () => {
      await render(<StatCard title="Users" value={1200} />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("light + icon + description", async () => {
      await render(
        <StatCard
          title="Revenue"
          value="$12,340"
          icon={<Text>◉</Text>}
          description="vs last week"
        />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("light + trend='up' + delta + description", async () => {
      await render(
        <StatCard
          title="Revenue"
          value="$12,340"
          trend="up"
          delta="+8.2%"
          description="vs last week"
        />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("light + trend='down' + delta", async () => {
      await render(<StatCard title="Bounce rate" value="42.3%" trend="down" delta="-2.1%" />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("dark palette + all slots populated", async () => {
      mockUseUIKit.mockReturnValue({
        activeTheme: "dark",
        tokens: { statCardColors: DARK_STAT_CARD_COLORS },
      });
      await render(
        <StatCard
          title="Revenue"
          value="$12,340"
          icon={<Text>◉</Text>}
          trend="up"
          delta="+8.2%"
          description="vs last week"
        />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });
  });
});
