import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";
import unusedImports from "eslint-plugin-unused-imports";
import simpleImportSort from "eslint-plugin-simple-import-sort";

module.exports = tseslint.config(tseslint.configs.recommended, prettierConfig, {
  plugins: {
    "unused-imports": unusedImports,
    "simple-import-sort": simpleImportSort,
  },
  rules: {
    "@typescript-eslint/no-unused-vars": "off",
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": [
      "warn",
      {
        vars: "all",
        varsIgnorePattern: "^_",
        args: "after-used",
        argsIgnorePattern: "^_",
      },
    ],

    "simple-import-sort/imports": [
      "error",
      {
        groups: [
          // Node.js built-ins (bare and node: prefix)
          [
            "^node:",
            "^(assert|buffer|child_process|cluster|crypto|dns|events|fs|http|https|net|os|path|stream|timers|tls|url|util|vm|zlib)(/|$)",
          ],
          // External npm packages
          [
            "^(?!@(providers|apis|services|workers)/)\\w",
            "^@(?!(providers|apis|services|workers)/)",
          ],
          // Path aliases in declared order
          ["^@providers/"],
          ["^@apis/"],
          ["^@services/", "^@workers/"],
          // Relative imports
          ["^\\."],
        ],
      },
    ],
    "simple-import-sort/exports": "error",
  },
});
