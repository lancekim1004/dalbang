import { defineConfig } from "vitest/config";

// 켜져 있는 사이트 점검 (npm run test:smoke). 주소는 SMOKE_URL로 바꿀 수 있음.
// 예: SMOKE_URL=https://dalbang.vercel.app npm run test:smoke
export default defineConfig({ test: { include: ["tests/smoke/**/*.test.ts"], testTimeout: 30_000 } });
