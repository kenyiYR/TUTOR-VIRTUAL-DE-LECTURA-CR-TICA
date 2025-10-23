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
  coverageThreshold: { global: { lines: 20, statements: 20, branches: 10, functions: 20 } },
  testTimeout: 10000
};
