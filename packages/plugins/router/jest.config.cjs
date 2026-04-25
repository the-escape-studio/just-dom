/** @type {import("jest").Config} */
module.exports = {
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: {
          module: "NodeNext",
          moduleResolution: "NodeNext",
          esModuleInterop: true,
          strict: true,
        },
      },
    ],
  },
};
