/**
 * ui-kraken — highly customizable React Native / Expo component library.
 *
 * Public API. Every export is explicit — no `export *` — so consumers get a
 * precise surface and dead exports stay detectable. See docs/PLAN.md for
 * roadmap and AGENTS.md for the convention set every export follows.
 */

// Provider
export { KrakenProvider, useKraken } from "./provider";
export type { KrakenProviderProps, KrakenContextValue } from "./provider";

// Tokens
export { DEFAULT_KRAKEN_TOKENS, buildKrakenConfig, coarseToFineTokens, tint } from "./tokens";
export type { KrakenTokens, ResolvedKrakenTokens, KrakenConfig } from "./tokens";

// Components
export { Button } from "./components";
export type {
  ButtonProps,
  ButtonColors,
  TextColors,
  IconColors,
  ButtonTone,
  ButtonSize,
} from "./components";
