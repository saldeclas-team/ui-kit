import { createContext } from "react";

import type { KrakenContextValue } from "./kraken-provider-types";

// `null` sentinel lets `useKraken` throw a clear error when called outside the
// provider tree. Never provide a default value — it would silently hide the bug.
export const KrakenContext = createContext<KrakenContextValue | null>(null);
