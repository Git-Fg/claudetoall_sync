import eslint from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import noTypeAssertion from "eslint-plugin-no-type-assertion";
import oxlint from "eslint-plugin-oxlint";
import strictDependencies from "eslint-plugin-strict-dependencies";
import zodImport from "eslint-plugin-zod-import";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

/**
 * @type {import('eslint').Linter.Config}
 */
export default defineConfig([
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/coverage/**",
      "**/*.config.js",
      "**/*.config.mjs",
      "**/.lintstagedrc.js",
      "**/eslint-plugin-*.js",
      "**/tmp/**",
    ],
  },

  {
    files: ["src/**/*.ts"],
  },

  eslint.configs.recommended,

  ...tseslint.configs.recommended,

  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "strict-dependencies": strictDependencies,
      import: importPlugin,
      "no-type-assertion": noTypeAssertion,
      "zod-import": zodImport,
    },
    rules: {
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/ban-ts-comment": "off",
      "import/no-restricted-paths": "error",
      "no-type-assertion/no-type-assertion": "off",
      "strict-dependencies/strict-dependencies": ["error", []],
      "zod-import/zod-import": "off",
    },
  },

  {
    files: ["src/**/*.test.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "no-empty": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "no-new": "off",
      "no-type-assertion/no-type-assertion": "off",
    },
  },

  ...oxlint.buildFromOxlintConfigFile("./.oxlintrc.json"),
]);
