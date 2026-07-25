import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

import { IconTintOverride } from "./icon-tint-override";

describe("IconTintOverride", () => {
  it("renders its children inside a Text with the passed color", async () => {
    await render(
      <IconTintOverride color="#7C3AED" testID="wrapper">
        <Text testID="child">i</Text>
      </IconTintOverride>
    );
    const wrapper = screen.getByTestId("wrapper");
    const styleArray = Array.isArray(wrapper.props.style)
      ? wrapper.props.style
      : [wrapper.props.style];
    const merged = Object.assign({}, ...styleArray.filter(Boolean));
    expect(merged.color).toBe("#7C3AED");
    expect(screen.getByTestId("child")).toHaveTextContent("i");
  });

  it("passes through the testID when provided", async () => {
    await render(
      <IconTintOverride color="#000" testID="my-icon">
        <Text>x</Text>
      </IconTintOverride>
    );
    expect(screen.getByTestId("my-icon")).toBeTruthy();
  });

  it("omits the testID when not provided", async () => {
    await render(
      <IconTintOverride color="#000">
        <Text testID="child">x</Text>
      </IconTintOverride>
    );
    // Child is still rendered — parent Text has no queryable testID.
    expect(screen.getByTestId("child")).toBeTruthy();
  });

  it("accepts string children (not just ReactElement)", async () => {
    await render(
      <IconTintOverride color="#059669" testID="wrapper">
        {"✓"}
      </IconTintOverride>
    );
    expect(screen.getByTestId("wrapper")).toHaveTextContent("✓");
  });
});
