import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// 실제 Supabase DB에 대고 돌리는 시험 (npm run test:db). 시험이 만든 자료는 끝나면 스스로 지운다.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(new URL("./tests/stubs/server-only.ts", import.meta.url)),
    },
  },
  test: { include: ["tests/db/**/*.test.ts"], testTimeout: 30_000, fileParallelism: false },
});
