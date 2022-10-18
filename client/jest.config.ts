import type { Config } from "jest";
import esm from "socket.io-client";

const esModules = ["uuid", "nanoid"].join("|");

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  verbose: true,
  roots: ["<rootDir>/src"],
  setupFiles: ["jest-canvas-mock"],
  setupFilesAfterEnv: ["<rootDir>/jest.env.ts"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  // fakeTimers: {
  //   enableGlobally: true,
  // },
  moduleNameMapper: {
    "\\.(css|less|scss|sss|styl)$": "<rootDir>/node_modules/jest-css-modules",
    "^nanoid(/(.*)|$)": "nanoid$1",
    "^uuid(/(.*)|$)": "uuid$1",
    // "\\.(css|less|scss|sss|styl)$": "<rootDir>/node_modules/jest-css-modules",
  },
  transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
};
export default config;
