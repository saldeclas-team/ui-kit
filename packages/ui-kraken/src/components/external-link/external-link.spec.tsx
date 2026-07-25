import { fireEvent, render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

import type { ExternalLinkColors } from "../../tokens/tokens-types";

// Mock the styled file with rn.View / rn.Text / rn.Pressable stubs so
// the component logic (palette resolution, testID propagation,
// hideTrailingIcon, onPress interception, a11y) stays testable
// without booting Tamagui. Root is `rn.Pressable` so `disabled`
// gates the tap correctly (same gotcha as MultiSelect / SocialButton
// / Collapsible).
jest.mock("./external-link.styled", () => {
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
    StyledExternalLink: pressable,
    StyledExternalLinkIconWrapper: view,
    StyledExternalLinkTrailingIconWrapper: view,
    StyledExternalLinkLabel: text,
  };
});

const mockOpenExternalUrl = jest.fn<Promise<void>, [string]>().mockResolvedValue(undefined);
jest.mock("./open-url", () => ({
  openExternalUrl: (url: string) => mockOpenExternalUrl(url),
}));

const LIGHT_EXTERNAL_LINK_COLORS: ExternalLinkColors = {
  label: "#2563EB",
  icon: "#2563EB",
};

const DARK_EXTERNAL_LINK_COLORS: ExternalLinkColors = {
  label: "#60A5FA",
  icon: "#60A5FA",
};

type MockUIKit = {
  activeTheme: "light" | "dark";
  tokens: { externalLinkColors: ExternalLinkColors };
};

const mockUseUIKit = jest.fn<MockUIKit, []>(() => ({
  activeTheme: "light",
  tokens: { externalLinkColors: LIGHT_EXTERNAL_LINK_COLORS },
}));

jest.mock("../../provider/use-ui-kit", () => ({
  useUIKit: () => mockUseUIKit(),
}));

import { ExternalLink } from "./external-link";

describe("ExternalLink", () => {
  beforeEach(() => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: { externalLinkColors: LIGHT_EXTERNAL_LINK_COLORS },
    });
    mockOpenExternalUrl.mockClear();
    mockOpenExternalUrl.mockResolvedValue(undefined);
  });

  it("renders string children under the label testID", async () => {
    await render(<ExternalLink url="https://x.com">Read more</ExternalLink>);
    expect(screen.getByTestId("external-link-label")).toHaveTextContent("Read more");
  });

  it("uses a custom testID and derives sub-testIDs from it", async () => {
    await render(
      <ExternalLink url="https://x.com" testID="el">
        Read more
      </ExternalLink>
    );
    expect(screen.getByTestId("el")).toBeTruthy();
    expect(screen.getByTestId("el-label")).toBeTruthy();
    expect(screen.getByTestId("el-trailing-icon")).toBeTruthy();
  });

  it("renders ReactNode children as-is (wrapped in the label tint container)", async () => {
    await render(
      <ExternalLink url="https://x.com" testID="el">
        <Text testID="custom">Custom label</Text>
      </ExternalLink>
    );
    expect(screen.getByTestId("el-label")).toBeTruthy();
    expect(screen.getByTestId("custom")).toBeTruthy();
  });

  it("trailing icon defaults to the ↗ auto glyph", async () => {
    await render(
      <ExternalLink url="https://x.com" testID="el">
        Read more
      </ExternalLink>
    );
    expect(screen.getByTestId("el-trailing-icon")).toHaveTextContent("↗");
  });

  it("trailingIcon prop override wins over the auto glyph", async () => {
    await render(
      <ExternalLink
        url="https://x.com"
        testID="el"
        trailingIcon={<Text testID="custom-arrow">→</Text>}
      >
        Read more
      </ExternalLink>
    );
    expect(screen.getByTestId("custom-arrow")).toBeTruthy();
    expect(screen.getByTestId("el-trailing-icon")).not.toHaveTextContent("↗");
  });

  it("hideTrailingIcon unmounts the trailing icon entirely (collapses to inline Text)", async () => {
    await render(
      <ExternalLink url="https://x.com" testID="el" hideTrailingIcon>
        Read more
      </ExternalLink>
    );
    // Inline mode collapses to a single <Text> root — trailing icon
    // wrapper doesn't exist and the -label sub-testID also collapses.
    expect(screen.queryByTestId("el-trailing-icon")).toBeNull();
    expect(screen.queryByTestId("el-label")).toBeNull();
    // The root Text carries the label content directly.
    expect(screen.getByTestId("el")).toHaveTextContent("Read more");
  });

  it("inline mode renders as a single <Text> with underline styling on the baseline", async () => {
    // When neither an icon nor a trailing arrow renders, ExternalLink
    // collapses to a plain `<Text onPress>` so it plays nice inside a
    // parent `<Text>` — RN's text-nesting only baselines <Text>
    // children; a <View> floats above the surrounding copy.
    await render(
      <ExternalLink url="https://x.com" testID="el" hideTrailingIcon>
        Read more
      </ExternalLink>
    );
    const root = screen.getByTestId("el");
    const styleArray = Array.isArray(root.props.style) ? root.props.style : [root.props.style];
    const merged = Object.assign({}, ...styleArray.filter(Boolean));
    expect(merged.textDecorationLine).toBe("underline");
    expect(merged.color).toBe(LIGHT_EXTERNAL_LINK_COLORS.label);
    expect(merged.textDecorationColor).toBe(LIGHT_EXTERNAL_LINK_COLORS.label);
  });

  it("inline mode tap fires openExternalUrl", async () => {
    await render(
      <ExternalLink url="https://example.com" testID="el" hideTrailingIcon>
        Inline
      </ExternalLink>
    );
    fireEvent.press(screen.getByTestId("el"));
    await Promise.resolve();
    expect(mockOpenExternalUrl).toHaveBeenCalledWith("https://example.com");
  });

  it("inline mode disabled unwires onPress and dims the label", async () => {
    await render(
      <ExternalLink url="https://x.com" testID="el" hideTrailingIcon disabled>
        Disabled inline
      </ExternalLink>
    );
    const root = screen.getByTestId("el");
    expect(root.props.onPress).toBeUndefined();
    const styleArray = Array.isArray(root.props.style) ? root.props.style : [root.props.style];
    const merged = Object.assign({}, ...styleArray.filter(Boolean));
    expect(merged.opacity).toBe(0.5);
  });

  it("inline mode is skipped when an icon prop is passed (XStack layout wins)", async () => {
    await render(
      <ExternalLink url="https://x.com" testID="el" hideTrailingIcon icon={<Text>i</Text>}>
        With icon
      </ExternalLink>
    );
    // Icon present → inline mode inactive → -label + -icon wrappers exist.
    expect(screen.getByTestId("el-icon")).toBeTruthy();
    expect(screen.getByTestId("el-label")).toBeTruthy();
  });

  it("icon slot mounts only when icon is passed", async () => {
    await render(
      <ExternalLink url="https://x.com" testID="el" icon={<Text testID="glyph">i</Text>}>
        Read more
      </ExternalLink>
    );
    expect(screen.getByTestId("el-icon")).toBeTruthy();
    expect(screen.getByTestId("glyph")).toBeTruthy();
  });

  it("omits the icon wrapper when no icon passed", async () => {
    await render(
      <ExternalLink url="https://x.com" testID="el">
        Read more
      </ExternalLink>
    );
    expect(screen.queryByTestId("el-icon")).toBeNull();
  });

  it("tapping fires openExternalUrl with the url", async () => {
    await render(
      <ExternalLink url="https://example.com/docs" testID="el">
        Docs
      </ExternalLink>
    );
    fireEvent.press(screen.getByTestId("el"));
    // The handler is async but fireEvent.press awaits microtasks.
    await Promise.resolve();
    expect(mockOpenExternalUrl).toHaveBeenCalledWith("https://example.com/docs");
  });

  it("onPress hook fires before the open when set", async () => {
    const onPress = jest.fn();
    await render(
      <ExternalLink url="https://x.com" testID="el" onPress={onPress}>
        Docs
      </ExternalLink>
    );
    fireEvent.press(screen.getByTestId("el"));
    await Promise.resolve();
    await Promise.resolve();
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(mockOpenExternalUrl).toHaveBeenCalled();
  });

  it("onPress hook returning false prevents the open", async () => {
    const onPress = jest.fn().mockReturnValue(false);
    await render(
      <ExternalLink url="https://x.com" testID="el" onPress={onPress}>
        Docs
      </ExternalLink>
    );
    fireEvent.press(screen.getByTestId("el"));
    await Promise.resolve();
    await Promise.resolve();
    expect(onPress).toHaveBeenCalled();
    expect(mockOpenExternalUrl).not.toHaveBeenCalled();
  });

  it("onPress hook that returns a Promise is awaited", async () => {
    const onPress = jest.fn().mockResolvedValue(false);
    await render(
      <ExternalLink url="https://x.com" testID="el" onPress={onPress}>
        Docs
      </ExternalLink>
    );
    fireEvent.press(screen.getByTestId("el"));
    await Promise.resolve();
    await Promise.resolve();
    expect(mockOpenExternalUrl).not.toHaveBeenCalled();
  });

  it("disabled prop suppresses the press", async () => {
    await render(
      <ExternalLink url="https://x.com" testID="el" disabled>
        Docs
      </ExternalLink>
    );
    fireEvent.press(screen.getByTestId("el"));
    await Promise.resolve();
    expect(mockOpenExternalUrl).not.toHaveBeenCalled();
  });

  it("label paints from the palette label slot with matching underline color", async () => {
    await render(
      <ExternalLink url="https://x.com" testID="el">
        Docs
      </ExternalLink>
    );
    const label = screen.getByTestId("el-label");
    expect(label.props.color).toBe(LIGHT_EXTERNAL_LINK_COLORS.label);
    expect(label.props.textDecorationColor).toBe(LIGHT_EXTERNAL_LINK_COLORS.label);
  });

  it("per-instance label override wins", async () => {
    await render(
      <ExternalLink url="https://x.com" testID="el" externalLinkColors={{ label: "#7C3AED" }}>
        Docs
      </ExternalLink>
    );
    expect(screen.getByTestId("el-label").props.color).toBe("#7C3AED");
  });

  it("per-instance icon override wins on the trailing arrow color", async () => {
    await render(
      <ExternalLink url="https://x.com" testID="el" externalLinkColors={{ icon: "#7C3AED" }}>
        Docs
      </ExternalLink>
    );
    // Trailing-icon wrapper contains a Text with the icon color inline.
    // Assert on the wrapper's text content color via the tree.
    const wrapper = screen.getByTestId("el-trailing-icon");
    const styleArray = Array.isArray(wrapper.props.children.props.style)
      ? wrapper.props.children.props.style
      : [wrapper.props.children.props.style];
    const merged = Object.assign({}, ...styleArray.filter(Boolean));
    expect(merged.color).toBe("#7C3AED");
  });

  it("propagates provider palette overrides through useUIKit", async () => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: { externalLinkColors: { label: "#7C3AED", icon: "#5B21B6" } },
    });
    await render(
      <ExternalLink url="https://x.com" testID="el">
        Docs
      </ExternalLink>
    );
    expect(screen.getByTestId("el-label").props.color).toBe("#7C3AED");
  });

  it("uses the dark palette when activeTheme='dark'", async () => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "dark",
      tokens: { externalLinkColors: DARK_EXTERNAL_LINK_COLORS },
    });
    await render(
      <ExternalLink url="https://x.com" testID="el">
        Docs
      </ExternalLink>
    );
    expect(screen.getByTestId("el-label").props.color).toBe(DARK_EXTERNAL_LINK_COLORS.label);
  });

  it("sets accessibilityRole='link' by default and auto-composes label from string children", async () => {
    await render(
      <ExternalLink url="https://x.com" testID="el">
        Read the docs
      </ExternalLink>
    );
    const root = screen.getByTestId("el");
    expect(root.props.accessibilityRole).toBe("link");
    expect(root.props.accessibilityLabel).toBe("Read the docs");
  });

  it("falls back to the url for the a11y label when children is a ReactNode", async () => {
    await render(
      <ExternalLink url="https://example.com/terms" testID="el">
        <Text>Custom</Text>
      </ExternalLink>
    );
    expect(screen.getByTestId("el").props.accessibilityLabel).toBe("https://example.com/terms");
  });

  it("consumer accessibilityLabel wins over the auto composition", async () => {
    await render(
      <ExternalLink url="https://x.com" testID="el" accessibilityLabel="External: privacy policy">
        Privacy
      </ExternalLink>
    );
    expect(screen.getByTestId("el").props.accessibilityLabel).toBe("External: privacy policy");
  });

  it("accessibilityState.disabled reflects the disabled prop", async () => {
    await render(
      <ExternalLink url="https://x.com" testID="el" disabled>
        Docs
      </ExternalLink>
    );
    expect(screen.getByTestId("el").props.accessibilityState).toEqual({ disabled: true });
  });

  it("accessibilityState.disabled is false when the link is enabled", async () => {
    await render(
      <ExternalLink url="https://x.com" testID="el">
        Docs
      </ExternalLink>
    );
    // Pressable normalizes accessibilityState to a full object with
    // every field defaulted; the component passes `undefined` when
    // enabled, which Pressable expands to `{ disabled: false, ...}`.
    expect(screen.getByTestId("el").props.accessibilityState?.disabled).toBe(false);
  });

  it("flows extra props through the spread", async () => {
    await render(
      <ExternalLink url="https://x.com" testID="el" padding={12} hitSlop={8}>
        Docs
      </ExternalLink>
    );
    const root = screen.getByTestId("el");
    expect(root.props.padding).toBe(12);
    expect(root.props.hitSlop).toBe(8);
  });

  describe("snapshots", () => {
    it("default light — string children + auto trailing icon", async () => {
      await render(<ExternalLink url="https://x.com">Read the docs</ExternalLink>);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("light + leading + custom trailing icon", async () => {
      await render(
        <ExternalLink url="https://x.com" icon={<Text>i</Text>} trailingIcon={<Text>→</Text>}>
          With icons
        </ExternalLink>
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("dark palette + disabled", async () => {
      mockUseUIKit.mockReturnValue({
        activeTheme: "dark",
        tokens: { externalLinkColors: DARK_EXTERNAL_LINK_COLORS },
      });
      await render(
        <ExternalLink url="https://x.com" disabled>
          Dark disabled
        </ExternalLink>
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });
  });
});
