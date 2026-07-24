import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

// Tamagui pulls ESM-only entry points that Jest cannot transform. The provider
// only uses TamaguiProvider + PortalProvider as wrappers, so a pass-through
// mock keeps the test hermetic and fast. createTamagui / createTokens also
// need stubs because buildKrakenConfig calls them during useMemo.
jest.mock("tamagui", () => ({
  TamaguiProvider: ({ children }: { children: React.ReactNode }) => children,
  PortalProvider: ({ children }: { children: React.ReactNode }) => children,
  createTamagui: (config: unknown) => config,
  createTokens: (tokens: unknown) => tokens,
}));
jest.mock("@tamagui/config/v4", () => ({
  defaultConfig: { tokens: { color: {}, radius: {}, space: {}, size: {} } },
}));

import { KrakenProvider } from "./kraken-provider";
import { useKraken } from "./use-kraken";

function ReadPrimary() {
  const { tokens } = useKraken();
  return <Text testID="primary">{tokens.color.primary9}</Text>;
}

describe("KrakenProvider", () => {
  it("mounts children with default tokens", async () => {
    await render(
      <KrakenProvider>
        <Text testID="child">hi</Text>
      </KrakenProvider>
    );
    expect(screen.getByTestId("child")).toBeTruthy();
  });

  it("exposes the default primary color through useKraken", async () => {
    await render(
      <KrakenProvider>
        <ReadPrimary />
      </KrakenProvider>
    );
    // DEFAULT_KRAKEN_TOKENS.primaryColor
    expect(screen.getByTestId("primary").props.children).toBe("#2563EB");
  });

  it("exposes partial token overrides through useKraken", async () => {
    await render(
      <KrakenProvider tokens={{ primaryColor: "#FF6B00" }}>
        <ReadPrimary />
      </KrakenProvider>
    );
    expect(screen.getByTestId("primary").props.children).toBe("#FF6B00");
  });
});
