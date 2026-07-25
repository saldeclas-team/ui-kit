import { fireEvent, render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

import type { SocialButtonColors } from "../../tokens/tokens-types";

// Mock the styled file with plain-RN stubs. Root forwards to
// `rn.Pressable` (not `rn.View`) so `disabled` is a real prop and
// RTL cleanup between tests stays clean — same gotcha we hit on
// MultiSelect. Sub-elements are plain View / Text.
jest.mock("./social-button.styled", () => {
  const rn = jest.requireActual("react-native");
  const forwardRef = jest.requireActual("react").forwardRef;
  const pressable = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.Pressable ref={ref} {...props} />
  ));
  const view = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.View ref={ref} {...props} />
  ));
  const text = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.Text ref={ref} {...props} />
  ));
  return {
    StyledSocialButton: pressable,
    StyledSocialButtonIconWrapper: view,
    StyledSocialButtonLabel: text,
  };
});

const LIGHT_SOCIAL_BUTTON_COLORS: SocialButtonColors = {
  google: { background: "#FFFFFF", label: "#1F1F1F", border: "#DADCE0" },
  apple: { background: "#000000", label: "#FFFFFF", border: "#000000" },
  facebook: { background: "#1877F2", label: "#FFFFFF", border: "#1877F2" },
  github: { background: "#24292F", label: "#FFFFFF", border: "#24292F" },
  microsoft: { background: "#FFFFFF", label: "#5E5E5E", border: "#8C8C8C" },
  generic: { background: "#F3F4F6", label: "#111827", border: "#D1D5DB" },
};

const DARK_SOCIAL_BUTTON_COLORS: SocialButtonColors = {
  google: { background: "#1F1F1F", label: "#F5F5F7", border: "#3C4043" },
  apple: { background: "#FFFFFF", label: "#000000", border: "#FFFFFF" },
  facebook: { background: "#1877F2", label: "#FFFFFF", border: "#1877F2" },
  github: { background: "#F5F5F7", label: "#0B0B0F", border: "#F5F5F7" },
  microsoft: { background: "#1F1F1F", label: "#F5F5F7", border: "#3C4043" },
  generic: { background: "#1F2937", label: "#F5F5F7", border: "#374151" },
};

type MockUIKit = {
  activeTheme: "light" | "dark";
  tokens: { socialButtonColors: SocialButtonColors };
};

const mockUseUIKit = jest.fn<MockUIKit, []>(() => ({
  activeTheme: "light",
  tokens: { socialButtonColors: LIGHT_SOCIAL_BUTTON_COLORS },
}));

jest.mock("../../provider/use-ui-kit", () => ({
  useUIKit: () => mockUseUIKit(),
}));

import { SocialButton } from "./social-button";

describe("SocialButton", () => {
  beforeEach(() => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: { socialButtonColors: LIGHT_SOCIAL_BUTTON_COLORS },
    });
  });

  it("renders label under the derived testID", async () => {
    await render(<SocialButton provider="google" label="Continue with Google" />);
    expect(screen.getByTestId("social-button-label")).toHaveTextContent("Continue with Google");
  });

  it("uses a custom testID and derives sub-testIDs from it", async () => {
    await render(<SocialButton provider="google" label="X" testID="sb" />);
    expect(screen.getByTestId("sb")).toBeTruthy();
    expect(screen.getByTestId("sb-label")).toHaveTextContent("X");
  });

  it("mounts the icon slot when icon is passed and not loading", async () => {
    await render(
      <SocialButton provider="google" label="X" testID="sb" icon={<Text testID="glyph">G</Text>} />
    );
    expect(screen.getByTestId("sb-icon")).toBeTruthy();
    expect(screen.getByTestId("glyph")).toBeTruthy();
    expect(screen.queryByTestId("sb-loader")).toBeNull();
  });

  it("omits the icon slot when no icon is passed", async () => {
    await render(<SocialButton provider="google" label="X" testID="sb" />);
    expect(screen.queryByTestId("sb-icon")).toBeNull();
  });

  it("mounts the loader (and hides the icon) when loading", async () => {
    await render(
      <SocialButton
        provider="google"
        label="X"
        testID="sb"
        icon={<Text testID="glyph">G</Text>}
        loading
      />
    );
    expect(screen.getByTestId("sb-loader")).toBeTruthy();
    expect(screen.queryByTestId("sb-icon")).toBeNull();
    expect(screen.queryByTestId("glyph")).toBeNull();
  });

  it("fires onPress when tapped and not disabled/loading", async () => {
    const onPress = jest.fn();
    await render(<SocialButton provider="google" label="X" testID="sb" onPress={onPress} />);
    fireEvent.press(screen.getByTestId("sb"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not fire onPress when disabled", async () => {
    const onPress = jest.fn();
    await render(
      <SocialButton provider="google" label="X" testID="sb" onPress={onPress} disabled />
    );
    fireEvent.press(screen.getByTestId("sb"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("does not fire onPress when loading", async () => {
    const onPress = jest.fn();
    await render(
      <SocialButton provider="google" label="X" testID="sb" onPress={onPress} loading />
    );
    fireEvent.press(screen.getByTestId("sb"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it.each([
    ["google", "#FFFFFF", "#1F1F1F", "#DADCE0"],
    ["apple", "#000000", "#FFFFFF", "#000000"],
    ["facebook", "#1877F2", "#FFFFFF", "#1877F2"],
    ["github", "#24292F", "#FFFFFF", "#24292F"],
    ["microsoft", "#FFFFFF", "#5E5E5E", "#8C8C8C"],
    ["generic", "#F3F4F6", "#111827", "#D1D5DB"],
  ] as const)(
    "paints %s from its palette (bg=%s, label=%s, border=%s)",
    async (provider, bg, label, border) => {
      await render(<SocialButton provider={provider} label="X" testID="sb" />);
      const root = screen.getByTestId("sb");
      expect(root.props.backgroundColor).toBe(bg);
      expect(root.props.borderColor).toBe(border);
      expect(screen.getByTestId("sb-label").props.color).toBe(label);
    }
  );

  it.each([
    ["Google", "google", "#FFFFFF", "#1F1F1F"],
    ["Apple", "apple", "#000000", "#FFFFFF"],
    ["Facebook", "facebook", "#1877F2", "#FFFFFF"],
    ["Github", "github", "#24292F", "#FFFFFF"],
    ["Microsoft", "microsoft", "#FFFFFF", "#5E5E5E"],
    ["Generic", "generic", "#F3F4F6", "#111827"],
  ] as const)(
    "SocialButton.%s renders the %s provider",
    async (shortcut, _provider, expectedBg, expectedLabel) => {
      const Shortcut = SocialButton[shortcut];
      await render(<Shortcut label="X" testID="sb" />);
      expect(screen.getByTestId("sb").props.backgroundColor).toBe(expectedBg);
      expect(screen.getByTestId("sb-label").props.color).toBe(expectedLabel);
    }
  );

  it.each([
    ["background", "#0B0B0F"],
    ["label", "#F5F5F7"],
    ["border", "#374151"],
  ] as const)("per-instance socialButtonColors.%s override wins", async (slot, color) => {
    const override = { [slot]: color };
    await render(
      <SocialButton provider="google" label="X" testID="sb" socialButtonColors={override} />
    );
    const root = screen.getByTestId("sb");
    if (slot === "background") expect(root.props.backgroundColor).toBe(color);
    if (slot === "border") expect(root.props.borderColor).toBe(color);
    if (slot === "label") expect(screen.getByTestId("sb-label").props.color).toBe(color);
  });

  it("per-instance override on one button does NOT leak to a sibling", async () => {
    await render(
      <>
        <SocialButton
          provider="google"
          label="A"
          testID="a"
          socialButtonColors={{ background: "#0B0B0F" }}
        />
        <SocialButton provider="google" label="B" testID="b" />
      </>
    );
    expect(screen.getByTestId("a").props.backgroundColor).toBe("#0B0B0F");
    expect(screen.getByTestId("b").props.backgroundColor).toBe(
      LIGHT_SOCIAL_BUTTON_COLORS.google.background
    );
  });

  it("propagates provider palette overrides through useUIKit", async () => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: {
        socialButtonColors: {
          ...LIGHT_SOCIAL_BUTTON_COLORS,
          google: { background: "#7C3AED", label: "#FFFFFF", border: "#7C3AED" },
        },
      },
    });
    await render(<SocialButton provider="google" label="X" testID="sb" />);
    expect(screen.getByTestId("sb").props.backgroundColor).toBe("#7C3AED");
    expect(screen.getByTestId("sb-label").props.color).toBe("#FFFFFF");
  });

  it("uses the dark palette when activeTheme='dark'", async () => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "dark",
      tokens: { socialButtonColors: DARK_SOCIAL_BUTTON_COLORS },
    });
    await render(<SocialButton provider="google" label="X" testID="sb" />);
    expect(screen.getByTestId("sb").props.backgroundColor).toBe(
      DARK_SOCIAL_BUTTON_COLORS.google.background
    );
    expect(screen.getByTestId("sb-label").props.color).toBe(DARK_SOCIAL_BUTTON_COLORS.google.label);
  });

  it.each(["sm", "md", "lg"] as const)(
    "passes size='%s' to the styled root + label",
    async (size) => {
      await render(<SocialButton provider="google" label="X" testID="sb" size={size} />);
      expect(screen.getByTestId("sb").props.size).toBe(size);
      expect(screen.getByTestId("sb-label").props.size).toBe(size);
    }
  );

  it.each([
    ["none", 0],
    ["sm", "$uiRadiusSm"],
    ["md", "$uiRadiusMd"],
    ["lg", "$uiRadiusLg"],
    ["pill", 9999],
    [8, 8],
  ] as const)("maps radius=%s to borderRadius=%s", async (radius, expected) => {
    await render(<SocialButton provider="google" label="X" testID="sb" radius={radius} />);
    expect(screen.getByTestId("sb").props.borderRadius).toBe(expected);
  });

  it("sets accessibilityRole='button' by default and auto-composes accessibilityLabel from label", async () => {
    await render(<SocialButton provider="google" label="Continue with Google" testID="sb" />);
    const root = screen.getByTestId("sb");
    expect(root.props.accessibilityRole).toBe("button");
    expect(root.props.accessibilityLabel).toBe("Continue with Google");
  });

  it("consumer accessibilityLabel wins over the auto default", async () => {
    await render(
      <SocialButton
        provider="google"
        label="Continue with Google"
        testID="sb"
        accessibilityLabel="Sign in via Google account"
      />
    );
    expect(screen.getByTestId("sb").props.accessibilityLabel).toBe("Sign in via Google account");
  });

  it("accessibilityState reflects disabled + busy when loading", async () => {
    await render(<SocialButton provider="google" label="X" testID="sb" loading />);
    expect(screen.getByTestId("sb").props.accessibilityState).toEqual({
      disabled: true,
      busy: true,
    });
  });

  it("accessibilityState reflects disabled when explicitly disabled (not busy)", async () => {
    await render(<SocialButton provider="google" label="X" testID="sb" disabled />);
    expect(screen.getByTestId("sb").props.accessibilityState).toEqual({
      disabled: true,
      busy: false,
    });
  });

  it("accessibilityState is idle by default", async () => {
    await render(<SocialButton provider="google" label="X" testID="sb" />);
    expect(screen.getByTestId("sb").props.accessibilityState).toEqual({
      disabled: false,
      busy: false,
    });
  });

  it("consumer accessibilityState wins over the auto default", async () => {
    await render(
      <SocialButton
        provider="google"
        label="X"
        testID="sb"
        accessibilityState={{ selected: true, disabled: false, busy: false }}
      />
    );
    expect(screen.getByTestId("sb").props.accessibilityState).toEqual({
      selected: true,
      disabled: false,
      busy: false,
    });
  });

  it("flows extra XStack props through the spread", async () => {
    await render(<SocialButton provider="google" label="X" testID="sb" padding={24} width={280} />);
    const root = screen.getByTestId("sb");
    expect(root.props.padding).toBe(24);
    expect(root.props.width).toBe(280);
  });

  describe("snapshots", () => {
    it("google + md + light", async () => {
      await render(
        <SocialButton provider="google" label="Continue with Google" icon={<Text>G</Text>} />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("apple + md + light", async () => {
      await render(
        <SocialButton provider="apple" label="Sign in with Apple" icon={<Text>A</Text>} />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("facebook + lg + light", async () => {
      await render(
        <SocialButton
          provider="facebook"
          label="Continue with Facebook"
          icon={<Text>f</Text>}
          size="lg"
        />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("loading state (google)", async () => {
      await render(
        <SocialButton
          provider="google"
          label="Continue with Google"
          icon={<Text>G</Text>}
          loading
        />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("dark palette (google)", async () => {
      mockUseUIKit.mockReturnValue({
        activeTheme: "dark",
        tokens: { socialButtonColors: DARK_SOCIAL_BUTTON_COLORS },
      });
      await render(
        <SocialButton provider="google" label="Continue with Google" icon={<Text>G</Text>} />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });
  });
});
