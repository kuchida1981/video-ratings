import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import importX from "eslint-plugin-import-x";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      "react-hooks": reactHooks,
      "import-x": importX,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "import-x/no-unused-modules": ["warn", {
        unusedExports: true,
        missingExports: false,
        ignoreExports: ["src/main.tsx"],
      }],
    },
    settings: {
      "import-x/resolver": {
        typescript: {
          project: "./tsconfig.app.json",
        },
      },
    },
  },
  {
    ignores: ["dist/", "node_modules/"],
  },
);
