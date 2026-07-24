import type { ReactNode } from "react";

import type { KrakenConfig } from "../tokens/kraken-tokens";
import type { KrakenTokens, ResolvedKrakenTokens } from "../tokens/kraken-tokens-types";

export interface KrakenProviderProps {
  children: ReactNode;
  /**
   * Partial override of the coarse token schema. Any field not provided falls
   * back to `DEFAULT_KRAKEN_TOKENS`. Passing a fresh object literal on every
   * render forces the provider to rebuild the derived config — memoize
   * on the consumer side or hoist the value out of the render function.
   */
  tokens?: Partial<KrakenTokens>;
  defaultTheme?: "light" | "dark";
}

export interface KrakenContextValue {
  /** Coarse tokens with defaults filled in, exactly as consumed by components. */
  tokens: ResolvedKrakenTokens;
  /** Raw Tamagui config — escape hatch for consumers who need to drop down to Tamagui APIs directly. */
  tamaguiConfig: KrakenConfig;
}
