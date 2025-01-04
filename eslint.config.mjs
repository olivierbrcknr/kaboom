import eslint from "@eslint/js";
import eslintPluginNext from "@next/eslint-plugin-next";
import perfectionist from "eslint-plugin-perfectionist";
import eslintPluginReact from "eslint-plugin-react";
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
      "prefer-const": ["warn"],
    },
  },
  perfectionist.configs["recommended-natural"],
]);
