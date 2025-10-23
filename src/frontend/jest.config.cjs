module.exports = {
  testEnvironment: "jsdom",
  rootDir: ".",

  setupFilesAfterEnv: [
    "<rootDir>/jest.setup.js",
    "<rootDir>/tests/setup/jest.setup.extra.js"
  ],

  transform: { "^.+\\.(js|jsx|ts|tsx)$": "babel-jest" },

  transformIgnorePatterns: [
    "/node_modules/(?!(react-router|@remix-run/router)/)"
  ],

  testEnvironmentOptions: {
    customExportConditions: ["browser", "development"]
  },


  moduleNameMapper: {
    "\\.(css|scss|sass|less)$": "identity-obj-proxy",
    "^@/(.*)$": "<rootDir>/../src/$1",                   // <- antes apuntaba mal
    "^~tests/(.*)$": "<rootDir>/tests/$1",
    "\\.(jpg|jpeg|png|gif|svg|webp|avif)$": "<rootDir>/tests/mocks/fileMock.js",
    "^react-bootstrap$": "<rootDir>/tests/mocks/react-bootstrap.js"
  },

 
  moduleDirectories: ["node_modules", "<rootDir>", "<rootDir>/src", "<rootDir>/../src"],

  roots: ["<rootDir>"],

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
