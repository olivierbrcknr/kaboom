import eslintPluginNext from "@next/eslint-plugin-next";
import tsParser from "@typescript-eslint/parser";
import eslintPluginReact from "eslint-plugin-react";
import perfectionist from "eslint-plugin-perfectionist";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default [
  {
    plugins: {
      eslintPluginNext,
      eslintPluginReact,
    },
    rules: {
      "@next/next/google-font-display": ["off"],
    },
  },
  eslintPluginPrettierRecommended,
  {
    rules: {
      "no-unused-vars": [
        "warn",
        {
          vars: "all",
          args: "after-used",
          caughtErrors: "all",
          ignoreRestSiblings: false,
          reportUsedIgnorePattern: false,
        },
      ],
      "prefer-const": ["warn"],
    },
  },
  // {
  //   plugins: {
  //     tsPlugin,
  //   },
  //   rules: {
  //     "@typescript-eslint/no-unused-vars": [
  //       // "no-unused-vars": [
  //       "warn",
  //       {
  //         vars: "all",
  //         args: "after-used",
  //         caughtErrors: "all",
  //         ignoreRestSiblings: false,
  //         reportUsedIgnorePattern: false,
  //       },
  //     ],
  //   },
  // },
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
];
