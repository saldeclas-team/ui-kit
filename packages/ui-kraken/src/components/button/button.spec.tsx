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

// Mock useKraken so Button can run without a KrakenProvider wrapper in tests.
// The dark-elevation border path is exercised separately in `dark-elevation`
// tests below by re-mocking the return value.
const mockUseKraken = jest.fn(() => ({ activeTheme: "light" as const }));
jest.mock("../../provider/use-kraken", () => ({
  useKraken: () => mockUseKraken(),
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

    expect(screen.getByTestId("btn").props.borderRadius).toBe("$krakenRadiusLg");
  });

  it("defaults elevation to 'none'", async () => {
    await render(<Button testID="btn">Flat</Button>);
    expect(screen.getByTestId("btn").props.elevation).toBe("none");
  });

  it("forwards each elevation preset to the styled variant", async () => {
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

    expect(screen.getByTestId("sm").props.elevation).toBe("sm");
    expect(screen.getByTestId("md").props.elevation).toBe("md");
    expect(screen.getByTestId("lg").props.elevation).toBe("lg");
  });

  describe("dark mode elevation swap", () => {
    beforeEach(() => {
      mockUseKraken.mockReturnValue({ activeTheme: "dark" as const });
    });

    afterEach(() => {
      mockUseKraken.mockReturnValue({ activeTheme: "light" as const });
    });

    it("applies a translucent-white border on solid tones when elevation is set", async () => {
      await render(
        <Button testID="btn" elevation="md">
          Raised
        </Button>
      );

      expect(screen.getByTestId("btn").props.borderColor).toBe("rgba(255,255,255,0.10)");
      expect(screen.getByTestId("btn").props.borderWidth).toBe(1);
    });

    it("scales the border opacity with the elevation level", async () => {
      await render(
        <>
          <Button testID="sm" elevation="sm">
            sm
          </Button>
          <Button testID="lg" elevation="lg">
            lg
          </Button>
        </>
      );

      expect(screen.getByTestId("sm").props.borderColor).toBe("rgba(255,255,255,0.05)");
      expect(screen.getByTestId("lg").props.borderColor).toBe("rgba(255,255,255,0.15)");
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
});
