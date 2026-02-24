import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,

  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  {
    files: ["tests/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },

  {
    ignores: ["node_modules", "dist"],
  },

  {
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
    },
  },
];