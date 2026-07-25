import { useMemo } from "react";
import { useColorScheme } from "react-native";
import { TamaguiProvider } from "tamagui";

import {
  DEFAULT_DARK_TOKENS,
  DEFAULT_TOKENS,
  buildConfig,
  coarseToFineTokens,
  mergeAlertColors,
  mergeButtonColors,
  mergeCurrencyInputColors,
  mergeInputColors,
  mergeRadioGroupColors,
  mergeHintColors,
  mergeRefreshControlColors,
  mergeSkeletonColors,
  mergeSurfaceColors,
  mergeTextColors,
} from "../tokens/tokens";
import { UIKitContext } from "./provider-context";
import type { ProviderProps } from "./provider-types";

// NOTE: Tamagui v2's `TamaguiProvider` already mounts a `PortalProvider` with
// a root host internally. Adding our own wrapper produces a "Nested
// PortalProvider with shouldAddRootHost" warning and can cause hydration
// mismatches. Consumers who need a portal can still use `<Portal>` from
// `tamagui` — the root host from TamaguiProvider is sufficient.
export function UIKitProvider({ children, tokens, dark, defaultTheme = "light" }: ProviderProps) {
  const systemScheme = useColorScheme();

  const contextValue = useMemo(() => {
    const mergedLight = {
      ...DEFAULT_TOKENS,
      ...tokens,
      buttonColors: mergeButtonColors(DEFAULT_TOKENS.buttonColors, tokens?.buttonColors),
      textColors: mergeTextColors(DEFAULT_TOKENS.textColors, tokens?.textColors),
      alertColors: mergeAlertColors(DEFAULT_TOKENS.alertColors, tokens?.alertColors),
      radioGroupColors: mergeRadioGroupColors(
        DEFAULT_TOKENS.radioGroupColors,
        tokens?.radioGroupColors
      ),
      inputColors: mergeInputColors(DEFAULT_TOKENS.inputColors, tokens?.inputColors),
      currencyInputColors: mergeCurrencyInputColors(
        DEFAULT_TOKENS.currencyInputColors,
        tokens?.currencyInputColors
      ),
      surfaceColors: mergeSurfaceColors(DEFAULT_TOKENS.surfaceColors, tokens?.surfaceColors),
      refreshControlColors: mergeRefreshControlColors(
        DEFAULT_TOKENS.refreshControlColors,
        tokens?.refreshControlColors
      ),
      skeletonColors: mergeSkeletonColors(DEFAULT_TOKENS.skeletonColors, tokens?.skeletonColors),
      hintColors: mergeHintColors(DEFAULT_TOKENS.hintColors, tokens?.hintColors),
    };
    const mergedDark = {
      ...DEFAULT_DARK_TOKENS,
      ...dark,
      buttonColors: mergeButtonColors(DEFAULT_DARK_TOKENS.buttonColors, dark?.buttonColors),
      textColors: mergeTextColors(DEFAULT_DARK_TOKENS.textColors, dark?.textColors),
      alertColors: mergeAlertColors(DEFAULT_DARK_TOKENS.alertColors, dark?.alertColors),
      radioGroupColors: mergeRadioGroupColors(
        DEFAULT_DARK_TOKENS.radioGroupColors,
        dark?.radioGroupColors
      ),
      inputColors: mergeInputColors(DEFAULT_DARK_TOKENS.inputColors, dark?.inputColors),
      currencyInputColors: mergeCurrencyInputColors(
        DEFAULT_DARK_TOKENS.currencyInputColors,
        dark?.currencyInputColors
      ),
      surfaceColors: mergeSurfaceColors(DEFAULT_DARK_TOKENS.surfaceColors, dark?.surfaceColors),
      refreshControlColors: mergeRefreshControlColors(
        DEFAULT_DARK_TOKENS.refreshControlColors,
        dark?.refreshControlColors
      ),
      skeletonColors: mergeSkeletonColors(DEFAULT_DARK_TOKENS.skeletonColors, dark?.skeletonColors),
      hintColors: mergeHintColors(DEFAULT_DARK_TOKENS.hintColors, dark?.hintColors),
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
      tamaguiConfig: buildConfig(mergedLight, mergedDark),
    };
  }, [tokens, dark, defaultTheme, systemScheme]);

  return (
    <TamaguiProvider config={contextValue.tamaguiConfig} defaultTheme={contextValue.activeTheme}>
      <UIKitContext.Provider value={contextValue}>{children}</UIKitContext.Provider>
    </TamaguiProvider>
  );
}
