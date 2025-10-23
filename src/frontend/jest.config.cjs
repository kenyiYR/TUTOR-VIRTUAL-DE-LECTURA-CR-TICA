// jest.config.cjs
module.exports = {
  testEnvironment: "jsdom",
  rootDir: ".",

  setupFilesAfterEnv: [
    "<rootDir>/jest.setup.js",
    "<rootDir>/tests/setup/jest.setup.extra.js"
  ],

  transform: { "^.+\\.(js|jsx|ts|tsx)$": "babel-jest" },

  // importa ESMs de react-router correctamente
  transformIgnorePatterns: [
    "/node_modules/(?!(react-router|@remix-run/router)/)"
  ],

  // hace que Jest elija los builds correctos vía package.json "exports"
  testEnvironmentOptions: {
    customExportConditions: ["browser", "development"]
  },

  moduleNameMapper: {
    "\\.(css|scss|sass|less)$": "identity-obj-proxy",
    "^@/(.*)$": "<rootDir>/src/$1",
    "^~tests/(.*)$": "<rootDir>/tests/$1",
    "\\.(jpg|jpeg|png|gif|svg|webp|avif)$": "<rootDir>/tests/mocks/fileMock.js",
    "^react-bootstrap$": "<rootDir>/tests/mocks/react-bootstrap.js"
  },

  roots: ["<rootDir>"],

  // cobertura real y consistente
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/main.jsx",
    "!src/**/index.jsx",
    "!**/__tests__/**",
    "!**/*.test.*",
    "!**/*.spec.*"
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  coverageThreshold: { global: { lines: 50, statements: 50, branches: 40, functions: 50 } }
};
