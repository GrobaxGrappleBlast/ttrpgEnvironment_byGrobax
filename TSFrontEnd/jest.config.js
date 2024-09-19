/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: "node",
  transform: {
    "^.+\\.(ts)$": "ts-jest", 
  },
  transformIgnorePatterns: [
    "node_modules/(?!(grobax-json-handler))",
  ],
  testMatch :  [
    "**/*.test.ts",
    "**/*.test.js"
  ],
  moduleFileExtensions: [
      "js",
      "ts",
      "json",
      "node"
  ],
  collectCoverage:true,
  coverageReporters:[
    "json",
    "lcov",
    "text",
    "html"
  ],
  verbose:true,
  moduleDirectories:["node_modules","src"],
  testEnvironment: "node",
};
