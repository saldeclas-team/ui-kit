// Learn more: https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require("expo/metro-config");
// IMPORTANT: `@storybook/react-native` ships TWO withStorybook wrappers.
// The old top-level one (`@storybook/react-native/withStorybook`) auto-swaps
// the app entry to `.rnstorybook/index.tsx`, which breaks Expo Router
// (registerRootComponent from expo-router/entry never runs → "main has not
// been registered"). We want the newer `/metro/` one, which only tweaks the
// resolver and lets us handle the toggle at the route level with
// Stack.Protected. Same import name, different subpath.
const { withStorybook } = require("@storybook/react-native/metro/withStorybook");
const path = require("node:path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch the whole monorepo so Metro picks up changes in packages/*.
config.watchFolders = [workspaceRoot];

// Resolve modules from the app AND the monorepo root, in that order.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Storybook on-device. `withStorybook` handles the Metro side (story loader
// via unstable_allowRequireContext, stubbing `.rnstorybook/` imports when
// disabled). The actual entry-point switch happens in `index.js`, which
// checks the same env var (EXPO_PUBLIC_STORYBOOK_ENABLED) that Babel inlines
// at bundle time.
module.exports = withStorybook(config, {
  enabled: process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === "true",
  configPath: path.resolve(projectRoot, ".rnstorybook"),
});
