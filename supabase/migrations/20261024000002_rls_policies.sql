-- 1-3. 보안 규칙(RLS) — docs/PLAN.md 3-11
-- 방문자(anon): 공개된 지역·숙소·방·사진만 읽기. 예약·기록·명단은 접근 불가.
-- 관리자(admins 명단에 있는 로그인 계정): 전부 읽기, 숙소·방·사진·예약 쓰기.
-- 서버의 비밀 키(secret key)는 RLS를 건너뛰므로 서버 코드에서만 쓴다.

-- 관리자 명단에 있는지 확인. security definer = admins 표 RLS에 막히지 않고 확인하기 위함
create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;
revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

alter table public.districts enable row level security;
alter table public.listings enable row level security;
alter table public.rooms enable row level security;
alter table public.photos enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_events enable row level security;
alter table public.admins enable row level security;
alter table public.email_logs enable row level security;

-- 지역: 누구나 읽기
create policy "districts: anyone can read" on public.districts
  for select to anon, authenticated using (true);
create policy "districts: admins can write" on public.districts
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- 숙소: 공개된 것만 (관리자는 전부)
create policy "listings: read published" on public.listings
  for select to anon, authenticated using (is_published or (select public.is_admin()));
create policy "listings: admins can write" on public.listings
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- 방: 방과 그 숙소가 모두 공개일 때만
create policy "rooms: read published" on public.rooms
  for select to anon, authenticated using (
    (is_published and exists (
      select 1 from public.listings l where l.id = rooms.listing_id and l.is_published
    ))
    or (select public.is_admin())
  );
create policy "rooms: admins can write" on public.rooms
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- 사진: 연결된 숙소·방이 보이는 경우만 (위 규칙을 그대로 따름)
create policy "photos: read if owner visible" on public.photos
  for select to anon, authenticated using (
    (listing_id is not null and exists (select 1 from public.listings l where l.id = photos.listing_id))
    or (room_id is not null and exists (select 1 from public.rooms r where r.id = photos.room_id))
  );
create policy "photos: admins can write" on public.photos
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- 예약: 방문자는 직접 읽기·쓰기 불가 (서버 기능을 통해서만). 관리자는 전부.
create policy "bookings: admins only" on public.bookings
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- 처리 기록·메일 기록·관리자 명단: 관리자 읽기만 (쓰기는 서버가 비밀 키로)
create policy "booking_events: admins read" on public.booking_events
  for select to authenticated using ((select public.is_admin()));
create policy "email_logs: admins read" on public.email_logs
  for select to authenticated using ((select public.is_admin()));
create policy "admins: admins read" on public.admins
  for select to authenticated using ((select public.is_admin()));

-- 방문자에게는 아예 쓰기 권한도 주지 않음 (RLS에 더한 이중 잠금)
revoke insert, update, delete, truncate on all tables in schema public from anon;
revoke all on public.bookings, public.booking_events, public.email_logs, public.admins from anon;

-- 달력·빈 방 검색용: 손님 개인정보 없이 "방·날짜·상태"만 돌려준다.
-- 공개된 방의, 아직 끝나지 않은 대기·확정 예약만.
create function public.get_booked_ranges(p_room_id uuid default null)
returns table (room_id uuid, check_in date, check_out date, status public.booking_status)
language sql stable security definer set search_path = '' as $$
  select b.room_id, b.check_in, b.check_out, b.status
  from public.bookings b
  join public.rooms r on r.id = b.room_id and r.is_published
  join public.listings l on l.id = r.listing_id and l.is_published
  where b.status in ('pending', 'approved', 'awaiting_payment', 'paid')
    and b.check_out >= (now() at time zone 'Asia/Seoul')::date
    and (p_room_id is null or b.room_id = p_room_id);
$$;
revoke execute on function public.get_booked_ranges(uuid) from public;
grant execute on function public.get_booked_ranges(uuid) to anon, authenticated;
