import { act, render, screen } from "@testing-library/react-native";
import { createRef } from "react";
import type { View } from "react-native";

import type { AvatarColors } from "../../tokens/tokens-types";

// Mock tamagui YStack + Text so we can inspect resolved props
// without booting Tamagui.
jest.mock("tamagui", () => {
  const rn = jest.requireActual("react-native");
  const forwardRef = jest.requireActual("react").forwardRef;
  const box = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.View ref={ref} {...props} />
  ));
  const text = (props: Record<string, unknown>) => (
    // Use RN Text so children (initials) can be asserted via getByText.
    <rn.Text {...props} />
  );
  return { YStack: box, Text: text };
});

const LIGHT_AVATAR_COLORS: AvatarColors = { background: "#E5E7EB", text: "#374151" };
const DARK_AVATAR_COLORS: AvatarColors = { background: "#374151", text: "#F9FAFB" };

type MockUIKit = {
  activeTheme: "light" | "dark";
  tokens: { avatarColors: AvatarColors };
};
const mockUseUIKit = jest.fn<MockUIKit, []>(() => ({
  activeTheme: "light",
  tokens: { avatarColors: LIGHT_AVATAR_COLORS },
}));
jest.mock("../../provider/use-ui-kit", () => ({
  useUIKit: () => mockUseUIKit(),
}));

import { Avatar, computeInitials, resolveAvatarBorderRadius, resolveAvatarSize } from "./avatar";

const MOCK_SOURCE = { uri: "https://example.com/photo.jpg" };

describe("Avatar component", () => {
  beforeEach(() => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: { avatarColors: LIGHT_AVATAR_COLORS },
    });
  });

  describe("root testID + defaults", () => {
    it('defaults testID to "avatar"', async () => {
      await render(<Avatar name="A" />);
      expect(screen.getByTestId("avatar")).toBeTruthy();
    });

    it("custom testID overrides + propagates to initials sub-slot", async () => {
      await render(<Avatar testID="a1" name="Alexis Noriega" />);
      expect(screen.getByTestId("a1")).toBeTruthy();
      expect(screen.getByTestId("a1-initials")).toBeTruthy();
    });

    it("custom testID propagates to image sub-slot when source is set", async () => {
      await render(<Avatar testID="a1" source={MOCK_SOURCE} />);
      expect(screen.getByTestId("a1-image")).toBeTruthy();
    });

    it('default size="md" resolves to width/height=40', async () => {
      await render(<Avatar testID="a" name="A" />);
      const root = screen.getByTestId("a");
      expect(root.props.width).toBe(40);
      expect(root.props.height).toBe(40);
    });

    it('default shape="circle" resolves to borderRadius = size/2', async () => {
      await render(<Avatar testID="a" name="A" />);
      expect(screen.getByTestId("a").props.borderRadius).toBe(20);
    });
  });

  describe("rendering modes", () => {
    it("with source (no error) → renders Image, not initials", async () => {
      await render(<Avatar testID="a" source={MOCK_SOURCE} name="AN" />);
      expect(screen.getByTestId("a-image")).toBeTruthy();
      expect(screen.queryByTestId("a-initials")).toBeNull();
    });

    it("with source but image errors → falls back to initials", async () => {
      await render(<Avatar testID="a" source={MOCK_SOURCE} name="Alexis Noriega" />);
      // Trigger the image's onError handler directly. RN Testing
      // Library's fireEvent on RN Image doesn't propagate "error"
      // in jest-expo — invoking the prop is the reliable path.
      const image = screen.getByTestId("a-image");
      await act(async () => {
        image.props.onError();
      });
      expect(screen.queryByTestId("a-image")).toBeNull();
      expect(screen.getByTestId("a-initials").props.children).toBe("AN");
    });

    it("without source, with name → computed initials render", async () => {
      await render(<Avatar testID="a" name="Alexis Noriega" />);
      expect(screen.getByTestId("a-initials").props.children).toBe("AN");
    });

    it("without source, with explicit initials → uses that (wins over name)", async () => {
      await render(<Avatar testID="a" name="Alexis Noriega" initials="?" />);
      expect(screen.getByTestId("a-initials").props.children).toBe("?");
    });

    it("without source and without name/initials → renders empty background (no text child)", async () => {
      await render(<Avatar testID="a" />);
      expect(screen.getByTestId("a")).toBeTruthy();
      expect(screen.queryByTestId("a-initials")).toBeNull();
      expect(screen.queryByTestId("a-image")).toBeNull();
    });
  });

  describe("size resolution", () => {
    it.each([
      ["sm", 24],
      ["md", 40],
      ["lg", 56],
      ["xl", 80],
    ] as const)("preset '%s' resolves to %d", async (size, expected) => {
      await render(<Avatar testID={size} size={size} name="A" />);
      const root = screen.getByTestId(size);
      expect(root.props.width).toBe(expected);
      expect(root.props.height).toBe(expected);
    });

    it("raw numeric size passes through", async () => {
      await render(<Avatar testID="a" size={100} name="A" />);
      expect(screen.getByTestId("a").props.width).toBe(100);
    });
  });

  describe("shape → borderRadius resolution", () => {
    it("circle → size/2", async () => {
      await render(<Avatar testID="a" shape="circle" size={64} name="A" />);
      expect(screen.getByTestId("a").props.borderRadius).toBe(32);
    });

    it("rounded → 8", async () => {
      await render(<Avatar testID="a" shape="rounded" size={64} name="A" />);
      expect(screen.getByTestId("a").props.borderRadius).toBe(8);
    });

    it("square → 0", async () => {
      await render(<Avatar testID="a" shape="square" size={64} name="A" />);
      expect(screen.getByTestId("a").props.borderRadius).toBe(0);
    });
  });

  describe("palette resolution", () => {
    it("default background comes from provider's avatarColors.background", async () => {
      await render(<Avatar testID="a" name="A" />);
      expect(screen.getByTestId("a").props.backgroundColor).toBe("#E5E7EB");
    });

    it("per-instance avatarColors override wins", async () => {
      await render(
        <Avatar testID="a" name="A" avatarColors={{ background: "#FF6B00", text: "#FFFFFF" }} />
      );
      expect(screen.getByTestId("a").props.backgroundColor).toBe("#FF6B00");
      expect(screen.getByTestId("a-initials").props.color).toBe("#FFFFFF");
    });

    it("provider-level avatarColors override propagates through useUIKit", async () => {
      mockUseUIKit.mockReturnValue({
        activeTheme: "light",
        tokens: { avatarColors: { background: "#FFEEDD", text: "#3B0A00" } },
      });
      await render(<Avatar testID="branded" name="A" />);
      expect(screen.getByTestId("branded").props.backgroundColor).toBe("#FFEEDD");
    });

    it("dark palette wins when provider swaps activeTheme", async () => {
      mockUseUIKit.mockReturnValue({
        activeTheme: "dark",
        tokens: { avatarColors: DARK_AVATAR_COLORS },
      });
      await render(<Avatar testID="dark" name="A" />);
      expect(screen.getByTestId("dark").props.backgroundColor).toBe("#374151");
    });
  });

  describe("a11y + ref", () => {
    it('defaults accessibilityRole to "image"', async () => {
      await render(<Avatar testID="a" name="A" />);
      expect(screen.getByTestId("a").props.accessibilityRole).toBe("image");
    });

    it("accessibilityLabel defaults to name when provided", async () => {
      await render(<Avatar testID="a" name="Alexis" />);
      expect(screen.getByTestId("a").props.accessibilityLabel).toBe("Alexis");
    });

    it('accessibilityLabel defaults to "Avatar" when no name is passed', async () => {
      await render(<Avatar testID="a" initials="?" />);
      expect(screen.getByTestId("a").props.accessibilityLabel).toBe("Avatar");
    });

    it("consumer accessibilityLabel override wins", async () => {
      await render(<Avatar testID="a" name="Alexis" accessibilityLabel="Profile photo" />);
      expect(screen.getByTestId("a").props.accessibilityLabel).toBe("Profile photo");
    });

    it("forwards ref to the root element", async () => {
      const ref = createRef<View>();
      await render(<Avatar ref={ref} testID="a" name="A" />);
      expect(ref.current).not.toBeNull();
    });
  });

  describe("snapshots", () => {
    it("initials (md, circle)", async () => {
      await render(<Avatar name="Alexis Noriega" />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("image (lg, circle)", async () => {
      await render(<Avatar source={MOCK_SOURCE} size="lg" />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("rounded × xl", async () => {
      await render(<Avatar shape="rounded" size="xl" name="AN" />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("dark × sm × initials", async () => {
      mockUseUIKit.mockReturnValue({
        activeTheme: "dark",
        tokens: { avatarColors: DARK_AVATAR_COLORS },
      });
      await render(<Avatar name="Alexis" size="sm" />);
      expect(screen.toJSON()).toMatchSnapshot();
    });
  });
});

describe("computeInitials — pure helper", () => {
  it.each([
    ["Alexis Noriega", "AN"],
    ["alexis noriega", "AN"],
    ["Alexis", "A"],
    ["alexis", "A"],
    ["Foo Bar Baz", "FB"], // first + last only, middle ignored
    ["  Alexis   Noriega  ", "AN"], // extra whitespace tolerated
  ])("computeInitials('%s') → '%s'", (input, expected) => {
    expect(computeInitials(input)).toBe(expected);
  });

  it("empty string → empty string", () => {
    expect(computeInitials("")).toBe("");
  });

  it("whitespace-only → empty string", () => {
    expect(computeInitials("   ")).toBe("");
  });
});

describe("resolveAvatarSize — pure helper", () => {
  it.each([
    ["sm", 24],
    ["md", 40],
    ["lg", 56],
    ["xl", 80],
  ] as const)("preset '%s' → %d", (input, expected) => {
    expect(resolveAvatarSize(input)).toBe(expected);
  });

  it("raw number passes through", () => {
    expect(resolveAvatarSize(100)).toBe(100);
    expect(resolveAvatarSize(1)).toBe(1);
  });
});

describe("resolveAvatarBorderRadius — pure helper", () => {
  it("circle → dimension / 2", () => {
    expect(resolveAvatarBorderRadius("circle", 40)).toBe(20);
    expect(resolveAvatarBorderRadius("circle", 80)).toBe(40);
  });

  it("rounded → 8 regardless of dimension", () => {
    expect(resolveAvatarBorderRadius("rounded", 40)).toBe(8);
    expect(resolveAvatarBorderRadius("rounded", 80)).toBe(8);
  });

  it("square → 0 regardless of dimension", () => {
    expect(resolveAvatarBorderRadius("square", 40)).toBe(0);
    expect(resolveAvatarBorderRadius("square", 80)).toBe(0);
  });
});
