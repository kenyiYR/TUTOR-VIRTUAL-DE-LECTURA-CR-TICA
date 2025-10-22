// jest.config.cjs
module.exports = {
  testEnvironment: "node",
  transform: { "^.+\\.[tj]sx?$": "babel-jest" },
  roots: ["<rootDir>/src"],
  moduleFileExtensions: ["js", "jsx"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/**/__tests__/**",
    "!src/**/index.js"
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  coverageThreshold: { global: { lines: 50, statements: 50, branches: 40, functions: 50 } },
  testTimeout: 10000
};
