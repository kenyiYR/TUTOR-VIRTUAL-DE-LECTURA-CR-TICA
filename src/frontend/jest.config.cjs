module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transform: { "^.+\\.[tj]sx?$": "babel-jest" },
  moduleNameMapper: {
    "\\.(css|less|sass|scss)$": "identity-obj-proxy",
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  roots: ["<rootDir>"],
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "!src/main.jsx",
    "!src/**/index.jsx"
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  
};
