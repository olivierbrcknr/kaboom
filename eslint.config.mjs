import eslintPluginReact from "eslint-plugin-react";

import eslint from "@eslint/js";
import eslintPluginNext from "@next/eslint-plugin-next";
import tsParser from "@typescript-eslint/parser";
import perfectionist from "eslint-plugin-perfectionist";
import tseslint from "typescript-eslint";

export default tseslint.config([
  eslint.configs.recommended,
  tseslint.configs.recommended,
  { ignores: ["node_modules/*", ".next/*"] },
  {
    plugins: {
      eslintPluginNext,
      eslintPluginReact,
    },
    rules: {
      "@next/next/google-font-display": ["off"],
    },
  },
  {
    rules: {
      "prefer-const": ["warn"],
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/no-empty-object-type": "off",
      "no-empty-pattern": "off",
    },
  },
  {
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          modules: true,
        },
        ecmaVersion: "latest",
        // project: "./tsconfig.json",
      },
    },
    files: ["**/*.ts{,x}", "**/*.{,m}js{,x}"],
    plugins: {
      perfectionist,
    },
    rules: {
      "perfectionist/sort-imports": [
        "warn",
        {
          type: "alphabetical",
          order: "asc",
          ignoreCase: false,
          // internalPattern: ["components/**", "pages/**", "server/**"],
          newlinesBetween: "always",
          maxLineLength: undefined,
          groups: [
            "react",
            ["builtin", "external"],
            "internal",
            "parent",
            "sibling",
            "unknown",
            "style",
          ],
          customGroups: {
            value: {
              react: ["react", "react-*"],
              lodash: "lodash",
            },
            type: {
              react: ["react", "react-*"],
            },
          },
          environment: "node",
        },
      ],
      // "perfectionist/sort-objects": [
      //   "warn",
      //   {
      //     type: "natural",
      //     order: "asc",
      //     ignoreCase: true,
      //     // specialCharacters: "keep",
      //     partitionByComment: false,
      //     partitionByNewLine: false,
      //     // newlinesBetween: "ignore",
      //     styledComponents: true,
      //     ignorePattern: [],
      //     groups: [],
      //     customGroups: {},
      //   },
      // ],
    },
  },
]);
