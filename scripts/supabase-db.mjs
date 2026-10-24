// .env.local의 DB 비밀번호로 Supabase CLI를 실행한다. 비밀번호는 화면에 찍히지 않게 가린다.
// 사용 예: node scripts/supabase-db.mjs db push --dry-run
import { spawnSync } from "node:child_process";

process.loadEnvFile(".env.local");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const password = process.env.SUPABASE_DB_PASSWORD ?? "";
const ref = url.match(/^https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1];
if (!ref || !password) {
  console.error(".env.local에 NEXT_PUBLIC_SUPABASE_URL, SUPABASE_DB_PASSWORD가 필요합니다.");
  process.exit(1);
}
// 도쿄 지역 연결 주소(pooler). 다른 지역이면 SUPABASE_DB_HOST로 바꿀 수 있음
const host = process.env.SUPABASE_DB_HOST ?? "aws-0-ap-northeast-1.pooler.supabase.com";
const dbUrl = `postgresql://postgres.${ref}:${encodeURIComponent(password)}@${host}:5432/postgres`;

const result = spawnSync("npx", ["supabase", ...process.argv.slice(2), "--db-url", dbUrl], { encoding: "utf8" });
const mask = (s) => (s ?? "").replaceAll(encodeURIComponent(password), "***").replaceAll(password, "***");
process.stdout.write(mask(result.stdout));
process.stderr.write(mask(result.stderr));
process.exit(result.status ?? 1);
