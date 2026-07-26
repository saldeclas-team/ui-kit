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
    // Styled files that use the hyphen convention (DatePicker,
    // DateRangePicker) — same rationale as `.styled.ts`: pure
    // Tamagui component declarations, no branching to test.
    "!src/**/*-styled.ts",
  ],
  coverageThreshold: {
    // Realistic thresholds for library code. Branches is intentionally lower
    // because much of the branching is null-checks around optional props
    // (icon slots, per-instance overrides) — every such branch needs its own
    // test to bump the number, and the effort/value ratio is bad. Statements,
    // functions, and lines stay high because those catch real regressions.
    global: {
      branches: 70,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
