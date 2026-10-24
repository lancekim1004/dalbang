# 체험 안내 (면접관·리뷰어용)

사이트: https://dalbang.vercel.app — 모든 숙소·사진·가격은 예시 자료입니다. 결제는 없습니다.

## 손님으로 체험 (5분)

1. **검색** — 홈에서 동네(예: Mapo · Hongdae), 입주일, 기간을 고르고 Search.
   - 방 상세의 달력에 칠해진(확정) 날짜를 입주일로 고르면 그 방은 검색 목록에서 빠집니다.
2. **지도** — 방 목록에서 지도 핀을 누르면 숙소 카드가 뜹니다. 휴대폰에서는 아래 `Map` 버튼으로 전환.
3. **총액 미리보기** — 방 상세에서 날짜를 고르면 월세·남는 날·관리비·보증금 합계가 바로 계산됩니다.
   - 2/1 → 3/1처럼 28박이면 "Minimum stay is 30 nights."로 막힙니다.
4. **예약 요청** — `Request to book` → 이름·이메일(아무 주소나 가능, 예: `you@example.com`) → 동의 체크 → 보내기.
   - 예약 번호(예: `DB-7K3Q9P`)가 나옵니다.
   - 같은 이메일로 같은 날짜를 또 보내면 "You already have a pending request"로 막힙니다.
5. **조회** — 맨 아래 `Check your booking`에서 예약 번호 + 이메일. 하나라도 틀리면 "찾을 수 없음"만 나옵니다.

## 관리자로 체험

- 주소: https://dalbang.vercel.app/admin
- 데모 관리자 계정: 요청하시면 별도로 드립니다. (공개 저장소라 여기에는 적지 않습니다)

할 수 있는 것:
1. **대시보드** — 승인 대기 수, 이번 달 입주·퇴실.
2. **Requests** — 방금 보낸 요청을 열어 승인/거절(사유 입력). 같은 날짜의 다른 대기 요청이 있으면 승인 시 자동 거절된다고 미리 알려줍니다.
3. **Calendar** — 방별 가로 달력 (확정 = 진한색, 대기 = 노랑).
4. **Listings** — 숙소·방 추가/수정/숨기기, 사진 올리기(자동 축소)·순서 바꾸기·삭제. 숨긴 방은 손님 화면에서 즉시 사라집니다.

## 기술적으로 볼 만한 곳

| 보고 싶은 것 | 파일 |
|---|---|
| 겹침 금지 DB 제약 | `supabase/migrations/20261024000001_create_tables.sql` (`bookings_no_overlap`) |
| 승인·자동 거절 트랜잭션 | `supabase/migrations/20261024000005_booking_decisions.sql` |
| 보안 규칙(RLS) | `supabase/migrations/20261024000002_rls_policies.sql` |
| 총액 계산과 시험 | `src/lib/pricing.ts`, `src/lib/pricing.test.ts` |
| 서버 재검사 | `src/app/booking/actions.ts`, `src/lib/booking-rules.ts` |
| 동시 승인 시험 | `tests/db/booking-overlap.test.ts` |
