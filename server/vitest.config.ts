import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    fileParallelism: false,
    testTimeout: 10000,
    env: {
      NODE_ENV: "test",
      DATABASE_PATH: path.resolve(__dirname, "data/test.sqlite"),
    },
  },
});
