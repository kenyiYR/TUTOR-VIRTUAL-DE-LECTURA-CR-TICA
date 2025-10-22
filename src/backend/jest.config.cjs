module.exports = {
  testEnvironment: "node",
  transform: { "^.+\\.[tj]sx?$": "babel-jest" },
  roots: ["<rootDir>/src"],
  moduleFileExtensions: ["js", "jsx"],
  
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/**/__tests__/**",
    "!src/**/index.js"       
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],

  testTimeout: 10000
};
