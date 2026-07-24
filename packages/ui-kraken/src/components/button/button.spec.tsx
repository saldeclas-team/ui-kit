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

  it("applies per-instance buttonColors override", async () => {
    await render(
      <Button testID="save" buttonColors={{ primary: "#FF0000" }}>
        Save
      </Button>
    );

    expect(screen.getByTestId("save").props.backgroundColor).toBe("#FF0000");
  });

  it("applies per-instance textColors override", async () => {
    await render(
      <Button testID="save" textColors={{ primary: "#00FF00" }}>
        Save
      </Button>
    );

    expect(screen.getByTestId("save-label").props.color).toBe("#00FF00");
  });

  it("prefers the disabled slot when the button is disabled", async () => {
    await render(
      <Button testID="save" disabled buttonColors={{ primary: "#FF0000", disabled: "#AAAAAA" }}>
        Save
      </Button>
    );

    expect(screen.getByTestId("save").props.backgroundColor).toBe("#AAAAAA");
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

  it("exposes the compound variants (Primary/Secondary/Ghost/Destructive)", async () => {
    await render(
      <>
        <Button.Primary testID="primary">P</Button.Primary>
        <Button.Secondary testID="secondary">S</Button.Secondary>
        <Button.Ghost testID="ghost">G</Button.Ghost>
        <Button.Destructive testID="destructive">D</Button.Destructive>
      </>
    );

    expect(screen.getByTestId("primary").props.tone).toBe("primary");
    expect(screen.getByTestId("secondary").props.tone).toBe("secondary");
    expect(screen.getByTestId("ghost").props.tone).toBe("ghost");
    expect(screen.getByTestId("destructive").props.tone).toBe("destructive");
  });

  it("defaults <Button> to the Primary variant (dual export)", async () => {
    await render(<Button testID="default-button">Default</Button>);

    expect(screen.getByTestId("default-button").props.tone).toBe("primary");
  });
});
