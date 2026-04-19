// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    setupFiles: [],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/app": path.resolve(__dirname, "./app"),
      "server-only": path.resolve(__dirname, "./tests/helpers/server-only-mock.ts"),
    },
  },
});
