import { render } from "@testing-library/react-native";
import { Text } from "react-native";

import { useUIKit } from "./use-ui-kit";

function UseUIKitOrThrow() {
  const value = useUIKit();
  return <Text>{value.tokens.buttonColors.primary.background}</Text>;
}

describe("useUIKit", () => {
  it("throws a helpful error when called outside <KrakenProvider>", async () => {
    // React logs the caught render error to console.error — silence it so the
    // test output stays readable.
    const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    await expect(render(<UseUIKitOrThrow />)).rejects.toThrow(/inside <KrakenProvider>/);
    spy.mockRestore();
  });
});
