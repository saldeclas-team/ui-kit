import { fireEvent, render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

// Mock the styled file: Tamagui's ESM index blows up under Jest's CJS runtime.
// The mocks are dumb passthroughs — they simply forward props and testID
// to a React Native View / Text so the component logic (state derivation,
// override resolution, testID propagation) stays testable.
jest.mock("./button.styled", () => {
  const rn = jest.requireActual("react-native");
  const forwardRef = jest.requireActual("react").forwardRef;
  const StyledButton = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.View ref={ref} {...props} />
  ));
  const StyledButtonLabel = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.Text ref={ref} {...props} />
  ));
  return { StyledButton, StyledButtonLabel };
});

// Mock useUIKit so Button can run without a UIKitProvider wrapper in tests.
// The dark-elevation border path is exercised separately in `dark-elevation`
// tests below by re-mocking the return value.
const mockUseUIKit: jest.Mock<{ activeTheme: "light" | "dark" }, []> = jest.fn(() => ({
  activeTheme: "light",
}));
jest.mock("../../provider/use-ui-kit", () => ({
  useUIKit: () => mockUseUIKit(),
}));

import { Button } from "./button";

describe("Button", () => {
  it("renders the label and root testID", async () => {
    await render(<Button testID="save">Save</Button>);

    expect(screen.getByTestId("save")).toBeTruthy();
    expect(screen.getByTestId("save-label")).toBeTruthy();
    expect(screen.getByTestId("save-label").props.children).toBe("Save");
  });

  it("fires onPress when tapped", async () => {
    const onPress = jest.fn();
    await render(
      <Button testID="save" onPress={onPress}>
        Save
      </Button>
    );

    fireEvent.press(screen.getByTestId("save"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("applies per-instance background override", async () => {
    await render(
      <Button testID="save" buttonColors={{ background: "#FF0000" }}>
        Save
      </Button>
    );

    expect(screen.getByTestId("save").props.backgroundColor).toBe("#FF0000");
  });

  it("applies per-instance label override", async () => {
    await render(
      <Button testID="save" buttonColors={{ label: "#00FF00" }}>
        Save
      </Button>
    );

    expect(screen.getByTestId("save-label").props.color).toBe("#00FF00");
  });

  it("applies per-instance border override on outline variant", async () => {
    await render(
      <Button.Outline testID="save" buttonColors={{ border: "#0000FF" }}>
        Save
      </Button.Outline>
    );

    expect(screen.getByTestId("save").props.borderColor).toBe("#0000FF");
  });

  it("sets accessibilityState.disabled when disabled", async () => {
    await render(
      <Button testID="save" disabled>
        Save
      </Button>
    );

    expect(screen.getByTestId("save").props.accessibilityState).toMatchObject({ disabled: true });
  });

  it("swaps the left icon for a loader while loading", async () => {
    await render(
      <Button testID="save" loading leftIcon={<Text testID="my-icon">icon</Text>}>
        Save
      </Button>
    );

    expect(screen.queryByTestId("save-left-icon")).toBeNull();
    expect(screen.getByTestId("save-loader")).toBeTruthy();
    expect(screen.getByTestId("save").props.accessibilityState).toMatchObject({ busy: true });
  });

  it("exposes all five compound variants (Primary/Secondary/Outline/Ghost/Destructive)", async () => {
    await render(
      <>
        <Button.Primary testID="primary">P</Button.Primary>
        <Button.Secondary testID="secondary">S</Button.Secondary>
        <Button.Outline testID="outline">O</Button.Outline>
        <Button.Ghost testID="ghost">G</Button.Ghost>
        <Button.Destructive testID="destructive">D</Button.Destructive>
      </>
    );

    expect(screen.getByTestId("primary").props.tone).toBe("primary");
    expect(screen.getByTestId("secondary").props.tone).toBe("secondary");
    expect(screen.getByTestId("outline").props.tone).toBe("outline");
    expect(screen.getByTestId("ghost").props.tone).toBe("ghost");
    expect(screen.getByTestId("destructive").props.tone).toBe("destructive");
  });

  it("defaults <Button> to the Primary variant (dual export)", async () => {
    await render(<Button testID="default-button">Default</Button>);

    expect(screen.getByTestId("default-button").props.tone).toBe("primary");
  });

  it("falls back to primary when tone is explicitly undefined", async () => {
    // Compound wrappers spread caller props AFTER setting tone, so passing
    // `tone={undefined}` overrides the wrapper's default and reaches
    // BaseButton with tone=undefined — which triggers the destructure
    // default `tone = "primary"`. Covers that fallback branch directly.
    await render(
      <Button testID="undef" tone={undefined}>
        Undef
      </Button>
    );

    expect(screen.getByTestId("undef").props.tone).toBe("primary");
  });

  it("resolves radius='pill' to 9999", async () => {
    await render(
      <Button testID="btn" radius="pill">
        Round
      </Button>
    );

    expect(screen.getByTestId("btn").props.borderRadius).toBe(9999);
  });

  it("passes a numeric radius through unchanged", async () => {
    await render(
      <Button testID="btn" radius={20}>
        Custom
      </Button>
    );

    expect(screen.getByTestId("btn").props.borderRadius).toBe(20);
  });

  it("resolves radius='none' to 0", async () => {
    await render(
      <Button testID="btn" radius="none">
        Square
      </Button>
    );

    expect(screen.getByTestId("btn").props.borderRadius).toBe(0);
  });

  it("resolves preset radius names to theme tokens", async () => {
    await render(
      <Button testID="btn" radius="lg">
        Large
      </Button>
    );

    expect(screen.getByTestId("btn").props.borderRadius).toBe("$uiRadiusLg");
  });

  it("defaults to a flat elevation (no shadow, no border)", async () => {
    await render(<Button testID="btn">Flat</Button>);
    const props = screen.getByTestId("btn").props;
    expect(props.shadowColor).toBe("transparent");
    expect(props.shadowOpacity).toBe(0);
    expect(props.elevationAndroid).toBe(0);
    expect(props.borderColor).toBeUndefined();
  });

  it("applies stronger shadow values as elevation increases (light mode)", async () => {
    await render(
      <>
        <Button testID="sm" elevation="sm">
          sm
        </Button>
        <Button testID="md" elevation="md">
          md
        </Button>
        <Button testID="lg" elevation="lg">
          lg
        </Button>
      </>
    );

    const sm = screen.getByTestId("sm").props;
    const md = screen.getByTestId("md").props;
    const lg = screen.getByTestId("lg").props;

    expect(sm.shadowColor).toBe("#000000");
    expect(sm.shadowOpacity).toBeLessThan(md.shadowOpacity);
    expect(md.shadowOpacity).toBeLessThan(lg.shadowOpacity);
    expect(sm.elevationAndroid).toBeLessThan(md.elevationAndroid);
    expect(md.elevationAndroid).toBeLessThan(lg.elevationAndroid);
  });

  describe("dark mode elevation swap", () => {
    beforeEach(() => {
      mockUseUIKit.mockReturnValue({ activeTheme: "dark" });
    });

    afterEach(() => {
      mockUseUIKit.mockReturnValue({ activeTheme: "light" });
    });

    it("applies a translucent-white border on solid tones when elevation is set", async () => {
      await render(
        <Button testID="btn" elevation="md">
          Raised
        </Button>
      );

      const props = screen.getByTestId("btn").props;
      expect(props.borderColor).toMatch(/^rgba\(255,255,255,0\.\d+\)$/);
      expect(props.borderWidth).toBe(1);
      // Shadows must be fully cancelled in dark mode.
      expect(props.shadowColor).toBe("transparent");
      expect(props.shadowOpacity).toBe(0);
      expect(props.elevationAndroid).toBe(0);
    });

    it("scales the border opacity with the elevation level", async () => {
      await render(
        <>
          <Button testID="sm" elevation="sm">
            sm
          </Button>
          <Button testID="md" elevation="md">
            md
          </Button>
          <Button testID="lg" elevation="lg">
            lg
          </Button>
        </>
      );

      const parseOpacity = (rgba: string): number => {
        const match = rgba.match(/rgba\(255,255,255,(0\.\d+)\)/);
        if (match == null) throw new Error(`unexpected color: ${rgba}`);
        return Number(match[1]);
      };
      const smOp = parseOpacity(screen.getByTestId("sm").props.borderColor);
      const mdOp = parseOpacity(screen.getByTestId("md").props.borderColor);
      const lgOp = parseOpacity(screen.getByTestId("lg").props.borderColor);
      expect(smOp).toBeLessThan(mdOp);
      expect(mdOp).toBeLessThan(lgOp);
    });

    it("skips the dark-border swap for outline / ghost tones", async () => {
      await render(
        <>
          <Button.Outline testID="outline" elevation="md">
            O
          </Button.Outline>
          <Button.Ghost testID="ghost" elevation="md">
            G
          </Button.Ghost>
        </>
      );

      expect(screen.getByTestId("outline").props.borderColor).toBeUndefined();
      expect(screen.getByTestId("ghost").props.borderColor).toBeUndefined();
    });

    it("respects a per-instance border override over the dark-border swap", async () => {
      await render(
        <Button testID="btn" elevation="md" buttonColors={{ border: "#FF0000" }}>
          Custom
        </Button>
      );

      expect(screen.getByTestId("btn").props.borderColor).toBe("#FF0000");
    });

    it("does nothing when elevation is 'none'", async () => {
      await render(<Button testID="btn">Flat</Button>);

      expect(screen.getByTestId("btn").props.borderColor).toBeUndefined();
      expect(screen.getByTestId("btn").props.borderWidth).toBeUndefined();
    });
  });

  // Structural snapshots — serialize the rendered RN tree and diff on any
  // structural / prop / inline-style change. Complements the targeted
  // assertions above by catching regressions the specific asserts don't
  // (e.g. an accidental extra wrapper, a dropped prop, a style flip).
  //
  // If a snapshot diff is intentional: run `pnpm --filter ui-kraken test -u`,
  // review the .snap diff carefully, and commit both the code and the
  // snapshot update in the same PR.
  describe("snapshots", () => {
    beforeEach(() => {
      // The dark-elevation describe flips this to "dark" and restores in
      // afterEach — but if the snapshot block runs before it (jest order is
      // insertion), we still want an explicit reset so intra-block state
      // never leaks in.
      mockUseUIKit.mockReturnValue({ activeTheme: "light" });
    });

    // --- Tones × md size (5) ---
    it.each([
      ["primary", <Button.Primary key="p">Primary</Button.Primary>],
      ["secondary", <Button.Secondary key="s">Secondary</Button.Secondary>],
      ["outline", <Button.Outline key="o">Outline</Button.Outline>],
      ["ghost", <Button.Ghost key="g">Ghost</Button.Ghost>],
      ["destructive", <Button.Destructive key="d">Destructive</Button.Destructive>],
    ])("tone=%s @ md size", async (_tone, node) => {
      await render(node);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    // --- Sizes × primary tone (3) ---
    it.each(["sm", "md", "lg"] as const)("size=%s @ primary tone", async (size) => {
      await render(<Button.Primary size={size}>Save</Button.Primary>);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    // --- States: disabled / loading / with-icons / icon-only (4) ---
    it("state: disabled", async () => {
      await render(<Button disabled>Save</Button>);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("state: loading", async () => {
      await render(<Button loading>Save</Button>);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("state: with leftIcon + rightIcon", async () => {
      await render(
        <Button leftIcon={<Text testID="lf">L</Text>} rightIcon={<Text testID="rf">R</Text>}>
          Save
        </Button>
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("state: icon-only (no children)", async () => {
      await render(<Button leftIcon={<Text testID="lf">L</Text>} />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    // --- Radius presets + raw number (6) ---
    it.each(["none", "sm", "md", "lg", "pill"] as const)(
      "radius=%s @ primary md",
      async (radius) => {
        await render(<Button.Primary radius={radius}>Save</Button.Primary>);
        expect(screen.toJSON()).toMatchSnapshot();
      }
    );

    it("radius=24 (raw px) @ primary md", async () => {
      await render(<Button.Primary radius={24}>Save</Button.Primary>);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    // --- Elevation × light theme (4) ---
    it.each(["none", "sm", "md", "lg"] as const)(
      "elevation=%s @ primary md (light)",
      async (elevation) => {
        mockUseUIKit.mockReturnValue({ activeTheme: "light" });
        await render(<Button.Primary elevation={elevation}>Save</Button.Primary>);
        expect(screen.toJSON()).toMatchSnapshot();
      }
    );

    // --- Elevation × dark theme (4) — exercises the dark-elevation border swap ---
    it.each(["none", "sm", "md", "lg"] as const)(
      "elevation=%s @ primary md (dark)",
      async (elevation) => {
        mockUseUIKit.mockReturnValue({ activeTheme: "dark" });
        await render(<Button.Primary elevation={elevation}>Save</Button.Primary>);
        expect(screen.toJSON()).toMatchSnapshot();
      }
    );

    // --- Per-instance color override (1) ---
    it("buttonColors override: custom brand orange", async () => {
      await render(
        <Button.Primary buttonColors={{ background: "#FF6B00", label: "#FFFFFF" }}>
          Save
        </Button.Primary>
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });
  });
});
