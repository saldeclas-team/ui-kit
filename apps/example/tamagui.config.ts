import { defaultConfig } from "@tamagui/config/v4";
import { createTamagui } from "tamagui";

// Starting point: Tamagui's default v4 config (tokens, themes, media queries).
// Once ui-kraken exposes its own token schema (see docs/PLAN.md), we will
// merge ui-kraken tokens on top of this.
export const tamaguiConfig = createTamagui(defaultConfig);

export type AppTamaguiConfig = typeof tamaguiConfig;

declare module "tamagui" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TamaguiCustomConfig extends AppTamaguiConfig {}
}

export default tamaguiConfig;
