-- 표 접근 권한. 새 Supabase 프로젝트는 표 권한을 자동으로 주지 않으므로 필요한 것만 직접 준다.
-- 권한(GRANT) = "이 표에 손댈 수 있는가", RLS = "그중 어느 줄을 볼 수 있는가". 둘 다 통과해야 한다.

-- 서버(비밀 키): 전부. 서버 코드에서만 쓰는 키.
grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;

-- 방문자: 공개 자료 읽기만 (어느 줄이 보이는지는 RLS가 결정)
grant usage on schema public to anon, authenticated;
grant select on public.districts, public.listings, public.rooms, public.photos to anon;

-- 로그인한 사용자: 관리자일 때만 RLS가 허락함
grant select, insert, update, delete
  on public.districts, public.listings, public.rooms, public.photos, public.bookings
  to authenticated;
grant select on public.booking_events, public.email_logs, public.admins to authenticated;
