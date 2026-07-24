import { render } from "@testing-library/react-native";
import { Text } from "react-native";

import { useKraken } from "./use-kraken";

function UseKrakenOrThrow() {
  const value = useKraken();
  return <Text>{value.tokens.buttonColors.primary.background}</Text>;
}

describe("useKraken", () => {
  it("throws a helpful error when called outside <KrakenProvider>", async () => {
    // React logs the caught render error to console.error — silence it so the
    // test output stays readable.
    const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    await expect(render(<UseKrakenOrThrow />)).rejects.toThrow(/inside <KrakenProvider>/);
    spy.mockRestore();
  });
});
