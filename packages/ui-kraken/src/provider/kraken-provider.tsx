import { useMemo } from "react";
import { PortalProvider, TamaguiProvider } from "tamagui";

import {
  DEFAULT_KRAKEN_TOKENS,
  buildKrakenConfig,
  coarseToFineTokens,
} from "../tokens/kraken-tokens";
import { KrakenContext } from "./kraken-provider-context";
import type { KrakenProviderProps } from "./kraken-provider-types";

export function KrakenProvider({ children, tokens, defaultTheme = "light" }: KrakenProviderProps) {
  const contextValue = useMemo(() => {
    const merged = { ...DEFAULT_KRAKEN_TOKENS, ...tokens };
    return {
      tokens: coarseToFineTokens(merged),
      tamaguiConfig: buildKrakenConfig(merged),
    };
  }, [tokens]);

  return (
    <TamaguiProvider config={contextValue.tamaguiConfig} defaultTheme={defaultTheme}>
      <PortalProvider shouldAddRootHost>
        <KrakenContext.Provider value={contextValue}>{children}</KrakenContext.Provider>
      </PortalProvider>
    </TamaguiProvider>
  );
}
