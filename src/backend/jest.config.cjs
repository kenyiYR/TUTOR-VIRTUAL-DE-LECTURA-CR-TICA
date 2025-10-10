module.exports = {
  testEnvironment: "node",
  transform: { "^.+\\.jsx?$": "babel-jest" },
  roots: ["<rootDir>/src"],
  moduleFileExtensions: ["js", "jsx"],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/**/__tests__/**"
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
};
