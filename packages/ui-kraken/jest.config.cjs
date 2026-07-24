/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  // Repo convention (AGENTS.md): tests live next to the file they cover as
  // `*.spec.ts(x)`. Legacy `*.test.ts(x)` and `__tests__/` are accepted so
  // early scaffolding doesn't fail loudly during migration.
  testMatch: [
    "<rootDir>/src/**/*.spec.(ts|tsx)",
    "<rootDir>/src/**/*.test.(ts|tsx)",
    "<rootDir>/__tests__/**/*.(test|spec).(ts|tsx)",
  ],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/index.ts",
    "!src/**/*.stories.tsx",
    "!src/**/*-types.ts",
    "!src/**/*.styled.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
