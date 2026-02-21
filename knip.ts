import { type KnipConfig } from "knip";

const config: KnipConfig = {
  entry: ["src/cli.ts", "src/index.ts", "src/**/*.test.ts"],
  project: ["src/**/*.ts"],
  ignore: [
    "dist/**",
    "node_modules/**",
    "**/test-temp/**",
    "tsconfig.json",
    "vitest.config.ts",
    "eslint.config.js",
    ".oxfmtrc.json",
  ],
  ignoreDependencies: [
    "@secretlint/secretlint-rule-preset-recommend",
    "typescript",
    "@types/node",
    "lint-staged",
  ],
  typescript: {
    config: "tsconfig.json",
  },
  includeEntryExports: true,
};

export default config;
