import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import ts from "@typescript-eslint/eslint-plugin";
import unusedImports from "eslint-plugin-unused-imports";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "prettier", "next/typescript"),
  {
    plugins: {
      "@typescript-eslint": ts,
      "unused-imports": unusedImports,
    },
    rules: {
      "no-undef": "error", // Flags undeclared variables like 'connection'
      "no-use-before-define": "error", // Ensures variables are defined before use
      "@typescript-eslint/no-unused-vars": "warn", // Relax to warn
      "unused-imports/no-unused-imports": "error", // Remove unused imports
      "unused-imports/no-unused-vars": [
        "warn",
        { vars: "all", args: "after-used", ignoreRestSiblings: true },
      ], // Warn on unused vars
    },
  },
];

export default eslintConfig;
