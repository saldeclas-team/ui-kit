import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-config-prettier";

const nodeGlobals = {
  __dirname: "readonly",
  __filename: "readonly",
  module: "readonly",
  require: "readonly",
  process: "readonly",
  console: "readonly",
  exports: "readonly",
  Buffer: "readonly",
  setTimeout: "readonly",
  clearTimeout: "readonly",
  setInterval: "readonly",
  clearInterval: "readonly",
  setImmediate: "readonly",
};

// Repo-wide rules enforced across every workspace. See AGENTS.md for the
// prose version and the reasoning behind each rule.
export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.expo/**",
      "**/.rnstorybook/storybook.requires.ts",
      "**/coverage/**",
      "**/android/**",
      "**/ios/**",
      "**/*.d.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,jsx}"],
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...nodeGlobals,
        __DEV__: "readonly",
      },
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // React Native commonly requires image assets via require().
      "@typescript-eslint/no-require-imports": "off",
      // AGENTS.md rule: NEVER `any`. Use `unknown` + narrowing or generics.
      "@typescript-eslint/no-explicit-any": "error",
      // AGENTS.md rule: NEVER `export default`. Named exports only.
      // Overridden below for Expo Router route files.
      "no-restricted-syntax": [
        "error",
        {
          selector: "ExportDefaultDeclaration",
          message:
            "Default exports are banned in this repo — use named exports. Expo Router route files under apps/example/app/** are the only allowed exception.",
        },
        {
          selector: "ExportAllDeclaration",
          message:
            "`export *` is banned in barrels — list every symbol explicitly so the API surface stays precise.",
        },
      ],
      // AGENTS.md rule: no console.log — warn/error are OK.
      "no-console": ["error", { allow: ["warn", "error"] }],
      // AGENTS.md rule: type-only imports must use `import type`.
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
    },
  },
  {
    // Library code (packages/ui-kraken/src/**): block `StyleSheet` +
    // `Animated` + `Easing` from react-native so nobody bypasses
    // Tamagui styling or the reanimated animation stack.
    files: ["packages/ui-kraken/src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react-native",
              importNames: ["StyleSheet"],
              message:
                "ui-kraken components must style via Tamagui `styled()` — StyleSheet.create() is banned. See .agents/skills/creating-component-tamagui/SKILL.md §6.",
            },
            {
              name: "react-native",
              importNames: ["Animated", "Easing"],
              message:
                "ui-kraken components must animate via `react-native-reanimated` (useSharedValue + useAnimatedStyle + withTiming / withRepeat) — RN's built-in `Animated` + `Easing` are banned. See AGENTS.md § Animation.",
            },
          ],
        },
      ],
    },
  },
  {
    // Files that MUST use `export default` because the tool that reads them
    // does not accept named exports:
    //   - apps/example/app/**  — Expo Router route components
    //   - **/.rnstorybook/**   — Storybook on-device config / decorators / entry
    //   - **/.storybook/**     — Storybook Web config (main.ts + preview.tsx)
    //   - **/*.config.ts       — tool configs (tsup.config.ts, jest, etc.)
    //   - **/*.stories.tsx     — Storybook meta object
    files: [
      "apps/example/app/**/*.{ts,tsx}",
      "**/.rnstorybook/**/*.{ts,tsx}",
      "**/.storybook/**/*.{ts,tsx}",
      "**/*.config.ts",
      "**/*.stories.tsx",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        // The `export *` ban still applies here.
        {
          selector: "ExportAllDeclaration",
          message:
            "`export *` is banned in barrels — list every symbol explicitly so the API surface stays precise.",
        },
      ],
    },
  },
  {
    // CommonJS: any .cjs file, plus any plain .js file in the repo (config
    // files, Expo build/reset scripts). packages/ui-kraken uses .mjs / .cjs
    // extensions explicitly, so this block does not affect the library src.
    files: ["**/*.cjs", "**/*.js"],
    languageOptions: {
      globals: nodeGlobals,
      sourceType: "commonjs",
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      // Config files legitimately use `module.exports = ...` and shell scripts.
      "no-restricted-syntax": "off",
      "no-console": "off",
    },
  },
  {
    // Expo template code lives in apps/example/src/components. Relax rules
    // there — it is not part of the library API surface.
    files: ["apps/example/src/components/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  prettier,
];
