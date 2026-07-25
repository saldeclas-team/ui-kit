import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

import type { AlertColors } from "../../tokens/tokens-types";

// Mock the styled file the same way Button + Text do. The stubs forward
// every prop to plain RN primitives so the component logic (variant
// resolution, palette derivation, testID propagation, compound export,
// a11y role) stays testable without booting Tamagui.
jest.mock("./alert.styled", () => {
  const rn = jest.requireActual("react-native");
  const forwardRef = jest.requireActual("react").forwardRef;
  const StyledAlert = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.View ref={ref} {...props} />
  ));
  const StyledAlertIconWrapper = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.View ref={ref} {...props} />
  ));
  const StyledAlertContent = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.View ref={ref} {...props} />
  ));
  const StyledAlertTitle = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.Text ref={ref} {...props} />
  ));
  const StyledAlertBody = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.Text ref={ref} {...props} />
  ));
  return {
    StyledAlert,
    StyledAlertIconWrapper,
    StyledAlertContent,
    StyledAlertTitle,
    StyledAlertBody,
  };
});

// Mock useUIKit so Alert can run without a UIKitProvider wrapper in
// tests. The mocked alertColors match DEFAULT_LIGHT_ALERT_COLORS so slot
// resolution asserts against a known palette.
const LIGHT_ALERT_COLORS: AlertColors = {
  info: { background: "#EFF6FF", text: "#0284C7", icon: "#0284C7" },
  success: { background: "#F0FDF4", text: "#059669", icon: "#059669" },
  warning: { background: "#FFFBEB", text: "#D97706", icon: "#D97706" },
  danger: { background: "#FEF2F2", text: "#DC2626", icon: "#DC2626" },
};

const DARK_ALERT_COLORS: AlertColors = {
  info: { background: "#0C4A6E33", text: "#38BDF8", icon: "#38BDF8" },
  success: { background: "#064E3B33", text: "#34D399", icon: "#34D399" },
  warning: { background: "#78350F33", text: "#FBBF24", icon: "#FBBF24" },
  danger: { background: "#7F1D1D33", text: "#F87171", icon: "#F87171" },
};

type MockUIKit = {
  activeTheme: "light" | "dark";
  tokens: {
    alertColors: AlertColors;
  };
};
const mockUseUIKit = jest.fn<MockUIKit, []>(() => ({
  activeTheme: "light",
  tokens: { alertColors: LIGHT_ALERT_COLORS },
}));
jest.mock("../../provider/use-ui-kit", () => ({
  useUIKit: () => mockUseUIKit(),
}));

import { Alert } from "./alert";

describe("Alert", () => {
  beforeEach(() => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: { alertColors: LIGHT_ALERT_COLORS },
    });
  });

  it("renders the body children under the derived body testID", async () => {
    await render(<Alert testID="a">Body text</Alert>);
    const body = screen.getByTestId("a-body");
    expect(body.props.children).toBe("Body text");
  });

  it("renders the title when provided", async () => {
    await render(
      <Alert testID="a" title="Heads up">
        Body
      </Alert>
    );
    expect(screen.getByTestId("a-title").props.children).toBe("Heads up");
  });

  it("omits the title element when title is not provided", async () => {
    await render(<Alert testID="b">Body only</Alert>);
    expect(screen.queryByTestId("b-title")).toBeNull();
  });

  it.each([
    ["info", "#0284C7"],
    ["success", "#059669"],
    ["warning", "#D97706"],
    ["danger", "#DC2626"],
  ] as const)("variant=%s pulls text color from alertColors[%s]", async (variant, expected) => {
    await render(
      <Alert testID={variant} variant={variant}>
        x
      </Alert>
    );
    expect(screen.getByTestId(`${variant}-body`).props.color).toBe(expected);
  });

  it.each([
    ["info", "#EFF6FF"],
    ["success", "#F0FDF4"],
    ["warning", "#FFFBEB"],
    ["danger", "#FEF2F2"],
  ] as const)(
    "variant=%s pulls background color from alertColors[%s]",
    async (variant, expected) => {
      await render(
        <Alert testID={variant} variant={variant}>
          x
        </Alert>
      );
      expect(screen.getByTestId(variant).props.backgroundColor).toBe(expected);
    }
  );

  it.each([
    ["Info", "#0284C7"],
    ["Success", "#059669"],
    ["Warning", "#D97706"],
    ["Danger", "#DC2626"],
  ] as const)("compound Alert.%s renders with correct text color", async (key, expected) => {
    const Component = Alert[key];
    await render(<Component testID={`c-${key}`}>x</Component>);
    expect(screen.getByTestId(`c-${key}-body`).props.color).toBe(expected);
  });

  it("renders the icon slot when provided", async () => {
    await render(
      <Alert testID="with" icon={<Text testID="my-icon">i</Text>}>
        Body
      </Alert>
    );
    expect(screen.getByTestId("with-icon")).toBeTruthy();
    expect(screen.getByTestId("my-icon")).toBeTruthy();
  });

  it("omits the icon wrapper when icon is not provided", async () => {
    await render(<Alert testID="without">Body</Alert>);
    expect(screen.queryByTestId("without-icon")).toBeNull();
  });

  it("resolves radius='pill' to 9999", async () => {
    await render(
      <Alert testID="a" radius="pill">
        x
      </Alert>
    );
    expect(screen.getByTestId("a").props.borderRadius).toBe(9999);
  });

  it("resolves radius='none' to 0", async () => {
    await render(
      <Alert testID="a" radius="none">
        x
      </Alert>
    );
    expect(screen.getByTestId("a").props.borderRadius).toBe(0);
  });

  it("resolves preset radius names to theme tokens", async () => {
    await render(
      <Alert testID="a" radius="lg">
        x
      </Alert>
    );
    expect(screen.getByTestId("a").props.borderRadius).toBe("$uiRadiusLg");
  });

  it("passes a numeric radius through unchanged", async () => {
    await render(
      <Alert testID="a" radius={20}>
        x
      </Alert>
    );
    expect(screen.getByTestId("a").props.borderRadius).toBe(20);
  });

  it("applies per-instance alertColors override across all 4 slots", async () => {
    await render(
      <Alert
        testID="a"
        alertColors={{
          background: "#FFEEDD",
          border: "#123456",
          text: "#000000",
          icon: "#FF0000",
        }}
        icon={<Text testID="icon">i</Text>}
        title="T"
      >
        Body
      </Alert>
    );
    const root = screen.getByTestId("a");
    expect(root.props.backgroundColor).toBe("#FFEEDD");
    expect(root.props.borderColor).toBe("#123456");
    expect(root.props.borderWidth).toBe(1);
    expect(screen.getByTestId("a-title").props.color).toBe("#000000");
    expect(screen.getByTestId("a-body").props.color).toBe("#000000");
  });

  it("provider-level alertColors override propagates through useUIKit", async () => {
    // Consumer paints their brand: a re-themed danger variant.
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: {
        alertColors: {
          ...LIGHT_ALERT_COLORS,
          danger: { background: "#4A0000", text: "#FFFFFF", icon: "#FFFFFF", border: "#FCA5A5" },
        },
      },
    });
    await render(
      <Alert.Danger testID="branded" title="Payment failed">
        Update your card.
      </Alert.Danger>
    );
    const root = screen.getByTestId("branded");
    expect(root.props.backgroundColor).toBe("#4A0000");
    expect(root.props.borderColor).toBe("#FCA5A5");
    expect(root.props.borderWidth).toBe(1);
    expect(screen.getByTestId("branded-body").props.color).toBe("#FFFFFF");
  });

  it.each(["info", "success", "warning"] as const)(
    "variant=%s sets accessibilityRole=alert + accessibilityLiveRegion=polite",
    async (variant) => {
      await render(
        <Alert testID={variant} variant={variant}>
          x
        </Alert>
      );
      const el = screen.getByTestId(variant);
      expect(el.props.accessibilityRole).toBe("alert");
      expect(el.props.accessibilityLiveRegion).toBe("polite");
    }
  );

  it("variant=danger sets accessibilityRole=alert + accessibilityLiveRegion=assertive", async () => {
    await render(
      <Alert testID="danger" variant="danger">
        x
      </Alert>
    );
    const danger = screen.getByTestId("danger");
    expect(danger.props.accessibilityRole).toBe("alert");
    expect(danger.props.accessibilityLiveRegion).toBe("assertive");
  });

  // Structural snapshots — serialize the rendered RN tree and diff on
  // any structural / prop / inline-style change. Complements the
  // targeted assertions above by catching regressions the specific
  // asserts miss.
  //
  // Intentional snapshot changes: `pnpm --filter ui-kraken test -- -u`,
  // review the .snap diff carefully, commit both.
  describe("snapshots", () => {
    // --- Variants × default title + body (4) ---
    it.each(["info", "success", "warning", "danger"] as const)(
      "variant=%s with title + body",
      async (variant) => {
        await render(
          <Alert variant={variant} title="Title">
            Body content
          </Alert>
        );
        expect(screen.toJSON()).toMatchSnapshot();
      }
    );

    // --- Title vs body-only (2) ---
    it("body only, no title", async () => {
      await render(<Alert>Just body text.</Alert>);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("title + body", async () => {
      await render(<Alert title="A title">A body.</Alert>);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    // --- With / without icon slot (2) ---
    it("with icon slot", async () => {
      await render(<Alert icon={<Text>i</Text>}>Body with icon</Alert>);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("without icon slot", async () => {
      await render(<Alert>Body no icon</Alert>);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    // --- Radius presets + raw number (6) ---
    it.each(["none", "sm", "md", "lg", "pill"] as const)("radius=%s", async (radius) => {
      await render(<Alert radius={radius}>Radius {radius}</Alert>);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("radius=24 (raw px)", async () => {
      await render(<Alert radius={24}>Radius 24</Alert>);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    // --- Dark theme × each variant (4) ---
    it.each(["info", "success", "warning", "danger"] as const)(
      "variant=%s in dark theme",
      async (variant) => {
        mockUseUIKit.mockReturnValue({
          activeTheme: "dark",
          tokens: { alertColors: DARK_ALERT_COLORS },
        });
        await render(
          <Alert variant={variant} title="Dark">
            Body
          </Alert>
        );
        expect(screen.toJSON()).toMatchSnapshot();
      }
    );

    // --- Per-instance alertColors override (1) ---
    it("alertColors override: all 4 slots set", async () => {
      await render(
        <Alert
          variant="danger"
          title="Override"
          alertColors={{
            background: "#4A0000",
            border: "#FFFFFF",
            text: "#FFFFFF",
            icon: "#FFFFFF",
          }}
          icon={<Text>i</Text>}
        >
          Custom paint
        </Alert>
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });
  });
});
