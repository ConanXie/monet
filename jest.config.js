/**
 * @type {import("@jest/types").Config.ProjectConfig}
 */
module.exports = {
  testMatch: ["**/__tests__/**/*.ts?(x)"],
  transform: {
    "\\.[jt]sx?$": "babel-jest",
  },
  collectCoverageFrom: ["src/**/*.{ts,tsx}"],
}
