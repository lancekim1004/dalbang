-- 3-3. 요청 횟수 제한. 같은 접속지(IP를 알아볼 수 없게 바꾼 값)에서 짧은 시간에 너무 많이 요청하면 막는다.
create table public.rate_limits (
  key text not null,            -- 예: 'request:ab12…' (IP 원문은 저장하지 않음)
  window_start timestamptz not null,
  count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (key, window_start)
);
-- RLS를 켜고 규칙은 만들지 않는다 → 방문자·로그인 사용자 모두 접근 불가, 서버(비밀 키)만 사용
alter table public.rate_limits enable row level security;
grant all on public.rate_limits to service_role;

-- 한 번 세고, 한도 안이면 true. 시간 창(window) 단위로 센다.
create function public.hit_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  w timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  c integer;
begin
  insert into public.rate_limits (key, window_start, count) values (p_key, w, 1)
  on conflict (key, window_start) do update set count = public.rate_limits.count + 1, updated_at = now()
  returning count into c;
  return c <= p_limit;
end;
$$;

-- 하루 지난 기록 지우기 (매일 자동 작업에서 부름)
create function public.cleanup_rate_limits()
returns void
language sql security definer set search_path = '' as $$
  delete from public.rate_limits where window_start < now() - interval '1 day';
$$;

revoke execute on function public.hit_rate_limit(text, integer, integer) from public, anon, authenticated;
revoke execute on function public.cleanup_rate_limits() from public, anon, authenticated;
grant execute on function public.hit_rate_limit(text, integer, integer) to service_role;
grant execute on function public.cleanup_rate_limits() to service_role;
