import { useMemo } from "react";
import { useColorScheme } from "react-native";
import { PortalProvider, TamaguiProvider } from "tamagui";

import {
  DEFAULT_DARK_KRAKEN_TOKENS,
  DEFAULT_KRAKEN_TOKENS,
  buildKrakenConfig,
  coarseToFineTokens,
  mergeButtonColors,
} from "../tokens/kraken-tokens";
import { KrakenContext } from "./kraken-provider-context";
import type { KrakenProviderProps } from "./kraken-provider-types";

export function KrakenProvider({
  children,
  tokens,
  dark,
  defaultTheme = "light",
}: KrakenProviderProps) {
  const systemScheme = useColorScheme();

  const contextValue = useMemo(() => {
    const mergedLight = {
      ...DEFAULT_KRAKEN_TOKENS,
      ...tokens,
      buttonColors: mergeButtonColors(DEFAULT_KRAKEN_TOKENS.buttonColors, tokens?.buttonColors),
    };
    const mergedDark = {
      ...DEFAULT_DARK_KRAKEN_TOKENS,
      ...dark,
      buttonColors: mergeButtonColors(DEFAULT_DARK_KRAKEN_TOKENS.buttonColors, dark?.buttonColors),
    };
    const resolvedLight = coarseToFineTokens(mergedLight);
    const resolvedDark = coarseToFineTokens(mergedDark);
    const activeTheme: "light" | "dark" =
      defaultTheme === "system" ? (systemScheme === "dark" ? "dark" : "light") : defaultTheme;

    return {
      lightTokens: resolvedLight,
      darkTokens: resolvedDark,
      activeTheme,
      tokens: activeTheme === "dark" ? resolvedDark : resolvedLight,
      tamaguiConfig: buildKrakenConfig(mergedLight, mergedDark),
    };
  }, [tokens, dark, defaultTheme, systemScheme]);

  return (
    <TamaguiProvider config={contextValue.tamaguiConfig} defaultTheme={contextValue.activeTheme}>
      <PortalProvider shouldAddRootHost>
        <KrakenContext.Provider value={contextValue}>{children}</KrakenContext.Provider>
      </PortalProvider>
    </TamaguiProvider>
  );
}
