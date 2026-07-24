import { useContext } from "react";

import { KrakenContext } from "./kraken-provider-context";
import type { KrakenContextValue } from "./kraken-provider-types";

export function useKraken(): KrakenContextValue {
  const value = useContext(KrakenContext);
  if (value === null) {
    throw new Error(
      "useKraken must be called inside <KrakenProvider>. Wrap your app root with KrakenProvider before rendering ui-kraken components."
    );
  }
  return value;
}
