import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

// Tamagui pulls ESM-only entry points that Jest cannot transform. The provider
// only uses TamaguiProvider + PortalProvider as wrappers, so a pass-through
// mock keeps the test hermetic and fast. createTamagui / createTokens also
// need stubs because buildConfig calls them during useMemo.
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

import { UIKitProvider } from "./provider";
import { useUIKit } from "./use-ui-kit";

function ReadPrimary() {
  const { activeTheme, tokens } = useUIKit();
  return (
    <>
      <Text testID="active-theme">{activeTheme}</Text>
      <Text testID="primary-bg">{tokens.buttonColors.primary.background}</Text>
    </>
  );
}

describe("UIKitProvider", () => {
  it("mounts children with default tokens in light mode", async () => {
    await render(
      <UIKitProvider>
        <Text testID="child">hi</Text>
      </UIKitProvider>
    );
    expect(screen.getByTestId("child")).toBeTruthy();
  });

  it("exposes the default light primary background through useUIKit", async () => {
    await render(
      <UIKitProvider>
        <ReadPrimary />
      </UIKitProvider>
    );
    expect(screen.getByTestId("active-theme").props.children).toBe("light");
    // DEFAULT_LIGHT_BUTTON_COLORS.primary.background
    expect(screen.getByTestId("primary-bg").props.children).toBe("#2563EB");
  });

  it("exposes partial token overrides through useUIKit", async () => {
    await render(
      <UIKitProvider tokens={{ buttonColors: { primary: { background: "#FF6B00" } } }}>
        <ReadPrimary />
      </UIKitProvider>
    );
    expect(screen.getByTestId("primary-bg").props.children).toBe("#FF6B00");
  });

  it("switches to dark tokens when defaultTheme='dark'", async () => {
    await render(
      <UIKitProvider defaultTheme="dark">
        <ReadPrimary />
      </UIKitProvider>
    );
    expect(screen.getByTestId("active-theme").props.children).toBe("dark");
    // DEFAULT_DARK_BUTTON_COLORS.primary.background
    expect(screen.getByTestId("primary-bg").props.children).toBe("#3B82F6");
  });

  it("respects a user-provided dark tokens override", async () => {
    await render(
      <UIKitProvider
        defaultTheme="dark"
        dark={{ buttonColors: { primary: { background: "#111827" } } }}
      >
        <ReadPrimary />
      </UIKitProvider>
    );
    expect(screen.getByTestId("primary-bg").props.children).toBe("#111827");
  });

  it("exposes textColors overrides through useUIKit", async () => {
    function ReadTextPrimary() {
      const { tokens } = useUIKit();
      return <Text testID="text-primary">{tokens.textColors.primary}</Text>;
    }

    await render(
      <UIKitProvider tokens={{ textColors: { primary: "#123456" } }}>
        <ReadTextPrimary />
      </UIKitProvider>
    );
    expect(screen.getByTestId("text-primary").props.children).toBe("#123456");
  });

  it("keeps unmodified textColors slots from the defaults on partial override", async () => {
    function ReadTextSecondary() {
      const { tokens } = useUIKit();
      return <Text testID="text-secondary">{tokens.textColors.secondary}</Text>;
    }

    await render(
      <UIKitProvider tokens={{ textColors: { primary: "#123456" } }}>
        <ReadTextSecondary />
      </UIKitProvider>
    );
    // DEFAULT_LIGHT_TEXT_COLORS.secondary
    expect(screen.getByTestId("text-secondary").props.children).toBe("#5B6472");
  });

  // NOTE: defaultTheme="system" is covered by the app-level integration test
  // (apps/example runs with useColorScheme wired up). Mocking RN's
  // useColorScheme() from Jest is fragile because it drags in TurboModule
  // native bindings.
});
