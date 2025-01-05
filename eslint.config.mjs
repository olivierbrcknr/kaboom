import eslint from "@eslint/js";
import eslintPluginNext from "@next/eslint-plugin-next";
import perfectionist from "eslint-plugin-perfectionist";
import eslintPluginReact from "eslint-plugin-react";
import tseslint from "typescript-eslint";

export default tseslint.config([
  eslint.configs.recommended,
  tseslint.configs.recommended,
  perfectionist.configs["recommended-natural"],
  { ignores: ["node_modules/*", ".next/*", "eslint.config.mjs"] },
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
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          ignoreRestSiblings: true,
          varsIgnorePattern: "^_",
        },
      ],
      "no-empty-pattern": "off",
      "no-unused-vars": "off",
      "perfectionist/sort-imports": [
        "warn",
        {
          type: "alphabetical",
          order: "asc",
          ignoreCase: false,
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
      "prefer-const": ["warn"],
    },
  },
]);
