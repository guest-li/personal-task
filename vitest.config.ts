// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "path";
import { readFileSync } from "fs";

// Load environment variables manually
const envContent = readFileSync(".env", "utf-8");
envContent.split("\n").forEach((line) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith("#")) {
    const [key, value] = trimmed.split("=");
    if (key && value) {
      process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, "");
    }
  }
});

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
