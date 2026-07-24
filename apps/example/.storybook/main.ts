// Storybook Web config — parallel to `.rnstorybook/` (on-device). Reuses
// the SAME story files so contributors write stories once and both runners
// pick them up. The on-device Storybook stays as maintainer dev tool;
// this one feeds Chromatic for visual regression testing.
//
// Uses `@storybook/react-native-web-vite` — Storybook's official framework
// for compiling RN components to DOM via `react-native-web`. Vite is the
// bundler under the hood.
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-native-web-vite";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  // Same globs as `.rnstorybook/main.ts` — one story file, two rendering
  // targets. When a contributor adds a story it lands in both automatically.
  stories: [
    "../../../packages/ui-kraken/src/**/*.stories.?(ts|tsx)",
    "../src/**/*.stories.?(ts|tsx)",
  ],
  framework: "@storybook/react-native-web-vite",
  addons: [],
  viteFinal: async (viteConfig) => {
    // Force `ui-kraken` to resolve to the source, always.
    //
    // Why: story files inside `packages/ui-kraken/src/**/*.stories.tsx`
    // import components via relative paths ("./button"), so their
    // `useUIKit()` call reaches the Context defined at
    // `packages/ui-kraken/src/provider/provider-context.tsx`.
    // Meanwhile `.storybook/preview.tsx` imports `KrakenProvider` via
    // the package name `"ui-kraken"`, which Vite resolves through the
    // exports map to a DIFFERENT module (either `dist/index.js` or a
    // fresh compilation of `src/index.ts` under a different resolver
    // path). Two module instances = two React Contexts = "must be
    // called inside <KrakenProvider>" error at render time, even when
    // the decorator IS wrapping the Story.
    //
    // Aliasing the bare specifier to the exact source entry
    // guarantees one module = one Context.
    viteConfig.resolve = viteConfig.resolve ?? {};
    viteConfig.resolve.alias = {
      ...(viteConfig.resolve.alias ?? {}),
      "ui-kraken": path.resolve(dirname, "../../../packages/ui-kraken/src/index.ts"),
    };
    return viteConfig;
  },
};

export default config;
