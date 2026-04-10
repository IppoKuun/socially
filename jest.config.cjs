const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

// Objet config Jest, coverrage est juste la maniere de s'assurer //
// Que les test couvrent bien l'intégralité de ce qui est importé //
const customJestConfig = {
  clearMocks: true,
  coverageProvider: "v8",
  collectCoverageFrom: [
    "app/[locale]/onboarding/_actions/actions.ts",
    "lib/validations.ts/onboarding.ts",
  ],
  coveragePathIgnorePatterns: ["/node_modules/", "/.next/"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  roots: ["<rootDir>/__tests__"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
};

module.exports = createJestConfig(customJestConfig);
