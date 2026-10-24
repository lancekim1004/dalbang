// 주소창의 검색 조건(?district=mapo&moveIn=...)을 안전하게 읽는다. 이상한 값은 무시.
import { z } from "zod";
import { isValidIsoDate } from "./dates";
import type { RoomFilters } from "./repo";
import { STAY_MONTH_OPTIONS } from "./repo";

const one = (v: unknown) => (Array.isArray(v) ? v[0] : v);
const optionalNumber = z.preprocess(
  (v) => (one(v) === "" || one(v) == null ? undefined : Number(one(v))),
  z.number().int().min(0).max(100_000_000).optional().catch(undefined),
);

const schema = z.object({
  district: z.preprocess(one, z.string().regex(/^[a-z-]{1,40}$/).optional().catch(undefined)),
  moveIn: z.preprocess(one, z.string().refine(isValidIsoDate).optional().catch(undefined)),
  months: z.preprocess(
    (v) => (one(v) ? Number(one(v)) : undefined),
    z.number().refine((n) => (STAY_MONTH_OPTIONS as readonly number[]).includes(n)).optional().catch(undefined),
  ),
  minPrice: optionalNumber,
  maxPrice: optionalNumber,
  sort: z.preprocess(one, z.enum(["recommended", "priceAsc", "priceDesc"]).optional().catch(undefined)),
});

export function parseRoomFilters(params: Record<string, string | string[] | undefined>): RoomFilters {
  return schema.parse(params);
}

/** 방 상세로 넘어갈 때 입주일·기간을 이어서 전달 */
export function stayQuery(f: RoomFilters): string {
  const q = new URLSearchParams();
  if (f.moveIn) q.set("moveIn", f.moveIn);
  if (f.months) q.set("months", String(f.months));
  const s = q.toString();
  return s ? `?${s}` : "";
}
