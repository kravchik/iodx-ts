import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [".vscode-test/", "dist/", "node_modules/", "target/", "tests/fixtures/"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        Buffer: "readonly",
        console: "readonly",
        process: "readonly",
      },
    },
  },
  {
    files: ["src/generated/**/*.ts"],
    rules: {
      "no-useless-assignment": "off",
      "prefer-const": "off",
    },
  },
);
