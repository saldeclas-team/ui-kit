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
  defaultConfig: {
    tokens: { color: {}, radius: {}, space: {}, size: {} },
    themes: { light: {}, dark: {} },
  },
}));

import { KrakenProvider } from "./kraken-provider";
import { useKraken } from "./use-kraken";

function ReadPrimary() {
  const { activeTheme, tokens } = useKraken();
  return (
    <>
      <Text testID="active-theme">{activeTheme}</Text>
      <Text testID="primary-bg">{tokens.buttonColors.primary.background}</Text>
    </>
  );
}

describe("KrakenProvider", () => {
  it("mounts children with default tokens in light mode", async () => {
    await render(
      <KrakenProvider>
        <Text testID="child">hi</Text>
      </KrakenProvider>
    );
    expect(screen.getByTestId("child")).toBeTruthy();
  });

  it("exposes the default light primary background through useKraken", async () => {
    await render(
      <KrakenProvider>
        <ReadPrimary />
      </KrakenProvider>
    );
    expect(screen.getByTestId("active-theme").props.children).toBe("light");
    // DEFAULT_LIGHT_BUTTON_COLORS.primary.background
    expect(screen.getByTestId("primary-bg").props.children).toBe("#2563EB");
  });

  it("exposes partial token overrides through useKraken", async () => {
    await render(
      <KrakenProvider tokens={{ buttonColors: { primary: { background: "#FF6B00" } } }}>
        <ReadPrimary />
      </KrakenProvider>
    );
    expect(screen.getByTestId("primary-bg").props.children).toBe("#FF6B00");
  });

  it("switches to dark tokens when defaultTheme='dark'", async () => {
    await render(
      <KrakenProvider defaultTheme="dark">
        <ReadPrimary />
      </KrakenProvider>
    );
    expect(screen.getByTestId("active-theme").props.children).toBe("dark");
    // DEFAULT_DARK_BUTTON_COLORS.primary.background
    expect(screen.getByTestId("primary-bg").props.children).toBe("#3B82F6");
  });

  it("respects a user-provided dark tokens override", async () => {
    await render(
      <KrakenProvider
        defaultTheme="dark"
        dark={{ buttonColors: { primary: { background: "#111827" } } }}
      >
        <ReadPrimary />
      </KrakenProvider>
    );
    expect(screen.getByTestId("primary-bg").props.children).toBe("#111827");
  });

  // NOTE: defaultTheme="system" is covered by the app-level integration test
  // (apps/example runs with useColorScheme wired up). Mocking RN's
  // useColorScheme() from Jest is fragile because it drags in TurboModule
  // native bindings.
});
