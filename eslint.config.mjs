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
      "@typescript-eslint/no-explicit-any": "warn",
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
