// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    setupFiles: [],
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
  resolve: {
    alias: [
      {
        find: "@/app",
        replacement: path.resolve(__dirname, "./app"),
      },
      {
        find: "@/server/redis",
        replacement: path.resolve(__dirname, "./tests/helpers/redis-mock.ts"),
      },
      {
        find: "@",
        replacement: path.resolve(__dirname, "./src"),
      },
      {
        find: "server-only",
        replacement: path.resolve(__dirname, "./tests/helpers/server-only-mock.ts"),
      },
    ],
  },
});
