import { resolve } from "path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    typecheck: {
      tsconfig: "./tsconfig.test.json",
    },
  },
  resolve: {
    alias: {
      "@providers": resolve(__dirname, "src/providers"),
      "@apis": resolve(__dirname, "src/apis"),
      "@services": resolve(__dirname, "src/services"),
      "@workers": resolve(__dirname, "src/workers"),
    },
  },
});
